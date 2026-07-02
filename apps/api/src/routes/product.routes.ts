import { Router } from 'express';
import { getProducts, getProductById, createProduct, updateProduct, deleteProduct } from '../controllers/product.controller';
import { authenticate, authorizeAdmin } from '../middlewares/auth';
import { upload } from '../middlewares/upload';

const router = Router();

router.get('/', getProducts);
router.get('/:id', getProductById);
router.post('/', authenticate, authorizeAdmin, upload.array('images', 8), createProduct);
router.put('/:id', authenticate, authorizeAdmin, upload.array('images', 8), updateProduct);
router.delete('/:id', authenticate, authorizeAdmin, deleteProduct);

export default router;
