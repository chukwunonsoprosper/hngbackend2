const { Organisation, User } = require('../models');
const { v4: uuidv4 } = require('uuid');  // Import the uuid library

exports.getOrganisations = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.userId);

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found',
        statusCode: 404
      });
    }

    const organisations = await user.getOrganisations();

    if (!organisations) {
      return res.status(404).json({
        status: 'error',
        message: 'Organisations not found for the user',
        statusCode: 404
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Organisations fetched successfully',
      data: {
        organisations
      }
    });
  } catch (err) {
    console.error('Error fetching organisations:', err);
    res.status(500).json({
      status: 'error',
      message: 'Server error in org controller',
      error: err.message,  // Include specific error message for debugging
      statusCode: 500
    });
  }
};

exports.getOrganisationById = async (req, res) => {
  const { orgId } = req.params;

  try {
    const organisation = await Organisation.findByPk(orgId);

    if (!organisation) {
      return res.status(404).json({
        status: 'error',
        message: 'Organisation not found',
        statusCode: 404
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Organisation fetched successfully',
      data: organisation
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: 'Server error',
      statusCode: 500
    });
  }
};

exports.createOrganisation = async (req, res) => {
  const { name, description } = req.body;

  try {
    // Validate input
    if (!name || !description) {
      return res.status(400).json({
        status: 'error',
        message: 'Name and description are required',
        statusCode: 400
      });
    }

    // Create organisation
    const organisation = await Organisation.create({
      orgId: uuidv4(),
      name,
      description
    });

    // Check if organisation was successfully created
    if (!organisation) {
      return res.status(500).json({
        status: 'error',
        message: 'Failed to create organisation',
        statusCode: 500
      });
    }

    // Associate the user with the created organisation
    await organisation.addUser(req.user);

    // Respond with success status
    res.status(201).json({
      status: 'success',
      message: 'Organisation created successfully',
      data: organisation
    });
  } catch (err) {
    // Handle errors
    console.error('Error creating organisation:', err);
    res.status(500).json({
      status: 'error',
      message: 'Server error',
      error: err.message,
      statusCode: 500
    });
  }
};

exports.addUserToOrganisation = async (req, res) => {
  const { orgId } = req.params;
  const { userId } = req.body;

  try {
    const organisation = await Organisation.findByPk(orgId);
    const user = await User.findByPk(userId);

    if (!organisation || !user) {
      return res.status(404).json({
        status: 'error',
        message: 'Organisation or user not found',
        statusCode: 404
      });
    }

    await organisation.addUser(user);

    res.status(200).json({
      status: 'success',
      message: 'User added to organisation successfully'
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: 'Server error',
      statusCode: 500
    });
  }
};
