import express from "express";
import CartController from "../controllers/cartController.js";

const router = express.Router();


router.get('/', CartController.getCart);
router.post('/', CartController.addToCart);
router.patch('/:id', CartController.updateCartItem);
router.delete('/:id', CartController.removeCartItem);
router.delete('/', CartController.clearCart);

export default router;
