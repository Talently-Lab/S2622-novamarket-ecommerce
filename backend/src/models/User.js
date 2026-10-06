
const mongoose = require('mongoose');
const { Schema } = mongoose;
const bcrypt = require('bcryptjs');

const userSchema = new Schema({
  nombre: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  rol: {
    type: String,
    enum: ['client', 'admin'],
    default: 'client'
  },
  carrito: {
    items: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: 'Product'
        },
        cantidad: {
          type: Number,
          default: 1
        }
      }
    ],
    fechaCreacion: {
      type: Date,
      default: null
    },
    fechaActualizacion: {
      type: Date,
      default: null
    }
  }
}, {
  timestamps: true
});


userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});


userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);