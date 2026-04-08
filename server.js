/**
 * server.js
 * RaiseKit — Express server entry point.
 *
 * Starts a full-stack web server with:
 *   - Session-based authentication (express-session)
 *   - SQLite database via better-sqlite3
 *   - EJS server-side rendering
 *   - CSRF protection via synchronizer token pattern (session-stored)
 *   - Routes: /, /signup, /login, /logout, /dashboard, /generator,
 *             /generate, /playbooks, /playbooks/:id, /playbooks/:id/delete
 */

require('dotenv').config();

// Refuse to start in production without a real session secret
if (process.env.NODE_ENV === 'production' && !process.env.SESSION_SECRET) {
  throw new Error('SESSION_SECRET environment variable is required in production.');
}

const crypto = require('crypto');
const express = require('express');
const path = require('path');
const session = require('express-session');
const FileStore = require('session-file-store')(session);

const app = express();
const PORT = process.env.PORT || 3000;

// ── View engine ────────────────────────────────────────────────────────────
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ── Static files ───────────────────────────────────────────────────────────
app.use(express.static(path.join(__dirname, 'public')));

// ── Body parsing ──────────────────────────────────────────────────────────
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ── Sessions ──────────────────────────────────────────────────────────────
// Sessions are stored as JSON files in ./sessions/ (local to the server).
// For production deployments, swap FileStore for a Redis or Postgres-backed
// store so sessions survive server restarts and work across multiple instances.
app.use(
  session({
    store: new FileStore({ path: './sessions', ttl: 7 * 24 * 3600, retries: 1 }),
    secret: process.env.SESSION_SECRET || 'change-this-secret-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,                                    // Prevent JS access to the cookie
      secure: process.env.NODE_ENV === 'production',     // HTTPS-only in production
      sameSite: 'lax',                                   // Blocks cross-site POST submissions
      maxAge: 7 * 24 * 60 * 60 * 1000,                  // 7 days
    },
  })
);

// ── CSRF protection — synchronizer token pattern ───────────────────────────
// On every request, ensure a per-session CSRF token exists.
// All state-changing requests (POST/PUT/PATCH/DELETE) must include this token
// either as `_csrf` in the request body or as the `X-CSRF-Token` header.
app.use((req, res, next) => {
  // Initialize the session so we can set a CSRF token (needed for unauthenticated
  // visitors who are about to submit the signup/login form).
  if (!req.session.csrfToken) {
    req.session.csrfToken = crypto.randomBytes(32).toString('hex');
  }

  // Validate the token on state-changing methods.
  const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
  if (!safeMethods.includes(req.method)) {
    const submitted =
      (req.body && req.body._csrf) || req.headers['x-csrf-token'];
    if (!submitted || submitted !== req.session.csrfToken) {
      return res
        .status(403)
        .render('error', {
          message: 'Form session expired. Please go back and try again.',
          csrfToken: req.session.csrfToken || '',
          currentUser: req.session.userId
            ? { id: req.session.userId, name: req.session.userName }
            : null,
        });
    }
  }

  next();
});

// ── Locals available to all views ─────────────────────────────────────────
app.use((req, res, next) => {
  res.locals.currentUser = req.session.userId
    ? { id: req.session.userId, name: req.session.userName }
    : null;
  // Expose the CSRF token so every EJS template can embed it in forms and meta tags.
  res.locals.csrfToken = req.session.csrfToken || '';
  next();
});

// ── Routes ─────────────────────────────────────────────────────────────────
const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const playbookRoutes = require('./routes/playbooks');

// Landing page — always public
app.get('/', (req, res) => {
  res.render('index');
});

app.use('/', authRoutes);
app.use('/', dashboardRoutes);
app.use('/', playbookRoutes);

// ── 404 handler ────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).render('404');
});

// ── Error handler ──────────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error', { message: 'Something went wrong. Please try again.' });
});

// ── Start ──────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 RaiseKit running at http://localhost:${PORT}`);
});
