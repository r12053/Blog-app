const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const postController = require('../controllers/postController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const admin = require('../middleware/admin');

// Create post
router.post(
  '/',
  upload.single('image'), 
  auth,
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('content').notEmpty().withMessage('Content is required'),
  ],
  postController.createPost
);

// Get all posts
router.get('/', postController.getPosts);

// Get single post
router.get('/:id', postController.getPostById);

// Update post
router.put(
  '/:id',
  auth,
  [
    body('title').optional().notEmpty().withMessage('Title cannot be empty'),
    body('content').optional().notEmpty().withMessage('Content cannot be empty'),
  ],
  postController.updatePost
);

// Delete post
router.delete('/:id', auth, postController.deletePost);

// Add comment
router.post('/:id/comments', auth, postController.addComment);
// Delete comment
router.delete('/:id/comments/:commentId', auth, postController.deleteComment);

// Like/unlike post
router.post('/:id/like', auth, postController.toggleLike);
// Bookmark/unbookmark post
router.post('/:id/bookmark', auth, postController.toggleBookmark);

// Upload cover image
router.post('/upload', auth, upload.single('coverImage'), (req, res) => {
  if (!req.file) return res.status(400).json({ msg: 'No file uploaded' });
  const fileUrl = `/uploads/${req.file.filename}`;
  res.status(201).json({ url: fileUrl });
});

// Admin delete post
router.delete('/:id/admin', auth, admin, postController.deletePostAsAdmin);
// Admin delete comment
router.delete('/:id/comments/:commentId/admin', auth, admin, postController.deleteCommentAsAdmin);

module.exports = router;
