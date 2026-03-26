import dotenv from "dotenv";

dotenv.config();

export const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
export const DATABASE_URL = process.env.DATABASE_URL ?? "";
export const JWT_SECRET = process.env.JWT_SECRET ?? "change_me";
export const REFRESH_TOKEN_SECRET =
  process.env.REFRESH_TOKEN_SECRET ?? "change_me_refresh";
export const COOKIE_SECRET = process.env.COOKIE_SECRET ?? "change_me";
export const TRUST_PROXY = process.env.TRUST_PROXY ?? "1";
export const ALLOWED_ORIGIN = process.env.CLIENT_DOMAIN ?? "";
export const NODE_ENV = process.env.NODE_ENV ?? "development";

export const ACCESS_TOKEN_EXPIRES_IN =
  process.env.ACCESS_TOKEN_EXPIRES_IN ?? "15m";
export const REFRESH_TOKEN_EXPIRES_IN =
  process.env.REFRESH_TOKEN_EXPIRES_IN ?? "7d";

export const BREVO_API_KEY = process.env.BREVO_API_KEY ?? "";
export const FROM_EMAIL = process.env.FROM_EMAIL ?? "";
export const EMAIL_TIMEOUT_MS = process.env.EMAIL_TIMEOUT_MS
  ? Number(process.env.EMAIL_TIMEOUT_MS)
  : 10000;

export const APP_NAME = process.env.APP_NAME ?? "op-market";

export const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME ?? "";
export const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY ?? "";
export const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET ?? "";

export const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID ?? "";
export const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET ?? "";
export const PAYPAL_ENV =
  process.env.PAYPAL_ENV === "live" ? "live" : "sandbox";
export const PAYPAL_CURRENCY = process.env.PAYPAL_CURRENCY ?? "USD";
