import request from 'supertest';
import { AppError } from '../utils/AppError';
// We need to export 'app' from app.ts (see note below)
import { app } from '../app'; 
import { db } from '../database';
import { users } from '../database/schema';
import { eq } from 'drizzle-orm';

// Cleanup after tests (Optional but good practice)
afterAll(async () => {
  // Close DB connection or delete test user
  // await db.delete(users).where(eq(users.email, 'test@jest.com'));
});

describe('Auth API', () => {
  const testUser = {
    email: `test_${Date.now()}@jest.com`, // Unique email every run
    password: 'password123',
    name: 'Jest Tester',
  };

  let accessToken = '';

  it('POST /register - should create a new user', async () => {
    const res = await request(app).post('/api/v1/auth/register').send(testUser);

    expect(res.status).toBe(201);
    expect(res.body.status).toBe('success');
    expect(res.body.data.user.email).toBe(testUser.email);
    // Ensure password is NOT returned
    expect(res.body.data.user.passwordHash).toBeUndefined();
  });

  it('POST /login - should return tokens', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({
      email: testUser.email,
      password: testUser.password,
    });

    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.refreshToken).toBeDefined();
    
    // Save token for next test
    accessToken = res.body.data.accessToken;
  });

  it('GET /me - should fail without token', async () => {
    const res = await request(app).get('/api/v1/auth/me');
    expect(res.status).toBe(401);
  });

  it('GET /me - should succeed with token', async () => {
    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.user.email).toBe(testUser.email);
  });
});