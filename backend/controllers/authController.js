const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const getJwtSecret = require('../utils/getJwtSecret');
const JWT_SECRET = getJwtSecret();

exports.register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { name, email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }
    user = new User({ name, email, password });
    await user.save();
    // Debug
    // console.log('Registered user:', { id: user._id.toString(), email: user.email });
    const payload = { userId: user._id, roles: user.roles,name : name };
    console.log(payload);
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email, avatar: user.avatar, roles: user.roles } });
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

exports.login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      // console.log('Login failed: user not found', email);
      return res.status(400).json({ msg: 'Invalid credentials' });
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      // console.log('Login failed: password mismatch for', email);
      return res.status(400).json({ msg: 'Invalid credentials' });
    }
    const payload = { userId: user._id, roles: user.roles,name: user.name, };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, avatar: user.avatar, roles: user.roles } });
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};
