# Tester Documentation for Elaanji E-Commerce Project

## 1. Project Overview

This is a full-stack e-commerce application for a garments store (Elaanji). The project consists of:

- **Backend**: FastAPI-based REST API with PostgreSQL database, using SQLAlchemy ORM and Alembic for migrations.
- **Frontend**: React 18 application built with Vite, styled with Tailwind CSS.

The application includes customer-facing storefront and an admin panel for managing products, orders, inventory, etc.

## 2. Backend API Endpoints

The backend exposes RESTful APIs under the `/api` prefix (with versioning via `/api/v1` internally). The following modules are available:

### Customer-Facing Endpoints

- **Authentication** (`/api/auth`): User registration, login, logout, token refresh, OAuth.
- **Products** (`/api/products`): Product listing, search, filtering, product details.
- **Categories** (`/api/categories`): Category navigation and hierarchy.
- **Cart** (`/api/cart`): Shopping cart operations (add, remove, update, get cart).
- **Wishlist** (`/api/wishlist`): Customer wishlist management.
- **Addresses** (`/api/addresses`): Customer saved address book.
- **Coupons** (`/api/coupons`): Coupon validation and discount application.
- **Orders** (`/api/orders`): Order placement, order history, order details.
- **Payments** (`/api/payments`): Payment processing (Razorpay integration).
- **Banners** (`/api/banners`): Banner management for homepage promotions.
- **SEO** (`/api/seo`): SEO-related endpoints (if applicable).

### Admin Panel Endpoints

- **Dashboard** (`/api/admin/dashboard`): Administrative KPIs and analytics.
- **Products** (`/api/admin/products`): CRUD operations for products.
- **Categories** (`/api/admin/categories`): CRUD operations for categories.
- **Inventory** (`/api/admin/inventory`): Stock management.
- **Uploads** (`/api/admin/uploads`): File upload handling.
- **Orders** (`/api/admin/admin_orders`): Order management (view, update status).
- **Refunds** (`/api/admin/refunds`): Refund processing.
- **Customers** (`/api/admin/customers`): Customer management.
- **Coupons** (`/api/admin/coupons`): Admin coupon management.
- **Reviews** (`/api/admin/reviews`): Product review management.
- **Banners** (`/api/admin/banners`): Admin banner management.
- **Homepage** (`/api/admin/homepage`): Homepage content management.
- **Reports** (`/api/admin/reports`): Sales and inventory reports.
- **Settings** (`/api/admin/settings`): Application settings.

### Health Endpoints

- **Liveness**: `/api/health` or `/api/v1/health`
- **Readiness**: `/api/health/ready` or `/api/v1/health/ready`

## 3. Database Schema Overview

The database schema is managed via SQLAlchemy models and Alembic migrations. Key tables include:

- **users**: Customer and admin user information.
- **products**: Product details (name, description, price, images, etc.).
- **categories**: Product categories and hierarchy.
- **inventory**: Stock levels for products.
- **cart_items**: Items in shopping carts.
- **wishlist_items**: Items in wishlists.
- **orders**: Order headers.
- **order_items**: Line items within orders.
- **payments**: Payment transaction records.
- **coupons**: Coupon definitions and usage.
- **addresses**: Customer shipping/billing addresses.
- **activity_log**: Audit trail of user actions.
- **reviews**: Product reviews and ratings.
- **banners**: Promotional banners.
- **settings**: Application configuration.

Relationships are defined via foreign keys (e.g., orders → users, order_items → orders & products).

## 4. Setup for Testing

### Prerequisites

- Python 3.11+ (as specified in `backend/PYTHON_VERSION`)
- Node.js 18+ (for frontend)
- PostgreSQL database
- Redis (for rate limiting, if used)

### Backend Setup

1. Navigate to `backend/` directory.
2. Create a virtual environment: `python -m venv venv`
3. Activate the virtual environment:
   - Windows: `venv\Scripts\activate`
   - Unix/MacOS: `source venv/bin/activate`
4. Install dependencies: `pip install -r requirements.txt`
5. Set up environment variables (copy `backend/.env.example` to `.env` if exists, or refer to `backend/frontend.env` for frontend; backend uses `.env` or system env).
6. Run database migrations: `alembic upgrade head` (or use the provided script: `python scripts/run_migrations.py`)
7. Seed initial data (if needed): `python scripts/seed_catalog.py`
8. Start the development server: `uvicorn app.main:app --reload --host 0.0.0.0 --port 8000`

### Frontend Setup

1. Navigate to `frontend/` directory.
2. Install dependencies: `npm install`
3. Set up environment variables: Copy `frontend/frontend.env.example` to `.env` and fill in required values (e.g., VITE_API_URL).
4. Start the development server: `npm run dev`
5. The frontend will be available at `http://localhost:5173` (or as configured).

## 5. Running Tests

### Backend Tests

The backend includes test files in `backend/tests/`:

- `test_otp_flow.py`: Tests for OTP-based authentication flow.
- `test_production_apis.py`: Tests for production API endpoints.

To run the backend tests:

1. Ensure the backend virtual environment is activated.
2. Install test dependencies (if any): `pip install pytest` (if not already in requirements).
3. Run pytest: `pytest backend/tests/ -v`

### Frontend Tests

Currently, there are no explicit test files in the frontend. However, you can use:

- **Unit tests**: If using Jest or React Testing Library (check `package.json` for test scripts).
- **End-to-end tests**: Using Cypress or Playwright (if configured).

Check `frontend/package.json` for test scripts (e.g., `npm test`).

## 6. Test Scenarios and Data

### Suggested Test Cases

#### Authentication
- User registration with valid/invalid data.
- Login with correct/incorrect credentials.
- Token refresh and logout.
- OTP request and verification (if applicable).

#### Product Catalog
- Listing products with pagination.
- Filtering by category, price range, search.
- Retrieving product details.
- Out-of-stock product handling.

#### Shopping Cart
- Adding items to cart.
- Updating quantities.
- Removing items.
- Cart persistence across sessions.
- Price calculation with discounts and taxes.

#### Wishlist
- Adding/removing items.
- Moving items to cart.

#### Address Management
- Adding, editing, deleting addresses.
- Setting default address.

#### Coupons
- Applying valid/invalid coupons.
- Coupon expiration and usage limits.

#### Checkout & Orders
- Placing an order with various payment methods (simulate Razorpay).
- Order confirmation and email simulation.
- Order history retrieval.
- Order status updates (admin).

#### Admin Functions
- Creating/editing/deleting products.
- Managing inventory levels.
- Processing orders (shipped, delivered, cancelled).
- Managing coupons and banners.
- Viewing reports and analytics.

### Test Data

- Use the seed script (`scripts/seed_catalog.py`) to populate initial catalog data.
- Create test users via the registration endpoint or directly in the database for specific roles (customer, admin).
- Use realistic product data (garments, sarees, etc.) for testing search and filtering.

## 7. Frontend Testing Notes

### Components to Test
- **Header**: Navigation, cart icon, user menu.
- **Homepage**: Banner slider, product categories, featured products.
- **Product Listing**: Grid/list view, filters, sorting, pagination.
- **Product Detail Page**: Images, description, price, size selection, add to cart/wishlist.
- **Cart Page**: Item list, quantity updates, removal, coupon application, checkout button.
- **Checkout Form**: Shipping/billing address, payment method selection, order summary.
- **User Profile**: Order history, address book, wishlist.
- **Admin Panel**: Login, dashboard, product management, order management.

### Testing Strategies
- **Visual Regression**: Ensure UI consistency across browsers and devices.
- **Form Validation**: Test input validation (required fields, email format, phone numbers, etc.).
- **API Mocking**: Mock backend API calls to test frontend in isolation (if applicable).
- **Accessibility**: Test keyboard navigation, screen reader compatibility, color contrast.
- **Performance**: Test loading times, lazy loading of images, bundle size.

### Environment
- Frontend runs on `http://localhost:5173` by default.
- Ensure the backend is running and accessible at the configured API URL (usually `http://localhost:8000/api`).

## 8. Additional Notes

- **Rate Limiting**: The backend uses rate limiting (via `slowapi`). Test headers like `X-RateLimit-Remaining` and `X-RateLimit-Reset`.
- **Security Headers**: The backend includes security headers (CSP, HSTS, etc.) via `SecurityHeadersMiddleware`.
- **Error Handling**: The backend returns consistent JSON error responses with appropriate HTTP status codes.
- **Documentation**: Interactive API documentation is available at `/docs` (Swagger UI) and `/redoc` (ReDoc) when the backend is running.

## 9. Contact

For any questions regarding the test setup or test cases, refer to the project maintainers or consult the source code comments.

---
*This documentation is intended for software testers to understand the system and design test cases. It is based on the current state of the codebase and may evolve.*