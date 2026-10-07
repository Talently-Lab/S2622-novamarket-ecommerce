import express from "express";
import OrderController from "../controllers/orderController.js";
import {authenticate} from "../middleware/verifyToken.js";
import {authorize} from "../middleware/isAdmin.js"

const router = express.Router();

router.use(authenticate);

router.get('/', authorize('admin'), OrderController.getOrders);
router.get('/:id', OrderController.getOrderById);
router.get('/me', OrderController.getOrdersByUserId);

export default router;
