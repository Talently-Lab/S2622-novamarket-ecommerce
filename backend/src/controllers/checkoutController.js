import { errorResponse, successResponse } from '../helpers/response.helper.js';

class CheckoutController {
    async createCheckout(req, res, next) {
        try {
            return successResponse(res, null, null, 200);
        } catch (error) {
            return errorResponse(res, error);
        }
    }

}

export default new CheckoutController();