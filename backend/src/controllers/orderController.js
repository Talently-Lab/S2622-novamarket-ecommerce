import { errorResponse, successResponse } from '../helpers/response.helper.js';
import OrderService from '../services/orderService.js';

class OrderController {

    async createOrder(req, res, next) {
        try {
            const userId = req.user.id
            const result = await OrderService.createOrder(req.body, userId);
            return successResponse(res, result, "Compra realizada correctamente", 201);
        } catch (error) {
            return errorResponse(res, error);
        }
    }

    async getOrders(req, res, next) {
        try {
            return successResponse(res, null, null, 200);
        } catch (error) {
            return errorResponse(res, error);
        }
    }

    async getOrderById(req, res, next) {
        try {
            return successResponse(res, null, null, 200);
        } catch (error) {
            return errorResponse(res, error);
        }
    }

    async getOrdersByUserId(req, res, next) {
        try {
            const userId = req.user.id
            const result = await OrderService.getOrdersByUserId(userId)
            return successResponse(res, result, "Ordenes obtenidas correctamente", 200);
        } catch (error) {
            return errorResponse(res, error);
        }
    }
}

export default new OrderController();