const express = require('express');
const router = express.Router();
const multer = require('multer');
const mongoose = require('mongoose');
const Document = require('../models/Document');
const fs = require('fs');
const path = require('path');
const auth = require('../middleware/auth');
const pdfParse = require('pdf-parse');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') cb(null, true);
    else cb(new Error('Only PDF files are allowed'), false);
  }
});

// Local Order Model for cross-service validation
const OrderSchema = new mongoose.Schema({ vendorId: String, documentId: String });
const Order = mongoose.models.Order || mongoose.model('Order', OrderSchema);

router.post('/upload', auth, upload.single('file'), async (req, res) => {
  try {
    let pageCount = 1;
    try {
      const dataBuffer = fs.readFileSync(req.file.path);
      const pdfData = await pdfParse(dataBuffer);
      pageCount = pdfData.numpages || 1;
    } catch(err) {
      console.log('PDF parse error:', err);
    }

    const doc = new Document({
      userId: req.user.id,
      originalName: req.file.originalname,
      filename: req.file.filename,
      path: req.file.path,
      size: req.file.size,
      mimetype: req.file.mimetype,
      pageCount
    });
    await doc.save();
    res.json(doc);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id/download', auth, async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Document not found' });

    // Validate ownership
    if (req.user.role === 'vendor') {
      const order = await Order.findOne({ vendorId: req.user.id, documentId: doc._id });
      if (!order) return res.status(403).json({ message: 'Unauthorized: Vendor not assigned to this document' });
    } else if (doc.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized: You do not own this document' });
    }

    const filePath = path.resolve(doc.path);
    if (!fs.existsSync(filePath)) return res.status(404).json({ message: 'File not found on server' });
    
    res.download(filePath, doc.originalName);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:id', auth, async (req, res) => {
  const doc = await Document.findById(req.params.id);
  res.json(doc);
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);
    if(fs.existsSync(doc.path)) fs.unlinkSync(doc.path);
    await Document.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;