import { Router } from 'express';
import { getCart, addToCart, updateCartItem, deleteCartItem, clearCart } from '../controllers/cart.controller';
import { authenticate } from '../middlewares/auth';

const router = Router();

router.use(authenticate);

router.get('/', getCart);
router.post('/', addToCart);
router.put('/:id', updateCartItem);
router.delete('/:id', deleteCartItem);
router.delete('/', clearCart);

export default router;
