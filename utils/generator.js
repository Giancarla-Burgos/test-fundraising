/**
 * utils/generator.js
 * Server-side fundraising plan generation logic.
 * Extracted from the original script.js so it can run on both client and server.
 */

const ORG_LABELS = {
  student: 'Student organization',
  nonprofit: 'Small nonprofit',
  community: 'Community project',
  campus: 'Campus initiative',
};

const GOAL_LABELS = {
  1000: '$1,000',
  5000: '$5,000',
  10000: '$10,000',
  25000: '$25,000+',
};

const TIMELINE_LABELS = {
  '2weeks': '2 weeks',
  '1month': '1 month',
  '3months': '3 months',
};

const PRIORITY_LABELS = {
  grants: 'Grants',
  smalldonors: 'Small donors',
  corporate: 'Corporate sponsors',
  mixed: 'Mixed strategy',
};

// ── Fit badge ────────────────────────────────────────────────────────────────

function getFitBadge(org, timeline, goal) {
  const goalN = parseInt(goal, 10);
  if (org === 'student' || org === 'campus') {
    return goalN <= 5000
      ? '✦ Best for early-stage student-led fundraising'
      : '✦ Best for ambitious campus campaigns';
  }
  if (org === 'community') return '✦ Best for grassroots community fundraising';
  if (timeline === '2weeks') return '✦ Best for urgent, focused fundraising sprints';
  if (timeline === '3months') return '✦ Best for sustained, multi-channel campaigns';
  return '✦ Best for mixed nonprofit outreach';
}

// ── Strategy ─────────────────────────────────────────────────────────────────

function getStrategy(org, goal, timeline, priority, mission, stage) {
  const goalN = parseInt(goal, 10);

  const mixes = {
    mixed: '40% grant outreach, 40% small-dollar donor campaign, and 20% corporate sponsorship.',
    grants: '60% grant applications, 25% institutional donor outreach, and 15% foundation cultivation.',
    smalldonors: '70% individual donor outreach, 20% peer-to-peer fundraising, and 10% small event revenue.',
    corporate: '50% corporate sponsorship pitches, 30% grant applications, and 20% major donor cultivation.',
  };

  const urgency =
    timeline === '2weeks'
      ? 'Given your tight two-week window, focus on warm contacts first and move fast.'
      : timeline === '1month'
      ? 'With one month, balance outreach volume with relationship-building.'
      : 'Over three months, layer your approach: start broad and narrow to high-probability channels.';

  const scale =
    goalN <= 1000
      ? 'For a $1,000 goal, 20–25 personal asks should be sufficient.'
      : goalN <= 5000
      ? 'For a $5,000 goal, combine personal asks with a small public campaign.'
      : goalN <= 10000
      ? 'For a $10,000 goal, you will need multiple channels working in parallel.'
      : 'For a $25,000+ goal, prioritize grants and corporate sponsors alongside individual donors.';

  const missionNote = mission
    ? ` Your focus on "${mission}" gives you a clear story to lead with in every ask.`
    : '';

  const stageNote =
    stage === 'starting'
      ? ' Since you are just starting, prioritize building your contact list and crafting your pitch before sending anything.'
      : stage === 'somedonors'
      ? ' Since you already have some donors, start by re-engaging them — warm contacts convert fastest.'
      : stage === 'done1'
      ? ' Having run a campaign before is a real advantage. Lean on past donors and lessons learned to move faster this time.'
      : '';

  return `Focus on a ${mixes[priority] || mixes.mixed} ${urgency} ${scale}${missionNote}${stageNote}`;
}

// ── Timeline ─────────────────────────────────────────────────────────────────

const TIMELINES = {
  '2weeks': [
    { label: 'Days 1–3', tasks: 'Clarify your mission statement, gather 2–3 impact stats, and build a 30-person outreach list.' },
    { label: 'Days 4–7', tasks: 'Send first wave of personal outreach emails. Set up a simple donation tracking sheet.' },
    { label: 'Days 8–11', tasks: 'Follow up with non-responders, post a campaign update, thank first donors.' },
    { label: 'Days 12–14', tasks: 'Close remaining asks, send final update, celebrate and document lessons learned.' },
  ],
  '1month': [
    { label: 'Week 1', tasks: 'Define your story, collect impact stats, build your donor list of 50+ contacts.' },
    { label: 'Week 2', tasks: 'Send first outreach emails, identify 10 relevant grants, post campaign on social channels.' },
    { label: 'Week 3', tasks: 'Follow up with warm leads, submit first grant applications, reach out to sponsors.' },
    { label: 'Week 4', tasks: 'Close remaining asks, thank all donors, review conversion and document learnings.' },
  ],
  '3months': [
    { label: 'Month 1', tasks: 'Research and map your funding landscape. Build donor list, identify 15 grants, draft outreach materials.' },
    { label: 'Month 2', tasks: 'Launch outreach in waves. Submit grant applications, run a small donor campaign, pitch 3–5 sponsors.' },
    { label: 'Month 3', tasks: 'Follow up, close asks, host a small thank-you event, and evaluate results for the next campaign.' },
  ],
};

function getTimeline(timeline) {
  return TIMELINES[timeline] || TIMELINES['1month'];
}

// ── Email template ─────────────────────────────────────────────────────────

function getEmail(org, goal, priority, mission) {
  const orgPhrase = {
    student: 'our student organization',
    nonprofit: 'our nonprofit',
    community: 'our community project',
    campus: 'our campus initiative',
  }[org] || 'our organization';

  const impactPhrase = {
    student: 'support students and advance our mission on campus',
    nonprofit: 'directly fund programs that serve our community',
    community: 'create lasting impact for the people we serve',
    campus: 'expand our reach and deliver meaningful programming',
  }[org] || 'advance our mission';

  const missionLabel = mission || '[mission or project name]';
  const goalLabel = GOAL_LABELS[goal] || 'our funding target';

  return `Subject: Supporting ${mission ? mission : '[Mission]'} — A Quick Ask

Hi [Name],

I hope you're doing well! I'm reaching out because ${orgPhrase} is raising support for ${missionLabel}, and I immediately thought of you.

We're working toward a goal of ${goalLabel} to ${impactPhrase}. Your contribution — at any level — would make a real difference.

Here's what your support helps us do:
• [Impact statement 1, e.g., "serve 200 students this semester"]
• [Impact statement 2, e.g., "fund our first community event"]
• [Impact statement 3, e.g., "cover materials and operating costs"]

If you're able to contribute, even a small gift goes a long way. You can donate at [link] or reply to this email and I'll follow up.

Thank you so much for your time and support.

Warmly,
[Your name]
[Organization name]
[Contact info]`;
}

// ── Grant ideas ───────────────────────────────────────────────────────────

const GRANT_SETS = {
  student: [
    '🎓 University student activity fund grants',
    '📚 Campus innovation and entrepreneurship awards',
    '🤝 Local community foundation youth grants',
    '🌍 National student leadership grants (e.g., Newman Civic Fellows)',
    '🏛 Departmental or college-specific project grants',
  ],
  nonprofit: [
    '🏘 Local community foundation general operating grants',
    '💼 Corporate social responsibility (CSR) grants',
    '🌱 State and regional nonprofit capacity-building grants',
    '🏛 Government program grants (city/county/state level)',
    '📋 Foundation grants aligned with your mission area',
  ],
  community: [
    '🏙 City neighborhood improvement grants',
    '🤝 Local community foundation project grants',
    '🏪 Small business sponsorship and community funds',
    '🌿 Environmental or civic engagement micro-grants',
    '📣 Crowdfunding platforms (GoFundMe, Fundly)',
  ],
  campus: [
    '🎓 Student government association project grants',
    "🏛 Dean's office or provost innovation grants",
    '📚 Academic department funding for programming',
    '🌍 Campus sustainability and social impact funds',
    '💡 Alumni association small grants for student projects',
  ],
};

function getGrants(org, priority) {
  const base = GRANT_SETS[org] || GRANT_SETS.nonprofit;
  if (priority === 'corporate') {
    return [
      ...base.slice(0, 3),
      '💼 Corporate foundation grants (Salesforce.org, Google.org, etc.)',
      '🤝 Industry-specific company giving programs',
    ];
  }
  return base;
}

// ── Checklist ─────────────────────────────────────────────────────────────

function getChecklist(goal, timeline, mission) {
  const missionItem = mission
    ? `☐ Finalize your mission pitch: "${mission}"`
    : '☐ Write a clear 1-paragraph mission statement';
  const items = [
    '☐ Define your funding goal and set a deadline',
    missionItem,
    '☐ Collect 2–3 concrete impact metrics',
    '☐ Build a donor/prospect spreadsheet (start with 30+ names)',
    '☐ Draft your outreach email using the template above',
    '☐ Send your first 20 emails to warm contacts',
    '☐ Identify 5 relevant grants to apply to',
    '☐ Create a simple campaign tracking doc',
    '☐ Set up a follow-up reminder for Day 7',
    '☐ Thank every donor within 24 hours of receiving a gift',
  ];
  if (timeline === '3months') {
    items.push('☐ Schedule a monthly check-in to review progress');
    items.push('☐ Plan a small donor appreciation moment or update');
  }
  return items;
}

// ── What to do today ──────────────────────────────────────────────────────

function getTodayActions(org, goal, priority) {
  return [
    '✏️ Write your 1-sentence mission statement right now',
    '📋 Open a spreadsheet and list your first 20 warm contacts',
    '📧 Personalize and send 5 outreach emails before end of day',
    priority === 'grants' || priority === 'mixed'
      ? '🔍 Search for 3 grant opportunities relevant to your mission'
      : '📱 Post one update about your campaign on social media',
    '📊 Set a daily tracking habit: log outreach sent and responses received',
  ];
}

// ── Subtitle ──────────────────────────────────────────────────────────────

function getSubtitle(org, goal, timeline) {
  const orgLabel = ORG_LABELS[org] || 'your organization';
  const goalLabel = GOAL_LABELS[goal] || `$${goal}`;
  const timeLabel = TIMELINE_LABELS[timeline] || timeline;
  const lower = orgLabel.toLowerCase();
  const article = /^[aeiou]/.test(lower) ? 'an' : 'a';
  return `For ${article} ${lower} raising ${goalLabel} over ${timeLabel}`;
}

// ── Master generate function ──────────────────────────────────────────────

/**
 * Generate all plan sections from the given inputs.
 * Returns an object with all plan fields, ready for rendering or saving.
 */
function generatePlan({ orgType, fundingGoal, timeHorizon, fundingPriority, mission, currentStage }) {
  const org = orgType;
  const goal = fundingGoal;
  const timeline = timeHorizon;
  const priority = fundingPriority;
  const stage = currentStage;

  const todayActions = getTodayActions(org, goal, priority);
  const timelineData = getTimeline(timeline);
  const grantIdeas = getGrants(org, priority);
  const checklist = getChecklist(goal, timeline, mission);

  return {
    orgType: org,
    fundingGoal: goal,
    timeHorizon: timeline,
    fundingPriority: priority,
    mission: mission || '',
    currentStage: stage || '',
    fitBadge: getFitBadge(org, timeline, goal),
    subtitle: getSubtitle(org, goal, timeline),
    strategySummary: getStrategy(org, goal, timeline, priority, mission, stage),
    todayActions,
    timeline: timelineData,
    donorOutreach: getEmail(org, goal, priority, mission),
    grantIdeas,
    checklist,
    // Labels for display
    orgLabel: ORG_LABELS[org] || org,
    goalLabel: GOAL_LABELS[goal] || `$${goal}`,
    timelineLabel: TIMELINE_LABELS[timeline] || timeline,
    priorityLabel: PRIORITY_LABELS[priority] || priority,
  };
}

module.exports = {
  generatePlan,
  ORG_LABELS,
  GOAL_LABELS,
  TIMELINE_LABELS,
  PRIORITY_LABELS,
};
