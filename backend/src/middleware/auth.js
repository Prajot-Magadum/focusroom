const verifyToken = require('../utils/verifyToken');

// Verifies the Supabase access token sent by the frontend
// (Authorization: Bearer <token>) and attaches the user to req.user.
// Apply this to any route that needs to know who the caller is,
// e.g. POST /rooms, POST /rooms/:id/join.
async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const [scheme, token] = authHeader.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({
      success: false,
      message: 'Missing or invalid Authorization header',
    });
  }

  const user = await verifyToken(token);

  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired session',
    });
  }

  req.user = user;
  next();
}

module.exports = requireAuth;