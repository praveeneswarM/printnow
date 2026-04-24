const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const path = require('path');

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// Serve static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/documents', require('./routes/documents'));

const PORT = process.env.PORT || 5002;
app.listen(PORT, () => console.log(`Document Service running on port ${PORT}`));