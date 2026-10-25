import { errorResponse, successResponse } from '../helpers/response.helper.js';
import CartService from '../services/cartService.js';

class CartController {

    async getCart(req, res, next) {
        try {
            const result = await CartService.getCart(req.user.id);
            return successResponse(res, result, "Carrito obtenido correctamente", 200);
        } catch (error) {
            return errorResponse(res, error);
        }
    }

    async addToCart(req, res, next) {
        try {
            const result = await CartService.addToCart(req.user.id, req.body);
            return successResponse(res, result, "Producto agregado al carrito", 201);
        } catch (error) {
            return errorResponse(res, error);
        }
    }

    async updateCartItem(req, res, next) {
        try {
            const result = await CartService.updateCartItem(req.user.id, req.params.id, req.body.cantidad);
            return successResponse(res, result, "Producto del carrito actualizado correctamente", 200);
        } catch (error) {
            return errorResponse(res, error);
        }
    }

    async removeCartItem(req, res, next) {
        try {
            const result = await CartService.removeCartItem(req.user.id, req.params.id);
            return successResponse(res, result, "Producto eliminado del carrito", 200);
        } catch (error) {
            return errorResponse(res, error);
        }
    }

    async clearCart(req, res, next) {
        try {
            const result = await CartService.clearCart(req.user.id);
            return successResponse(res, result, "Carrito vaciado correctamente", 200);
        } catch (error) {
            return errorResponse(res, error);
        }
    }
}

export default new CartController();
