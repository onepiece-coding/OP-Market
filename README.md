# OP Market

OP Market is a full-stack ecommerce application.

## Tech Stack

### Backend

- Node.js
- Express
- TypeScript
- Prisma
- PostgreSQL
- JWT cookies
- Brevo
- Cloudinary
- PayPal sandbox

### Frontend

- Frontend stack to be added later

## Project Structure

```text
op-market/
  backend/
  frontend/
```

## Backend Features

- Authentication with signup, login, refresh, logout
- Email verification
- Password reset
- Products management
- Cart management
- Orders
- Payments
- Product image uploads
- Admin access control

## Frontend Features

Frontend files will be added later.

### Pages to implement

- Home
- Product listing
- Product details
- Cart
- Checkout
- Login
- Signup
- Email verification
- Forgot password
- Reset password
- Profile
- Orders
- Admin dashboard

### Components to implement

- Navbar
- Footer
- Product card
- Cart item
- Order summary
- Payment buttons
- Auth forms
- Admin forms

## Environment Variables

### Backend

See `backend/.env.example` or `backend/README.md`.

### Frontend

To be added later.

## Local Development

### 1. Start the backend

```bash
cd backend
npm install
npm run dev
```

### 2. Start the frontend

To be added later.

## API

The backend exposes the API under `/api`.

### Main areas

- `/api/auth`
- `/api/users`
- `/api/products`
- `/api/cart`
- `/api/orders`
- `/api/payments`

## Payment Flow

- Cash on delivery completes immediately.
- PayPal orders create an approval link.
- The frontend redirects the user to PayPal.
- After PayPal approval, the frontend calls the capture endpoint.
- If payment is not completed, the user can retry PayPal later.

## Notes for Frontend Integration

- Use cookies for auth requests.
- Handle verification and reset password links from email.
- Handle PayPal approval redirect and capture callback.
- Use retry payment flow for unpaid orders.

## License

ISC
