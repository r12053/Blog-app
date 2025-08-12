const request = require('supertest');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const app = require('../src/app');
const User = require('../models/User');
const Post = require('../models/Post');

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

describe('Blog Post Features', () => {
  let userToken, adminToken, postId, commentId;

  beforeAll(async () => {
    await mongoose.connect(MONGO_URI);
    await User.deleteMany({});
    await Post.deleteMany({});
    // Create user
    await request(app)
      .post('/api/auth/register')
      .send({ name: 'User', email: 'user@example.com', password: 'password123' });
    // Ensure user exists in DB before login
    let tries = 0;
    while (tries < 5) {
      const exists = await User.findOne({ email: 'user@example.com' });
      if (exists) break;
      await new Promise((r) => setTimeout(r, 200));
      tries++;
    }
    // Create admin
    await request(app)
      .post('/api/auth/register')
      .send({ name: 'Admin', email: 'admin@example.com', password: 'adminpass' });
    // Set admin role
    const admin = await User.findOne({ email: 'admin@example.com' });
    admin.roles = ['admin'];
    await admin.save();
    // Login user
    const userRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'user@example.com', password: 'password123' });
    userToken = userRes.body.token;
    console.log('User token:', userToken);
    console.log('User login response:', userRes.body);
    // Login admin
    const adminRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@example.com', password: 'adminpass' });
    adminToken = adminRes.body.token;
    console.log('Admin token:', adminToken);
  });

  afterAll(async () => {
    await User.deleteMany({});
    await Post.deleteMany({});
    await mongoose.connection.close();
  });

  it('should create a post', async () => {
    console.log('Creating post with token:', userToken);
    const res = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ title: 'Test Post', content: 'This is a test post.' });
    console.log('Post creation response:', res.statusCode, res.body);
    expect(res.statusCode).toBe(201);
    expect(res.body.title).toBe('Test Post');
    postId = res.body._id;
  });

  it('should get all posts', async () => {
    const res = await request(app).get('/api/posts');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('should get a single post', async () => {
    const res = await request(app).get(`/api/posts/${postId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body._id).toBe(postId);
  });

  it('should update a post', async () => {
    const res = await request(app)
      .put(`/api/posts/${postId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ title: 'Updated Title' });
    expect(res.statusCode).toBe(200);
    expect(res.body.title).toBe('Updated Title');
  });

  it('should add a comment', async () => {
    const res = await request(app)
      .post(`/api/posts/${postId}/comments`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ text: 'Nice post!' });
    expect(res.statusCode).toBe(201);
    expect(res.body.text).toBe('Nice post!');
    commentId = res.body._id;
  });

  it('should like the post', async () => {
    const res = await request(app)
      .post(`/api/posts/${postId}/like`)
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.liked).toBe(true);
  });

  it('should unlike the post', async () => {
    const res = await request(app)
      .post(`/api/posts/${postId}/like`)
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.liked).toBe(false);
  });

  it('should bookmark the post', async () => {
    const res = await request(app)
      .post(`/api/posts/${postId}/bookmark`)
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.bookmarked).toBe(true);
  });

  it('should unbookmark the post', async () => {
    const res = await request(app)
      .post(`/api/posts/${postId}/bookmark`)
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.bookmarked).toBe(false);
  });

  it('should not allow non-author to delete post', async () => {
    const res = await request(app)
      .delete(`/api/posts/${postId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(403);
  });

  it('should allow admin to delete post', async () => {
    // Re-create post for admin delete
    const createRes = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ title: 'Admin Delete Post', content: 'To be deleted by admin.' });
    const adminPostId = createRes.body._id;
    const res = await request(app)
      .delete(`/api/posts/${adminPostId}/admin`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.msg).toBe('Post deleted');
  });

  it('should allow comment author to delete comment', async () => {
    // Ensure a post exists
    const ensurePost = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ title: 'Post for comments', content: 'Testing comments' });
    postId = ensurePost.body._id;
    // Add comment
    const commentRes = await request(app)
      .post(`/api/posts/${postId}/comments`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ text: 'Comment to delete' });
    const delCommentId = commentRes.body._id;
    const res = await request(app)
      .delete(`/api/posts/${postId}/comments/${delCommentId}`)
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.msg).toBe('Comment deleted');
  });

  it('should allow admin to delete any comment', async () => {
    // Add comment as user on existing post
    const commentRes = await request(app)
      .post(`/api/posts/${postId}/comments`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ text: 'Admin will delete this' });
    const adminDelCommentId = commentRes.body._id;
    const res = await request(app)
      .delete(`/api/posts/${postId}/comments/${adminDelCommentId}/admin`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.msg).toBe('Comment deleted');
  });

  // File upload test (mock, does not require actual file)
  it('should upload a cover image (mock)', async () => {
    const res = await request(app)
      .post('/api/posts/upload')
      .set('Authorization', `Bearer ${userToken}`)
      .attach('coverImage', Buffer.from('fake image data'), 'test.png');
    expect(res.statusCode).toBe(201);
    expect(res.body.url).toMatch(/\/uploads\//);
  });
});
