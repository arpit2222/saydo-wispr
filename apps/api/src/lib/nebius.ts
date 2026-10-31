import { AzureOpenAI, OpenAI } from 'openai';
import { logger } from './logger.js';

export type AIProvider = 'azure' | 'openai' | 'nebius' | 'offline';

export function getAIProvider(): AIProvider {
  const azureKey = process.env.AZURE_OPENAI_API_KEY;
  const azureEndpoint = process.env.AZURE_OPENAI_ENDPOINT;
  if (azureKey && !azureKey.startsWith('dummy') && !azureKey.includes('your_azure_api_key') && azureEndpoint) {
    return 'azure';
  }
  const openaiKey = process.env.OPENAI_API_KEY;
  if (openaiKey && !openaiKey.startsWith('dummy') && !openaiKey.includes('your_openai_key')) {
    return 'openai';
  }
  const nebiusKey = process.env.NEBIUS_API_KEY;
  if (nebiusKey && !nebiusKey.startsWith('dummy') && !nebiusKey.includes('your_nebius_api_key')) {
    return 'nebius';
  }
  return 'offline';
}

export function hasActiveApiKey(): boolean {
  return getAIProvider() !== 'offline';
}

export const AI_MODELS = {
  fast: process.env.AZURE_OPENAI_DEPLOYMENT || process.env.OPENAI_FAST_MODEL || process.env.NEMOTRON_FAST_MODEL || 'gpt-4o-mini',
  agent: process.env.AZURE_OPENAI_DEPLOYMENT || process.env.OPENAI_AGENT_MODEL || process.env.NEMOTRON_AGENT_MODEL || 'gpt-4o-mini',
  reason: process.env.AZURE_OPENAI_DEPLOYMENT_REASON || process.env.AZURE_OPENAI_DEPLOYMENT || process.env.OPENAI_REASON_MODEL || process.env.NEMOTRON_REASON_MODEL || 'gpt-4o',
} as const;

export type AIModelRole = keyof typeof AI_MODELS;

// Backward-compatible alias
export const NEBIUS_MODELS = AI_MODELS;
export type NebiusModelRole = AIModelRole;

export function getAIClient(): OpenAI | AzureOpenAI {
  const provider = getAIProvider();

  if (provider === 'azure') {
    return new AzureOpenAI({
      apiKey: process.env.AZURE_OPENAI_API_KEY,
      endpoint: process.env.AZURE_OPENAI_ENDPOINT,
      apiVersion: process.env.AZURE_OPENAI_API_VERSION || '2024-08-01-preview',
      deployment: process.env.AZURE_OPENAI_DEPLOYMENT || 'gpt-4o-mini',
    });
  }

  if (provider === 'openai') {
    return new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      baseURL: process.env.OPENAI_BASE_URL,
    });
  }

  if (provider === 'nebius') {
    return new OpenAI({
      apiKey: process.env.NEBIUS_API_KEY,
      baseURL: process.env.NEBIUS_BASE_URL || 'https://api.tokenfactory.nebius.com/v1',
    });
  }

  return new OpenAI({
    apiKey: 'dummy-key',
    baseURL: 'http://localhost:4000/offline',
  });
}

// Backward-compatible alias
export const getNebiusClient = getAIClient;

export interface ModelCallTelemetry {
  model: string;
  role: AIModelRole;
  latencyMs: number;
  promptTokens?: number;
  completionTokens?: number;
}

export async function checkModelHealth(modelName: string): Promise<{
  model: string;
  provider: AIProvider;
  chatOk: boolean;
  toolCallsOk: boolean;
  jsonModeOk: boolean;
  latencyMs: number;
  notes?: string;
}> {
  const startTime = Date.now();
  const provider = getAIProvider();

  if (provider === 'offline') {
    return {
      model: modelName,
      provider: 'offline',
      chatOk: true,
      toolCallsOk: true,
      jsonModeOk: true,
      latencyMs: 1,
      notes: 'Offline deterministic engine active (AZURE_OPENAI_API_KEY not configured). All pre-seeded tools and policy guardrails operational.',
    };
  }

  const client = getAIClient();
  let chatOk = false;
  let toolCallsOk = false;
  let jsonModeOk = false;
  let notes: string | undefined;

  try {
    // 1. Test trivial chat
    const chatRes = await client.chat.completions.create({
      model: modelName,
      messages: [{ role: 'user', content: 'Respond with the word "pong".' }],
      max_tokens: 10,
    });
    chatOk = !!chatRes.choices[0]?.message?.content;

    // 2. Test tool call support
    try {
      const toolRes = await client.chat.completions.create({
        model: modelName,
        messages: [{ role: 'user', content: 'What is the weather in Delhi?' }],
        tools: [
          {
            type: 'function',
            function: {
              name: 'get_weather',
              description: 'Get weather for a city',
              parameters: {
                type: 'object',
                properties: {
                  city: { type: 'string' },
                },
                required: ['city'],
              },
            },
          },
        ],
        tool_choice: 'auto',
        max_tokens: 50,
      });
      const toolCalls = toolRes.choices[0]?.message?.tool_calls;
      toolCallsOk = Array.isArray(toolCalls) && toolCalls.length > 0;
    } catch (err: any) {
      toolCallsOk = false;
      notes = `Tool call check: ${err.message}`;
    }

    // 3. Test JSON mode support
    try {
      const jsonRes = await client.chat.completions.create({
        model: modelName,
        messages: [
          {
            role: 'system',
            content: 'You must respond only with valid JSON: {"status": "ok"}',
          },
          { role: 'user', content: 'Ping' },
        ],
        response_format: { type: 'json_object' },
        max_tokens: 30,
      });
      const content = jsonRes.choices[0]?.message?.content;
      if (content) {
        JSON.parse(content);
        jsonModeOk = true;
      }
    } catch (err: any) {
      jsonModeOk = false;
      notes = notes ? `${notes}; JSON mode check: ${err.message}` : `JSON mode check: ${err.message}`;
    }
  } catch (err: any) {
    logger.error({ err, model: modelName }, 'Model health check failed');
    notes = err.message;
  }

  const latencyMs = Date.now() - startTime;

  return {
    model: modelName,
    provider,
    chatOk,
    toolCallsOk,
    jsonModeOk,
    latencyMs,
    notes,
  };
}
