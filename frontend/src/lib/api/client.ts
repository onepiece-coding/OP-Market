/**
 * @file src/lib/api/client.ts
 */

import type { ApiErrorResponse } from "@/types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

export class ApiError extends Error {
  public status: number;
  public errors?: ApiErrorResponse["errors"];

  constructor(
    message: string,
    status: number,
    errors?: ApiErrorResponse["errors"],
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
  }
}

interface FetchOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  cookieHeader?: string;
  nextOptions?: NextFetchRequestConfig;
}

interface NextFetchRequestConfig {
  revalidate?: number | false;
  tags?: string[];
}

/**
 * A 401 from any of these means something other than "the access token
 * expired" — refreshing wouldn't help and could loop.
 */
const AUTH_RETRY_EXEMPT_ENDPOINTS = [
  "/auth/refresh",
  "/auth/login",
  "/auth/signup",
  "/auth/logout",
];

let pendingRefresh: Promise<void> | null = null;

function refreshAccessToken(): Promise<void> {
  if (!pendingRefresh) {
    pendingRefresh = apiFetch("/auth/refresh", { method: "POST" })
      .then(() => undefined)
      .finally(() => {
        pendingRefresh = null;
      });
  }
  return pendingRefresh;
}

type AuthExpiredHandler = () => void;
let onAuthExpired: AuthExpiredHandler | null = null;

/**
 * Registered once by <Providers> on mount. Called when a refresh attempt
 * ITSELF fails — the refresh token is also expired/invalid, meaning the
 * user is genuinely logged out, not just due for a token refresh. Lets
 * us clear the stale "logged in" UI without this low-level file needing
 * to import Redux directly.
 */
export function setAuthExpiredHandler(handler: AuthExpiredHandler) {
  onAuthExpired = handler;
}

export async function apiFetch<TData>(
  endpoint: string,
  options: FetchOptions = {},
  isRetry = false,
): Promise<TData> {
  const { body, cookieHeader, nextOptions, ...restOptions } = options;

  const headers = new Headers(restOptions.headers);

  let serializedBody: string | FormData | undefined;
  if (body instanceof FormData) {
    serializedBody = body;
  } else if (body !== undefined) {
    headers.set("Content-Type", "application/json");
    serializedBody = JSON.stringify(body);
  }

  if (cookieHeader) {
    headers.set("Cookie", cookieHeader);
  }

  const url = `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    ...restOptions,
    headers,
    body: serializedBody,
    credentials: "include",
    ...(nextOptions && { next: nextOptions }),
  });

  let data: unknown;
  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    const errorBody = data as ApiErrorResponse;

    const isBrowser = typeof window !== "undefined";
    const isExempt = AUTH_RETRY_EXEMPT_ENDPOINTS.some((exempt) =>
      endpoint.startsWith(exempt),
    );

    if (response.status === 401 && isBrowser && !isExempt && !isRetry) {
      try {
        await refreshAccessToken();
        // Retry the EXACT original request, once, now that the browser
        // holds a fresh accessToken cookie.
        return apiFetch<TData>(endpoint, options, true);
      } catch {
        // Refresh itself failed — genuinely logged out. Notify the app
        // (clears Redux auth/cart state) and fall through to throw the
        // ORIGINAL error below, which is what's actually relevant to
        // whoever called this request.
        onAuthExpired?.();
      }
    }

    throw new ApiError(
      errorBody?.message ?? `Request failed with status ${response.status}`,
      response.status,
      errorBody?.errors,
    );
  }

  return data as TData;
}

export const apiGet = <TData>(
  endpoint: string,
  options?: Omit<FetchOptions, "method" | "body">,
) => apiFetch<TData>(endpoint, { ...options, method: "GET" });

export const apiPost = <TData>(
  endpoint: string,
  body?: FetchOptions["body"],
  options?: Omit<FetchOptions, "method" | "body">,
) => apiFetch<TData>(endpoint, { ...options, method: "POST", body });

export const apiPut = <TData>(
  endpoint: string,
  body?: FetchOptions["body"],
  options?: Omit<FetchOptions, "method" | "body">,
) => apiFetch<TData>(endpoint, { ...options, method: "PUT", body });

export const apiDelete = <TData>(
  endpoint: string,
  options?: Omit<FetchOptions, "method" | "body">,
) => apiFetch<TData>(endpoint, { ...options, method: "DELETE" });
