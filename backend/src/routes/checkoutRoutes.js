import express from "express";
import CheckoutController from "../controllers/checkoutController.js";

const router = express.Router();


router.post('/', CheckoutController.createCheckout);


export default router;
