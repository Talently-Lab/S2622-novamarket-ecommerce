const mongoose = require('mongoose');
const { Schema } = mongoose;

const productSchema = new Schema({
  nombre: {
    type: String,
    required: true,
    trim: true
  },
  descripcion: {
    type: String
  },
  precio: {
    type: Number,
    required: true,
    min: [0, "El campo 'precio' debe ser mayor a 0"]
  },
  stock: {
    type: Number,
    required: true,
    default: 0,
    min: [0, "El stock no puede ser negativo"]
  },
  categoria: {
    type: String,
    required: true,
    trim: true
  },
  imagenUrl: {
    type: String
  }
}, {
  timestamps: true   // genera createdAt y updatedAt automático
});

module.exports = mongoose.model('Product', productSchema);

