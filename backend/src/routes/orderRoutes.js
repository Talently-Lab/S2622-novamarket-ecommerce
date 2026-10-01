import express from "express";
import OrderController from "../controllers/orderController.js";

const router = express.Router();


router.get('/', OrderController.getOrders);
router.get('/:id', OrderController.getOrderById);
router.get('/me', OrderController.getOrdersByUserId);

export default router;
