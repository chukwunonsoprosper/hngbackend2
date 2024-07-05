const Organisation = require('../models/organisation.model');

// Get all organisations
exports.getAllOrganisations = async (req, res) => {
  try {
    const organisations = await Organisation.findAll();
    res.status(200).json({
      status: 'success',
      message: 'Organisations retrieved successfully',
      data: { organisations }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'Internal server error',
      message: 'Failed to retrieve organisations',
      statusCode: 500
    });
  }
};
