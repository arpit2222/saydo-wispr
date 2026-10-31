export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export type PolicyKind = 'confirm' | 'block' | 'limit' | 'require' | 'role';

export type PolicyOperator = 
  | 'eq' 
  | 'neq' 
  | 'gt' 
  | 'gte' 
  | 'lt' 
  | 'lte' 
  | 'in' 
  | 'not_in' 
  | 'contains';

export type PolicySource = 'voice' | 'docs' | 'compile';

export interface PolicyRule {
  id: string;
  app_id: string;
  skill_name: string;
  kind: PolicyKind;
  field?: string | null;
  op?: PolicyOperator | null;
  value?: unknown;
  message: string;
  spoken?: string | null;
  source: PolicySource;
  created_at?: string;
}

export interface SkillInputParam {
  type: string;
  required?: boolean;
  enum?: string[];
  description?: string;
  default?: unknown;
}

export interface NarrationMetadata {
  source: 'voice' | 'typed';
  words: number;
  created_at?: string;
}

export interface SkillDefinition {
  id: string;
  app_id: string;
  name: string;
  version: number;
  title: string;
  description?: string;
  method: HttpMethod;
  path: string;
  query_params?: string[];
  inputs: Record<string, SkillInputParam>;
  constants?: Record<string, unknown>;
  outputs?: Record<string, unknown>;
  depends_on?: string[];
  is_write: boolean;
  verify_with?: string | null;
  source_recording?: string | null;
  narration?: string | null;
  narration_metadata?: NarrationMetadata | null;
  status: 'active' | 'drifted' | 'disabled' | 'at_risk';
}

export interface NetworkCapturedEvent {
  method: HttpMethod;
  path: string;
  query?: Record<string, string>;
  requestBody?: unknown;
  status: number;
  responseBody?: unknown;
  ts: number;
}

export interface PolicyEvaluationContext {
  userRole?: string;
  userId?: string;
  env?: Record<string, unknown>;
}

export interface PolicyViolation {
  policyId: string;
  message: string;
  kind: PolicyKind;
  field?: string | null;
}

export interface PolicyEvaluationResult {
  allowed: boolean;
  needsConfirm: boolean;
  violations: PolicyViolation[];
}

export interface TracerEdge {
  from_event: number;
  from_path: string;
  to_event: number;
  to_field: string;
  value: string | number;
}

export interface CompileResult {
  skills: SkillDefinition[];
  suggested_policies: PolicyRule[];
  tracer_edges: TracerEdge[];
}

export interface AgentPlanStep {
  idx: number;
  skill_name: string;
  description: string;
  args?: Record<string, any>;
}

export interface AgentPlan {
  steps: AgentPlanStep[];
  summary: string;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  tool_call_id?: string;
  name?: string;
}

export interface ChatPendingResult {
  call_id: string;
  skill_name: string;
  status: number;
  response?: any;
}

export interface ChatRequest {
  app_key: string;
  messages: ChatMessage[];
  pending_result?: ChatPendingResult;
}

export interface ChatToolCallResponse {
  type: 'tool_call';
  call_id: string;
  skill: string;
  method?: HttpMethod;
  path?: string;
  args: Record<string, any>;
  check: PolicyEvaluationResult;
  plan?: AgentPlan;
  verified?: boolean;
  verification_note?: string;
  blocked?: boolean;
  message?: string;
}

export interface ChatMessageResponse {
  type: 'message';
  text: string;
  plan?: AgentPlan;
  sources?: any[];
  verified?: boolean;
  verification_note?: string;
}

export type ChatResponse = ChatToolCallResponse | ChatMessageResponse;


