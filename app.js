const express = require('express');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/authRoutes');
const organisationRoutes = require('./routes/organisationRoutes');
const userRoutes = require('./routes/userRoutes'); // Import user routes
const sequelize = require('./config/database');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

app.use(bodyParser.json());

// Routes
app.use('/auth', authRoutes);
app.use('/api/organisations', organisationRoutes);
app.use('/api/users', userRoutes); 

module.exports = app;
