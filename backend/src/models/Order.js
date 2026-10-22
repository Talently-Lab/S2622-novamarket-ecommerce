import mongoose from 'mongoose'
const { Schema } = mongoose;

export const ORDER_STATUSES = ['pendiente', 'pagado', 'enviado', 'entregado', 'cancelado', 'confirmado'];

const orderSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [
    {
      productId: {
        type: Schema.Types.ObjectId,
        ref: 'Product'
      },
      nombre: {
        type: String,
        required: true,
        trim: true
      },
      precioHistorico: {
        type: Number,
        required: true
      },
      cantidad: {
        type: Number,
        required: true
      }
    }
  ],
  total: {
    type: Number,
    required: true
  },
  estado: {
    type: String,
    enum: ORDER_STATUSES,
    default: 'pendiente'
  },
  direccionEnvio: {
    calle: {
      type: String,
      required: true
    },
    ciudad: {
      type: String,
      required: true
    },
    provincia: {
      type: String,
      required: true
    },
    codigoPostal: {
      type: String,
      required: true
    }
  }
}, {
  timestamps: true
});

export default mongoose.model('Order', orderSchema);
