const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const token = req.header('Authorization');

  if (!token) {
    return res.status(401).json({ message: 'Auth Error' });
  }

  try {
    const decoded = jwt.verify(
      token.replace('Bearer ', ''),
      process.env.JWT_SECRET
    );

    // 🔥 normalize user object
    req.user = {
      id: decoded.id || decoded._id || decoded.userId,
      role: decoded.role
    };

    next();

  } catch (e) {
    console.error("Token error:", e);
    res.status(401).json({ message: 'Invalid Token' });
  }
};