import mongoose from 'mongoose';  //usemos los imports y export modernos ya que el package.json tiene "type": "module"
import bcrypt from 'bcryptjs';


const { Schema } = mongoose;

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
  //no es necesario llamar a next() aquí, ya que bcrypt.hash es una función asíncrona y el flujo de ejecución continuará después de que se complete la operación de hash. (genera error si se llama a next() aquí)
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model('User', userSchema);