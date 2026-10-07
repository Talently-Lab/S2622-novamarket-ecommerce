import express from "express";
import CartController from "../controllers/cartController.js";
import {authenticate} from "../middleware/verifyToken.js";

const router = express.Router();

router.use(authenticate); 

router.get('/', CartController.getCart);
router.post('/', CartController.addToCart);
router.patch('/:id', CartController.updateCartItem);
router.delete('/:id', CartController.removeCartItem);
router.delete('/', CartController.clearCart);

export default router;
