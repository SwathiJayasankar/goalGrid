const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  // Get token from headers (standard x-auth-token or Authorization Bearer)
  let token = req.header('x-auth-token') || req.header('Authorization');

  // Support both "x-auth-token: token" and "Authorization: Bearer token"
  if (token && token.startsWith('Bearer ')) {
    token = token.slice(7, token.length).trim();
  }

  if (!token) {
    return res.status(401).json({ message: 'No authorization token, access denied' });
  }

  try {
    const secret = process.env.JWT_SECRET || 'productive_super_secret_key_12345';
    const decoded = jwt.verify(token, secret);
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is invalid or expired' });
  }
};
