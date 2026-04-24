const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  vendorId: { type: String, required: true },
  documentId: { type: String, required: true },
  settings: {
    color: String,
    copies: Number,
    size: String
  },
  status: { type: String, enum: ['Pending Payment', 'Confirmed', 'Printing', 'Ready', 'Delivered'], default: 'Pending Payment' },
  paymentMethod: { type: String, enum: ['COD', 'Online'] },
  amount: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Order', OrderSchema);