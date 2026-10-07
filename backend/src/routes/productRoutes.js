import express from "express";
import ProductController from "../controllers/productController.js";
import {authenticate} from "../middleware/verifyToken.js";
import {authorize} from "../middleware/isAdmin.js"
const router = express.Router();



router.get('/', ProductController.getAllProducts);
router.get('/:id', ProductController.getProductById);
router.post('/', authenticate, authorize('admin'), ProductController.createProduct);
router.put('/:id', authenticate, authorize('admin'), ProductController.updateProduct);
router.delete('/:id', authenticate, authorize('admin'), ProductController.deleteProduct);
router.patch('/:id/stock', authenticate, authorize('admin'), ProductController.updateProductStock);

export default router;
