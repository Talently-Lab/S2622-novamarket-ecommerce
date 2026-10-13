import mongoose from "mongoose"; // import en lugar de require, ya que estamos usando ES Modules
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
    enum: ['accesorios', 'perifericos', 'gadgets'],
    required: true,
    trim: true
  },
  imagenUrl: {
    type: String
  },
  activo: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true   // genera createdAt y updatedAt automático
});

export default mongoose.model('Product', productSchema);

