
import Order from '../models/Order.js';
import { AppError } from '../helpers/customError.js';
import mongoose from 'mongoose';

class OrderService {
    async createOrder(data, userId) {
        const session = await mongoose.startSession();
        let nuevaOrden = null;

        try {
            await session.withTransaction(async () => {
                let totalOrden = 0;
                const productosAComprar = [];

                for (const item of data.items) {
                    const producto = await Product.findById(item.productId).session(session);

                    if (!producto) {
                        throw new AppError(`El producto con ID ${item.productId} no existe.`, 404);
                    }

                    if (producto.stock < item.cantidad) {
                        throw new AppError(`Stock insuficiente para ${producto.nombre}. Disponibles: ${producto.stock}`, 409);
                    }


                    await Product.updateOne(
                        { _id: item.productId },
                        { $inc: { stock: -item.cantidad } },
                        { session }
                    );

                    totalOrden += producto.precio * item.cantidad;
                    productosAComprar.push({
                        productId: producto._id,
                        nombre: producto.nombre,
                        cantidad: item.cantidad,
                        precioHistorico: producto.precio
                    });
                }

                if (totalOrden !== data.total) {
                    throw new AppError(`El total dado es distinto al total final`, 400);
                }
                const [ordenCreada] = await Order.create(
                    [
                        {
                            userId,
                            items: productosAComprar,
                            total: totalOrden,
                            direccionEnvio: {
                                calle: data.direccionEnvio.calle,
                                ciudad: data.direccionEnvio.ciudad,
                                provincia: data.direccionEnvio.provincia,
                                codigoPostal: data.direccionEnvio.codigoPostal
                            }
                        }
                    ],
                    { session }
                );

                nuevaOrden = ordenCreada;
            });

            console.log("Orden creada y stock actualizado correctamente.");
            return nuevaOrden;

        } finally {
            session.endSession();
        }
    }

     async getOrdersByUserId(userId) {
        const orders = await Order.find({ userId: userId })
            .populate('items.productId');
 
        return orders;
    }
 
    // ADMIN: devuelve TODOS los pedidos, del más nuevo al más viejo,
    // con nombre y email del cliente (para la tabla del panel admin).
    async getAllOrders() {
        const orders = await Order.find()
            .populate('userId', 'nombre email')
            .sort({ createdAt: -1 });
 
        return orders;
    }
 
    // ADMIN: cambia el estado de un pedido.
    async updateOrderStatus(orderId, estado) {
        const order = await Order.findByIdAndUpdate(
            orderId,
            { estado },
            { new: true, runValidators: true }
        ).populate('userId', 'nombre email');
 
        if (!order) {
            throw new AppError('Pedido no encontrado', 404);
        }
 
        return order;
    }
}
 
 
export default new OrderService();