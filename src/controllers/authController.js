import { errorResponse, successResponse } from '../helpers/response.helper.js';

class AuthController {
    async createUser(req, res, next) {
        try {
            return successResponse(res, null, null, 200);
        } catch (error) {
            return errorResponse(res, err, 'Error al comprobar el estado del servidor', 500)
        }
    }

    async loginUser(req, res, next) {
        try {
            return successResponse(res, null, null, 200);
        } catch (error) {
            return errorResponse(res, err, 'Error al comprobar el estado del servidor', 500)
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