/**
 * routes/auth.js
 * GET  /signup  → signup form
 * POST /signup  → create user
 * GET  /login   → login form
 * POST /login   → authenticate user
 * POST /logout  → destroy session
 */

const express = require('express');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const { users } = require('../models/db');

const router = express.Router();

// ── Signup ────────────────────────────────────────────────────────────────

router.get('/signup', (req, res) => {
  // If already logged in, send to dashboard
  if (req.session.userId) return res.redirect('/dashboard');
  res.render('signup', { errors: [], old: {} });
});

router.post(
  '/signup',
  [
    body('name').trim().notEmpty().withMessage('Name is required.').escape(),
    body('email')
      .trim()
      .isEmail()
      .withMessage('Please enter a valid email address.')
      .normalizeEmail(),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters.'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    const old = { name: req.body.name, email: req.body.email };

    if (!errors.isEmpty()) {
      return res.render('signup', {
        errors: errors.array().map((e) => e.msg),
        old,
      });
    }

    const { name, email, password } = req.body;

    // Check for existing email
    if (users.findByEmail(email)) {
      return res.render('signup', {
        errors: ['An account with that email already exists.'],
        old,
      });
    }

    // Hash password and create user
    const passwordHash = await bcrypt.hash(password, 12);
    const userId = users.create({ name, email, password: passwordHash });

    // Log user in immediately; save session before redirecting
    req.session.userId = userId;
    req.session.userName = name;
    req.session.save((err) => {
      if (err) {
        return res.render('signup', { errors: ['Sign up failed. Please try again.'], old });
      }
      res.redirect('/dashboard');
    });
  }
);

// ── Login ─────────────────────────────────────────────────────────────────

router.get('/login', (req, res) => {
  if (req.session.userId) return res.redirect('/dashboard');
  res.render('login', { errors: [], old: {} });
});

router.post(
  '/login',
  [
    body('email').trim().isEmail().withMessage('Please enter a valid email address.').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required.'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    const old = { email: req.body.email };

    if (!errors.isEmpty()) {
      return res.render('login', {
        errors: errors.array().map((e) => e.msg),
        old,
      });
    }

    const { email, password } = req.body;
    const user = users.findByEmail(email);

    // Deliberate constant-time comparison even on missing user
    const passwordMatch = user
      ? await bcrypt.compare(password, user.password)
      : await bcrypt.compare(password, '$2a$12$invalidhashplaceholderXXXXXXXXXXXXXXXXXXXXXXXXXXX');

    if (!user || !passwordMatch) {
      return res.render('login', {
        errors: ['Invalid email or password.'],
        old,
      });
    }

    // Regenerate session to prevent session fixation
    req.session.regenerate((err) => {
      if (err) {
        return res.render('login', { errors: ['Login failed. Please try again.'], old });
      }
      req.session.userId = user.id;
      req.session.userName = user.name;

      const returnTo = req.session.returnTo || '/dashboard';
      delete req.session.returnTo;
      res.redirect(returnTo);
    });
  }
);

// ── Logout ────────────────────────────────────────────────────────────────

router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

module.exports = router;
