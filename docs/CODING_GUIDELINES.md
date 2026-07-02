# Coding Guidelines - Ram Ji Collection

Follow these standards during local development and code additions:

## Code Guidelines

1. **TypeScript Usage**
   - Write type-safe code. Avoid using `any` type casts wherever possible.
   - Place common structures inside `packages/types/` for reuse across applications.

2. **Clean Component Architecture**
   - Keep React component code clean and small (less than 200 lines).
   - Separate layout presentation elements from Zustand state storage logic.

3. **Error Management**
   - Always catch controller exceptions and push them to the Express centralized `errorHandler` middleware.
   - Use customized error classes like `AppError`, `NotFoundError` and `BadRequestError` for clean REST messages.

4. **Variables and Secrets**
   - Never embed secret keys or database connection URLs in source code. Load them dynamically from environment variables.
