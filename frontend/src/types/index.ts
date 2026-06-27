/**
 * @file src/types/index.ts
 */

export type UserRole = "ADMIN" | "USER";

export type PaymentMethod = "CASH_ON_DELIVERY" | "PAYPAL";

export type PaymentStatus = "PENDING" | "COMPLETED" | "FAILED";

export type OrderStatus =
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "CANCELED"
  | "ACCEPTED"
  | "PENDING";

export interface User {
  defaultShippingAddress: number | null;
  defaultBillingAddress: number | null;
  emailVerifiedAt: string | null;
  updatedAt: string;
  createdAt: string;
  role: UserRole;
  email: string;
  name: string;
  id: number;
}

export interface Address {
  lineTwo?: string | null;
  createdAt: string;
  updatedAt: string;
  lineOne: string;
  country: string;
  pincode: string;
  userId: number;
  city: string;
  id: number;
}

export interface Product {
  imageUrl: string | null;
  imageKey: string | null;
  description: string;
  createdAt: string;
  updatedAt: string;
  price: string;
  name: string;
  tags: string;
  id: number;
}

export interface CartItem {
  productId: number;
  updatedAt: string;
  createdAt: string;
  quantity: number;
  product: Product;
  userId: number;
  id: number;
}

export interface OrderEvent {
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  orderId: number;
  id: number;
}

export interface OrderProduct {
  productId: number;
  createdAt: string;
  updatedAt: string;
  quantity: number;
  orderId: number;
  id: number;
}

export interface Order {
  paymentProviderId: string | null;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  products?: OrderProduct[];
  paidAt: string | null;
  events?: OrderEvent[];
  status: OrderStatus;
  updatedAt: string;
  createdAt: string;
  netAmount: string;
  address: string;
  userId: number;
  id: number;
}

export interface SignUpBody {
  password: string;
  email: string;
  name: string;
}

export interface LoginBody {
  password: string;
  email: string;
}

export interface ForgotPasswordBody {
  email: string;
}

export interface ResetPasswordBody {
  password: string;
  token: string;
}

export interface ResendVerificationBody {
  email: string;
}

export interface AddAddressBody {
  lineTwo?: string;
  lineOne: string;
  country: string;
  pincode: string;
  city: string;
}

export interface UpdateUserBody {
  defaultShippingAddress?: number;
  defaultBillingAddress?: number;
  name?: string;
}

export interface AddToCartBody {
  productId: number;
  quantity: number;
}

export interface ChangeQuantityBody {
  quantity: number;
}

export interface CreateOrderBody {
  paymentMethod: PaymentMethod;
}

export interface CreateProductBody {
  description: string;
  price: number;
  tags?: string;
  name: string;
  image?: File;
}

export interface UpdateProductBody {
  description?: string;
  price?: number;
  name?: string;
  tags?: string;
  image?: File;
}

export interface ChangeUserRoleBody {
  role: UserRole;
}

export interface ChangeOrderStatusBody {
  status: OrderStatus;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    totalPages: number;
    results: number;
    current: number;
    limit: number;
  };
}

/** POST /api/auth/signup */
export interface SignUpResponse {
  verificationEmailSent: boolean;
  message: string;
  user: User;
}

/** POST /api/auth/login */
export interface LoginResponse {
  user: User;
}

/** GET /api/auth/verify-email */
export interface VerifyEmailResponse {
  message: string;
  user: User;
}

/** POST /api/auth/refresh */
export interface RefreshResponse {
  user: User;
}

/** GET /api/auth/me */
export type MeResponse = User;

/** POST /api/orders */
export interface CreateOrderResponse {
  providerOrderId?: string;
  approvalUrl?: string;
  warning?: string;
  order: Order;
}

/** POST /api/payments/paypal/:id/retry */
export interface RetryPayPalResponse {
  providerOrderId: string;
  approvalUrl: string;
  message: string;
  order: Order;
}

/** POST /api/payments/paypal/:id/capture */
export interface CapturePayPalResponse {
  capture: Record<string, unknown>;
  message: string;
  order: Order;
}

/** Standard error response from the backend error handler */
export interface ApiErrorResponse {
  errors?: Array<{ path: string; message: string }>; // Zod validation errors
  message: string;
  stack?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface ListOrdersParams extends PaginationParams {
  status?: OrderStatus;
}

export interface SearchProductsParams extends PaginationParams {
  q?: string;
}

export type ToastVariant = "success" | "error" | "warning" | "info";

export interface Toast {
  variant: ToastVariant;
  message: string;
  id: string;
}

/** The shape of our Redux auth slice state */
export interface AuthState {
  isLoading: boolean; // true while we're verifying the session on app mount
  isInitialized: boolean; // true once the first /api/auth/me call finishes
  user: User | null;
}

/** The shape of our Redux cart slice state */
export interface CartState {
  error: string | null;
  isLoading: boolean;
  items: CartItem[];
}

/** The shape of our Redux UI slice state */
export interface UiState {
  toasts: Toast[];
}
