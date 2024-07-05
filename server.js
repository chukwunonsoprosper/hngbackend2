const express = require('express');
const bodyParser = require('body-parser');
const sequelize = require('./config/db.config');
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const organisationRoutes = require('./routes/organisation.routes');
const { verifyToken } = require('./middlewares/auth.middleware');

const app = express();
const PORT = process.env.PORT;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use('/auth', authRoutes);
app.use('/api/users', verifyToken, userRoutes);
app.use('/api/organisations', verifyToken, organisationRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    status: 'Internal server error',
    message: err.message,
    statusCode: 500
  });
});

// Start server
sequelize.sync().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
});
