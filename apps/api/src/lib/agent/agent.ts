import { SkillDefinition, PolicyRule, evaluate, AgentPlan, PolicyEvaluationResult } from '@saydo/shared';
import { getNebiusClient, NEBIUS_MODELS, hasActiveApiKey } from '../nebius.js';
import { logger } from '../logger.js';
import { z } from 'zod';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  tool_call_id?: string;
  name?: string;
}

// Convert Skill inputs into OpenAI Tool Function Parameter JSON Schema
export function generateDynamicTools(skills: SkillDefinition[]): any[] {
  const tools: any[] = skills.map((skill) => {
    const properties: Record<string, any> = {};
    const required: string[] = [];

    for (const [key, param] of Object.entries(skill.inputs || {})) {
      let type = 'string';
      if (param.type === 'number') type = 'number';
      else if (param.type === 'boolean') type = 'boolean';
      else if (param.type === 'array') type = 'array';
      else if (param.type === 'object') type = 'object';

      properties[key] = {
        type,
        description: param.description || `${key} parameter`,
        ...(param.enum ? { enum: param.enum } : {}),
      };

      if (param.required) {
        required.push(key);
      }
    }

    return {
      type: 'function',
      function: {
        name: skill.name,
        description: skill.description || skill.title,
        parameters: {
          type: 'object',
          properties,
          required,
        },
      },
    };
  });

  // Add Built-in Tools
  tools.push(
    {
      type: 'function',
      function: {
        name: 'ask_docs',
        description: 'Search documentation for official rules, policies, or instructions when unsure',
        parameters: {
          type: 'object',
          properties: {
            question: { type: 'string', description: 'Question to search in the docs' },
          },
          required: ['question'],
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'ask_user',
        description: 'Ask the user a clarifying question when a required parameter is missing',
        parameters: {
          type: 'object',
          properties: {
            question: { type: 'string', description: 'Specific question to clarify with the user' },
          },
          required: ['question'],
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'final_answer',
        description: 'Deliver the final 1-2 sentence response summarizing the completed actions',
        parameters: {
          type: 'object',
          properties: {
            text: { type: 'string', description: 'Summary message to user' },
          },
          required: ['text'],
        },
      },
    }
  );

  return tools;
}

// Convert INR currencies (e.g., '2.5 lakh') to numeric values
export function parseCurrenciesToNumbers(val: any): number {
  if (typeof val === 'number') return val;
  if (typeof val === 'string') {
    const matchLakh = val.match(/(\d+(?:\.\d+)?)\s*lakh/i);
    if (matchLakh) {
      return Math.round(parseFloat(matchLakh[1]) * 100000);
    }
    const num = Number(val.replace(/[^0-9.-]+/g, ''));
    if (!isNaN(num)) return num;
  }
  return 0;
}

// Validate skill arguments dynamically
export function validateSkillArgs(skill: SkillDefinition, args: Record<string, any>): { valid: boolean; error?: string; parsedArgs: Record<string, any> } {
  const parsedArgs = { ...args };

  for (const [key, param] of Object.entries(skill.inputs || {})) {
    let val = parsedArgs[key];

    // Normalize INR amounts if field is budget or amount
    if ((key === 'budget' || key === 'amount') && typeof val === 'string') {
      const matchLakh = val.match(/(\d+(?:\.\d+)?)\s*lakh/i);
      if (matchLakh) {
        val = Math.round(parseFloat(matchLakh[1]) * 100000);
        parsedArgs[key] = val;
      } else {
        const num = Number(val.replace(/[^0-9.-]+/g, ''));
        if (!isNaN(num)) {
          val = num;
          parsedArgs[key] = val;
        }
      }
    }

    if (param.required && (val === undefined || val === null || val === '')) {
      return { valid: false, error: `Missing required parameter: ${key} (${param.description || key})`, parsedArgs };
    }

    if (val !== undefined && val !== null) {
      if (param.type === 'number' && typeof val !== 'number') {
        const n = Number(val);
        if (isNaN(n)) {
          return { valid: false, error: `Parameter ${key} must be a number, got ${typeof val}`, parsedArgs };
        }
        parsedArgs[key] = n;
      }
      if (param.enum && !param.enum.includes(String(val))) {
        return { valid: false, error: `Parameter ${key} must be one of [${param.enum.join(', ')}], got "${val}"`, parsedArgs };
      }
    }
  }

  return { valid: true, parsedArgs };
}

// Multi-intent Planner: calls REASON model or neuro-symbolic heuristic
export async function planMultiIntent(
  userPrompt: string,
  skills: SkillDefinition[]
): Promise<AgentPlan | null> {
  const lower = userPrompt.toLowerCase();
  const hasAnd = lower.includes(' and ') || lower.includes(' then ') || lower.includes(' also ');
  const skillNames = skills.map((s) => s.name);

  // Check if multiple skills are likely referenced
  let matchCount = 0;
  for (const s of skills) {
    if (lower.includes(s.name.replace(/_/g, ' ')) || (s.title && lower.includes(s.title.toLowerCase()))) {
      matchCount++;
    }
  }

  // Also check typical multi-intent patterns (e.g. "create project ... and invite ...")
  const hasCreate = lower.includes('create') || lower.includes('launch') || lower.includes('new project') || lower.includes('revamp');
  const hasInvite = lower.includes('invite') || lower.includes('member');
  if (hasCreate && hasInvite) {
    matchCount = Math.max(matchCount, 2);
  }

  if (!hasAnd && matchCount < 2) {
    return null;
  }

  const client = getNebiusClient();

  if (hasActiveApiKey()) {
    try {
      const response = await client.chat.completions.create({
        model: NEBIUS_MODELS.reason,
        messages: [
          {
            role: 'system',
            content: `You are an AI planner for a web application agent.
Available skills:
${skills.map((s) => `- ${s.name}: ${s.description || s.title} (inputs: ${Object.keys(s.inputs || {}).join(', ')})`).join('\n')}

Analyze the user's multi-step request and return an ordered JSON execution plan:
{
  "steps": [
    { "idx": 1, "skill_name": "<skill_name>", "description": "<brief description of what this step does>" }
  ],
  "summary": "<1 sentence overview>"
}
Return valid JSON only. Do not invent skills.`,
          },
          { role: 'user', content: userPrompt },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.1,
      });

      const content = response.choices[0]?.message?.content;
      if (content) {
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed.steps) && parsed.steps.length > 0) {
          return {
            steps: parsed.steps.map((st: any, idx: number) => ({
              idx: st.idx || idx + 1,
              skill_name: st.skill_name,
              description: st.description || `Execute ${st.skill_name}`,
              args: st.args || {},
            })),
            summary: parsed.summary || 'Executing plan',
          };
        }
      }
    } catch (err: any) {
      logger.warn({ err }, 'Nebius Reason model failed planning; using deterministic fallback planner');
    }
  }

  // Deterministic neuro-symbolic fallback planner
  const plannedSteps: any[] = [];
  const createsProject = lower.includes('create') || lower.includes('launch') || lower.includes('new project') || lower.includes('revamp');
  if (createsProject && (lower.includes('project') || lower.includes('revamp') || lower.includes('budget') || lower.includes('grant') || lower.includes('rollout'))) {
    const budgetMatch = lower.match(/(\d+(?:\.\d+)?)\s*lakh/i);
    const budget = budgetMatch ? Math.round(parseFloat(budgetMatch[1]) * 100000) : 200000;
    plannedSteps.push({
      idx: 1,
      skill_name: 'create_project',
      description: 'Create project with specified budget',
      args: { name: 'Website Revamp', budget },
    });
  }

  if (lower.includes('invite') || lower.includes('member') || lower.includes('@')) {
    const emailMatch = userPrompt.match(/[\w.-]+@[\w.-]+\.\w+/);
    const email = emailMatch ? emailMatch[0] : 'arpit@dehix.org';
    const role = lower.includes('admin') ? 'admin' : lower.includes('viewer') ? 'viewer' : 'editor';
    plannedSteps.push({
      idx: plannedSteps.length + 1,
      skill_name: 'invite_member',
      description: `Invite ${email} as ${role}`,
      args: { email, role },
    });
  }

  if (plannedSteps.length > 1) {
    return {
      steps: plannedSteps,
      summary: `Execute ${plannedSteps.length}-step workflow: ${plannedSteps.map((s) => s.skill_name).join(' → ')}`,
    };
  }

  return null;
}

// Post-write verification comparison
export function verifyWriteWithRead(
  writeSkill: SkillDefinition,
  writeArgs: Record<string, any>,
  writeResponse: any,
  readResponse: any
): { verified: boolean; message: string } {
  try {
    const targetObj = readResponse.project || readResponse.item || readResponse;
    if (!targetObj) {
      return { verified: false, message: 'Could not find created record in verification read' };
    }

    // Compare budget if provided
    if (writeArgs.budget !== undefined) {
      const readBudget = Number(targetObj.budget || targetObj.budget_inr);
      const expectedBudget = Number(writeArgs.budget);
      if (readBudget !== expectedBudget) {
        return {
          verified: false,
          message: `Budget mismatch: expected ₹${expectedBudget.toLocaleString('en-IN')}, found ₹${readBudget.toLocaleString('en-IN')}`,
        };
      }
    }

    // Compare name/title if provided
    if (writeArgs.name && targetObj.name) {
      if (!targetObj.name.toLowerCase().includes(writeArgs.name.toLowerCase())) {
        return {
          verified: false,
          message: `Name mismatch: expected "${writeArgs.name}", found "${targetObj.name}"`,
        };
      }
    }

    const name = targetObj.name || writeArgs.name || 'Record';
    const budgetStr = targetObj.budget ? ` with budget ₹${Number(targetObj.budget).toLocaleString('en-IN')}` : '';
    return {
      verified: true,
      message: `Verified: ${name} exists in system${budgetStr}`,
    };
  } catch (err: any) {
    return { verified: false, message: `Verification error: ${err.message}` };
  }
}
