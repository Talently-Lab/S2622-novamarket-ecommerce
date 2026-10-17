import express from "express";
import ProductController from "../controllers/productController.js";
import { authenticate } from "../middleware/verifyToken.js";
import { authorize } from "../middleware/isAdmin.js"
import { validateParams } from "../middleware/validateSchema.js";
import { GET_PRODUCT_SCHEMA, GET_PRODUCTS_SCHEMA } from "../zodSchemas/products.js";
const router = express.Router();



router.get('/', validateParams(GET_PRODUCTS_SCHEMA), ProductController.getAllProducts);
router.get('/:id', validateParams(GET_PRODUCT_SCHEMA), ProductController.getProductById);
router.post('/', authenticate, authorize('admin'), ProductController.createProduct);
router.put('/:id', authenticate, authorize('admin'), ProductController.updateProduct);
router.delete('/:id', authenticate, authorize('admin'), ProductController.deleteProduct);
router.patch('/:id/stock', authenticate, authorize('admin'), ProductController.updateProductStock);

export default router;
