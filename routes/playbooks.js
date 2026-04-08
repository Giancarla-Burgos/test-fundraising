/**
 * routes/playbooks.js
 * GET  /generator           → generator form (protected)
 * POST /generate            → generate plan, return JSON (protected)
 * POST /playbooks           → save a playbook (protected)
 * GET  /playbooks/:id       → view a saved playbook (protected)
 * POST /playbooks/:id/delete → delete a playbook (protected)
 */

const express = require('express');
const { body, validationResult } = require('express-validator');
const requireAuth = require('../middleware/requireAuth');
const { generatePlan } = require('../utils/generator');
const { playbooks } = require('../models/db');

const router = express.Router();

const VALID_ORG_TYPES = ['student', 'nonprofit', 'community', 'campus'];
const VALID_GOALS = ['1000', '5000', '10000', '25000'];
const VALID_TIMELINES = ['2weeks', '1month', '3months'];
const VALID_PRIORITIES = ['grants', 'smalldonors', 'corporate', 'mixed'];
const VALID_STAGES = ['', 'starting', 'somedonors', 'done1'];

// Shared validation rules for the generator form
const generatorValidation = [
  body('orgType').isIn(VALID_ORG_TYPES).withMessage('Please select a valid organization type.'),
  body('fundingGoal').isIn(VALID_GOALS).withMessage('Please select a valid funding goal.'),
  body('timeHorizon').isIn(VALID_TIMELINES).withMessage('Please select a valid time horizon.'),
  body('fundingPriority').isIn(VALID_PRIORITIES).withMessage('Please select a valid funding priority.'),
  body('mission').optional().trim().isLength({ max: 120 }).escape(),
  body('currentStage').optional().isIn(VALID_STAGES),
];

// ── Generator form ────────────────────────────────────────────────────────

router.get('/generator', (req, res) => {
  res.render('generator', { errors: [], plan: null, inputs: {} });
});

// ── Generate plan (AJAX / form POST) ─────────────────────────────────────

router.post('/generate', generatorValidation, (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    if (req.headers.accept && req.headers.accept.includes('application/json')) {
      return res.status(400).json({ errors: errors.array().map((e) => e.msg) });
    }
    return res.render('generator', {
      errors: errors.array().map((e) => e.msg),
      plan: null,
      inputs: req.body,
    });
  }

  const inputs = {
    orgType: req.body.orgType,
    fundingGoal: req.body.fundingGoal,
    timeHorizon: req.body.timeHorizon,
    fundingPriority: req.body.fundingPriority,
    mission: (req.body.mission || '').trim(),
    currentStage: req.body.currentStage || '',
  };

  const plan = generatePlan(inputs);

  // JSON response for the client-side save flow
  if (req.headers.accept && req.headers.accept.includes('application/json')) {
    return res.json({ plan });
  }

  // Fall back to server-rendered plan page
  res.render('generator', { errors: [], plan, inputs });
});

// ── Save playbook ─────────────────────────────────────────────────────────

router.post(
  '/playbooks',
  requireAuth,
  [
    body('orgType').isIn(VALID_ORG_TYPES),
    body('fundingGoal').isIn(VALID_GOALS),
    body('timeHorizon').isIn(VALID_TIMELINES),
    body('fundingPriority').isIn(VALID_PRIORITIES),
    body('mission').optional().trim().isLength({ max: 120 }).escape(),
    body('currentStage').optional().isIn(VALID_STAGES),
    body('strategySummary').trim().notEmpty(),
    body('todayActions').trim().notEmpty(),
    body('timeline').trim().notEmpty(),
    body('donorOutreach').trim().notEmpty(),
    body('grantIdeas').trim().notEmpty(),
    body('checklist').trim().notEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Invalid playbook data.' });
    }

    const {
      orgType, fundingGoal, timeHorizon, fundingPriority, mission, currentStage,
      strategySummary, todayActions, timeline, donorOutreach, grantIdeas, checklist,
    } = req.body;

    try {
      const id = await playbooks.create({
        userId: req.session.userId,
        orgType,
        fundingGoal,
        timeHorizon,
        fundingPriority,
        mission: mission || '',
        currentStage: currentStage || '',
        strategySummary,
        todayActions,
        timeline,
        donorOutreach,
        grantIdeas,
        checklist,
      });
      res.json({ success: true, id });
    } catch (err) {
      console.error('Save playbook error:', err);
      res.status(500).json({ error: 'Could not save playbook. Please try again.' });
    }
  }
);

// ── View saved playbook ────────────────────────────────────────────────────

router.get('/playbooks/:id', requireAuth, async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.redirect('/dashboard');

  try {
    const playbook = await playbooks.findByIdAndUser(id, req.session.userId);
    if (!playbook) return res.redirect('/dashboard');

    // Parse JSON-stored arrays back to objects
    let todayActions = [];
    let timeline = [];
    let grantIdeas = [];
    let checklist = [];
    try { todayActions = JSON.parse(playbook.today_actions); } catch (_) {}
    try { timeline = JSON.parse(playbook.timeline); } catch (_) {}
    try { grantIdeas = JSON.parse(playbook.grant_ideas); } catch (_) {}
    try { checklist = JSON.parse(playbook.checklist); } catch (_) {}

    res.render('playbook', { playbook, todayActions, timeline, grantIdeas, checklist });
  } catch (err) {
    console.error('View playbook error:', err);
    res.status(500).render('error', { message: 'Could not load playbook. Please try again.' });
  }
});

// ── Delete playbook ────────────────────────────────────────────────────────

router.post('/playbooks/:id/delete', requireAuth, async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.redirect('/dashboard');

  try {
    await playbooks.deleteByIdAndUser(id, req.session.userId);
  } catch (err) {
    console.error('Delete playbook error:', err);
  }
  res.redirect('/dashboard');
});

module.exports = router;
