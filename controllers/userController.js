const { User } = require('../models');

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findOne({
      where: { userId: req.params.id } // Use 'userId' instead of 'id'
    });

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found',
        statusCode: 404
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'User details fetched successfully',
      data: user
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: 'error',
      message: 'Server error apa',
      statusCode: 500
    });
  }
};
