# API Documentation - Ram Ji Collection

All backend resources are mounted under the `/api` prefix.

## Endpoints Summary

### Authentication (`/api/auth`)
- `POST /register`: Create client profiles.
- `POST /login`: Log in to profiles and return JWT.
- `POST /refresh`: Refresh access tokens.
- `GET /me`: Query profile details.

### Catalog (`/api/products` & `/api/categories`)
- `GET /`: List collections with filters.
- `GET /:id`: Product details and reviews.

### Checkout (`/api/orders` & `/api/cart`)
- `POST /cart`: Add items to carts.
- `POST /checkout`: Initialize order records.
- `POST /verify-payment`: Verify payment signature hash.
