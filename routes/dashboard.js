/**
 * routes/dashboard.js
 * GET /dashboard → protected dashboard page
 */

const express = require('express');
const requireAuth = require('../middleware/requireAuth');
const { users, playbooks } = require('../models/db');

const router = express.Router();

router.get('/dashboard', requireAuth, async (req, res) => {
  try {
    const user = await users.findById(req.session.userId);
    if (!user) {
      req.session.destroy(() => res.redirect('/login'));
      return;
    }

    const userPlaybooks = await playbooks.findAllByUser(req.session.userId);

    res.render('dashboard', {
      user,
      playbooks: userPlaybooks,
    });
  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).render('error', { message: 'Could not load your dashboard. Please try again.' });
  }
});

module.exports = router;
