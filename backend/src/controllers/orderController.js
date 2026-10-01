import { errorResponse, successResponse } from '../helpers/response.helper.js';

class OrderController {
    async getOrders(req, res, next) {
        try {
            return successResponse(res, null, null, 200);
        } catch (error) {
            return errorResponse(res, err, 'Error al comprobar el estado del servidor', 500)
        }
    }

    async getOrderById(req, res, next) {
        try {
            return successResponse(res, null, null, 200);
        } catch (error) {
            return errorResponse(res, err, 'Error al comprobar el estado del servidor', 500)
        }
    }

    async getOrdersByUserId(req, res, next) {
        try {
            return successResponse(res, null, null, 200);
        } catch (error) {
            return errorResponse(res, err, 'Error al comprobar el estado del servidor', 500)
        }
    }
}

export default new OrderController();