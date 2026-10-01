import { errorResponse, successResponse } from '../helpers/response.helper.js';

class CartController {

    async getCart(req, res, next) {
        try {
            return successResponse(res, null, null, 200);
        } catch (error) {
            return errorResponse(res, err, 'Error al comprobar el estado del servidor', 500)
        }
    }

    async addToCart(req, res, next) {
        try {
            return successResponse(res, null, null, 200);
        } catch (error) {
            return errorResponse(res, err, 'Error al comprobar el estado del servidor', 500)
        }
    }

    async updateCartItem(req, res, next) {
        try {
            return successResponse(res, null, null, 200);
        } catch (error) {
            return errorResponse(res, err, 'Error al comprobar el estado del servidor', 500)
        }
    }

    async removeCartItem(req, res, next) {
        try {
            return successResponse(res, null, null, 200);
        } catch (error) {
            return errorResponse(res, err, 'Error al comprobar el estado del servidor', 500)
        }
    }

    async clearCart(req, res, next) {
        try {
            return successResponse(res, null, null, 200);
        } catch (error) {
            return errorResponse(res, err, 'Error al comprobar el estado del servidor', 500)
        }
    }
}

export default new CartController();