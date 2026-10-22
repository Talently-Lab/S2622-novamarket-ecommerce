import mongoose from 'mongoose';
const { Schema } = mongoose;

const cartEventSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tipo: {
    type: String,
    enum: ['creado', 'checkout'],
    required: true
  },
  fecha: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('CartEvent', cartEventSchema);
