const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'vendor'], default: 'user' },
  contactNumber: { type: String },
  shopName: { type: String },
  address: { type: String },
  city: { type: String },
  state: { type: String },
  pincode: { type: String },
  pricing: { 
    bw: { type: Number, default: 2 },
    color: { type: Number, default: 5 },
    minOrder: { type: Number, default: 0 }
  }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);