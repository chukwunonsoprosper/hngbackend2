const request = require('supertest');
const app = require('../app');
const { User, Organization, sequelize } = require('../models');
const jwt = require('jsonwebtoken');

describe('Authentication', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('POST /auth/register', () => {
    it('Should register user successfully with default organisation', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          password: 'password123',
          phone: '1234567890',
        });

      expect(response.status).toBe(201);
      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('Registration successful');
      expect(response.body.data.accessToken).toBeDefined();
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.user.firstName).toBe('John');

      const user = await User.findOne({ where: { email: 'john@example.com' } });
      const orgs = await user.getOrganizations();
      expect(orgs.length).toBe(1);
      expect(orgs[0].name).toBe("John's Organisation");
    });

    it('Should fail if required fields are missing', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({
          firstName: 'Jane',
          lastName: 'Doe',
          email: 'jane@example.com',
        });

      expect(response.status).toBe(422);
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors.some(e => e.field === 'password')).toBe(true);
    });

    it('Should fail if there\'s duplicate email', async () => {
      await request(app)
        .post('/auth/register')
        .send({
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          password: 'password123',
          phone: '1234567890',
        });

      const response = await request(app)
        .post('/auth/register')
        .send({
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          password: 'password123',
          phone: '1234567890',
        });

      expect(response.status).toBe(422);
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors.some(e => e.field === 'email')).toBe(true);
    });
  });

  describe('POST /auth/login', () => {
    it('Should log the user in successfully', async () => {
      await request(app)
        .post('/auth/register')
        .send({
          firstName: 'Alice',
          lastName: 'Smith',
          email: 'alice@example.com',
          password: 'password123',
          phone: '1234567890',
        });

      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'alice@example.com',
          password: 'password123',
        });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('Login successful');
      expect(response.body.data.accessToken).toBeDefined();
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.user.email).toBe('alice@example.com');
    });

    it('Should fail with invalid credentials', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'alice@example.com',
          password: 'wrongpassword',
        });

      expect(response.status).toBe(401);
      expect(response.body.status).toBe('Bad request');
      expect(response.body.message).toBe('Authentication failed');
    });
  });

  describe('Token generation', () => {
    it('Should generate a token that expires at the correct time', async () => {
      const user = await User.create({
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        password: 'password123',
      });

      const token = jwt.sign({ userId: user.userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      expect(decoded.userId).toBe(user.userId);
      expect(decoded.exp - decoded.iat).toBe(3600);
    });
  });

  describe('Organization access', () => {
    let user1, user2, org1, org2;

    beforeEach(async () => {
      user1 = await User.create({
        firstName: 'User',
        lastName: 'One',
        email: 'user1@example.com',
        password: 'password123',
      });

      user2 = await User.create({
        firstName: 'User',
        lastName: 'Two',
        email: 'user2@example.com',
        password: 'password123',
      });

      org1 = await Organization.create({
        name: 'Org One',
        description: 'First org',
      });

      org2 = await Organization.create({
        name: 'Org Two',
        description: 'Second org',
      });

      await user1.addOrganization(org1);
      await user2.addOrganization(org2);
    });

    it('Should ensure users can\'t see data from organisations they don\'t have access to', async () => {
      const token = jwt.sign({ userId: user1.userId }, process.env.JWT_SECRET);

      const response = await request(app)
        .get(`/api/organisations/${org2.orgId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Organization not found');
    });

    // it('Should allow users to see data from organisations they have access to', async () => {
    //   const token = jwt.sign({ userId: user1.userId }, process.env.JWT_SECRET);

    //   const response = await request(app)
    //     .get(`/api/organisations/${org1.orgId}`)
    //     .set('Authorization', `Bearer ${token}`);

    //   expect(response.status).toBe(200);
    //   expect(response.body.data.orgId).toBe(org1.orgId);
    //   expect(response.body.data.name).toBe(org1.name);
    // });
  });
});