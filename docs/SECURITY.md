# Security Practices - Ram Ji Collection

This project implements enterprise-level security precautions to protect customer checkout details and catalog states.

## Security Precautions

- **JWT Authentication**: High-security authentication utilizing JSON Web Tokens with distinct Access Tokens (15m/1d) and Cryptographic Refresh Tokens (7d).
- **Password Cryptography**: Salted hashing of user passwords using `bcryptjs` before insertion into database pools.
- **SQL Injection Safeguard**: Type-safe database queries via Prisma ORM parameterized statements.
- **HTTP Header Security**: Helmet integration in our Express app to set strict HTTP response security headers.
- **Input Validations**: Zod type assertions checking input variables in auth controllers and catalog creation endpoints.
- **Payment Verification Verification**: Cryptographic SHA256 validation comparing Razorpay payment signatures against server secret keys.
