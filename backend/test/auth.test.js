const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const User = require('../models/User');
const fs = require('fs');
const path = require('path');

let MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  try {
    const configPath = path.join(__dirname, '../config/default.json');
    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    MONGO_URI = config.MONGO_URI;
  } catch (err) {
    MONGO_URI = 'mongodb://localhost:27017/blog-app-test';
  }
}

describe('Auth Endpoints', () => {
  beforeAll(async () => {
    await mongoose.connect(MONGO_URI);
    await User.deleteMany({});
  });

  afterAll(async () => {
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  let token;

  it('should register a new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test User', email: 'testuser@example.com', password: 'password123' });
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user.email).toBe('testuser@example.com');
  });

  it('should login the user', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'testuser@example.com', password: 'password123' });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('token');
    token = res.body.token;
  });
});
