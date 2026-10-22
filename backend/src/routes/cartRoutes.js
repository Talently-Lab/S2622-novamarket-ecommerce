import express from "express";
import CartController from "../controllers/cartController.js";
import { authenticate } from "../middleware/verifyToken.js";
import { validateBody, validateParams } from "../middleware/validateSchema.js";
import { ADD_TO_CART_SCHEMA, UPDATE_CART_ITEM_SCHEMA, CART_ITEM_PARAMS_SCHEMA } from "../zodSchemas/cart.js";

const router = express.Router();

router.use(authenticate);

router.get('/', CartController.getCart);
router.post('/', validateBody(ADD_TO_CART_SCHEMA), CartController.addToCart);
router.patch('/:id', validateParams(CART_ITEM_PARAMS_SCHEMA), validateBody(UPDATE_CART_ITEM_SCHEMA), CartController.updateCartItem);
router.delete('/:id', validateParams(CART_ITEM_PARAMS_SCHEMA), CartController.removeCartItem);
router.delete('/', CartController.clearCart);

export default router;
