import Product from '../models/Product.js';

class ProductService {
    async getProductById(productId) {
        const product = await Product.findOne({ _id: productId, activo: true });
        if (!product) {
            throw new Error('Producto no encontrado');
        }
        return product;
    }
}


export default new ProductService();