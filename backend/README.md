# OP Market Backend

Backend API for the OP Market ecommerce project.

## Stack

- Node.js
- Express
- TypeScript
- Prisma
- PostgreSQL
- JWT auth with access and refresh tokens in HttpOnly cookies
- Brevo for transactional email
- Cloudinary for product images

## Features

- User signup and login
- Email verification
- Password reset flow
- Cookie-based auth with access and refresh tokens
- Admin role support
- Products CRUD
- Product image upload and deletion
- Cart management
- Order creation and order history
- PayPal payment flow with sandbox support
- Cash on delivery fallback

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create a `.env` file in the backend root.

```env
DATABASE_URL="postgresql://devuser:devpass@localhost:5432/ecommerce"
SHADOW_DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/postgres?schema=public"

PORT=3000
JWT_SECRET=your_jwt_secret
REFRESH_TOKEN_SECRET=your_refresh_secret

ACCESS_TOKEN_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d

CLIENT_DOMAIN=http://localhost:4400
NODE_ENV=development
TRUST_PROXY=1

BREVO_API_KEY=your_brevo_api_key
FROM_EMAIL=your_verified_sender_email
EMAIL_TIMEOUT_MS=10000
APP_NAME=op-market

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret

PAYPAL_CLIENT_ID=your_paypal_sandbox_client_id
PAYPAL_CLIENT_SECRET=your_paypal_sandbox_client_secret
PAYPAL_ENV=sandbox
PAYPAL_CURRENCY=USD
```

### 3. Run Prisma

```bash
npx prisma migrate dev
npx prisma generate
```

### 4. Start the server

```bash
npm run dev
```

## Scripts

```json
{
  "build": "tsc",
  "build:watch": "tsc -w",
  "start": "node dist/src/server.js",
  "dev": "tsx watch src/server.ts",
  "prisma:generate": "npx prisma generate",
  "prisma:push": "npx prisma db push"
}
```

## API Overview

### Auth

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/auth/verify-email?token=...`
- `POST /api/auth/resend-verification`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `GET /api/auth/me`

### Users

- `GET /api/users`
- `GET /api/users/:id`
- `PUT /api/users`
- `PUT /api/users/:id/role`
- `GET /api/users/address`
- `POST /api/users/address`
- `DELETE /api/users/address/:id`

### Products

- `GET /api/products`
- `POST /api/products`
- `GET /api/products/:id`
- `PUT /api/products/:id`
- `DELETE /api/products/:id`
- `GET /api/products/search`

### Cart

- `GET /api/cart`
- `POST /api/cart`
- `PUT /api/cart/:id`
- `DELETE /api/cart/:id`

### Orders

- `GET /api/orders`
- `POST /api/orders`
- `GET /api/orders/:id`
- `PUT /api/orders/:id/cancel`
- `GET /api/orders/index`
- `GET /api/orders/users/:id`
- `PUT /api/orders/:id/status`

### Payments

- `POST /api/payments/paypal/:id/capture`
- `POST /api/payments/paypal/:id/retry`

## Notes

- Auth uses HttpOnly cookies, so the frontend must send requests with credentials enabled.
- Product image uploads use Cloudinary.
- Email verification and password reset use one-time tokens stored in the database.
- PayPal is configured for sandbox during development.
- Local dev uses PostgreSQL.

## Database

The Prisma schema includes:

- users
- addresses
- products
- cart_items
- orders
- order_products
- order_events
- refresh_tokens
- one_time_tokens

## Frontend integration notes

- Send requests with `credentials: "include"` or `withCredentials: true`.
- After signup, redirect the user to an email-verification message page.
- After PayPal checkout, call the capture endpoint from the frontend return page.
- Use the retry endpoint for unpaid PayPal orders.

## License

ISC
