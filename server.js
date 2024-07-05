const express = require('express');
const app = express();
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const orgRoutes = require('./routes/organizations');

app.use(express.json());

app.use('/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/organisations', orgRoutes);

module.exports = app;