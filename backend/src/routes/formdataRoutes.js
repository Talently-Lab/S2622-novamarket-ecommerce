import express from "express";
import FormdataController from "../controllers/formdataController.js";


const router = express.Router();

router.get('/products', FormdataController.getProductsCategory);
router.get('/order-status', FormdataController.getOrderStatus);
export default router;
