const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../app');
const { sequelize } = require('../models');
const { expect } = chai;

chai.use(chaiHttp);

describe('Auth API', () => {
  let accessToken;
  let userId;
  let orgId;

  before(async () => {
    await sequelize.sync({ force: true });

    // Register a user
    const registerRes = await chai.request(app)
      .post('/auth/register')
      .send({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@gmail.com',
        password: 'password123',
        phone: '1234567890'
      });

    expect(registerRes).to.have.status(201);
    expect(registerRes.body).to.have.property('status', 'success');
    expect(registerRes.body.data).to.have.property('accessToken');
    expect(registerRes.body.data.user).to.include({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@gmail.com'
    });

    accessToken = registerRes.body.data.accessToken;
    userId = registerRes.body.data.user.userId;
  });

  describe('POST /auth/login', () => {
    it('should log the user in successfully', (done) => {
      chai.request(app)
        .post('/auth/login')
        .send({
          email: 'john.doe@gmail.com',
          password: 'password123'
        })
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('status', 'success');
          expect(res.body.data).to.have.property('accessToken');
          expect(res.body.data.user).to.include({
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@gmail.com'
          });
          accessToken = res.body.data.accessToken; // Update accessToken for protected endpoint tests
          done();
        });
    });
  });

  describe('GET /api/users/:id', () => {
    it('should get user details for logged in user', (done) => {
      chai.request(app)
        .get(`/api/users/${userId}`)
        .set('Authorization', `Bearer ${accessToken}`) // Set Authorization header
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('status', 'success');
          expect(res.body.data).to.include({
            userId: userId,
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@gmail.com'
          });
          done();
        });
    });
  });

  describe('Organisation API', () => {
    describe('POST /api/organisations', () => {
      it('should create a new organisation', (done) => {
        chai.request(app)
          .post('/api/organisations')
          .set('Authorization', `Bearer ${accessToken}`) // Set Authorization header
          .send({
            name: "John's Organisation",
            description: "Default organisation for John"
          })
          .end((err, res) => {
            expect(res).to.have.status(201);
            expect(res.body).to.have.property('status', 'success');
            expect(res.body.data).to.have.property('orgId');
            expect(res.body.data).to.include({
              name: "John's Organisation",
              description: "Default organisation for John"
            });
            orgId = res.body.data.orgId;
            done();
          });
      });
    });

    describe('GET /api/organisations/:orgId', () => {
      it('should get details of a specific organisation', (done) => {
        chai.request(app)
          .get(`/api/organisations/${orgId}`)
          .set('Authorization', `Bearer ${accessToken}`) // Set Authorization header
          .end((err, res) => {
            expect(res).to.have.status(200);
            expect(res.body).to.have.property('status', 'success');
            expect(res.body.data).to.include({
              orgId: orgId,
              name: "John's Organisation",
              description: "Default organisation for John"
            });
            done();
          });
      });
    });

    describe('GET /api/organisations', () => {
      it('should get all organisations of the logged in user', (done) => {
        chai.request(app)
          .get('/api/organisations')
          .set('Authorization', `Bearer ${accessToken}`) // Set Authorization header
          .end((err, res) => {
            expect(res).to.have.status(200);
            expect(res.body).to.have.property('status', 'success');
            expect(res.body.data.organisations).to.be.an('array').that.is.not.empty;
            done();
          });
      });
    });
  });
});
