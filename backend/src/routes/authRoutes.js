import express from "express";
import AuthController from "../controllers/authController.js";
import {authenticate} from "../middleware/verifyToken.js";


const router = express.Router();

router.post('/register', AuthController.createUser);
router.post('/login', AuthController.loginUser);
router.get('/me',authenticate, AuthController.getCurrentUser);
router.post('/logout', authenticate, AuthController.logoutUser);

export default router;
