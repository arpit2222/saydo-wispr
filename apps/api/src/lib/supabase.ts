import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { logger } from './logger.js';

let supabaseClient: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (supabaseClient) return supabaseClient;

  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey || url.includes('your-project') || serviceKey.includes('your_service_role')) {
    logger.warn('Supabase URL or Service Role Key not set. Using local mock storage for dev.');
    return null;
  }

  supabaseClient = createClient(url, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return supabaseClient;
}

// In-memory mock store for local development before Supabase keys are provided
export const mockDb = {
  apps: new Map([
    [
      'pk_demo_dehix',
      {
        id: 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b22',
        org_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        name: 'DEHIX-lite',
        public_key: 'pk_demo_dehix',
        allowed_origins: [
          'http://localhost:3000',
          'http://127.0.0.1:3000',
          'https://saydo.app',
          'https://saydo-demo.vercel.app',
        ],
        docs_url: 'https://saydo.app/docs',
        changelog_url: 'https://saydo.app/changelog',
      },
    ],
  ]),
  recordings: new Map<string, any>([
    [
      'rec-demo-dehix-1',
      {
        id: 'rec-demo-dehix-1',
        app_id: 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b22',
        title: 'Create Website Revamp Project',
        events: [
          {
            method: 'POST',
            path: '/api/dehix/projects',
            status: 201,
            requestBody: { name: 'Website Revamp', budget: 200000, description: 'Wispr voice-guided delivery' },
            responseBody: { project_id: 'proj-demo-99', message: 'Project created successfully' },
            ts: Date.now() - 3600000,
          },
        ],
        narration: 'Create a new Website Revamp project with 2 lakh budget and Wispr voice-guided delivery milestones',
        narration_metadata: {
          source: 'voice',
          words: 16,
          created_at: new Date(Date.now() - 3600000).toISOString(),
        },
        created_at: new Date(Date.now() - 3600000).toISOString(),
      },
    ],
  ]),
  skills: new Map<string, any>([
    [
      '11111111-1111-1111-1111-111111111111',
      {
        id: '11111111-1111-1111-1111-111111111111',
        app_id: 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b22',
        name: 'list_projects',
        version: 1,
        title: 'List Projects',
        description: 'Retrieve all active and archived projects in DEHIX-lite',
        method: 'GET',
        path: '/api/dehix/projects',
        query_params: ['status'],
        inputs: {
          status: { type: 'string', required: false, enum: ['active', 'completed', 'archived'] },
        },
        constants: {},
        outputs: { projects: 'array' },
        depends_on: [],
        is_write: false,
        verify_with: null,
        status: 'active',
        narration: 'Retrieve all active talent and grant projects in DEHIX to review deliverables and status',
        narration_metadata: { source: 'voice', words: 15, created_at: new Date(Date.now() - 86400000).toISOString() },
        created_at: new Date().toISOString(),
      },
    ],
    [
      '22222222-2222-2222-2222-222222222222',
      {
        id: '22222222-2222-2222-2222-222222222222',
        app_id: 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b22',
        name: 'create_project',
        version: 1,
        title: 'Create Project',
        description: 'Create a new project with name, budget, and description',
        method: 'POST',
        path: '/api/dehix/projects',
        query_params: [],
        inputs: {
          name: { type: 'string', required: true, description: 'Project title' },
          budget: { type: 'number', required: true, description: 'Grant budget in INR' },
          description: { type: 'string', required: false, description: 'Milestones and deliverables' },
        },
        constants: {},
        outputs: { project_id: 'string', message: 'string' },
        depends_on: [],
        is_write: true,
        verify_with: 'get_project',
        status: 'active',
        narration: 'When spinning up a new project or bounty on DEHIX, capture the project title, grant budget in INR, and key delivery milestones',
        narration_metadata: { source: 'voice', words: 23, created_at: new Date(Date.now() - 86400000).toISOString() },
        created_at: new Date().toISOString(),
      },
    ],
    [
      '33333333-3333-3333-3333-333333333333',
      {
        id: '33333333-3333-3333-3333-333333333333',
        app_id: 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b22',
        name: 'get_project',
        version: 1,
        title: 'Get Project Details',
        description: 'Retrieve a specific project by its ID',
        method: 'GET',
        path: '/api/dehix/projects/get',
        query_params: ['id'],
        inputs: {
          id: { type: 'string', required: true, description: 'Project ID UUID' },
        },
        constants: {},
        outputs: { project: 'object' },
        depends_on: [],
        is_write: false,
        verify_with: null,
        status: 'active',
        narration: 'Look up the specific Web3 project by its UUID to inspect budget and team allocations',
        narration_metadata: { source: 'voice', words: 15, created_at: new Date(Date.now() - 86400000).toISOString() },
        created_at: new Date().toISOString(),
      },
    ],
    [
      '44444444-4444-4444-4444-444444444444',
      {
        id: '44444444-4444-4444-4444-444444444444',
        app_id: 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b22',
        name: 'invite_member',
        version: 1,
        title: 'Invite Team Member',
        description: 'Invite a user by email with a role',
        method: 'POST',
        path: '/api/dehix/members',
        query_params: [],
        inputs: {
          project_id: { type: 'string', required: false, description: 'Associated project ID' },
          email: { type: 'string', required: true, description: 'Collaborator email address' },
          role: { type: 'string', required: true, enum: ['viewer', 'editor', 'admin'] },
        },
        constants: {},
        outputs: { member_id: 'string', message: 'string' },
        depends_on: ['create_project'],
        is_write: true,
        verify_with: null,
        status: 'active',
        narration: 'Invite a collaborator or mentor by email address, assigning them viewer, editor, or admin roles',
        narration_metadata: { source: 'voice', words: 15, created_at: new Date(Date.now() - 86400000).toISOString() },
        created_at: new Date().toISOString(),
      },
    ],
    [
      '55555555-5555-5555-5555-555555555555',
      {
        id: '55555555-5555-5555-5555-555555555555',
        app_id: 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b22',
        name: 'list_applications',
        version: 1,
        title: 'List Talent Applications',
        description: 'Retrieve talent applications for Web3 bounties and roles, optionally filtered by status or project_id',
        method: 'GET',
        path: '/api/dehix/applications',
        query_params: ['status', 'project_id'],
        inputs: {
          status: { type: 'string', required: false, enum: ['pending', 'approved', 'rejected'], description: 'Filter by status' },
          project_id: { type: 'string', required: false, description: 'Filter by project ID' },
        },
        constants: {},
        outputs: { applications: 'array' },
        depends_on: [],
        is_write: false,
        verify_with: null,
        status: 'active',
        narration: 'Query talent applications submitted for open bounties to see candidate proposals and credentials',
        narration_metadata: { source: 'voice', words: 14, created_at: new Date(Date.now() - 86400000).toISOString() },
        created_at: new Date().toISOString(),
      },
    ],
    [
      '66666666-6666-6666-6666-666666666666',
      {
        id: '66666666-6666-6666-6666-666666666666',
        app_id: 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b22',
        name: 'update_application_decision',
        version: 1,
        title: 'Update Application Decision',
        description: 'Approve or reject a talent application',
        method: 'POST',
        path: '/api/dehix/applications/decision',
        query_params: [],
        inputs: {
          application_id: { type: 'string', required: true, description: 'Application ID UUID' },
          decision: { type: 'string', required: true, enum: ['approved', 'rejected'], description: 'Decision (approved or rejected)' },
        },
        constants: {},
        outputs: { application: 'object', message: 'string' },
        depends_on: [],
        is_write: true,
        verify_with: null,
        status: 'active',
        narration: 'Record review decision to approve or reject an applicant submission for a Web3 grant',
        narration_metadata: { source: 'voice', words: 14, created_at: new Date(Date.now() - 86400000).toISOString() },
        created_at: new Date().toISOString(),
      },
    ],
  ]),
  policies: new Map<string, any>([
    [
      'pol-budget-limit',
      {
        id: 'pol-budget-limit',
        app_id: 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b22',
        skill_name: 'create_project',
        kind: 'limit',
        field: 'budget',
        op: 'lte',
        value: 1000000,
        message: 'Project budget cannot exceed ₹10,00,000 INR per platform policy.',
        spoken: 'Budget can never exceed 10 lakh',
        source: 'voice',
        created_at: new Date().toISOString(),
      },
    ],
    [
      'pol-admin-block',
      {
        id: 'pol-admin-block',
        app_id: 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b22',
        skill_name: 'invite_member',
        kind: 'block',
        field: 'role',
        op: 'eq',
        value: 'admin',
        message: 'Autonomous agents cannot assign administrator privileges without out-of-band admin confirmation.',
        spoken: 'Never invite admins through the assistant',
        source: 'voice',
        created_at: new Date().toISOString(),
      },
    ],
    [
      'pol-reject-confirm',
      {
        id: 'pol-reject-confirm',
        app_id: 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b22',
        skill_name: 'update_application_decision',
        kind: 'confirm',
        field: 'decision',
        op: 'eq',
        value: 'rejected',
        message: 'User confirmation required before recording a rejection decision.',
        spoken: 'Always ask before rejecting an application',
        source: 'voice',
        created_at: new Date().toISOString(),
      },
    ],
  ]),
  runs: new Map<string, any>(),
  run_steps: new Map<string, any>(),
  health_checks: new Map<string, any>(),
  eval_results: new Map<string, any>(),
};

export async function getAppByPublicKey(publicKey: string) {
  const sb = getSupabase();
  if (sb) {
    const { data, error } = await sb
      .from('apps')
      .select('*')
      .eq('public_key', publicKey)
      .single();

    if (error) {
      logger.error({ error, publicKey }, 'Failed to fetch app by public key from Supabase');
      return null;
    }
    return data;
  }

  return mockDb.apps.get(publicKey) || null;
}

export async function saveRecording(data: {
  app_id: string;
  title: string;
  events: any[];
  narration?: string;
  narration_metadata?: any;
}) {
  const sb = getSupabase();
  const id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `rec-${Date.now()}`;
  const record = {
    id,
    app_id: data.app_id,
    title: data.title,
    events: data.events,
    narration: data.narration || null,
    narration_metadata: data.narration_metadata || (data.narration ? {
      source: 'voice',
      words: data.narration.trim().split(/\s+/).filter(Boolean).length,
      created_at: new Date().toISOString(),
    } : null),
    created_at: new Date().toISOString(),
  };

  if (sb) {
    const { data: inserted, error } = await sb.from('recordings').insert([record]).select().single();
    if (error) {
      logger.error({ error }, 'Failed to save recording in Supabase');
      throw error;
    }
    return inserted;
  }

  mockDb.recordings.set(id, record);
  return record;
}

export async function getRecordings(app_id?: string) {
  const sb = getSupabase();
  if (sb) {
    let query = sb.from('recordings').select('*').order('created_at', { ascending: false });
    if (app_id) query = query.eq('app_id', app_id);
    const { data, error } = await query;
    if (!error && data) return data;
  }

  const all = Array.from(mockDb.recordings.values());
  if (app_id) {
    return all.filter((r) => r.app_id === app_id);
  }
  return all;
}

export async function getRecordingById(id: string) {
  const sb = getSupabase();
  if (sb) {
    const { data, error } = await sb.from('recordings').select('*').eq('id', id).single();
    if (!error && data) return data;
  }
  return mockDb.recordings.get(id) || null;
}

export async function getSkills(app_id?: string) {
  const sb = getSupabase();
  if (sb) {
    let query = sb.from('skills').select('*').order('created_at', { ascending: false });
    if (app_id) query = query.eq('app_id', app_id);
    const { data, error } = await query;
    if (!error && data) return data;
  }

  const all = Array.from(mockDb.skills.values());
  if (app_id) {
    return all.filter((s) => s.app_id === app_id);
  }
  return all;
}

export async function saveSkill(skill: any) {
  const sb = getSupabase();
  const id = skill.id || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `skill-${Date.now()}`);
  const record = {
    ...skill,
    id,
    created_at: new Date().toISOString(),
  };

  if (sb) {
    const { data, error } = await sb.from('skills').upsert([record], { onConflict: 'app_id,name,version' }).select().single();
    if (error) {
      logger.error({ error }, 'Failed to save skill in Supabase');
      throw error;
    }
    return data;
  }

  mockDb.skills.set(id, record);
  return record;
}

export async function updateSkillStatus(id: string, status: 'active' | 'drifted' | 'disabled') {
  const sb = getSupabase();
  if (sb) {
    const { data, error } = await sb.from('skills').update({ status }).eq('id', id).select().single();
    if (!error && data) return data;
  }

  const skill = mockDb.skills.get(id);
  if (skill) {
    skill.status = status;
    return skill;
  }
  return null;
}

export async function savePolicies(policies: any[]) {
  const sb = getSupabase();
  if (policies.length === 0) return [];

  if (sb) {
    const { data, error } = await sb.from('policies').insert(policies).select();
    if (!error && data) return data;
  }

  policies.forEach((p) => {
    const id = p.id || `pol-${Date.now()}`;
    mockDb.policies.set(id, { ...p, id });
  });

  return policies;
}

export async function getPolicies(app_id?: string) {
  const sb = getSupabase();
  if (sb) {
    let query = sb.from('policies').select('*').order('created_at', { ascending: false });
    if (app_id) query = query.eq('app_id', app_id);
    const { data, error } = await query;
    if (!error && data) return data;
  }

  const all = Array.from(mockDb.policies.values());
  if (app_id) {
    return all.filter((p) => p.app_id === app_id);
  }
  return all;
}

export async function deletePolicy(id: string): Promise<boolean> {
  const sb = getSupabase();
  if (sb) {
    const { error } = await sb.from('policies').delete().eq('id', id);
    return !error;
  }
  return mockDb.policies.delete(id);
}

export async function saveRun(data: {
  id?: string;
  app_id: string;
  user_message: string;
  plan?: any;
  status?: 'running' | 'completed' | 'failed' | 'blocked';
  model_agent: string;
  model_reason?: string;
  total_ms?: number;
  channel?: 'web' | 'mcp' | 'sdk' | 'eval';
}) {
  const sb = getSupabase();
  const id = data.id || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `run-${Date.now()}`);
  const record = {
    id,
    app_id: data.app_id,
    user_message: data.user_message,
    plan: data.plan || [],
    status: data.status || 'running',
    model_agent: data.model_agent,
    model_reason: data.model_reason || null,
    total_ms: data.total_ms || 0,
    channel: data.channel || 'web',
    created_at: new Date().toISOString(),
  };

  if (sb) {
    const { data: inserted, error } = await sb.from('runs').upsert([record]).select().single();
    if (!error && inserted) return inserted;
  }

  mockDb.runs.set(id, record);
  return record;
}

export async function updateRunStatus(id: string, status: 'running' | 'completed' | 'failed' | 'blocked', total_ms?: number) {
  const sb = getSupabase();
  if (sb) {
    const updateObj: any = { status };
    if (typeof total_ms === 'number') updateObj.total_ms = total_ms;
    const { data, error } = await sb.from('runs').update(updateObj).eq('id', id).select().single();
    if (!error && data) return data;
  }

  const existing = mockDb.runs.get(id);
  if (existing) {
    existing.status = status;
    if (typeof total_ms === 'number') existing.total_ms = total_ms;
    return existing;
  }
  return null;
}

export async function saveRunStep(data: {
  run_id: string;
  idx: number;
  skill_name: string;
  args?: any;
  policy_result?: any;
  confirmed?: boolean;
  http_status?: number;
  response?: any;
  verified?: boolean;
  latency_ms?: number;
}) {
  const sb = getSupabase();
  const id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `step-${Date.now()}-${data.idx}`;
  const record = {
    id,
    run_id: data.run_id,
    idx: data.idx,
    skill_name: data.skill_name,
    args: data.args || {},
    policy_result: data.policy_result || {},
    confirmed: data.confirmed || false,
    http_status: data.http_status || 200,
    response: data.response || null,
    verified: data.verified || false,
    latency_ms: data.latency_ms || 0,
    created_at: new Date().toISOString(),
  };

  if (sb) {
    const { data: inserted, error } = await sb.from('run_steps').insert([record]).select().single();
    if (!error && inserted) return inserted;
  }

  mockDb.run_steps.set(id, record);
  return record;
}

export async function getRunSteps(run_id: string) {
  const sb = getSupabase();
  if (sb) {
    const { data, error } = await sb.from('run_steps').select('*').eq('run_id', run_id).order('idx', { ascending: true });
    if (!error && data) return data;
  }

  return Array.from(mockDb.run_steps.values()).filter((s) => s.run_id === run_id).sort((a, b) => a.idx - b.idx);
}

export async function saveHealthCheck(data: {
  app_id: string;
  skill_id: string;
  skill_name: string;
  method: string;
  path: string;
  status: 'pass' | 'fail' | 'diff';
  diff?: any;
  latency_ms: number;
  http_status: number;
  response_sample?: any;
}) {
  const sb = getSupabase();
  const id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `hc-${Date.now()}-${Math.random().toString(36).substring(7)}`;
  const record = {
    id,
    ...data,
    checked_at: new Date().toISOString(),
  };

  if (sb) {
    const { data: inserted, error } = await sb.from('health_checks').insert([record]).select().single();
    if (!error && inserted) return inserted;
  }

  mockDb.health_checks.set(id, record);
  return record;
}

export async function getHealthChecks(app_id?: string) {
  const sb = getSupabase();
  if (sb) {
    let query = sb.from('health_checks').select('*').order('checked_at', { ascending: false });
    if (app_id) query = query.eq('app_id', app_id);
    const { data, error } = await query;
    if (!error && data) return data;
  }

  const all = Array.from(mockDb.health_checks.values());
  if (app_id) {
    return all.filter((h) => h.app_id === app_id);
  }
  return all;
}

export async function saveEvalResult(data: {
  model: string;
  total_tasks: number;
  passed_tasks: number;
  failed_tasks: number;
  pass_rate: number;
  avg_latency_ms: number;
  task_results: any[];
}) {
  const sb = getSupabase();
  const id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `eval-${Date.now()}`;
  const record = {
    id,
    ...data,
    created_at: new Date().toISOString(),
  };

  if (sb) {
    const { data: inserted, error } = await sb.from('eval_results').insert([record]).select().single();
    if (!error && inserted) return inserted;
  }

  mockDb.eval_results.set(data.model, record);
  return record;
}

export async function getEvalResults(model?: string) {
  const sb = getSupabase();
  if (sb) {
    let query = sb.from('eval_results').select('*').order('created_at', { ascending: false });
    if (model) query = query.eq('model', model);
    const { data, error } = await query;
    if (!error && data) return data;
  }

  const all = Array.from(mockDb.eval_results.values());
  if (model) {
    return all.filter((e) => e.model === model);
  }
  return all;
}

export async function getRuns(app_id?: string) {
  const sb = getSupabase();
  if (sb) {
    let query = sb.from('runs').select('*').order('created_at', { ascending: false });
    if (app_id) query = query.eq('app_id', app_id);
    const { data, error } = await query;
    if (!error && data) return data;
  }

  const all = Array.from(mockDb.runs.values()).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
  if (app_id) {
    return all.filter((r) => r.app_id === app_id);
  }
  return all;
}

export async function getRunById(id: string) {
  const sb = getSupabase();
  if (sb) {
    const { data: run, error } = await sb.from('runs').select('*').eq('id', id).single();
    if (!error && run) {
      const steps = await getRunSteps(id);
      return { run, steps };
    }
  }

  const run = mockDb.runs.get(id);
  if (!run) return null;
  const steps = await getRunSteps(id);
  return { run, steps };
}

export async function getStats(app_id?: string) {
  const allSkills = await getSkills(app_id);
  const activeSkills = allSkills.filter((s: any) => s.status !== 'disabled');
  const policies = await getPolicies(app_id);
  const runs = await getRuns(app_id);
  const evals = await getEvalResults();
  const latestEval = evals[0];

  return {
    skills_count: activeSkills.length,
    policies_count: policies.length,
    runs_count: runs.length,
    eval_pass_rate: latestEval ? latestEval.pass_rate : 100,
    models_supported: 3,
  };
}

export async function resetDemoData() {
  mockDb.runs.clear();
  mockDb.run_steps.clear();
  mockDb.health_checks.clear();
  return { success: true, message: 'Demo agent runs and health probes reset. Skills and safety policies preserved.' };
}




