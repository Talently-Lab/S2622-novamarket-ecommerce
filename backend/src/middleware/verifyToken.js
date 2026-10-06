import jwt from 'jsonwebtoken';
import { errorResponse } from '../helpers/response.helper.js';

export const authenticate = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader?.startsWith('Bearer ')) {
            return errorResponse(res, null, 'Token requerido', 401);
        }

        const token = authHeader.split(' ')[1];

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = decoded;

        next();
    } catch (error) {
        return errorResponse(res, error, 'Token inválido o expirado', 401);
    }
};