import { errorResponse } from '../helpers/response.helper.js';


export const authorize = (...roles) => {
    return (req, res, next) => {
        
        if (!roles.includes(req.user.rol)) {
            return errorResponse(res,null,'No tienes permisos para realizar esta acción',403);
        }

        next();
    };
};