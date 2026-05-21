const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../server');
const User = require('../models/User');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  // Close any existing connections before connecting to memory server
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

let superAdminId;

beforeEach(async () => {
  await User.deleteMany({});
  
  // Create Super Admin to allow guest employee registrations
  const superAdmin = await User.create({
    name: 'Super Admin',
    email: 'admin@worktrackr.com',
    phone: '1234567890',
    empId: 'SUPER01',
    password: 'AdminPassword123',
    role: 'superadmin'
  });
  superAdminId = superAdmin._id;
});

describe('Auth API', () => {
  const testUser = {
    name: 'Test User',
    email: 'test@example.com',
    phone: '1234567890',
    empId: 'EMP001',
    password: 'Password123'
  };

  test('POST /api/auth/register - Should register a new user', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send(testUser);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('token');
    expect(response.body.email).toBe(testUser.email);
    
    const userInDb = await User.findOne({ email: testUser.email });
    expect(userInDb).toBeTruthy();
    expect(userInDb.name).toBe(testUser.name);
  });

  test('POST /api/auth/login - Should login existing user', async () => {
    // Manually create user
    await User.create({ ...testUser, organizationId: superAdminId });

    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
    expect(response.body.name).toBe(testUser.name);
  });

  test('POST /api/auth/login - Should fail with wrong password', async () => {
    await User.create({ ...testUser, organizationId: superAdminId });

    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: 'WrongPassword'
      });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Invalid credentials');
  });

  test('POST /api/auth/register - Should register orgadmin and generate Organization with secret code', async () => {
    const orgAdminData = {
      name: 'Org Admin User',
      email: 'orgadmin@example.com',
      phone: '9876543210',
      empId: 'ADM001',
      password: 'AdminPassword123',
      role: 'orgadmin'
    };

    const response = await request(app)
      .post('/api/auth/register')
      .send(orgAdminData);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('token');
    expect(response.body.role).toBe('orgadmin');
    expect(response.body.organizationId).toBeTruthy();

    // Verify User record in DB has dbName and organizationId
    const userInDb = await User.findOne({ email: orgAdminData.email });
    expect(userInDb).toBeTruthy();
    expect(userInDb.organizationId).toBeTruthy();
    expect(userInDb.dbName).toContain('worktrackr_org_org_admin_user_');

    // Verify Organization record was created
    const Organization = require('../models/Organization');
    const orgInDb = await Organization.findById(userInDb.organizationId);
    expect(orgInDb).toBeTruthy();
    expect(orgInDb.name).toBe(orgAdminData.name);
    expect(orgInDb.email).toBe(orgAdminData.email);
    expect(orgInDb.joinCode).toBeTruthy();
    expect(orgInDb.joinCode.length).toBeGreaterThan(0);
    expect(orgInDb.orgId).toContain('ORG-');
  });
});
