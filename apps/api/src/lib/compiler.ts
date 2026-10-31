import {
  LLMCompileOutputSchema,
  NetworkCapturedEvent,
  SkillDefinition,
  TracerEdge,
  PolicyRule,
} from '@saydo/shared';
import { getNebiusClient, NEBIUS_MODELS, hasActiveApiKey } from './nebius.js';
import { logger } from './logger.js';

interface CompileOptions {
  events: NetworkCapturedEvent[];
  narration?: string;
  tracerEdges: TracerEdge[];
  existingSkills?: SkillDefinition[];
}

export async function compileSkillsWithNemotron({
  events,
  narration = '',
  tracerEdges,
  existingSkills = [],
}: CompileOptions): Promise<{
  skills: Omit<SkillDefinition, 'id' | 'app_id' | 'version' | 'status'>[];
  suggested_policies: PolicyRule[];
}> {
  if (hasActiveApiKey()) {
    try {
      return await callNebiusCompiler({ events, narration, tracerEdges, existingSkills });
    } catch (err: any) {
      logger.warn({ err }, 'AI compiler call failed or malformed; falling back to deterministic compiler');
    }
  }

  // Deterministic fallback compiler
  return deterministicCompile({ events, narration, tracerEdges, existingSkills });
}

async function callNebiusCompiler(options: CompileOptions, retryCount = 0): Promise<{
  skills: Omit<SkillDefinition, 'id' | 'app_id' | 'version' | 'status'>[];
  suggested_policies: PolicyRule[];
}> {
  const client = getNebiusClient();
  const startTime = Date.now();

  const systemPrompt = `You are SayDo's Expert Skill Compiler for NVIDIA Nemotron.
Your job is to transform sanitized HTTP network events, user narration, and deterministic value-tracer dependency edges into typed skills and spoken policies.

RULES:
1. One skill per distinct business action.
2. NEVER invent endpoints or fields. Use only the paths, methods, query, and requestBody fields observed in the events.
3. Name skills in snake_case (e.g. create_project, invite_member, get_project).
4. Identify inputs (user parameters) vs constants based on the narration and request bodies.
5. Inputs must specify: type ('string', 'number', 'boolean'), required (boolean), and description.
6. Outputs: Extract meaningful returned fields from responseBody, especially IDs and status.
7. DEPENDENCIES: Look at tracer_edges. If an event uses an ID produced by a prior event, add the prior skill's name to 'depends_on'.
8. is_write: true for POST, PUT, PATCH, DELETE. false for GET.
9. verify_with: If a GET skill exists (or was observed) that can verify the created/modified record (e.g., get_project), set verify_with to its name. Otherwise null.
10. suggested_policies: If the narration mentions limits, roles, or restrictions (e.g. "budget up to 10 lakhs", "only admin"), create structured policies.

OUTPUT FORMAT: Return strictly a valid JSON object matching:
{
  "skills": [...],
  "suggested_policies": [...]
}`;

  const userPayload = {
    events: options.events.map((e, idx) => ({
      index: idx,
      method: e.method,
      path: e.path,
      query: e.query,
      requestBody: e.requestBody,
      status: e.status,
      responseBody: e.responseBody,
    })),
    narration: options.narration,
    tracer_edges: options.tracerEdges,
    known_skills: (options.existingSkills || []).map((s) => ({ name: s.name, method: s.method, path: s.path })),
  };

  const response = await client.chat.completions.create({
    model: NEBIUS_MODELS.fast,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: JSON.stringify(userPayload, null, 2) },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.1,
  });

  const latencyMs = Date.now() - startTime;
  logger.info({ model: NEBIUS_MODELS.fast, latencyMs }, 'Nemotron skill compile completed');

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error('Empty response from Nemotron Fast model');
  }

  let parsedJson: any;
  try {
    parsedJson = JSON.parse(content);
  } catch (err: any) {
    if (retryCount < 1) {
      return callNebiusCompiler(options, retryCount + 1);
    }
    throw new Error(`Failed to parse Nemotron JSON response: ${err.message}`);
  }

  const validated = LLMCompileOutputSchema.safeParse(parsedJson);
  if (!validated.success) {
    if (retryCount < 1) {
      logger.warn({ errors: validated.error.errors }, 'Compiler validation failed. Retrying once...');
      return callNebiusCompiler(options, retryCount + 1);
    }
    throw new Error(`Compiler schema validation failed: ${validated.error.errors[0]?.message}`);
  }

  return {
    skills: validated.data.skills as any,
    suggested_policies: validated.data.suggested_policies as any,
  };
}

export function deterministicCompile({
  events,
  narration,
  tracerEdges,
  existingSkills = [],
}: CompileOptions): {
  skills: Omit<SkillDefinition, 'id' | 'app_id' | 'version' | 'status'>[];
  suggested_policies: PolicyRule[];
} {
  const skills: Omit<SkillDefinition, 'id' | 'app_id' | 'version' | 'status'>[] = [];
  const suggested_policies: PolicyRule[] = [];

  // Group events into skills
  events.forEach((event, idx) => {
    // Generate clean skill name from path and method
    const pathClean = event.path.replace(/^\/api\/dehix\//, '').replace(/^\/api\//, '');
    const segments = pathClean.split('/').filter(Boolean);
    const resource = segments[0] || 'item';
    const subAction = segments[1] || '';

    let name = '';
    let title = '';

    if (event.method === 'POST') {
      if (subAction === 'invite') {
        name = 'invite_member';
        title = 'Invite Team Member';
      } else if (subAction === 'decision') {
        name = 'update_application_decision';
        title = 'Update Application Decision';
      } else {
        name = `create_${resource.replace(/s$/, '')}`;
        title = `Create ${resource.replace(/s$/, '').replace(/^\w/, (c) => c.toUpperCase())}`;
      }
    } else if (event.method === 'GET') {
      if (subAction === 'get' || event.query?.id) {
        name = `get_${resource.replace(/s$/, '')}`;
        title = `Get ${resource.replace(/s$/, '').replace(/^\w/, (c) => c.toUpperCase())}`;
      } else {
        name = `list_${resource}`;
        title = `List ${resource.replace(/^\w/, (c) => c.toUpperCase())}`;
      }
    } else {
      name = `${event.method.toLowerCase()}_${resource}`;
      title = `${event.method} ${resource}`;
    }

    // Inputs from request body and query
    const inputs: Record<string, any> = {};
    if (event.requestBody && typeof event.requestBody === 'object') {
      for (const [k, v] of Object.entries(event.requestBody)) {
        inputs[k] = {
          type: typeof v,
          required: true,
          description: `Parameter ${k} for ${name}`,
        };
      }
    }
    if (event.query) {
      for (const [k, v] of Object.entries(event.query)) {
        inputs[k] = {
          type: typeof v,
          required: false,
          description: `Query parameter ${k}`,
        };
      }
    }

    // Outputs from responseBody
    const outputs: Record<string, any> = {};
    if (event.responseBody && typeof event.responseBody === 'object') {
      for (const [k, v] of Object.entries(event.responseBody)) {
        if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') {
          outputs[k] = typeof v;
        } else if (Array.isArray(v)) {
          outputs[k] = 'array';
        } else if (typeof v === 'object' && v !== null) {
          outputs[k] = 'object';
        }
      }
    }

    // Dependencies from value tracer
    const dependsOn: string[] = [];
    tracerEdges.forEach((edge) => {
      if (edge.to_event === idx) {
        const priorSkillName = skills[edge.from_event]?.name;
        if (priorSkillName && !dependsOn.includes(priorSkillName)) {
          dependsOn.push(priorSkillName);
        }
      }
    });

    const isWrite = event.method !== 'GET';

    // Verify with read skill
    let verifyWith: string | null = null;
    if (isWrite) {
      const candidateGet = `get_${resource.replace(/s$/, '')}`;
      const hasGetInBatch = events.some((e) => e.method === 'GET' && e.path.includes(resource));
      const hasGetInExisting = existingSkills.some((s) => s.name === candidateGet);
      if (hasGetInBatch || hasGetInExisting) {
        verifyWith = candidateGet;
      }
    }

    skills.push({
      name,
      title,
      description: `Skill for ${event.method} ${event.path} automatically compiled by SayDo`,
      method: event.method,
      path: event.path,
      query_params: event.query ? Object.keys(event.query) : [],
      inputs,
      constants: {},
      outputs,
      depends_on: dependsOn,
      is_write: isWrite,
      verify_with: verifyWith,
      source_recording: null,
      narration: narration || null,
    });
  });

  // Suggest spoken policies from narration keywords
  if (narration) {
    const lower = narration.toLowerCase();
    if (lower.includes('budget') || lower.includes('lakh') || lower.includes('₹')) {
      suggested_policies.push({
        id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `pol-${Date.now()}`,
        app_id: '',
        skill_name: 'create_project',
        kind: 'limit',
        field: 'budget',
        op: 'lte',
        value: 1000000,
        message: 'Project budget cannot exceed ₹10,00,000 INR without administrative approval',
        spoken: narration,
        source: 'voice',
      });
    }

    if (lower.includes('admin') || lower.includes('role')) {
      suggested_policies.push({
        id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `pol-${Date.now() + 1}`,
        app_id: '',
        skill_name: 'invite_member',
        kind: 'block',
        field: 'role',
        op: 'eq',
        value: 'admin',
        message: 'Autonomous agents cannot issue invitations with administrator privileges',
        spoken: narration,
        source: 'voice',
      });
    }
  }

  return { skills, suggested_policies };
}
