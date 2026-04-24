const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/vendors', require('./routes/vendors'));

const PORT = process.env.PORT || 5004;
app.listen(PORT, () => console.log(`Vendor Service running on port ${PORT}`));