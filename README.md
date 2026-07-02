# Ram Ji Collection - Premium E-Commerce Monorepo

Welcome to the **Ram Ji Collection** repository, an enterprise-level e-commerce application designed for selling premium apparel online.

## 🚀 Repository Structure

The codebase is organized as a monorepo workspace containing separate sub-applications and shared library models:

- **`apps/`**
  - **`web/`**: Next-generation React customer shopping site utilizing Tailwind styling.
  - **`admin/`**: Business analytics dashboard featuring transaction statistics and product controllers.
  - **`api/`**: Express server managing databases queries, JWT user authentications, and payment gateway interactions.
- **`packages/`**
  - **`ui/`**: Shared reusable components and custom layouts.
  - **`types/`**: Common TypeScript models sharing user details, cart entities, and product definitions.
  - **`utils/`**: Reusable formatting, validations, and logic hooks.
  - **`config/`**: Shared configurations.
  - **`constants/`**: Store-wide constant values (pricing parameters, sizing indices, categories list).
- **`database/`**: PostgreSQL schemas, DB seeds, and migrations logs.
- **`docs/`**: Architecture diagrams, API endpoints guides, database designs, and deployment runbooks.

## 🛠️ Tech Stack
- **Frontend / Admin**: React.js, Vite, Tailwind CSS, Framer Motion, Zustand
- **Backend Server**: Node.js, Express.js, TypeScript, Prisma ORM
- **Database Engine**: PostgreSQL
- **Asset Storage**: Cloudflare R2
- **Email Dispatch**: Resend
- **Payment Gateway**: Razorpay

## ⚡ Setup & Local Run Instructions
Please refer to [walkthrough.md](walkthrough.md) or [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) to initialize the database and run the development servers.
