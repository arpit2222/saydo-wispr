import { Router, Request, Response } from 'express';
import { checkModelHealth, NEBIUS_MODELS, getAIProvider } from '../lib/nebius.js';
import { getAppByPublicKey, getSkills, saveHealthCheck, getHealthChecks, mockDb } from '../lib/supabase.js';
import { logger } from '../lib/logger.js';

export const healthRouter: Router = Router();

healthRouter.get('/', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'saydo-api',
    time: new Date().toISOString(),
  });
});

healthRouter.get('/healthz', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'saydo-api',
    time: new Date().toISOString(),
  });
});

healthRouter.get('/models', async (_req: Request, res: Response) => {
  const provider = getAIProvider();
  const models = [
    { role: 'fast', name: NEBIUS_MODELS.fast },
    { role: 'agent', name: NEBIUS_MODELS.agent },
    { role: 'reason', name: NEBIUS_MODELS.reason },
  ];

  const results = await Promise.all(
    models.map(async ({ role, name }) => {
      const health = await checkModelHealth(name);
      return {
        role,
        ...health,
      };
    })
  );

  res.json({
    provider,
    timestamp: new Date().toISOString(),
    results,
  });
});

// GET /v1/health/checks - List historical or latest health check runs
healthRouter.get('/checks', async (req: Request, res: Response) => {
  const appId = req.query.app_id as string | undefined;
  const checks = await getHealthChecks(appId);
  return res.json({ checks });
});

// POST /v1/health/run - Execute fixture calls on sandbox project, compare JSON shape, store checks
healthRouter.post('/run', async (req: Request, res: Response) => {
  const { app_id } = req.body;

  let app: any = null;
  if (app_id) {
    app = Array.from(mockDb.apps.values()).find((a) => a.id === app_id || a.public_key === app_id);
  }
  if (!app) {
    app = await getAppByPublicKey('pk_demo_dehix');
  }

  if (!app) {
    return res.status(404).json({ error: 'App not found for health check' });
  }

  const allSkills = await getSkills(app.id);
  const activeSkills = allSkills.filter((s: any) => s.status !== 'disabled');

  const hostBaseUrl = process.env.HOST_URL || app.allowed_origins?.[0] || 'http://localhost:3000';
  const checks: any[] = [];

  for (const skill of activeSkills) {
    const startTime = Date.now();
    let fixtureArgs: Record<string, any> = {};

    // Fixture arguments per skill
    if (skill.name === 'list_projects') {
      fixtureArgs = {};
    } else if (skill.name === 'get_project') {
      fixtureArgs = { id: 'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380c33' };
    } else if (skill.name === 'list_applications') {
      fixtureArgs = { status: 'pending' };
    } else if (skill.name === 'create_project') {
      fixtureArgs = {
        name: '[Sandbox Health Check]',
        budget: 50000,
        description: 'Automated contract health check fixture',
      };
    } else if (skill.name === 'invite_member') {
      fixtureArgs = {
        project_id: 'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380c33',
        email: 'sandbox-probe@dehix.org',
        role: 'viewer',
      };
    } else if (skill.name === 'update_application_decision') {
      fixtureArgs = {
        application_id: 'app-001',
        decision: 'approved',
      };
    }

    // Prepare HTTP Call with X-Agent-Token
    let url = `${hostBaseUrl}${skill.path}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Agent-Token': process.env.AGENT_TOKEN || 'saydo_health_agent_token_secret',
    };

    let fetchOptions: RequestInit = {
      method: skill.method,
      headers,
    };

    if (skill.method === 'GET') {
      const qParams = new URLSearchParams();
      for (const [k, v] of Object.entries(fixtureArgs)) {
        if (v !== undefined && v !== null) qParams.append(k, String(v));
      }
      const qStr = qParams.toString();
      if (qStr) url += (url.includes('?') ? '&' : '?') + qStr;
    } else {
      fetchOptions.body = JSON.stringify(fixtureArgs);
    }

    let httpStatus = 200;
    let resJson: any = null;
    let checkStatus: 'pass' | 'fail' | 'diff' = 'pass';
    let diff: any = null;

    try {
      const apiRes = await fetch(url, fetchOptions);
      httpStatus = apiRes.status;
      resJson = await apiRes.json().catch(() => ({}));

      // Compare JSON response shape with expected output shape
      if (!apiRes.ok && apiRes.status !== 201) {
        checkStatus = 'fail';
        diff = { error: `HTTP ${apiRes.status}: ${JSON.stringify(resJson)}` };
      } else {
        // Inspect response keys
        const actualKeys = Object.keys(resJson || {});
        const expectedKeys = skill.outputs ? Object.keys(skill.outputs) : [];

        // Check if drifted warning applies (e.g. create_project budget standardized to amount)
        if (skill.status === 'at_risk' || skill.status === 'drifted') {
          checkStatus = 'diff';
          diff = {
            notice: 'Schema drift detected via changelog watch',
            reason: skill.drift_reason || 'Field "budget" is scheduled to standardize to "amount"',
            expected_keys: ['name', 'budget'],
            actual_keys: actualKeys,
          };
        } else if (expectedKeys.length > 0) {
          const missing = expectedKeys.filter((k) => !actualKeys.includes(k));
          if (missing.length > 0) {
            checkStatus = 'diff';
            diff = { missing_keys: missing, actual_keys: actualKeys };
          }
        }
      }
    } catch (err: any) {
      httpStatus = 500;
      checkStatus = 'fail';
      diff = { error: err.message };
    }

    // For write skills: run against sandbox and clean up
    if (skill.name === 'create_project' && resJson?.project_id) {
      try {
        await fetch(`${hostBaseUrl}/api/dehix/projects?id=${resJson.project_id}`, {
          method: 'DELETE',
          headers: {
            'X-Agent-Token': process.env.AGENT_TOKEN || 'saydo_health_agent_token_secret',
          },
        });
      } catch (e) {
        // cleanup best-effort
      }
    }

    const latencyMs = Date.now() - startTime;

    const record = await saveHealthCheck({
      app_id: app.id,
      skill_id: skill.id,
      skill_name: skill.name,
      method: skill.method,
      path: skill.path,
      status: checkStatus,
      diff,
      latency_ms: latencyMs,
      http_status: httpStatus,
      response_sample: resJson,
    });

    checks.push(record);
  }

  const passed = checks.filter((c) => c.status === 'pass').length;
  const diffs = checks.filter((c) => c.status === 'diff').length;
  const failed = checks.filter((c) => c.status === 'fail').length;

  return res.json({
    app_id: app.id,
    total_checked: checks.length,
    passed,
    diffs,
    failed,
    checks,
    checked_at: new Date().toISOString(),
  });
});
