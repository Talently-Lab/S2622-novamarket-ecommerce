import express from "express";
import AuthController from "../controllers/authController.js";

const router = express.Router();



router.post('/register', AuthController.createUser);
router.post('/login', AuthController.loginUser);
router.get('/me', AuthController.getCurrentUser);
router.post('/logout', AuthController.logoutUser);

export default router;
