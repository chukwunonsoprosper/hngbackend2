const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');

// GET /api/users/:id
router.get('/:id', userController.getUserById);

module.exports = router;
