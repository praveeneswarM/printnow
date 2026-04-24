const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, contactNumber, shopName, address, city, state, pincode } = req.body;
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({ 
      name, email, password: hashedPassword, role, contactNumber, 
      shopName, address, city, state, pincode 
    });
    await user.save();

    const payload = { id: user.id, role: user.role, name: user.name };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ token, user: { id: user.id, name, email, role } });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const payload = { id: user.id, role: user.role, name: user.name };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ token, user: { id: user.id, name: user.name, email, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;