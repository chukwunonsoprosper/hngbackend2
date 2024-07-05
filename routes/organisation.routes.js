const express = require('express');
const router = express.Router();
const organisationController = require('../controllers/organisation.controller');

// GET /api/organisations
router.get('/', organisationController.getAllOrganisations);

module.exports = router;
