import { Router } from 'express';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../controllers/category.controller';
import { authenticate, authorizeAdmin } from '../middlewares/auth';
import { upload } from '../middlewares/upload';

const router = Router();

router.get('/', getCategories);
router.post('/', authenticate, authorizeAdmin, upload.single('image'), createCategory);
router.put('/:id', authenticate, authorizeAdmin, upload.single('image'), updateCategory);
router.delete('/:id', authenticate, authorizeAdmin, deleteCategory);

export default router;
