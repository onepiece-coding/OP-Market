/**
 * @file src/lib/api/auth.ts
 */

import { apiGet, apiPost } from "./client";
import type {
  ResendVerificationBody,
  VerifyEmailResponse,
  ForgotPasswordBody,
  ResetPasswordBody,
  RefreshResponse,
  SignUpResponse,
  LoginResponse,
  MeResponse,
  SignUpBody,
  LoginBody,
} from "@/types";

/**
 * POST /api/auth/signup
 * Called from the signup form (Client Component).
 */
export const signUp = (body: SignUpBody) =>
  apiPost<SignUpResponse>("/auth/signup", body);

/**
 * POST /api/auth/login
 * Called from the login form (Client Component).
 * On success, the backend sets httpOnly cookies in the browser.
 */
export const login = (body: LoginBody) =>
  apiPost<LoginResponse>("/auth/login", body);

/**
 * POST /api/auth/logout
 * Called from the header logout button (Client Component).
 * The backend clears the auth cookies.
 */
export const logout = () => apiPost<{ message: string }>("/auth/logout");

/**
 * POST /api/auth/refresh
 * Called to get a new access token using the refresh token cookie.
 * This is called automatically when a 401 is received.
 */
export const refreshTokens = () => apiPost<RefreshResponse>("/auth/refresh");

/**
 * GET /api/auth/me
 * Gets the current logged-in user's data.
 *
 * This function is used in two different ways:
 * 1. Server Component: pass `cookieHeader` to authenticate on the server.
 * 2. Client Component: browser sends cookies automatically.
 *
 * @param cookieHeader - Pass `(await cookies()).toString()` from a Server Component.
 */
export const getMe = (cookieHeader?: string) =>
  apiGet<MeResponse>("/auth/me", { cookieHeader });

/**
 * GET /api/auth/verify-email?token=...
 * Called when the user clicks the verification link in their email.
 * Handled by the verify-email page (Server Component reads the token from the URL).
 */
export const verifyEmail = (token: string) =>
  apiGet<VerifyEmailResponse>(
    `/auth/verify-email?token=${encodeURIComponent(token)}`,
  );

/**
 * POST /api/auth/resend-verification
 */
export const resendVerification = (body: ResendVerificationBody) =>
  apiPost<{ message: string }>("/auth/resend-verification", body);

/**
 * POST /api/auth/forgot-password
 */
export const forgotPassword = (body: ForgotPasswordBody) =>
  apiPost<{ message: string }>("/auth/forgot-password", body);

/**
 * POST /api/auth/reset-password
 */
export const resetPassword = (body: ResetPasswordBody) =>
  apiPost<{ message: string }>("/auth/reset-password", body);
