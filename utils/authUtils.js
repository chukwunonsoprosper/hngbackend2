const jwt = require('jsonwebtoken');
const { User } = require('../models');

const generateAccessToken = (user) => {
  return jwt.sign({ userId: user.userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization && req.headers['authorization']?.split(' ')[1];

  if (!token) {
    return res.status(403).json({ status: 'error', message: 'No token provided', statusCode: 403 });
  }

  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err) {
      return res.status(401).json({ status: 'error', message: 'Unauthorized kwa verify', statusCode: 401 });
    }

    try {
      const user = await User.findOne({ where: { userId: decoded.userId } });
      if (!user) {
        return res.status(401).json({ status: 'error', message: 'User not found', statusCode: 401 });
      }

      req.user = user;
      next();
    } catch (err) {
      console.error('Error during verification:', err);
      res.status(500).json({ status: 'error', message: 'Server error kwa verification', statusCode: 500 });
    }
  });
};


module.exports = {
  generateAccessToken,
  verifyToken
};
