import { errorResponse, successResponse } from '../helpers/response.helper.js';
import FormdataService from '../services/formdataService.js';

class FormdataController {

    getProductsCategory(req, res, next) {
        try {
            const category = FormdataService.getProductsCategory();
            return successResponse(res, category, 'Categorías de productos', 200);
        } catch (error) {
            return errorResponse(res, error);
        }
    }

}

export default new FormdataController();