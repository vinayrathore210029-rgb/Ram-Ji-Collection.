import { Router } from 'express';
import { getProducts, getProductById, createProduct, updateProduct, deleteProduct, deleteProductImage } from '../controllers/product.controller';
import { authenticate, authorizeAdmin } from '../middlewares/auth';
import { upload } from '../middlewares/upload';

const router = Router();

router.get('/', getProducts);
router.get('/:id', getProductById);
router.post('/', authenticate, authorizeAdmin, upload.array('images', 3), createProduct);
router.put('/:id', authenticate, authorizeAdmin, upload.array('images', 3), updateProduct);
router.delete('/images/:imageId', authenticate, authorizeAdmin, deleteProductImage);
router.delete('/:id', authenticate, authorizeAdmin, deleteProduct);

export default router;
