import { errorResponse, successResponse } from '../helpers/response.helper.js';
import ProductService from '../services/productService.js';

class ProductController {
    async getAllProducts(req, res, next) {
        try {

            const filters = req.query;
            const options = {
                limit: parseInt(req.query.limit) || 10,
                page: parseInt(req.query.page) || 1,
            };

            const products = await ProductService.getAllProducts(filters, options);
            return successResponse(res, products, 'Productos encontrados', 200);
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