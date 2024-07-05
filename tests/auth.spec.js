const request = require('supertest');
const app = require('../server');
const db = require('../models');

describe('User Registration and Login', () => {
  beforeAll(async () => {
    // Sync and clear the database before running the tests
    await db.sequelize.sync({ force: true });
  });

  describe('POST /auth/register', () => {
    it('Should register user successfully with default organisation', async () => {
      const res = await request(app)
        .post('/auth/register')
        .send({
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          password: 'password123',
          phone: '1234567890'
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('status', 'success');
      expect(res.body).toHaveProperty('message', 'Registration successful');
      expect(res.body.data).toHaveProperty('accessToken');
      expect(res.body.data.user).toMatchObject({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '1234567890'
      });
    });

    it('Should fail if required fields are missing', async () => {
      const res = await request(app)
        .post('/auth/register')
        .send({
          firstName: '',
          lastName: '',
          email: '',
          password: '',
          phone: '1234567890'
        });

      expect(res.statusCode).toEqual(422);
      expect(res.body).toHaveProperty('errors');
      expect(res.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ field: 'firstName', message: 'First name is required' }),
          expect.objectContaining({ field: 'lastName', message: 'Last name is required' }),
          expect.objectContaining({ field: 'email', message: 'Email is required' }),
          expect.objectContaining({ field: 'password', message: 'Password is required' }),
        ])
      );
    });

    it('Should fail if there’s a duplicate email or userId', async () => {
      // First registration should succeed
      await request(app)
        .post('/auth/register')
        .send({
          firstName: 'Jane',
          lastName: 'Doe',
          email: 'jane.doe@example.com',
          password: 'password123',
          phone: '1234567890'
        });

      // Second registration with the same email should fail
      const res = await request(app)
        .post('/auth/register')
        .send({
          firstName: 'Jane',
          lastName: 'Doe',
          email: 'jane.doe@example.com',
          password: 'password123',
          phone: '1234567890'
        });

      expect(res.statusCode).toEqual(422);
      expect(res.body).toHaveProperty('errors');
      expect(res.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ field: 'email', message: 'Email already in use' }),
        ])
      );
    });
  });

  describe('POST /auth/login', () => {
    it('Should log the user in successfully', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({
          email: 'john.doe@example.com',
          password: 'password123'
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('status', 'success');
      expect(res.body).toHaveProperty('message', 'Login successful');
      expect(res.body.data).toHaveProperty('accessToken');
      expect(res.body.data.user).toMatchObject({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '1234567890'
      });
    });

    it('Should fail if credentials are invalid', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({
          email: 'john.doe@example.com',
          password: 'wrongpassword'
        });

      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty('status', 'Bad request');
      expect(res.body).toHaveProperty('message', 'Authentication failed');
    });
  });
});
