import {
  APP_NAME,
  BREVO_API_KEY,
  EMAIL_TIMEOUT_MS,
  FROM_EMAIL,
  NODE_ENV,
} from "../config/secrets.js";
import logger from "../utils/logger.js";

type EmailPayload = {
  to: string;
  subject: string;
  html: string;
  from?: string;
};

const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

function getConfig() {
  return {
    NODE_ENV: process.env.NODE_ENV ?? NODE_ENV,
    BREVO_API_KEY: process.env.BREVO_API_KEY ?? BREVO_API_KEY ?? undefined,
    DEFAULT_FROM: process.env.FROM_EMAIL ?? FROM_EMAIL ?? undefined,
    DEFAULT_TIMEOUT_MS: process.env.EMAIL_TIMEOUT_MS
      ? Number(process.env.EMAIL_TIMEOUT_MS)
      : EMAIL_TIMEOUT_MS,
    APP_NAME: process.env.APP_NAME ?? APP_NAME,
  };
}

async function timeoutFetch(
  input: RequestInfo,
  init: RequestInit = {},
  timeout: number,
  fetchFn: (
    input: RequestInfo,
    init?: RequestInit,
  ) => Promise<Response> = fetch,
): Promise<Response> {
  const ac = new AbortController();
  const id = setTimeout(() => ac.abort(), timeout);

  try {
    return await fetchFn(input, { ...init, signal: ac.signal });
  } finally {
    clearTimeout(id);
  }
}

export async function sendEmail(
  { to, subject, html, from }: EmailPayload,
  fetchFn?: (input: RequestInfo, init?: RequestInit) => Promise<Response>,
): Promise<any> {
  const cfg = getConfig();

  if (cfg.NODE_ENV === "test" && !cfg.BREVO_API_KEY) {
    logger.info(
      "sendEmail: test env without BREVO_API_KEY — returning mock response",
    );
    return {
      ok: true,
      message: "Email send mocked in test env",
      to,
      subject,
    };
  }

  if (!cfg.BREVO_API_KEY) {
    throw new Error(
      "Email provider not configured. Set BREVO_API_KEY (or run tests with NODE_ENV=test).",
    );
  }

  const senderEmail = from ?? cfg.DEFAULT_FROM;
  if (!senderEmail) {
    throw new Error("FROM_EMAIL is required for sending emails.");
  }

  const payload = {
    sender: {
      email: senderEmail,
      name: cfg.APP_NAME,
    },
    to: [{ email: to }],
    subject,
    htmlContent: html,
  };

  let res: Response;
  try {
    res = await timeoutFetch(
      BREVO_API_URL,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "api-key": cfg.BREVO_API_KEY,
        },
        body: JSON.stringify(payload),
      },
      cfg.DEFAULT_TIMEOUT_MS,
      fetchFn,
    );
  } catch (networkErr: any) {
    const message =
      networkErr?.name === "AbortError"
        ? "Request timed out"
        : networkErr?.message;
    logger.error("Brevo network error", { message, stack: networkErr?.stack });
    throw new Error("Internal Server Error (email network)");
  }

  const contentType = res.headers.get("content-type") ?? "";
  let body: any = null;

  if (contentType.includes("application/json")) {
    try {
      body = await res.json();
    } catch {
      body = null;
    }
  } else {
    try {
      body = await res.text();
    } catch {
      body = null;
    }
  }

  if (!res.ok) {
    logger.error("Brevo API error", {
      status: res.status,
      statusText: res.statusText,
      body,
    });
    throw new Error("Internal Server Error (email send)");
  }

  logger.info("Brevo send success", { status: res.status, body });
  return body;
}

export default sendEmail;
