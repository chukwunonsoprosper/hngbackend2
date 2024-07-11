const express = require('express');
const router = express.Router();
const { getUserById } = require('../controllers/userController');
const { verifyToken } = require('../utils/authUtils');

// Route to get user by ID
router.get('/:id', verifyToken, getUserById);

module.exports = router;
