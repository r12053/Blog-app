const Post = require('../models/Post');
const { validationResult } = require('express-validator');

exports.createPost = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const post = new Post({
      title: req.body.title,
      content: req.body.content,
      coverImage: req.body.coverImage,
      author: req.user.userId
    });
    await post.save();
    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

exports.getPosts = async (req, res) => {
  try {
    const posts = await Post.find().populate('author', 'name email avatar').sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

exports.getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate('author', 'name email avatar');
    if (!post) return res.status(404).json({ msg: 'Post not found' });
    res.json(post);
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

exports.updatePost = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ msg: 'Post not found' });
    if (
      post.author.toString() !== req.user.userId &&
      !(req.user.roles && req.user.roles.includes('admin'))
    ) {
      return res.status(403).json({ msg: 'Unauthorized' });
    }
    post.title = req.body.title || post.title;
    post.content = req.body.content || post.content;
    post.coverImage = req.body.coverImage || post.coverImage;
    await post.save();
    res.json(post);
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// Author-only delete
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ msg: 'Post not found' });
    if (post.author.toString() !== req.user.userId) {
      return res.status(403).json({ msg: 'Unauthorized' });
    }
    await post.deleteOne();
    res.json({ msg: 'Post deleted' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// Admin delete (no author check)
exports.deletePostAsAdmin = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ msg: 'Post not found' });
    await post.deleteOne();
    res.json({ msg: 'Post deleted' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

exports.addComment = async (req, res) => {
  console.log("we are at 94",req.user);
  const { text } = req.body;
  if (!text) return res.status(400).json({ msg: 'Comment text is required' });
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ msg: 'Post not found' });
    const comment = {
      user: req.user.userId,
      text,
      name : req.user.name
    };
    post.comments.unshift(comment);
    await post.save();
    await post.populate('comments.user', 'name email avatar');
    res.status(201).json(post.comments[0]);
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// Author delete own comment
exports.deleteComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ msg: 'Post not found' });
    const comment = post.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ msg: 'Comment not found' });
    if (comment.user.toString() !== req.user.userId) {
      return res.status(403).json({ msg: 'Unauthorized' });
    }
    await comment.deleteOne();
    await post.save();
    res.json({ msg: 'Comment deleted' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// Admin delete any comment
exports.deleteCommentAsAdmin = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ msg: 'Post not found' });
    const comment = post.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ msg: 'Comment not found' });
    await comment.deleteOne();
    await post.save();
    res.json({ msg: 'Comment deleted' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

exports.toggleLike = async (req, res) => {
  try {
    console.log("hello we are here      h");
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ msg: 'Post not found' });
    const userId = req.user.userId;
    const index = post.likes.indexOf(userId);
    if (index === -1) {
      post.likes.push(userId);
      await post.save();
      return res.json({ liked: true, likesCount: post.likes.length });
    } else {
      post.likes.splice(index, 1);
      await post.save();
      return res.json({ liked: false, likesCount: post.likes.length });
    }
  } catch (err) {
    console.log("present here")
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

exports.toggleBookmark = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ msg: 'Post not found' });
    const userId = req.user.userId;
    const index = post.bookmarks.indexOf(userId);
    if (index === -1) {
      post.bookmarks.push(userId);
      await post.save();
      return res.json({ bookmarked: true, bookmarksCount: post.bookmarks.length });
    } else {
      post.bookmarks.splice(index, 1);
      await post.save();
      return res.json({ bookmarked: false, bookmarksCount: post.bookmarks.length });
    }
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};
