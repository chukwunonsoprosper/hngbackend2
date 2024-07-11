const express = require('express');
const { check } = require('express-validator');
const { register, login } = require('../controllers/authController');
const router = express.Router();

router.post(
  '/register',
  [
    check('firstName').not().isEmpty().withMessage('First name is required'),
    check('lastName').not().isEmpty().withMessage('Last name is required'),
    check('email').isEmail().withMessage('Valid email is required'),
    check('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
  ],
  register
);

router.post(
  '/login',
  [
    check('email').isEmail().withMessage('Valid email is required'),
    check('password').not().isEmpty().withMessage('Password is required')
  ],
  login
);

module.exports = router;

