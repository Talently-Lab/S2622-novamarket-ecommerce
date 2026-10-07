import express from "express";
import CheckoutController from "../controllers/checkoutController.js";
import {authenticate} from "../middleware/verifyToken.js";
import {authorize} from "../middleware/isAdmin.js"

const router = express.Router();

router.use(authenticate);

router.post('/', authorize('client'), CheckoutController.createCheckout);


export default router;
