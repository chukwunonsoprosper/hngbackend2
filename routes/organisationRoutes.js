const express = require('express');
const { check } = require('express-validator');
const {
  getOrganisations,
  getOrganisationById,
  createOrganisation,
  addUserToOrganisation
} = require('../controllers/organisationController');
const { verifyToken } = require('../utils/authUtils');
const router = express.Router();

router.get('/', verifyToken, getOrganisations);

router.get('/:orgId', verifyToken, getOrganisationById);

router.post(
  '/',
  verifyToken,
  [
    check('name').not().isEmpty().withMessage('Organisation name is required')
  ],
  createOrganisation
);

router.post('/:orgId/users', verifyToken, addUserToOrganisation);

module.exports = router;
