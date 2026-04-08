/**
 * routes/dashboard.js
 * GET /dashboard → protected dashboard page
 */

const express = require('express');
const requireAuth = require('../middleware/requireAuth');
const { users, playbooks } = require('../models/db');

const router = express.Router();

router.get('/dashboard', requireAuth, (req, res) => {
  const user = users.findById(req.session.userId);
  if (!user) {
    req.session.destroy(() => res.redirect('/login'));
    return;
  }

  const userPlaybooks = playbooks.findAllByUser(req.session.userId);

  res.render('dashboard', {
    user,
    playbooks: userPlaybooks,
  });
});

module.exports = router;
