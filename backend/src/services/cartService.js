import User from '../models/User.js';
import Product from '../models/Product.js';
import CartEvent from '../models/CartEvent.js';
import { AppError } from '../helpers/customError.js';

class CartService {

    // ---------- helpers internos ----------

    // Devuelve el carrito crudo (sin populate) del usuario.
    async _getRawCart(userId) {
        const user = await User.findById(userId).select('carrito').lean();

        if (!user) {
            throw new AppError('Usuario no encontrado', 404);
        }

        return {
            items: user.carrito?.items ?? [],
            fechaCreacion: user.carrito?.fechaCreacion ?? null,
        };
    }

    // Busca un producto activo o lanza 404.
    async _getActiveProduct(productId) {
        const producto = await Product.findOne({ _id: productId, activo: true });

        if (!producto) {
            throw new AppError('Producto no encontrado', 404);
        }

        return producto;
    }

    _checkStock(producto, cantidadTotal) {
        if (cantidadTotal > producto.stock) {
            throw new AppError(
                `Stock insuficiente para ${producto.nombre}. Disponibles: ${producto.stock}`,
                409
            );
        }
    }

    // Guarda items + fechas del carrito sin pasar por los hooks de User.save()
    async _saveCart(userId, items, extraFields = {}) {
        await User.updateOne(
            { _id: userId },
            {
                $set: {
                    'carrito.items': items,
                    'carrito.fechaActualizacion': new Date(),
                    ...extraFields,
                },
            }
        );
    }

    // ---------- GET /api/cart ----------

    async getCart(userId) {
        const user = await User.findById(userId)
            .select('carrito')
            .populate('carrito.items.productId')
            .lean();

        if (!user) {
            throw new AppError('Usuario no encontrado', 404);
        }

        const items = [];
        let total = 0;
        let totalUnidades = 0;

        for (const item of user.carrito?.items ?? []) {
            const producto = item.productId;

            // Si el producto fue borrado o desactivado, no se muestra ni se suma
            if (!producto || !producto.activo) continue;

            const subtotal = producto.precio * item.cantidad;
            total += subtotal;
            totalUnidades += item.cantidad;

            items.push({
                productId: producto._id,
                nombre: producto.nombre,
                precio: producto.precio,
                imagenUrl: producto.imagenUrl ?? null,
                stock: producto.stock,
                cantidad: item.cantidad,
                subtotal,
            });
        }

        return {
            items,
            totalUnidades,
            total,
            fechaCreacion: user.carrito?.fechaCreacion ?? null,
            fechaActualizacion: user.carrito?.fechaActualizacion ?? null,
        };
    }

    // ---------- POST /api/cart ----------

    async addToCart(userId, { productId, cantidad }) {
        const producto = await this._getActiveProduct(productId);
        const { items, fechaCreacion } = await this._getRawCart(userId);

        const existente = items.find((i) => String(i.productId) === String(productId));
        const cantidadFinal = (existente?.cantidad ?? 0) + cantidad;

        this._checkStock(producto, cantidadFinal);

        let nuevosItems;
        if (existente) {
            // Si el producto ya estaba, se suma la cantidad (no se duplica)
            nuevosItems = items.map((i) =>
                String(i.productId) === String(productId) ? { ...i, cantidad: cantidadFinal } : i
            );
        } else {
            nuevosItems = [...items, { productId, cantidad }];
        }

        // El carrito pasa de vacío a tener su primer ítem -> se registra la creación
        const eraVacio = items.length === 0;
        const extra = {};
        if (eraVacio || !fechaCreacion) {
            extra['carrito.fechaCreacion'] = new Date();
        }

        await this._saveCart(userId, nuevosItems, extra);

        if (eraVacio) {
            await CartEvent.create({ userId, tipo: 'creado' });
        }

        return this.getCart(userId);
    }

    // ---------- PATCH /api/cart/:id ----------

    async updateCartItem(userId, productId, cantidad) {
        const { items } = await this._getRawCart(userId);

        const existe = items.some((i) => String(i.productId) === String(productId));
        if (!existe) {
            throw new AppError('El producto no está en el carrito', 404);
        }

        const producto = await this._getActiveProduct(productId);
        this._checkStock(producto, cantidad);

        // Reemplaza la cantidad (no la suma)
        const nuevosItems = items.map((i) =>
            String(i.productId) === String(productId) ? { ...i, cantidad } : i
        );

        await this._saveCart(userId, nuevosItems);

        return this.getCart(userId);
    }

    // ---------- DELETE /api/cart/:id ----------

    async removeCartItem(userId, productId) {
        const { items } = await this._getRawCart(userId);

        const nuevosItems = items.filter((i) => String(i.productId) !== String(productId));

        if (nuevosItems.length === items.length) {
            throw new AppError('El producto no está en el carrito', 404);
        }

        // Si quedó vacío, se reinicia fechaCreacion (el próximo "agregar" será un carrito nuevo)
        const extra = nuevosItems.length === 0 ? { 'carrito.fechaCreacion': null } : {};

        await this._saveCart(userId, nuevosItems, extra);

        return this.getCart(userId);
    }

    // ---------- DELETE /api/cart ----------

    async clearCart(userId) {
        await this._getRawCart(userId); // valida que el usuario exista

        await this._saveCart(userId, [], { 'carrito.fechaCreacion': null });

        return this.getCart(userId);
    }
}

export default new CartService();
