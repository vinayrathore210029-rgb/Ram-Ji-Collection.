import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../../.env') });

// Import routers
import authRoutes from './routes/auth.routes';
import productRoutes from './routes/product.routes';
import categoryRoutes from './routes/category.routes';
import cartRoutes from './routes/cart.routes';
import wishlistRoutes from './routes/wishlist.routes';
import orderRoutes from './routes/order.routes';
import adminRoutes from './routes/admin.routes';

// Import error handler
import { errorHandler } from './middlewares/errors';

const app = express();
const PORT = process.env.PORT || 5000;

// Security and utility middlewares
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

const allowedOrigins = [
  (process.env.FRONTEND_URL || 'http://localhost:5173').trim(),
  (process.env.ADMIN_URL || 'http://localhost:5174').trim()
];

app.use(cors({
  origin: (origin, callback) => {
    console.log('CORS Debug - Request Origin:', origin);
    console.log('CORS Debug - Allowed Origins:', allowedOrigins);
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
}));

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve local static uploads directory as a fallback
app.use('/uploads', express.static(path.join(__dirname, '../../../uploads')));

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);

// Root route check
app.get('/health', (req, res) => {
  res.json({ success: true, status: 'healthy', timestamp: new Date() });
});

// Centralized error handling
app.use(errorHandler);

// Start Server
app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(`  RAM JI COLLECTION SERVER RUNNING ON PORT ${PORT}`);
  console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`=========================================`);
});

export default app;
