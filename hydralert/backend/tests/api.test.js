const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/index');
const User = require('../src/models/User');
const Log = require('../src/models/Log');

let token;
let userId;

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  // Clean test DB
  await User.deleteMany({});
  await Log.deleteMany({});
});

afterAll(async () => {
  await User.deleteMany({});
  await Log.deleteMany({});
  await mongoose.connection.close();
});

// ─── Auth Tests ───────────────────────────────────────────
describe('POST /api/auth/register', () => {
  it('registers a new user and returns a token', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test User', email: 'test@example.com', password: 'Password123' });

    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe('test@example.com');
    expect(res.body.user.passwordHash).toBeUndefined(); // Must not expose hash

    token = res.body.token;
    userId = res.body.user._id;
  });

  it('rejects duplicate email', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test User 2', email: 'test@example.com', password: 'Password123' });

    expect(res.status).toBe(409);
  });

  it('rejects short password', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test', email: 'test2@example.com', password: '123' });

    expect(res.status).toBe(400);
  });
});

describe('POST /api/auth/login', () => {
  it('logs in with correct credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'Password123' });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  it('rejects wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'WrongPassword' });

    expect(res.status).toBe(401);
  });
});

// ─── User Profile Tests ───────────────────────────────────
describe('GET /api/users/me', () => {
  it('returns user profile with valid token', async () => {
    const res = await request(app)
      .get('/api/users/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe('test@example.com');
  });

  it('rejects unauthenticated request', async () => {
    const res = await request(app).get('/api/users/me');
    expect(res.status).toBe(401);
  });
});

describe('PUT /api/users/me', () => {
  it('updates user profile', async () => {
    const res = await request(app)
      .put('/api/users/me')
      .set('Authorization', `Bearer ${token}`)
      .send({ age: 30, weightKg: 70, activityLevel: 'high', dailyGoalMl: 2500 });

    expect(res.status).toBe(200);
    expect(res.body.user.age).toBe(30);
    expect(res.body.user.activityLevel).toBe('high');
  });
});

// ─── Log Tests ────────────────────────────────────────────
describe('POST /api/logs', () => {
  it('creates a water intake log', async () => {
    const res = await request(app)
      .post('/api/logs')
      .set('Authorization', `Bearer ${token}`)
      .send({ amountMl: 250 });

    expect(res.status).toBe(201);
    expect(res.body.log.amountMl).toBe(250);
  });

  it('rejects negative amount', async () => {
    const res = await request(app)
      .post('/api/logs')
      .set('Authorization', `Bearer ${token}`)
      .send({ amountMl: -100 });

    expect(res.status).toBe(400);
  });

  it('rejects amount over 5000', async () => {
    const res = await request(app)
      .post('/api/logs')
      .set('Authorization', `Bearer ${token}`)
      .send({ amountMl: 9999 });

    expect(res.status).toBe(400);
  });
});

describe('GET /api/logs', () => {
  it('fetches logs for authenticated user', async () => {
    const res = await request(app)
      .get('/api/logs')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.logs)).toBe(true);
    expect(res.body.logs.length).toBeGreaterThan(0);
    expect(res.body.todayTotal).toBeGreaterThan(0);
  });
});

// ─── Health Check ─────────────────────────────────────────
describe('GET /api/health', () => {
  it('returns ok status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});
