const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../server');
const User = require('../models/User');
const Attendance = require('../models/Attendance');
const jwt = require('jsonwebtoken');

// Mock Cloudinary utility
jest.mock('../utils/cloudinary', () => ({
  uploadImage: jest.fn().mockResolvedValue('https://res.cloudinary.com/test-image.jpg')
}));

let mongoServer;
let token;
let user;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  
  await mongoose.connect(mongoUri);

  // Create a test user for auth
  user = await User.create({
    name: 'Attendance User',
    email: 'attendance@example.com',
    phone: '0987654321',
    empId: 'EMP002',
    password: 'Password123'
  });

  token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'fallback_secret_key');
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await Attendance.deleteMany({});
});

describe('Attendance API', () => {
  const now = new Date();
  const today = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;
  
  const checkInData = {
    image: 'data:image/jpeg;base64,mockdata',
    location: 'Test Office',
    date: today,
    time: '09:00 AM'
  };

  test('POST /api/attendance - Should mark check-in', async () => {
    const response = await request(app)
      .post('/api/attendance')
      .set('Authorization', `Bearer ${token}`)
      .send(checkInData);

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.checkIn.location).toBe(checkInData.location);
    expect(response.body.data.checkIn.imageUrl).toBe('https://res.cloudinary.com/test-image.jpg');
  });

  test('POST /api/attendance/checkout - Should mark check-out and calculate hours', async () => {
    // 1. First create a check-in record
    await Attendance.create({
      userId: user._id,
      date: today,
      checkIn: {
        imageUrl: 'https://res.cloudinary.com/old-image.jpg',
        location: 'Test Office',
        time: '09:00 AM'
      },
      status: 'present'
    });

    const checkOutData = {
      image: 'data:image/jpeg;base64,checkoutmock',
      location: 'Home Office',
      date: today,
      time: '05:00 PM'
    };

    const response = await request(app)
      .post('/api/attendance/checkout')
      .set('Authorization', `Bearer ${token}`)
      .send(checkOutData);

    expect(response.status).toBe(200);
    expect(response.body.attendance.checkOut.time).toBe(checkOutData.time);
    expect(response.body.attendance.totalHours).toBe('8h 0m');
    expect(response.body.attendance.earning).toBeGreaterThan(0);
  });

  test('POST /api/attendance - Should fail without token', async () => {
    const response = await request(app)
      .post('/api/attendance')
      .send(checkInData);

    expect(response.status).toBe(401);
  });
});
