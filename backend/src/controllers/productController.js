import { errorResponse, successResponse } from '../helpers/response.helper.js';
import ProductService from '../services/productService.js';

class ProductController {
    async getAllProducts(req, res, next) {
        try {
            return successResponse(res, null, null, 200);
        } catch (error) {
            return errorResponse(res, error);
        }
    }

    async getProductById(req, res, next) {
        try {
            const response = await ProductService.getProductById(req.params.id);
            return successResponse(res, response, 'Producto encontrado', 200);
        } catch (error) {
            return errorResponse(res, error);
        }
    }

    async createProduct(req, res, next) {
        try {
            return successResponse(res, null, null, 200);
        } catch (error) {
            return errorResponse(res, error);
        }
    }

    async updateProduct(req, res, next) {
        try {
            return successResponse(res, null, null, 200);
        } catch (error) {
            return errorResponse(res, error);
        }
    }

    async deleteProduct(req, res, next) {
        try {
            return successResponse(res, null, null, 200);
        } catch (error) {
            return errorResponse(res, error);
        }
    }

    async updateProductStock(req, res, next) {
        try {
            return successResponse(res, null, null, 200);
        } catch (error) {
            return errorResponse(res, error);
        }
    }
}

export default new ProductController();