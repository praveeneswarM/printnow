const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Order = require('../models/Order');
const auth = require('../middleware/auth');
const Razorpay = require('razorpay');
const crypto = require('crypto');

const UserSchema = new mongoose.Schema({
  pricing: { bw: Number, color: Number, minOrder: Number }
});
const User = mongoose.models.User || mongoose.model('User', UserSchema);

router.post('/create', auth, async (req, res) => {
  try {
    const { vendorId, documentId, settings, paymentMethod } = req.body;
    
    const vendor = await User.findById(vendorId);
    if (!vendor) return res.status(404).json({ message: 'Vendor not found' });
    
    const bwPrice = vendor.pricing?.bw || 2;
    const colorPrice = vendor.pricing?.color || 5;
    const minOrder = vendor.pricing?.minOrder || 0;

    const pagesToPrint = settings.totalPagesToPrint || 1;
    const pricePerPage = settings.color === 'Color' ? colorPrice : bwPrice;

    // Strict calculation: (pages * price) * copies
    let amount = (pagesToPrint * pricePerPage) * settings.copies;
    if (amount < minOrder) amount = minOrder;
    
    const order = new Order({
      userId: req.user.id,
      vendorId,
      documentId,
      settings,
      paymentMethod,
      amount,
      status: paymentMethod === 'COD' ? 'Confirmed' : 'Pending Payment'
    });
    await order.save();
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/user', auth, async (req, res) => {
  const orders = await Order.find({ userId: req.user.id }).sort({ createdAt: -1 });
  res.json(orders);
});

router.get('/:id', auth, async (req, res) => {
  const order = await Order.findById(req.params.id);
  res.json(order);
});

router.post('/payment/create-order', auth, async (req, res) => {
  try {
    const { amount } = req.body;
    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_mockkey',
      key_secret: process.env.RAZORPAY_SECRET || 'rzp_test_mocksecret',
    });

    const options = {
      amount: amount * 100,
      currency: "INR",
      receipt: "receipt_order_" + Date.now(),
    };

    const order = await instance.orders.create(options);
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create payment order' });
  }
});

router.post('/payment/verify', auth, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;
    const secret = process.env.RAZORPAY_SECRET || 'rzp_test_mocksecret';
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto.createHmac('sha256', secret).update(body.toString()).digest('hex');

    if (expectedSignature === razorpay_signature) {
      const order = await Order.findById(orderId);
      if(order) {
        order.status = 'Confirmed';
        await order.save();
      }
      res.json({ success: true, message: 'Payment verified successfully' });
    } else {
      res.status(400).json({ success: false, message: 'Invalid signature' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error during verification' });
  }
});

module.exports = router;