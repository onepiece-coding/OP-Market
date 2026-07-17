/**
 * @file src/lib/api/users.ts
 */

import { apiDelete, apiGet, apiPost, apiPut } from "./client";
import type {
  ChangeUserRoleBody,
  PaginatedResponse,
  PaginationParams,
  UpdateUserBody,
  AddAddressBody,
  Address,
  User,
} from "@/types";

const buildQuery = <T extends object>(params: T) => {
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) qs.set(key, String(value));
  }
  const str = qs.toString();
  return str ? `?${str}` : "";
};

/** GET /api/users/address */
export const listAddresses = (cookieHeader?: string) =>
  apiGet<Address[]>("/users/address", { cookieHeader });

/** POST /api/users/address */
export const addAddress = (body: AddAddressBody) =>
  apiPost<Address>("/users/address", body);

/** DELETE /api/users/address/:id */
export const deleteAddress = (id: number) =>
  apiDelete<{ status: boolean; message: string }>(`/users/address/${id}`);

/** PUT /api/users — Update current user's profile */
export const updateUser = (body: UpdateUserBody) =>
  apiPut<User>("/users", body);

/** GET /api/users — Admin: list all users */
export const listUsers = (
  params: PaginationParams = {},
  cookieHeader?: string,
) =>
  apiGet<PaginatedResponse<User>>(`/users${buildQuery(params)}`, {
    cookieHeader,
    cache: "no-store",
  });

/** GET /api/users/:id — Admin: get a specific user with addresses */
export const getUserById = (id: number, cookieHeader?: string) =>
  apiGet<User & { addresses: Address[] }>(`/users/${id}`, {
    cookieHeader,
    cache: "no-store",
  });

/** PUT /api/users/:id/role — Admin: change user role */
export const changeUserRole = (id: number, body: ChangeUserRoleBody) =>
  apiPut<User>(`/users/${id}/role`, body);
