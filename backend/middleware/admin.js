module.exports = function (req, res, next) {
  if (req.user && req.user.roles && req.user.roles.includes('admin')) {
    return next();
  }
  return res.status(403).json({ msg: 'Admin access required' });
};
