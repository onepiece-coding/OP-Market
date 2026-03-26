import { Request, Response } from "express";
import createError from "http-errors";
import asyncHandler from "express-async-handler";
import { prismaClient } from "../db/prisma.js";
import { compareSync, hashSync } from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { REFRESH_TOKEN_SECRET, ALLOWED_ORIGIN } from "../config/secrets.js";
import sendEmail from "../services/emailService.js";
import logger from "../utils/logger.js";
import {
  clearAuthCookies,
  compareTokenHash,
  hashToken,
  setAuthCookies,
  signAccessToken,
  signRefreshToken,
  REFRESH_TOKEN_MAX_AGE_MS,
} from "../utils/tokenHelper.js";
import { publicUserSelect } from "../utils/publicUserSelect.js";

const EMAIL_VERIFICATION_TOKEN_MAX_AGE_MS = 24 * 60 * 60 * 1000;
const PASSWORD_RESET_TOKEN_MAX_AGE_MS = 60 * 60 * 1000; // 1 hour
const TOKEN_CLEANUP_RETENTION_MS = 24 * 60 * 60 * 1000;
const MAX_ACTIVE_REFRESH_SESSIONS = 5;

const sanitizeUser = (user: any) => {
  const { password, ...rest } = user;
  return rest;
};

const hashOneTimeToken = (token: string) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

const generateRawToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

const cleanupOneTimeTokens = async (tx: any) => {
  const now = new Date();
  const usedCutoff = new Date(Date.now() - TOKEN_CLEANUP_RETENTION_MS);

  await tx.oneTimeToken.deleteMany({
    where: {
      OR: [{ expiresAt: { lt: now } }, { usedAt: { lt: usedCutoff } }],
    },
  });
};

const issueEmailVerificationToken = async (tx: any, userId: number) => {
  await tx.oneTimeToken.deleteMany({
    where: {
      userId,
      purpose: "EMAIL_VERIFICATION",
    },
  });

  const rawToken = generateRawToken();

  await tx.oneTimeToken.create({
    data: {
      userId,
      purpose: "EMAIL_VERIFICATION",
      tokenHash: hashOneTimeToken(rawToken),
      expiresAt: new Date(Date.now() + EMAIL_VERIFICATION_TOKEN_MAX_AGE_MS),
    },
  });

  return rawToken;
};

const issuePasswordResetToken = async (tx: any, userId: number) => {
  await tx.oneTimeToken.deleteMany({
    where: {
      userId,
      purpose: "PASSWORD_RESET",
    },
  });

  const rawToken = generateRawToken();

  await tx.oneTimeToken.create({
    data: {
      userId,
      purpose: "PASSWORD_RESET",
      tokenHash: hashOneTimeToken(rawToken),
      expiresAt: new Date(Date.now() + PASSWORD_RESET_TOKEN_MAX_AGE_MS),
    },
  });

  return rawToken;
};

const findMatchingRefreshToken = async (userId: number, rawToken: string) => {
  const tokens = await prismaClient.refreshToken.findMany({
    where: {
      userId,
      revoked: false,
      expiresAt: { gt: new Date() },
    },
  });

  for (const token of tokens) {
    if (compareTokenHash(rawToken, token.tokenHash)) {
      return token;
    }
  }

  return null;
};

const trimActiveRefreshTokens = async (userId: number, tx = prismaClient) => {
  const activeTokens = await tx.refreshToken.findMany({
    where: {
      userId,
      revoked: false,
      expiresAt: { gt: new Date() },
    },
    orderBy: {
      createdAt: "asc",
    },
    select: {
      id: true,
    },
  });

  const excess = Math.max(
    0,
    activeTokens.length - MAX_ACTIVE_REFRESH_SESSIONS + 1,
  );
  if (excess === 0) return;

  const idsToRevoke = activeTokens.slice(0, excess).map((token) => token.id);

  await tx.refreshToken.updateMany({
    where: {
      id: { in: idsToRevoke },
    },
    data: {
      revoked: true,
    },
  });
};

const cleanupRefreshTokens = async (tx = prismaClient) => {
  const now = new Date();
  const revokedCutoff = new Date(Date.now() - TOKEN_CLEANUP_RETENTION_MS);

  await tx.refreshToken.deleteMany({
    where: {
      OR: [
        { expiresAt: { lt: now } },
        { revoked: true, createdAt: { lt: revokedCutoff } },
      ],
    },
  });
};

const issueTokens = async (userId: number) => {
  await cleanupRefreshTokens(prismaClient);
  await trimActiveRefreshTokens(userId, prismaClient);

  const accessToken = signAccessToken(userId);
  const refreshToken = signRefreshToken(userId);

  await prismaClient.refreshToken.create({
    data: {
      tokenHash: hashToken(refreshToken),
      userId,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_MAX_AGE_MS),
    },
  });

  return { accessToken, refreshToken };
};

const sendVerificationEmail = async (
  req: Request,
  user: { name: string; email: string },
  rawToken: string,
) => {
  const host = req.get("host") ?? "localhost:3000";
  const verificationUrl = `${req.protocol}://${host}/api/auth/verify-email?token=${encodeURIComponent(rawToken)}`;

  return sendEmail({
    to: user.email,
    subject: "Verify your email",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6">
        <h2>Verify your email</h2>
        <p>Hello ${user.name},</p>
        <p>Please verify your email by clicking the link below:</p>
        <p><a href="${verificationUrl}">${verificationUrl}</a></p>
        <p>This link expires in 24 hours.</p>
      </div>
    `,
  });
};

const sendPasswordResetEmail = async (
  user: { name: string; email: string },
  rawToken: string,
) => {
  const frontendBase = (ALLOWED_ORIGIN || "http://localhost:4400").replace(
    /\/$/,
    "",
  );
  const resetUrl = `${frontendBase}/reset-password?token=${encodeURIComponent(rawToken)}`;

  return sendEmail({
    to: user.email,
    subject: "Reset your password",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6">
        <h2>Password reset request</h2>
        <p>Hello ${user.name},</p>
        <p>We received a request to reset your password.</p>
        <p><a href="${resetUrl}">Reset your password</a></p>
        <p>This link expires in 1 hour.</p>
      </div>
    `,
  });
};

/**
 * @desc   SignUp a new user
 * @route  api/auth/singup
 * @method POST
 * @access public
 */
export const signUpCtrl = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  const { user, verificationToken } = await prismaClient.$transaction(
    async (tx) => {
      const existing = await tx.user.findFirst({ where: { email } });
      if (existing) {
        throw createError(400, "User already exists!");
      }

      const usersCount = await tx.user.count();
      const isFirstUser = usersCount === 0;

      const user = await tx.user.create({
        data: {
          name,
          email,
          password: hashSync(password, 10),
          role: isFirstUser ? "ADMIN" : "USER",
          emailVerifiedAt: null,
        },
      });

      await cleanupOneTimeTokens(tx);
      const verificationToken = await issueEmailVerificationToken(tx, user.id);

      return { user, verificationToken };
    },
  );

  let verificationEmailSent = false;
  try {
    await sendVerificationEmail(req, user, verificationToken);
    verificationEmailSent = true;
  } catch (error) {
    logger.error("Failed to send verification email", error);
  }

  res.status(201).json({
    user: sanitizeUser(user),
    verificationEmailSent,
    message: verificationEmailSent
      ? "Account created. Please verify your email."
      : "Account created, but the verification email could not be sent. Please request a new one.",
  });
});

/**
 * @desc   Login a user
 * @route  api/auth/login
 * @method POST
 * @access public
 */
export const loginCtrl = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await prismaClient.user.findFirst({ where: { email } });
  if (!user) {
    throw createError(400, "Invalid credentials!");
  }

  if (!user.emailVerifiedAt) {
    throw createError(403, "Please verify your email before logging in.");
  }

  if (!compareSync(password, user.password)) {
    throw createError(400, "Invalid credentials!");
  }

  const { accessToken, refreshToken } = await issueTokens(user.id);
  setAuthCookies(res, accessToken, refreshToken);

  res.status(200).json({
    user: sanitizeUser(user),
  });
});

/**
 * @desc   Verify email
 * @route  GET /api/auth/verify-email?token=...
 * @access public
 */
export const verifyEmailCtrl = asyncHandler(
  async (req: Request, res: Response) => {
    const rawToken = String(req.query.token ?? "").trim();
    if (!rawToken) {
      throw createError(400, "Missing verification token");
    }

    const tokenHash = hashOneTimeToken(rawToken);

    const tokenRecord = await prismaClient.oneTimeToken.findFirst({
      where: {
        tokenHash,
        purpose: "EMAIL_VERIFICATION",
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
    });

    if (!tokenRecord) {
      throw createError(400, "Invalid or expired verification token");
    }

    const user = await prismaClient.$transaction(async (tx) => {
      const markUsed = await tx.oneTimeToken.updateMany({
        where: {
          id: tokenRecord.id,
          usedAt: null,
        },
        data: {
          usedAt: new Date(),
        },
      });

      if (!markUsed.count) {
        throw createError(400, "Invalid or expired verification token");
      }

      const updatedUser = await tx.user.update({
        where: { id: tokenRecord.userId },
        data: {
          emailVerifiedAt: new Date(),
        },
      });

      await cleanupOneTimeTokens(tx);
      return updatedUser;
    });

    const { accessToken, refreshToken } = await issueTokens(user.id);
    setAuthCookies(res, accessToken, refreshToken);

    res.status(200).json({
      user: sanitizeUser(user),
      message: "Email verified successfully.",
    });
  },
);

/**
 * @desc   Resend verification email
 * @route  POST /api/auth/resend-verification
 * @access public
 */
export const resendVerificationCtrl = asyncHandler(
  async (req: Request, res: Response) => {
    const { email } = req.body as { email: string };

    const user = await prismaClient.user.findFirst({
      where: { email },
    });

    if (!user || user.emailVerifiedAt) {
      res.status(200).json({
        message:
          "If the email exists and is not verified, a verification email has been sent.",
      });
      return;
    }

    const verificationToken = await prismaClient.$transaction(async (tx) => {
      await cleanupOneTimeTokens(tx);
      return issueEmailVerificationToken(tx, user.id);
    });

    try {
      await sendVerificationEmail(req, user, verificationToken);
    } catch (error) {
      logger.error("Failed to resend verification email", error);
    }

    res.status(200).json({
      message:
        "If the email exists and is not verified, a verification email has been sent.",
    });
  },
);

/**
 * @desc   Forgot password
 * @route  POST /api/auth/forgot-password
 * @access public
 */
export const forgotPasswordCtrl = asyncHandler(
  async (req: Request, res: Response) => {
    const { email } = req.body as { email: string };

    const user = await prismaClient.user.findFirst({
      where: { email },
    });

    if (!user) {
      res.status(200).json({
        message: "If the email exists, a password reset link has been sent.",
      });
      return;
    }

    const resetToken = await prismaClient.$transaction(async (tx) => {
      await cleanupOneTimeTokens(tx);
      return issuePasswordResetToken(tx, user.id);
    });

    try {
      await sendPasswordResetEmail(user, resetToken);
    } catch (error) {
      logger.error("Failed to send password reset email", error);
    }

    res.status(200).json({
      message: "If the email exists, a password reset link has been sent.",
    });
  },
);

/**
 * @desc   Reset password
 * @route  POST /api/auth/reset-password
 * @access public
 */
export const resetPasswordCtrl = asyncHandler(
  async (req: Request, res: Response) => {
    const { token, password } = req.body as { token: string; password: string };

    const tokenHash = hashOneTimeToken(token);

    const tokenRecord = await prismaClient.oneTimeToken.findFirst({
      where: {
        tokenHash,
        purpose: "PASSWORD_RESET",
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
    });

    if (!tokenRecord) {
      throw createError(400, "Invalid or expired reset token");
    }

    const result = await prismaClient.$transaction(async (tx) => {
      const markUsed = await tx.oneTimeToken.updateMany({
        where: {
          id: tokenRecord.id,
          usedAt: null,
        },
        data: {
          usedAt: new Date(),
        },
      });

      if (!markUsed.count) {
        throw createError(400, "Invalid or expired reset token");
      }

      const updatedUser = await tx.user.update({
        where: { id: tokenRecord.userId },
        data: {
          password: hashSync(password, 10),
        },
      });

      await tx.refreshToken.updateMany({
        where: {
          userId: tokenRecord.userId,
        },
        data: {
          revoked: true,
        },
      });

      await cleanupOneTimeTokens(tx);

      return updatedUser;
    });

    clearAuthCookies(res);

    res.status(200).json({
      message: "Password reset successfully. Please log in again.",
      user: sanitizeUser(result),
    });
  },
);

/**
 * @desc   Refresh access token
 * @route  /api/auth/refresh
 * @method POST
 * @access public
 */
export const refreshCtrl = asyncHandler(async (req: Request, res: Response) => {
  const rawRefreshToken = req.cookies?.refreshToken;
  if (!rawRefreshToken) {
    throw createError(401, "No refresh token");
  }

  let payload: { userId: number };
  try {
    payload = jwt.verify(rawRefreshToken, REFRESH_TOKEN_SECRET) as {
      userId: number;
    };
  } catch {
    throw createError(401, "Invalid refresh token");
  }

  const existingToken = await findMatchingRefreshToken(
    payload.userId,
    rawRefreshToken,
  );

  if (!existingToken) {
    throw createError(401, "Refresh token revoked or invalid");
  }

  await prismaClient.refreshToken.update({
    where: { id: existingToken.id },
    data: { revoked: true },
  });

  const newAccessToken = signAccessToken(payload.userId);
  const newRefreshToken = signRefreshToken(payload.userId);

  await prismaClient.refreshToken.create({
    data: {
      tokenHash: hashToken(newRefreshToken),
      userId: payload.userId,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_MAX_AGE_MS),
    },
  });

  setAuthCookies(res, newAccessToken, newRefreshToken);

  const user = await prismaClient.user.findUnique({
    where: { id: payload.userId },
    select: publicUserSelect,
  });

  res.status(200).json({ user });
});

/**
 * @desc   Logout user
 * @route  /api/auth/logout
 * @method POST
 * @access public
 */
export const logoutCtrl = asyncHandler(async (req: Request, res: Response) => {
  const rawRefreshToken = req.cookies?.refreshToken;

  if (rawRefreshToken) {
    try {
      const payload = jwt.verify(rawRefreshToken, REFRESH_TOKEN_SECRET) as {
        userId: number;
      };
      const existingToken = await findMatchingRefreshToken(
        payload.userId,
        rawRefreshToken,
      );

      if (existingToken) {
        await prismaClient.refreshToken.update({
          where: { id: existingToken.id },
          data: { revoked: true },
        });
      }
    } catch {
      // ignore invalid token, still clear cookies
    }
  }

  clearAuthCookies(res);
  res.status(200).json({ message: "Logged out" });
});

/**
 * @desc   Get Logged in user
 * @route  api/auth/me
 * @method GET
 * @access private(only Logged in User)
 */
export const meCtrl = asyncHandler(async (req: Request, res: Response) => {
  res.status(200).json(req.user);
});
