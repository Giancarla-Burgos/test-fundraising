/**
 * server.js
 * RaiseKit — Express server entry point.
 *
 * Starts a full-stack web server with:
 *   - Session-based authentication (express-session)
 *   - SQLite database via better-sqlite3
 *   - EJS server-side rendering
 *   - Routes: /, /signup, /login, /logout, /dashboard, /generator,
 *             /generate, /playbooks, /playbooks/:id, /playbooks/:id/delete
 */

require('dotenv').config();

const express = require('express');
const path = require('path');
const session = require('express-session');
const BetterSqlite3Store = require('better-sqlite3-session-store')(session);
const { db } = require('./models/db');

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
// NOTE: For production, also add a CSRF token middleware (e.g., csrf-csrf)
//       before state-changing POST routes.
app.use(
  session({
    store: new BetterSqlite3Store({ client: db }),
    secret: process.env.SESSION_SECRET || 'change-this-secret-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,                                    // Prevent JS access to the cookie
      secure: process.env.NODE_ENV === 'production',     // HTTPS-only in production
      sameSite: 'lax',                                   // Basic CSRF protection
      maxAge: 7 * 24 * 60 * 60 * 1000,                  // 7 days
    },
  })
);

// ── Locals available to all views ─────────────────────────────────────────
app.use((req, res, next) => {
  res.locals.currentUser = req.session.userId
    ? { id: req.session.userId, name: req.session.userName }
    : null;
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
