/**
 * middleware/requireAuth.js
 * Route guard — redirects unauthenticated users to /login.
 */

function requireAuth(req, res, next) {
  if (req.session && req.session.userId) {
    return next();
  }
  // Store intended destination so we can redirect after login
  req.session.returnTo = req.originalUrl;
  res.redirect('/login');
}

module.exports = requireAuth;
