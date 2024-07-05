const request = require('supertest');
const app = require('../server'); // Adjust the path as necessary
const db = require('../models');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

describe('User Management Endpoints', () => {
  let userToken;
  let userId;

  beforeAll(async () => {
    // Sync and clear the database before running the tests
    await db.sequelize.sync({ force: true });

    // Register a user to get a token
    const res = await request(app)
      .post('/auth/register')
      .send({
        firstName: 'Alice',
        lastName: 'Smith',
        email: 'alice.smith@example.com',
        password: 'password123',
        phone: '0987654321'
      });

    userToken = res.body.data.accessToken;
    userId = res.body.data.user.userId;
  });

  describe('GET /api/users/:id', () => {
    it('Should get user details by their ID', async () => {
      const res = await request(app)
        .get(`/api/users/${userId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('status', 'success');
      expect(res.body.data).toHaveProperty('userId', userId);
      expect(res.body.data).toHaveProperty('firstName', 'Alice');
      expect(res.body.data).toHaveProperty('lastName', 'Smith');
      expect(res.body.data).toHaveProperty('email', 'alice.smith@example.com');
      expect(res.body.data).toHaveProperty('phone', '0987654321');
    });

    it('Should fail if trying to access another user\'s details', async () => {
      // Register another user
      const res = await request(app)
        .post('/auth/register')
        .send({
          firstName: 'Bob',
          lastName: 'Johnson',
          email: 'bob.johnson@example.com',
          password: 'password123',
          phone: '1112223333'
        });

      const anotherUserId = res.body.data.user.userId;

      // Try to access another user's details
      const accessRes = await request(app)
        .get(`/api/users/${anotherUserId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(accessRes.statusCode).toEqual(403);
      expect(accessRes.body).toHaveProperty('status', 'error');
      expect(accessRes.body).toHaveProperty('message', 'Forbidden');
    });
  });

  // Add more tests for user update, delete, etc.
});
