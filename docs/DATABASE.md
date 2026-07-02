# Database Documentation - Ram Ji Collection

We use PostgreSQL as our primary database engine. The data model maps users, catalogs, orders, reviews, and address records.

## Entities Schema Map

### 1. User
- `id` (UUID, Primary Key)
- `email` (String, Unique)
- `passwordHash` (String)
- `firstName` (String)
- `lastName` (String)
- `phone` (String)
- `role` (Role Enum: CUSTOMER, ADMIN)

### 2. Product
- `id` (UUID, Primary Key)
- `name` (String)
- `description` (Text)
- `brand` (String)
- `categoryId` (UUID, Foreign Key referencing Category)
- `price` (Float)
- `discount` (Float)
- `finalPrice` (Float)
- `stock` (Integer)
- `sku` (String, Unique)
- `sizes` (String Array)
- `colors` (String Array)

### 3. Order
- `id` (UUID, Primary Key)
- `userId` (UUID, Foreign Key referencing User)
- `status` (OrderStatus Enum)
- `payableAmount` (Float)
- `shippingAddressId` (UUID, Foreign Key referencing Address)
- `paymentStatus` (PaymentStatus Enum)
- `orderIdRazorpay` (String, Unique)
