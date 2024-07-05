const request = require('supertest');
const app = require('../server');
const db = require('../models');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

describe('Organisation Endpoints', () => {
  let userToken;
  let orgId;

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
  });

  describe('GET /api/organisations', () => {
    it('Should get all organisations the user belongs to', async () => {
      const res = await request(app)
        .get('/api/organisations')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('status', 'success');
      expect(res.body).toHaveProperty('message');
      expect(res.body.data).toHaveProperty('organisations');
      expect(res.body.data.organisations.length).toBeGreaterThan(0);
    });
  });

  describe('POST /api/organisations', () => {
    it('Should create a new organisation', async () => {
      const res = await request(app)
        .post('/api/organisations')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: 'Alice\'s New Organisation',
          description: 'A new organisation created by Alice'
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('status', 'success');
      expect(res.body).toHaveProperty('message', 'Organisation created successfully');
      expect(res.body.data).toHaveProperty('orgId');
      expect(res.body.data.name).toEqual('Alice\'s New Organisation');
      expect(res.body.data.description).toEqual('A new organisation created by Alice');

      orgId = res.body.data.orgId;
    });

    it('Should fail if required fields are missing', async () => {
      const res = await request(app)
        .post('/api/organisations')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          description: 'An organisation without a name'
        });

      expect(res.statusCode).toEqual(422);
      expect(res.body).toHaveProperty('errors');
      expect(res.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ field: 'name', message: 'Name is required' }),
        ])
      );
    });
  });

  describe('GET /api/organisations/:orgId', () => {
    it('Should get a single organisation by its ID', async () => {
      const res = await request(app)
        .get(`/api/organisations/${orgId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('status', 'success');
      expect(res.body).toHaveProperty('message');
      expect(res.body.data).toHaveProperty('orgId', orgId);
      expect(res.body.data.name).toEqual('Alice\'s New Organisation');
      expect(res.body.data.description).toEqual('A new organisation created by Alice');
    });

    it('Should fail if the organisation does not exist', async () => {
      const res = await request(app)
        .get('/api/organisations/nonexistent')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toEqual(404);
      expect(res.body).toHaveProperty('status', 'error');
      expect(res.body).toHaveProperty('message', 'Organisation not found');
    });
  });
});
