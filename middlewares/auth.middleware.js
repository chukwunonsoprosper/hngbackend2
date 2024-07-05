const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/auth.config');

// Middleware to verify JWT token
exports.verifyToken = (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({
      status: 'Unauthorized',
      message: 'Access token is missing',
      statusCode: 401
    });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({
        status: 'Forbidden',
        message: 'Invalid token',
        statusCode: 403
      });
    }
    req.userId = decoded.userId;
    next();
  });
};
