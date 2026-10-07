import { errorResponse, successResponse } from '../helpers/response.helper.js';
import authService from '../services/authService.js';

class AuthController {
    async createUser(req, res, next) {
        try {

            const result = await authService.createUser(req.body);
            return successResponse(res, result, 'Usuario registrado correctamente', 201);

        } catch (error) {
            return errorResponse(res, error, error.message, 400);
        }
    }

    async loginUser(req, res, next) {
        try {
            const result = await authService.loginUser(req.body);
            return successResponse(res, result, 'Login exitoso', 200);
        } catch (error) {
            return errorResponse(res, error, error.message, 401);
        }
    }

    async getCurrentUser(req, res, next) {
        try {
            return successResponse(res, null, null, 200);
        } catch (error) {
            return errorResponse(res, err, 'Error al comprobar el estado del servidor', 500)
        }
    }

    async logoutUser(req, res, next) {
        try {
            return successResponse(res, null, null, 200);
        } catch (error) {
            return errorResponse(res, err, 'Error al comprobar el estado del servidor', 500)
        }
    }
}

export default new AuthController();