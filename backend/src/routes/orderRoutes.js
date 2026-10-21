import express from "express";
import OrderController from "../controllers/orderController.js";
import {authenticate} from "../middleware/verifyToken.js";
import {authorize} from "../middleware/isAdmin.js"
import { validateBody } from "../middleware/validateSchema.js";
import { CREATE_ORDER_SCHEMA } from "../zodSchemas/order.js";

const router = express.Router();

router.use(authenticate);

router.post('/', authorize('client'), validateBody(CREATE_ORDER_SCHEMA), OrderController.createOrder);

router.get('/', authorize('admin'), OrderController.getOrders);
router.get('/:id', OrderController.getOrderById);
router.get('/me', OrderController.getOrdersByUserId);

export default router;
