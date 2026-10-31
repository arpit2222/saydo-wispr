import { PolicyRule, PolicyRuleSchema, SkillDefinition } from '@saydo/shared';
import { getNebiusClient, NEBIUS_MODELS, hasActiveApiKey } from './nebius.js';
import { logger } from './logger.js';
import { z } from 'zod';

export function normalizeAmounts(text: string): { normalizedText: string; detectedValue?: number } {
  let normalized = text;
  let detectedValue: number | undefined;

  // Regex for Indian lakh/crore and standard thousand/million
  const lakhMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:lakh|lac|lakhs|lacs)/i);
  if (lakhMatch) {
    const val = parseFloat(lakhMatch[1]) * 100000;
    detectedValue = val;
    normalized = normalized.replace(lakhMatch[0], String(val));
  }

  const croreMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:crore|crores|cr)/i);
  if (croreMatch) {
    const val = parseFloat(croreMatch[1]) * 10000000;
    detectedValue = val;
    normalized = normalized.replace(croreMatch[0], String(val));
  }

  const thousandMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:thousand|k)/i);
  if (thousandMatch) {
    const val = parseFloat(thousandMatch[1]) * 1000;
    detectedValue = val;
    normalized = normalized.replace(thousandMatch[0], String(val));
  }

  return { normalizedText: normalized, detectedValue };
}

export async function parseSpokenPolicyWithNemotron({
  spoken,
  appId,
  source = 'voice',
  skills = [],
}: {
  spoken: string;
  appId: string;
  source?: 'voice' | 'docs' | 'compile';
  skills: SkillDefinition[];
}): Promise<PolicyRule[]> {
  if (hasActiveApiKey()) {
    try {
      return await callNebiusPolicyParser({ spoken, appId, source, skills });
    } catch (err: any) {
      logger.warn({ err }, 'AI policy parse failed; using deterministic policy rule compiler');
    }
  }

  return deterministicPolicyParse({ spoken, appId, source, skills });
}

async function callNebiusPolicyParser({
  spoken,
  appId,
  source,
  skills,
}: {
  spoken: string;
  appId: string;
  source: 'voice' | 'docs' | 'compile';
  skills: SkillDefinition[];
}): Promise<PolicyRule[]> {
  const client = getNebiusClient();
  const { normalizedText } = normalizeAmounts(spoken);

  const systemPrompt = `You are SayDo's Policy Rule Synthesizer for NVIDIA Nemotron.
Convert natural language spoken constraints, compliance rules, or safety guidelines into structured PolicyRule objects.

Available Skills and Parameters:
${JSON.stringify(
  skills.map((s) => ({
    name: s.name,
    description: s.description,
    inputs: s.inputs,
  })),
  null,
  2
)}

Policy Schemas:
- kind: 'confirm' (requires explicit confirmation) | 'block' (rejects call) | 'limit' (numerical threshold) | 'require' (mandatory field) | 'role' (RBAC check)
- op: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'not_in' | 'contains'
- Convert numerical idioms (e.g. 10 lakh -> 1000000).

Return strictly a JSON object:
{
  "policies": [
    {
      "skill_name": string (must match an available skill name or '*'),
      "kind": "confirm" | "block" | "limit" | "require" | "role",
      "field": string | null,
      "op": "eq" | "neq" | "gt" | "gte" | "lt" | "lte" | "in" | "not_in" | "contains" | null,
      "value": any,
      "message": string (clear user-facing notification),
      "spoken": string,
      "source": "${source}"
    }
  ]
}`;

  const response = await client.chat.completions.create({
    model: NEBIUS_MODELS.fast,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Spoken rule: "${spoken}" (Normalized: "${normalizedText}")` },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.1,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error('Empty response from Nemotron');

  const parsed = JSON.parse(content);
  const validated = z.object({ policies: z.array(PolicyRuleSchema) }).safeParse(parsed);

  if (!validated.success) {
    throw new Error(`Validation failed: ${validated.error.errors[0]?.message}`);
  }

  return validated.data.policies.map((p) => ({
    ...p,
    id: p.id || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `pol-${Date.now()}`),
    app_id: appId,
    source,
    spoken,
  })) as PolicyRule[];
}

export function deterministicPolicyParse({
  spoken,
  appId,
  source = 'voice',
  skills = [],
}: {
  spoken: string;
  appId: string;
  source?: 'voice' | 'docs' | 'compile';
  skills: SkillDefinition[];
}): PolicyRule[] {
  const lower = spoken.toLowerCase();
  const { detectedValue } = normalizeAmounts(spoken);
  const policies: PolicyRule[] = [];
  const idGen = () => (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `pol-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`);

  // Rule 1: "Budget can never exceed 10 lakh" / budget limits
  if (lower.includes('budget') || lower.includes('lakh') || lower.includes('exceed') || lower.includes('amount')) {
    const value = detectedValue || 1000000;
    policies.push({
      id: idGen(),
      app_id: appId,
      skill_name: 'create_project',
      kind: 'limit',
      field: 'budget',
      op: 'lte',
      value: value,
      message: `Project budget cannot exceed ₹${value.toLocaleString('en-IN')} INR per platform policy.`,
      spoken,
      source,
    });
  }

  // Rule 2: "Never invite admins through the assistant" / admin role block
  if (lower.includes('admin') && (lower.includes('invite') || lower.includes('assistant') || lower.includes('never'))) {
    policies.push({
      id: idGen(),
      app_id: appId,
      skill_name: 'invite_member',
      kind: 'block',
      field: 'role',
      op: 'eq',
      value: 'admin',
      message: 'Autonomous agents cannot assign administrator privileges without out-of-band admin confirmation.',
      spoken,
      source,
    });
  }

  // Rule 3: "Always ask before rejecting an application" / confirm rejection
  if (lower.includes('reject') || (lower.includes('decision') && lower.includes('ask'))) {
    policies.push({
      id: idGen(),
      app_id: appId,
      skill_name: 'update_application_decision',
      kind: 'confirm',
      field: 'decision',
      op: 'eq',
      value: 'rejected',
      message: 'User confirmation required before recording a rejection decision.',
      spoken,
      source,
    });
  }

  // Generic fallback if none of the above matched specifically
  if (policies.length === 0) {
    policies.push({
      id: idGen(),
      app_id: appId,
      skill_name: '*',
      kind: 'confirm',
      message: `Policy rule: ${spoken}`,
      spoken,
      source,
    });
  }

  return policies;
}
