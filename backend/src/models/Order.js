const mongoose = require('mongoose');
const { Schema } = mongoose;

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
    enum: ['pendiente', 'pagado', 'enviado', 'entregado', 'cancelado', "confirmado"],
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

module.exports = mongoose.model('Order', orderSchema);

