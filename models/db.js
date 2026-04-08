/**
 * models/db.js
 * Supabase client and async query helpers for users and playbooks.
 *
 * Setup: create the tables in Supabase using schema.sql, then set
 * SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your .env file.
 *
 * The service role key bypasses Row Level Security so all server-side
 * operations work without extra RLS policies during development.
 * For production, consider adding RLS policies and using the anon key
 * with proper policies, or keep the service role key server-side only.
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    'Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables. ' +
    'Copy .env.example to .env and fill in your Supabase project credentials.'
  );
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false }, // Server-side: never persist the Supabase auth session
});

// ── User helpers ───────────────────────────────────────────────────────────

const users = {
  /** Returns the user row with the given email, or null if not found. */
  async findByEmail(email) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  /** Returns a user row (without password) for the given id, or null. */
  async findById(id) {
    const { data, error } = await supabase
      .from('users')
      .select('id, name, email, created_at')
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  /** Inserts a new user and returns the new user's id. */
  async create({ name, email, password }) {
    const { data, error } = await supabase
      .from('users')
      .insert({ name, email, password })
      .select('id')
      .single();
    if (error) throw error;
    return data.id;
  },
};

// ── Playbook helpers ────────────────────────────────────────────────────────

const playbooks = {
  /** Returns summary rows for all playbooks owned by userId, newest first. */
  async findAllByUser(userId) {
    const { data, error } = await supabase
      .from('playbooks')
      .select('id, org_type, funding_goal, time_horizon, funding_priority, mission, current_stage, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  /** Returns the full playbook row only if it belongs to the given userId. */
  async findByIdAndUser(id, userId) {
    const { data, error } = await supabase
      .from('playbooks')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  /** Inserts a new playbook row and returns the new id. */
  async create(data) {
    const { data: row, error } = await supabase
      .from('playbooks')
      .insert({
        user_id:          data.userId,
        org_type:         data.orgType,
        funding_goal:     data.fundingGoal,
        time_horizon:     data.timeHorizon,
        funding_priority: data.fundingPriority,
        mission:          data.mission || null,
        current_stage:    data.currentStage || null,
        strategy_summary: data.strategySummary,
        today_actions:    data.todayActions,
        timeline:         data.timeline,
        donor_outreach:   data.donorOutreach,
        grant_ideas:      data.grantIdeas,
        checklist:        data.checklist,
      })
      .select('id')
      .single();
    if (error) throw error;
    return row.id;
  },

  /** Deletes a playbook only if it belongs to the given userId. Returns true if deleted. */
  async deleteByIdAndUser(id, userId) {
    const { error, count } = await supabase
      .from('playbooks')
      .delete({ count: 'exact' })
      .eq('id', id)
      .eq('user_id', userId);
    if (error) throw error;
    return count > 0;
  },
};

module.exports = { supabase, users, playbooks };
