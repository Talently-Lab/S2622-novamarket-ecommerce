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

    async getAllProducts(filters, options) {
        //como ya esta filtrando por activo, no hace falta que devuleva ese activo, ya que todos los productos que devuelve son activos
        const { category, name, minPrice, maxPrice, sortByPrice, sortByDate } = filters;

        const { limit, page } = options;

        const query = { activo: true };

        if (category) { query.categoria = category; }

        if (name) {
            query.nombre = {
                $regex: name,
                $options: 'i'
            };
        }

        if (minPrice !== undefined || maxPrice !== undefined) {
            query.precio = {};

            if (minPrice !== undefined) {
                query.precio.$gte = minPrice;
            }

            if (maxPrice !== undefined) {
                query.precio.$lte = maxPrice;
            }
        }

        const sort = {};

        if (sortByPrice === 'asc') {
            sort.precio = 1;
        } else if (sortByPrice === 'desc') {
            sort.precio = -1;
        }

        if (sortByDate === 'asc') {
            sort.createdAt = 1;
        } else if (sortByDate === 'desc') {
            sort.createdAt = -1;
        }

        const products = await Product.find(query)
            .select('-activo -__v')
            .sort(sort)
            .limit(limit)
            .skip((page - 1) * limit);



        const totalProducts = await Product.countDocuments(query);

        return { products, totalProducts };
    }
}

async createProduct(data) {
    return await Product.create(data);
}

async updateProduct(productId, data) {
    const product = await Product.findOneAndUpdate(
        { _id: productId, activo: true },
        { $set: data },
        { new: true, runValidators: true }
    );
    if (!product) throw new AppError('Producto no encontrado', 404);
    return product;
}

// Soft delete: NO borra el documento, solo marca activo: false
async deleteProduct(productId) {
    const product = await Product.findOneAndUpdate(
        { _id: productId, activo: true },
        { $set: { activo: false } },
        { new: true }
    );
    if (!product) throw new AppError('Producto no encontrado', 404);
    return product;
}
export default new ProductService();