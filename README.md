# OP Market

OP Market is a full-stack ecommerce application built with a zero-dependency philosophy on the frontend: the React app ships with only `react`, `react-dom`, and `react-router-dom` as runtime dependencies — every other system (caching, forms, modals, toasts) is built from scratch, paired with a secure Express and PostgreSQL backend.

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

- React
- TypeScript
- Vite
- React Router
- CSS Modules
- Zero UI/state/data-fetching libraries — custom-built caching, forms, and component system

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

### Pages

- Home / Shop (search, pagination)
- Product listing
- Product details
- Cart
- Checkout
- Login
- Signup
- Email verification
- Resend verification
- Forgot password
- Reset password
- Profile (account info, saved addresses)
- Orders (order history, cancel, retry payment)
- Admin dashboard
  - Products (create, edit, delete, image upload)
  - Orders (status management, filtering)
  - Users (role management)

### Components

- Navbar / Header (with live cart badge, mobile menu)
- Footer
- Product card
- Cart item row
- Order summary / order card
- Payment method selector
- Auth forms (login, signup, forgot/reset password)
- Admin forms (product form, confirm dialogs)
- Shared UI kit: Button, Input, Select, Spinner, Modal, Toast, Icon system, Pagination, Status/Role badges

## Environment Variables

### Backend

See `backend/.env.example` or `backend/README.md`.

### Frontend

| Variable | Description |
|---|---|
| `VITE_API_BASE_URL` | The backend API's base URL, including `/api/v1` (e.g. `http://localhost:8000/api/v1`) |

## Local Development

### 1. Start the backend

```bash
cd backend
npm install
npm run dev
```

### 2. Start the frontend

```bash
cd frontend-react
npm install
npm run dev
```

The frontend will be running at `http://localhost:3000`.

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

**Test credentials**

| Role | Email | Password |
|---|---|---|
| Admin | admin@email.com | Pass@1234 |
| User | user@email.com | Pass@1234 |
| Paypal | sb-jm1bo50147124@personal.example.com | H!we}8,k |

## License

ISC
