// const express = require('express');
// const router = express.Router();
// const mongoose = require('mongoose');
// const auth = require('../middleware/auth');

// const OrderSchema = new mongoose.Schema({
//   userId: String,
//   vendorId: String,
//   documentId: String,
//   settings: Object,
//   status: String,
//   paymentMethod: String,
//   amount: Number
// }, { timestamps: true });
// const Order = mongoose.models.Order || mongoose.model('Order', OrderSchema);

// const UserSchema = new mongoose.Schema({
//   name: String, email: String, role: String, contactNumber: String,
//   shopName: String, address: String, city: String, state: String, pincode: String,
//   pricing: { bw: Number, color: Number, minOrder: Number }
// });
// const User = mongoose.models.User || mongoose.model('User', UserSchema);

// router.get('/orders', auth, async (req, res) => {
//   if (req.user.role !== 'vendor') return res.status(403).json({ message: 'Forbidden' });
//   const orders = await Order.find({ vendorId: req.user.id }).sort({ createdAt: -1 });
//   res.json(orders);
// });

// router.put('/orders/:id/status', auth, async (req, res) => {
//   if (req.user.role !== 'vendor') return res.status(403).json({ message: 'Forbidden' });
//   const order = await Order.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
//   res.json(order);
// });

// router.get('/list', async (req, res) => {
//   const vendors = await User.find({ role: 'vendor' }).select('-password');
//   res.json(vendors);
// });

// router.put('/pricing', auth, async (req, res) => {
//   if (req.user.role !== 'vendor') return res.status(403).json({ message: 'Forbidden' });
//   const vendor = await User.findByIdAndUpdate(req.user.id, { pricing: req.body }, { new: true });
//   res.json(vendor.pricing);
// });

// router.get('/me/pricing', auth, async (req, res) => {
//   try {
//     if (req.user.role !== 'vendor') {
//       return res.status(403).json({ message: 'Forbidden' });
//     }

//     const vendor = await User.findById(req.user.id || req.user._id);

//     if (!vendor) {
//       return res.status(404).json({ message: 'Vendor not found' });
//     }

//     res.json(vendor.pricing || { bw: 2, color: 5, minOrder: 0 });

//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: err.message });
//   }
// });

// router.get('/:id', async (req, res) => {
//   const vendor = await User.findById(req.params.id).select('-password');
//   res.json(vendor);
// });

// module.exports = router;


const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const auth = require('../middleware/auth');

// ===================== SCHEMAS =====================
const OrderSchema = new mongoose.Schema({
  userId: String,
  vendorId: String,
  documentId: String,
  settings: Object,
  status: String,
  paymentMethod: String,
  amount: Number
}, { timestamps: true });

const Order = mongoose.models.Order || mongoose.model('Order', OrderSchema);

const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  role: String,
  contactNumber: String,
  shopName: String,
  address: String,
  city: String,
  state: String,
  pincode: String,
  pricing: {
    bw: Number,
    color: Number,
    minOrder: Number
  }
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);

// ===================== HELPERS =====================
const getUserId = (req) => req.user?.id || req.user?._id;

// ===================== ROUTES =====================

// 🔹 Get vendor orders
router.get('/orders', auth, async (req, res) => {
  try {
    if (req.user.role !== 'vendor') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ message: 'Invalid user token' });
    }

    const orders = await Order.find({ vendorId: userId }).sort({ createdAt: -1 });
    res.json(orders);

  } catch (err) {
    console.error("ORDERS ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

// 🔹 Update order status
router.put('/orders/:id/status', auth, async (req, res) => {
  try {
    if (req.user.role !== 'vendor') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);

  } catch (err) {
    console.error("UPDATE ORDER ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

// 🔹 Get all vendors
router.get('/list', async (req, res) => {
  try {
    const vendors = await User.find({ role: 'vendor' }).select('-password');
    res.json(vendors);

  } catch (err) {
    console.error("LIST ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

// 🔹 Update pricing
router.put('/pricing', auth, async (req, res) => {
  try {
    if (req.user.role !== 'vendor') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ message: 'Invalid user token' });
    }

    const vendor = await User.findByIdAndUpdate(
      userId,
      { pricing: req.body },
      { new: true }
    );

    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    res.json(vendor.pricing);

  } catch (err) {
    console.error("PRICING UPDATE ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

// 🔹 Get my pricing
router.get('/me/pricing', auth, async (req, res) => {
  try {
    if (req.user.role !== 'vendor') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ message: 'Invalid user token' });
    }

    const vendor = await User.findById(userId);

    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    res.json(vendor.pricing || { bw: 2, color: 5, minOrder: 0 });

  } catch (err) {
    console.error("GET PRICING ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

// 🔹 Get vendor by ID
router.get('/:id', async (req, res) => {
  try {
    const vendor = await User.findById(req.params.id).select('-password');

    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    res.json(vendor);

  } catch (err) {
    console.error("GET VENDOR ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;