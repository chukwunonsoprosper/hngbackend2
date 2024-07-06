const express = require('express');
const { Organization, User } = require('../models');
const authenticateToken = require('../middleware/authenticateToken');

const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.userId);
    const organizations = await user.getOrganizations();

    res.status(200).json({
      status: 'success',
      message: 'Organizations retrieved successfully',
      data: {
        organizations: organizations.map(org => ({
          orgId: org.orgId,
          name: org.name,
          description: org.description,
        })),
      },
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
});

router.get('/:orgId', authenticateToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.userId);
    const organization = await Organization.findByPk(req.params.orgId);

    if (!organization || !(await user.hasOrganization(organization))) {
      return res.status(404).json({
        status: 'error',
        message: 'Organization not found',
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Organization retrieved successfully',
      data: {
        orgId: organization.orgId,
        name: organization.name,
        description: organization.description,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(422).json({
        errors: [{ field: 'name', message: 'Name is required' }],
      });
    }

    const organization = await Organization.create({ name, description });
    const user = await User.findByPk(req.user.userId);
    await user.addOrganization(organization);

    res.status(201).json({
      status: 'success',
      message: 'Organisation created successfully',
      data: {
        orgId: organization.orgId,
        name: organization.name,
        description: organization.description,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'Bad Request',
      message: 'Client error',
      statusCode: 400,
    });
  }
});

router.post('/:orgId/users', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.body;
    const organization = await Organization.findByPk(req.params.orgId);
    const user = await User.findByPk(userId);

    if (!organization || !user) {
      return res.status(404).json({
        status: 'error',
        message: 'Organization or user not found',
      });
    }

    await organization.addUser(user);

    res.status(200).json({
      status: 'success',
      message: 'User added to organisation successfully',
    });
  } catch (error) {
    res.status(400).json({
      status: 'Bad Request',
      message: 'Client error',
      statusCode: 400,
    });
  }
});

module.exports = router;