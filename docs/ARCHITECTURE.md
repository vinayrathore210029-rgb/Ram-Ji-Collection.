# Architecture Documentation - Ram Ji Collection

This monorepo coordinates the full-stack applications for the Ram Ji Collection boutique.

## Applications Directory (`apps/`)
- **`web/`**: Next-generation React customer shopping site utilizing Tailwind styling.
- **`admin/`**: Business analytics dashboard featuring transaction statistics and product controllers.
- **`api/`**: Express server managing databases queries, JWT user authentications, and payment gateway interactions.

## Libraries Directory (`packages/`)
- **`types/`**: Common TypeScript models sharing user details, cart entities, and product definitions.

## Database Directory (`database/`)
- Contains migrations, entity diagrams, backups, and seed inputs.
