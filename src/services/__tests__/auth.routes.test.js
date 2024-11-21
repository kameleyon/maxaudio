import request from 'supertest';
import app from '../../app'; // Adjust the import based on your app's entry point

describe('Auth Routes', () => {
  describe('POST /api/auth/register', () => {
    it('should register a new user and return a token', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'newuser@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toHaveProperty('email', 'newuser@example.com');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should log in an existing user and return a token', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'existinguser@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toHaveProperty('email', 'existinguser@example.com');
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should log out the user', async () => {
      const response = await request(app)
        .post('/api/auth/logout');

      expect(response.status).toBe(200);
    });
  });
});
