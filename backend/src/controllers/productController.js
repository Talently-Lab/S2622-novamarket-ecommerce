import { errorResponse, successResponse } from '../helpers/response.helper.js';

class ProductController {
    async getAllProducts(req, res, next) {
        try {
            return successResponse(res, null, null, 200);
        } catch (err) {
            return errorResponse(res, err, 'Error al comprobar el estado del servidor', 500)
        }
    }

    async getProductById(req, res, next) {
        try {
            return successResponse(res, null, null, 200);
        } catch (err) {
            return errorResponse(res, err, 'Error al comprobar el estado del servidor', 500)
        }
    }

    async createProduct(req, res, next) {
        try {
            return successResponse(res, null, null, 200);
        } catch (err) {
            return errorResponse(res, err, 'Error al comprobar el estado del servidor', 500)
        }
    }

    async updateProduct(req, res, next) {
        try {
            return successResponse(res, null, null, 200);
        } catch (err) {
            return errorResponse(res, err, 'Error al comprobar el estado del servidor', 500)
        }
    }

    async deleteProduct(req, res, next) {
        try {
            return successResponse(res, null, null, 200);
        } catch (err) {
            return errorResponse(res, err, 'Error al comprobar el estado del servidor', 500)
        }
    }

    async updateProductStock(req, res, next) {
        try {
            return successResponse(res, null, null, 200);
        } catch (err) {
            return errorResponse(res, err, 'Error al comprobar el estado del servidor', 500)
        }
    }
}

export default new ProductController();