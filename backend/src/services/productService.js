import Product from '../models/Product.js';
import { AppError } from '../helpers/customError.js';

class ProductService {
    async getProductById(productId) {
        const product = await Product.findOne({ _id: productId, activo: true });
        if (!product) {
            throw new AppError('Producto no encontrado', 404);
        }
        return product;
    }
}


export default new ProductService();