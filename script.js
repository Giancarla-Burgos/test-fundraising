/* ─────────────────────────────────────────
   RaiseKit — script.js
   Frontend-only logic. No backend, no APIs.
───────────────────────────────────────── */

// ── Data maps ──────────────────────────────────────────────────────────────

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

// ── Fit badges ──────────────────────────────────────────────────────────────

function getFitBadge(org, timeline, goal) {
  if (org === 'student' || org === 'campus') {
    return goal <= 5000
      ? '✦ Best for early-stage student-led fundraising'
      : '✦ Best for ambitious campus campaigns';
  }
  if (org === 'community') return '✦ Best for grassroots community fundraising';
  if (timeline === '2weeks') return '✦ Best for urgent, focused fundraising sprints';
  if (timeline === '3months') return '✦ Best for sustained, multi-channel campaigns';
  return '✦ Best for mixed nonprofit outreach';
}

// ── Strategy ────────────────────────────────────────────────────────────────

function getStrategy(org, goal, timeline, priority, mission, stage) {
  const goalN = parseInt(goal, 10);

  const mixes = {
    mixed: '40% grant outreach, 40% small-dollar donor campaign, and 20% corporate sponsorship.',
    grants: '60% grant applications, 25% institutional donor outreach, and 15% foundation cultivation.',
    smalldonors: '70% individual donor outreach, 20% peer-to-peer fundraising, and 10% small event revenue.',
    corporate: '50% corporate sponsorship pitches, 30% grant applications, and 20% major donor cultivation.',
  };

  const urgency = timeline === '2weeks'
    ? 'Given your tight two-week window, focus on warm contacts first and move fast.'
    : timeline === '1month'
    ? 'With one month, balance outreach volume with relationship-building.'
    : 'Over three months, layer your approach: start broad and narrow to high-probability channels.';

  const scale = goalN <= 1000
    ? 'For a $1,000 goal, 20–25 personal asks should be sufficient.'
    : goalN <= 5000
    ? 'For a $5,000 goal, combine personal asks with a small public campaign.'
    : goalN <= 10000
    ? 'For a $10,000 goal, you will need multiple channels working in parallel.'
    : 'For a $25,000+ goal, prioritize grants and corporate sponsors alongside individual donors.';

  const missionNote = mission
    ? ` Your focus on "${mission}" gives you a clear story to lead with in every ask.`
    : '';

  const stageNote = stage === 'starting'
    ? ' Since you are just starting, prioritize building your contact list and crafting your pitch before sending anything.'
    : stage === 'somedonors'
    ? ' Since you already have some donors, start by re-engaging them — warm contacts convert fastest.'
    : stage === 'done1'
    ? ' Having run a campaign before is a real advantage. Lean on past donors and lessons learned to move faster this time.'
    : '';

  return `Focus on a ${mixes[priority] || mixes.mixed} ${urgency} ${scale}${missionNote}${stageNote}`;
}

// ── Timeline ────────────────────────────────────────────────────────────────

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

// ── Email templates ─────────────────────────────────────────────────────────

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

  return `Subject: Supporting ${mission ? mission : '[Mission]'} — A Quick Ask

Hi [Name],

I hope you're doing well! I'm reaching out because ${orgPhrase} is raising support for ${missionLabel}, and I immediately thought of you.

We're working toward a goal of ${GOAL_LABELS[goal] || 'our funding target'} to ${impactPhrase}. Your contribution — at any level — would make a real difference.

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

// ── Grant ideas ─────────────────────────────────────────────────────────────

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

// ── Checklist ───────────────────────────────────────────────────────────────

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

// ── What to do today ─────────────────────────────────────────────────────────

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

// ── Render helpers ──────────────────────────────────────────────────────────

function renderList(ulEl, items) {
  ulEl.innerHTML = '';
  items.forEach(item => {
    const li = document.createElement('li');
    li.textContent = item;
    ulEl.appendChild(li);
  });
}

function renderTimeline(containerEl, weeks) {
  containerEl.innerHTML = '';
  weeks.forEach(w => {
    const div = document.createElement('div');
    div.className = 'timeline-week';

    const labelEl = document.createElement('div');
    labelEl.className = 'week-label';
    labelEl.textContent = w.label;

    const tasksEl = document.createElement('div');
    tasksEl.className = 'week-tasks';
    tasksEl.textContent = w.tasks;

    div.appendChild(labelEl);
    div.appendChild(tasksEl);
    containerEl.appendChild(div);
  });
}

// ── Copy buttons ─────────────────────────────────────────────────────────────

function getTextContent(el) {
  if (!el) return '';
  if (el.tagName === 'UL') {
    return Array.from(el.querySelectorAll('li')).map(li => li.textContent).join('\n');
  }
  if (el.id === 'timeline-content') {
    return Array.from(el.querySelectorAll('.timeline-week'))
      .map(w => `${w.querySelector('.week-label').textContent}: ${w.querySelector('.week-tasks').textContent}`)
      .join('\n');
  }
  return el.textContent || el.innerText;
}

function setupCopyButtons() {
  document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.dataset.target;
      const target = document.getElementById(targetId);
      const text = getTextContent(target);
      navigator.clipboard.writeText(text).then(() => {
        btn.textContent = 'Copied!';
        btn.classList.add('copied');
        setTimeout(() => {
          btn.textContent = 'Copy';
          btn.classList.remove('copied');
        }, 1800);
      });
    });
  });
}

// ── Full plan text ──────────────────────────────────────────────────────────

function buildFullPlanText(inputs) {
  const { org, goal, timeline, priority, mission, stage } = inputs;
  const lines = [];

  lines.push('══════════════════════════════════════');
  lines.push('         RAISEKIT — YOUR FUNDRAISING PLAN');
  lines.push('══════════════════════════════════════');
  lines.push('');
  lines.push(`Org type:       ${ORG_LABELS[org]}`);
  lines.push(`Funding goal:   ${GOAL_LABELS[goal]}`);
  lines.push(`Time horizon:   ${TIMELINE_LABELS[timeline]}`);
  lines.push(`Priority:       ${PRIORITY_LABELS[priority]}`);
  if (mission) lines.push(`Mission:        ${mission}`);
  lines.push('');

  lines.push('── WHAT TO DO TODAY ──');
  getTodayActions(org, goal, priority).forEach(a => lines.push('• ' + a));
  lines.push('');

  lines.push('── RECOMMENDED STRATEGY ──');
  lines.push(getStrategy(org, goal, timeline, priority, mission, stage));
  lines.push('');

  lines.push('── ACTION TIMELINE ──');
  getTimeline(timeline).forEach(w => lines.push(`${w.label}: ${w.tasks}`));
  lines.push('');

  lines.push('── DONOR OUTREACH TEMPLATE ──');
  lines.push(getEmail(org, goal, priority, mission));
  lines.push('');

  lines.push('── GRANT STARTER LIST ──');
  getGrants(org, priority).forEach(g => lines.push(g));
  lines.push('');

  lines.push('── CHECKLIST ──');
  getChecklist(goal, timeline, mission).forEach(c => lines.push(c));
  lines.push('');

  lines.push('══════════════════════════════════════');
  lines.push('Generated by RaiseKit · github.com/Giancarla-Burgos/test-fundraising');
  lines.push('══════════════════════════════════════');

  return lines.join('\n');
}

// ── Playbook subtitle ────────────────────────────────────────────────────────

function getSubtitle(org, goal, timeline) {
  const orgLabel = ORG_LABELS[org] || 'your organization';
  const goalLabel = GOAL_LABELS[goal] || `$${goal}`;
  const timeLabel = TIMELINE_LABELS[timeline] || timeline;
  const lower = orgLabel.toLowerCase();
  const article = /^[aeiou]/.test(lower) ? 'an' : 'a';
  return `For ${article} ${lower} raising ${goalLabel} over ${timeLabel}`;
}

// ── Generate plan ────────────────────────────────────────────────────────────

function generatePlan(inputs) {
  const { org, goal, timeline, priority, mission, stage } = inputs;

  // Show loading state briefly
  const emptyState = document.getElementById('empty-state');
  const loadingState = document.getElementById('loading-state');
  const output = document.getElementById('output');

  emptyState.classList.add('hidden');
  output.classList.add('hidden');
  loadingState.classList.remove('hidden');

  setTimeout(() => {
    loadingState.classList.add('hidden');
    _renderPlan(inputs);
  }, 600);
}

function _renderPlan(inputs) {
  const { org, goal, timeline, priority, mission, stage } = inputs;

  // Playbook subtitle
  document.getElementById('playbook-subtitle').textContent = getSubtitle(org, goal, timeline);

  // Fit badge
  document.getElementById('fit-badge').textContent = getFitBadge(org, timeline, parseInt(goal, 10));

  // Today actions
  renderList(document.getElementById('today-content'), getTodayActions(org, goal, priority));

  // Strategy
  document.getElementById('strategy-content').textContent = getStrategy(org, goal, timeline, priority, mission, stage);

  // Timeline
  renderTimeline(document.getElementById('timeline-content'), getTimeline(timeline));

  // Email
  document.getElementById('email-content').textContent = getEmail(org, goal, priority, mission);

  // Grants
  renderList(document.getElementById('grants-content'), getGrants(org, priority));

  // Checklist
  renderList(document.getElementById('checklist-content'), getChecklist(goal, timeline, mission));

  // Show output, hide empty state
  document.getElementById('empty-state').classList.add('hidden');
  document.getElementById('output').classList.remove('hidden');

  // Smooth scroll
  document.getElementById('results').scrollIntoView({ behavior: 'smooth', block: 'start' });

  // Store inputs for download/copy-all
  document.getElementById('output').dataset.inputs = JSON.stringify(inputs);
}

// ── Copy / download helpers ───────────────────────────────────────────────────

function copyFullPlan(btnId, defaultLabel) {
  const raw = document.getElementById('output').dataset.inputs;
  if (!raw) return;
  const inputs = JSON.parse(raw);
  navigator.clipboard.writeText(buildFullPlanText(inputs)).then(() => {
    const btn = document.getElementById(btnId);
    btn.textContent = '✓ Copied!';
    setTimeout(() => { btn.textContent = defaultLabel; }, 2000);
  });
}

function downloadFullPlan() {
  const raw = document.getElementById('output').dataset.inputs;
  if (!raw) return;
  const inputs = JSON.parse(raw);
  const text = buildFullPlanText(inputs);
  const blob = new Blob([text], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'raisekit-plan.txt';
  a.click();
  URL.revokeObjectURL(url);
}

// ── Event listeners ──────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {

  // Form submit
  document.getElementById('playbook-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const form = e.target;
    const inputs = {
      org: form.orgType.value,
      goal: form.goal.value,
      timeline: form.timeline.value,
      priority: form.priority.value,
      mission: (form.mission.value || '').trim(),
      stage: form.stage.value,
    };
    generatePlan(inputs);
  });

  // Preset buttons
  document.querySelectorAll('.preset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const form = document.getElementById('playbook-form');
      form.orgType.value = btn.dataset.org;
      form.goal.value = btn.dataset.goal;
      form.timeline.value = btn.dataset.timeline;
      form.priority.value = btn.dataset.priority;

      const inputs = {
        org: btn.dataset.org,
        goal: btn.dataset.goal,
        timeline: btn.dataset.timeline,
        priority: btn.dataset.priority,
        mission: (form.mission.value || '').trim(),
        stage: form.stage.value,
      };
      generatePlan(inputs);
    });
  });

  // Copy buttons
  setupCopyButtons();

  // Copy full plan (bottom)
  document.getElementById('copy-all-btn').addEventListener('click', () => {
    copyFullPlan('copy-all-btn', '📋 Copy full plan');
  });

  // Copy full plan (top)
  document.getElementById('copy-all-btn-top').addEventListener('click', () => {
    copyFullPlan('copy-all-btn-top', '📋 Copy Full Plan');
  });

  // Download as .txt (bottom)
  document.getElementById('download-btn').addEventListener('click', downloadFullPlan);

  // Download as .txt (top)
  document.getElementById('download-btn-top').addEventListener('click', downloadFullPlan);

  // Regenerate
  document.getElementById('regenerate-btn').addEventListener('click', () => {
    const raw = document.getElementById('output').dataset.inputs;
    if (!raw) return;
    const inputs = JSON.parse(raw);
    generatePlan(inputs);
  });

});
