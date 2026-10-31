import { NetworkCapturedEvent, sanitizeEvents } from '@saydo/shared';

export interface SayDoConfig {
  publicKey: string;
  apiUrl?: string;
  apiPrefix?: string;
}

export interface ChatItem {
  id: string;
  role: 'user' | 'assistant' | 'tool';
  text?: string;
  sources?: Array<{ title?: string; url?: string; content?: string }>;
  toolCall?: {
    call_id: string;
    skill: string;
    method?: string;
    path?: string;
    args: Record<string, any>;
    check: any;
    blocked?: boolean;
    needsConfirm?: boolean;
    message?: string;
    is_verification?: boolean;
    original_write?: any;
  };
  verified?: boolean;
  verificationNote?: string;
  status?: 'pending' | 'running' | 'completed' | 'cancelled' | 'blocked';
}

export interface PlanStepItem {
  idx: number;
  skill_name: string;
  description: string;
  completed?: boolean;
}

class SayDoSDK {
  private config: SayDoConfig = {
    publicKey: 'pk_demo_dehix',
    apiUrl: 'http://localhost:4000',
    apiPrefix: '/api/',
  };

  private shadowRoot: ShadowRoot | null = null;
  private isRecording: boolean = false;
  private recordedEvents: NetworkCapturedEvent[] = [];
  private activeTab: 'ask' | 'teach' = 'ask';
  private isOpen: boolean = false;
  private isListening: boolean = false;
  private speechRecognition: any = null;
  private narrationText: string = '';
  private recordingTitle: string = '';

  // Ask Agent State
  private chatItems: ChatItem[] = [];
  private chatInputText: string = '';
  private isAgentBusy: boolean = false;
  private activePlan: { steps: PlanStepItem[]; summary: string } | null = null;
  private currentRunId: string | null = null;
  private stats: { skillsCount: number; rulesCount: number } = { skillsCount: 6, rulesCount: 3 };

  constructor() {
    this.autoInit();
  }

  private autoInit() {
    if (typeof window === 'undefined') return;

    const currentScript = document.currentScript as HTMLScriptElement | null;
    const publicKey = currentScript?.getAttribute('data-app') || 'pk_demo_dehix';
    const apiUrl = currentScript?.getAttribute('data-api') || currentScript?.getAttribute('data-api-url') || 'http://localhost:4000';

    this.init({ publicKey, apiUrl });
  }

  public init(config: SayDoConfig) {
    this.config = { ...this.config, ...config };
    this.setupInterceptors();
    this.initSpeechRecognition();
    this.mountWidget();
    this.fetchAppStats();

    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('saydo') === 'teach' || localStorage.getItem('saydo_mode') === 'teach') {
      this.activeTab = 'teach';
      this.isOpen = true;
    }

    this.render();
    console.log('[SayDo SDK] Initialized with app:', this.config.publicKey, 'API:', this.config.apiUrl);
  }

  private async fetchAppStats() {
    try {
      const res = await window.fetch(`${this.config.apiUrl}/v1/stats?publicKey=${this.config.publicKey}`);
      if (res.ok) {
        const data = await res.json();
        this.stats = {
          skillsCount: data.skills_count ?? 6,
          rulesCount: data.policies_count ?? 3,
        };
        this.render();
      }
    } catch {
      // fallback
    }
  }

  private isTeachModeAllowed(): boolean {
    if (typeof window === 'undefined') return false;
    const urlParams = new URLSearchParams(window.location.search);
    return (
      urlParams.get('saydo') === 'teach' ||
      localStorage.getItem('saydo_mode') === 'teach' ||
      (window as any).saydoTeachMode === true
    );
  }

  private setupInterceptors() {
    if (typeof window === 'undefined') return;

    const self = this;

    // 1. Wrap window.fetch
    const originalFetch = window.fetch;
    window.fetch = async function (...args) {
      const response = await originalFetch.apply(this, args);
      if (self.isRecording) {
        try {
          const urlStr = typeof args[0] === 'string' ? args[0] : (args[0] as Request).url;
          const url = new URL(urlStr, window.location.origin);

          if (url.origin === window.location.origin && url.pathname.startsWith(self.config.apiPrefix || '/api/')) {
            const clone = response.clone();
            let responseBody: unknown = null;
            try {
              responseBody = await clone.json();
            } catch {}

            const rawBody = args[1]?.body;
            const parsedBody = self.safeParseBody(rawBody);

            self.addCapturedEvent({
              method: (args[1]?.method || 'GET').toUpperCase() as any,
              path: url.pathname,
              query: Object.fromEntries(url.searchParams.entries()),
              requestBody: parsedBody,
              status: response.status,
              responseBody,
              ts: Date.now(),
            });
          }
        } catch (e) {
          console.warn('[SayDo] Fetch interceptor error:', e);
        }
      }
      return response;
    };

    // 2. Wrap XMLHttpRequest
    const originalXhrOpen = XMLHttpRequest.prototype.open;
    const originalXhrSend = XMLHttpRequest.prototype.send;

    XMLHttpRequest.prototype.open = function (this: any, method: string, url: string | URL, ...rest: any[]) {
      this._saydoMethod = method;
      this._saydoUrl = url.toString();
      return originalXhrOpen.apply(this, [method, url, ...rest] as any);
    };

    XMLHttpRequest.prototype.send = function (this: any, body?: any) {
      if (self.isRecording && this._saydoUrl) {
        this.addEventListener('load', () => {
          try {
            const url = new URL(this._saydoUrl, window.location.origin);
            if (url.origin === window.location.origin && url.pathname.startsWith(self.config.apiPrefix || '/api/')) {
              let responseBody = null;
              try {
                responseBody = JSON.parse(this.responseText);
              } catch {}

              self.addCapturedEvent({
                method: (this._saydoMethod || 'GET').toUpperCase() as any,
                path: url.pathname,
                query: Object.fromEntries(url.searchParams.entries()),
                requestBody: self.safeParseBody(body),
                status: this.status,
                responseBody,
                ts: Date.now(),
              });
            }
          } catch (e) {
            console.warn('[SayDo] XHR interceptor error:', e);
          }
        });
      }
      return originalXhrSend.apply(this, [body] as any);
    };
  }

  private addCapturedEvent(event: NetworkCapturedEvent) {
    this.recordedEvents.push(event);
    this.render();
  }

  private safeParseBody(body: any): unknown {
    if (!body) return undefined;
    if (typeof body === 'string') {
      try {
        return JSON.parse(body);
      } catch {
        return body;
      }
    }
    return body;
  }

  private initSpeechRecognition() {
    if (typeof window === 'undefined') return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      this.speechRecognition = new SpeechRecognition();
      this.speechRecognition.continuous = true;
      this.speechRecognition.interimResults = true;
      this.speechRecognition.lang = 'en-IN';

      this.speechRecognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }

        if (this.activeTab === 'teach') {
          this.narrationText = (this.narrationText + ' ' + transcript).trim();
        } else {
          this.chatInputText = (this.chatInputText + ' ' + transcript).trim();
        }
        this.render();
      };

      this.speechRecognition.onerror = () => {
        this.isListening = false;
        this.render();
      };

      this.speechRecognition.onend = () => {
        this.isListening = false;
        this.render();
      };
    }
  }

  private toggleSpeech() {
    if (!this.speechRecognition) {
      alert('Speech recognition is not supported in this browser. Please type directly.');
      return;
    }

    if (this.isListening) {
      this.speechRecognition.stop();
      this.isListening = false;
    } else {
      try {
        this.speechRecognition.start();
        this.isListening = true;
      } catch (e) {
        console.warn('Speech start error:', e);
      }
    }
    this.render();
  }

  private mountWidget() {
    if (typeof document === 'undefined') return;

    let hostDiv = document.getElementById('saydo-root');
    if (!hostDiv) {
      hostDiv = document.createElement('div');
      hostDiv.id = 'saydo-root';
      document.body.appendChild(hostDiv);
    }

    this.shadowRoot = hostDiv.attachShadow({ mode: 'open' });
  }

  // Send message to SayDo Agent (/v1/chat)
  public async submitUserPrompt(promptText: string) {
    if (!promptText.trim() || this.isAgentBusy) return;

    this.isAgentBusy = true;
    this.chatInputText = '';

    const userItem: ChatItem = {
      id: `msg-${Date.now()}`,
      role: 'user',
      text: promptText,
    };
    this.chatItems.push(userItem);
    this.render();

    await this.callChatApi();
  }

  private async callChatApi(pendingResult?: any) {
    try {
      // Build messages array
      const apiMessages = this.chatItems
        .filter((item) => item.text && (item.role === 'user' || item.role === 'assistant'))
        .map((item) => ({
          role: item.role,
          content: item.text || '',
        }));

      const payload = {
        app_key: this.config.publicKey,
        messages: apiMessages,
        pending_result: pendingResult,
        run_id: this.currentRunId,
        plan: this.activePlan,
      };

      const res = await fetch(`${this.config.apiUrl}/v1/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Agent request failed');
      }

      if (data.run_id) {
        this.currentRunId = data.run_id;
      }

      if (data.plan) {
        this.activePlan = data.plan;
      }

      if (data.type === 'tool_call') {
        const toolItem: ChatItem = {
          id: data.call_id || `call-${Date.now()}`,
          role: 'tool',
          toolCall: {
            call_id: data.call_id,
            skill: data.skill,
            method: data.method,
            path: data.path,
            args: data.args,
            check: data.check,
            blocked: data.blocked,
            needsConfirm: data.needsConfirm,
            message: data.message,
            is_verification: data.is_verification,
            original_write: data.original_write,
          },
          status: data.blocked ? 'blocked' : 'pending',
          verified: data.verified,
          verificationNote: data.verification_note,
        };
        this.chatItems.push(toolItem);
        this.render();

        // Auto-run if read skill and allowed without confirmation!
        if (!data.blocked && !data.needsConfirm) {
          await this.executeToolCall(toolItem);
        } else {
          this.isAgentBusy = false;
          this.render();
        }
      } else if (data.type === 'message') {
        this.chatItems.push({
          id: `msg-${Date.now()}`,
          role: 'assistant',
          text: data.text,
          sources: data.sources,
          verified: data.verified,
          verificationNote: data.verification_note,
        });

        // Mark all plan steps completed
        if (this.activePlan) {
          this.activePlan.steps.forEach((s) => (s.completed = true));
        }

        this.isAgentBusy = false;
        this.render();
      }
    } catch (err: any) {
      this.chatItems.push({
        id: `err-${Date.now()}`,
        role: 'assistant',
        text: `Agent Error: ${err.message}`,
      });
      this.isAgentBusy = false;
      this.render();
    }
  }

  // Execute Tool Call in Browser Session with User Credentials
  public async executeToolCall(item: ChatItem) {
    if (!item.toolCall) return;

    item.status = 'running';
    this.isAgentBusy = true;
    this.render();

    const tc = item.toolCall;
    const method = (tc.method || 'GET').toUpperCase();
    let url = tc.path || '/';

    // Build URL parameters for GET
    if (method === 'GET' && tc.args && Object.keys(tc.args).length > 0) {
      const searchParams = new URLSearchParams();
      for (const [k, v] of Object.entries(tc.args)) {
        if (v !== undefined && v !== null && v !== '') {
          searchParams.append(k, String(v));
        }
      }
      url = `${url}?${searchParams.toString()}`;
    }

    try {
      const execRes = await window.fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: method !== 'GET' ? JSON.stringify(tc.args) : undefined,
        credentials: 'include',
      });

      let responseData: any = null;
      try {
        responseData = await execRes.json();
      } catch {
        responseData = { status: execRes.status };
      }

      item.status = 'completed';

      // Update plan step checkbox
      if (this.activePlan) {
        const step = this.activePlan.steps.find((s) => s.skill_name === tc.skill);
        if (step) step.completed = true;
      }

      // Dispatch 'saydo:changed' event so host app (DEHIX-lite) refreshes in real-time
      if (method !== 'GET') {
        window.dispatchEvent(
          new CustomEvent('saydo:changed', {
            detail: { skill: tc.skill, args: tc.args, response: responseData },
          })
        );
      }

      // Post execution result back to /v1/chat to continue loop or trigger verifier
      await this.callChatApi({
        call_id: tc.call_id,
        skill_name: tc.skill,
        status: execRes.status,
        response: responseData,
        args: tc.args,
        is_verification: tc.is_verification,
        original_write: tc.original_write,
      });
    } catch (err: any) {
      item.status = 'cancelled';
      this.chatItems.push({
        id: `err-${Date.now()}`,
        role: 'assistant',
        text: `Execution failed: ${err.message}`,
      });
      this.isAgentBusy = false;
      this.render();
    }
  }

  public cancelToolCall(item: ChatItem) {
    item.status = 'cancelled';
    this.isAgentBusy = false;
    this.render();
  }

  private render() {
    if (!this.shadowRoot) return;

    const isTeachAvailable = this.isTeachModeAllowed();

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          all: initial;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          font-size: 13px;
          line-height: 1.4;
          color: #e2e8f0;
          box-sizing: border-box;
        }
        *, *::before, *::after {
          box-sizing: border-box;
        }

        /* Launcher */
        .saydo-launcher {
          position: fixed;
          bottom: 24px;
          right: 24px;
          background: #0f172a;
          color: #ffffff;
          border-radius: 9999px;
          padding: 10px 18px;
          font-size: 13px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.12);
          z-index: 2147483647;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          border: none;
        }
        .saydo-launcher:hover {
          transform: translateY(-2px);
          box-shadow: 0 14px 28px -5px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(59, 130, 246, 0.5);
        }
        .saydo-indicator {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: ${this.isRecording ? '#ef4444' : this.isAgentBusy ? '#f59e0b' : '#10b981'};
          box-shadow: 0 0 8px ${this.isRecording ? '#ef4444' : this.isAgentBusy ? '#f59e0b' : '#10b981'};
          animation: ${this.isRecording || this.isAgentBusy ? 'pulse 1s infinite' : 'none'};
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(1.2); }
        }

        /* Panel */
        .saydo-panel {
          position: fixed;
          bottom: 76px;
          right: 24px;
          width: 420px;
          max-height: calc(100vh - 100px);
          height: 580px;
          background: #0b0f19;
          border: 1px solid #1e293b;
          border-radius: 20px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.75);
          z-index: 2147483647;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          transform-origin: bottom right;
          opacity: ${this.isOpen ? '1' : '0'};
          transform: ${this.isOpen ? 'translateY(0) scale(1)' : 'translateY(16px) scale(0.95)'};
          pointer-events: ${this.isOpen ? 'auto' : 'none'};
        }

        /* Accessible Focus States */
        button:focus-visible, input:focus-visible, textarea:focus-visible {
          outline: 2px solid #10b981 !important;
          outline-offset: 2px !important;
        }

        /* Mobile Layout */
        @media (max-width: 640px) {
          .saydo-panel {
            bottom: 0 !important;
            right: 0 !important;
            left: 0 !important;
            width: 100% !important;
            height: 88vh !important;
            max-height: 88vh !important;
            border-radius: 20px 20px 0 0 !important;
          }
          .saydo-launcher {
            bottom: 16px !important;
            right: 16px !important;
          }
        }

        /* Header */
        .saydo-header {
          padding: 14px 18px;
          background: #0f172a;
          border-bottom: 1px solid #1e293b;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .saydo-brand {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 700;
          color: #ffffff;
          font-size: 14px;
        }
        .saydo-badge {
          font-size: 10px;
          background: rgba(59, 130, 246, 0.15);
          color: #60a5fa;
          padding: 2px 6px;
          border-radius: 9999px;
          border: 1px solid rgba(59, 130, 246, 0.3);
        }
        .saydo-close {
          background: none;
          border: none;
          color: #94a3b8;
          cursor: pointer;
          font-size: 18px;
          line-height: 1;
          padding: 4px;
        }
        .saydo-close:hover { color: #ffffff; }

        /* Tabs */
        .saydo-tabs {
          display: flex;
          background: #090d16;
          border-bottom: 1px solid #1e293b;
          padding: 4px;
          gap: 4px;
        }
        .saydo-tab-btn {
          flex: 1;
          padding: 8px 12px;
          border: none;
          border-radius: 10px;
          background: transparent;
          color: #94a3b8;
          font-weight: 600;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .saydo-tab-btn.active {
          background: #1e293b;
          color: #ffffff;
        }

        /* Body */
        .saydo-body {
          flex: 1;
          padding: 14px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        /* Ask Agent Styles */
        .saydo-plan-box {
          background: #0d1527;
          border: 1px solid rgba(59, 130, 246, 0.3);
          border-radius: 12px;
          padding: 10px 14px;
          font-size: 12px;
        }
        .saydo-plan-title {
          font-weight: 700;
          color: #60a5fa;
          margin-bottom: 6px;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .saydo-step-row {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 3px 0;
          color: #cbd5e1;
        }
        .saydo-step-done {
          color: #10b981;
          font-weight: 600;
        }

        .saydo-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-bottom: 4px;
        }
        .saydo-chip {
          background: #1e293b;
          border: 1px solid #334155;
          color: #94a3b8;
          padding: 5px 10px;
          border-radius: 9999px;
          font-size: 11px;
          cursor: pointer;
          transition: all 0.15s ease;
          text-align: left;
        }
        .saydo-chip:hover {
          background: #2563eb;
          color: #ffffff;
          border-color: #3b82f6;
        }

        /* Messages */
        .saydo-msg-user {
          align-self: flex-end;
          background: #1e3a8a;
          color: #eff6ff;
          padding: 8px 12px;
          border-radius: 14px 14px 2px 14px;
          max-width: 85%;
          font-size: 12px;
        }
        .saydo-msg-assistant {
          align-self: flex-start;
          background: #131b2e;
          border: 1px solid #1e293b;
          color: #e2e8f0;
          padding: 10px 14px;
          border-radius: 14px 14px 14px 2px;
          max-width: 90%;
          font-size: 12px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        /* Typing Indicator */
        .saydo-typing-indicator {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 8px 12px;
          background: #131b2e;
          border: 1px solid #1e293b;
          border-radius: 12px;
          width: fit-content;
        }
        .saydo-typing-dot {
          width: 6px;
          height: 6px;
          background: #3b82f6;
          border-radius: 50%;
          animation: saydo-bounce 1.4s infinite ease-in-out both;
        }
        .saydo-typing-dot:nth-child(1) {
          animation-delay: -0.32s;
        }
        .saydo-typing-dot:nth-child(2) {
          animation-delay: -0.16s;
        }
        @keyframes saydo-bounce {
          0%, 80%, 100% {
            transform: scale(0);
            opacity: 0.4;
          }
          40% {
            transform: scale(1);
            opacity: 1;
          }
        }
        .saydo-typing-text {
          font-size: 11px;
          color: #94a3b8;
          margin-left: 6px;
        }

        /* Tool Cards */
        .saydo-card-confirm {
          border-radius: 12px;
          border: 1px solid #3b82f6;
          background: #0f172a;
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
        }
        .saydo-card-blocked {
          border-radius: 12px;
          border: 1px solid #ef4444;
          background: #450a0a;
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.2);
        }
        .saydo-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-weight: 700;
          font-size: 12px;
        }
        .saydo-args-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 11px;
          background: rgba(0, 0, 0, 0.3);
          border-radius: 6px;
          overflow: hidden;
        }
        .saydo-args-table td {
          padding: 4px 8px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }
        .saydo-card-btns {
          display: flex;
          gap: 8px;
          margin-top: 4px;
        }
        .saydo-btn-confirm {
          flex: 1;
          background: #2563eb;
          color: #ffffff;
          padding: 8px;
          border: none;
          border-radius: 8px;
          font-size: 11px;
          font-weight: 700;
          cursor: pointer;
        }
        .saydo-btn-confirm:hover { background: #1d4ed8; }
        .saydo-btn-cancel {
          background: #334155;
          color: #cbd5e1;
          padding: 8px 12px;
          border: none;
          border-radius: 8px;
          font-size: 11px;
          font-weight: 600;
          cursor: pointer;
        }
        .saydo-btn-cancel:hover { background: #475569; }

        .saydo-badge-verified {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          background: rgba(16, 185, 129, 0.15);
          color: #34d399;
          border: 1px solid rgba(16, 185, 129, 0.3);
          padding: 3px 8px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 600;
        }

        /* Footer Input */
        .saydo-footer {
          padding: 10px 14px;
          background: #0f172a;
          border-top: 1px solid #1e293b;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .saydo-chat-input {
          flex: 1;
          background: #070a12;
          border: 1px solid #1e293b;
          border-radius: 10px;
          padding: 8px 12px;
          color: #f8fafc;
          font-size: 12px;
          outline: none;
        }
        .saydo-chat-input:focus {
          border-color: #3b82f6;
        }
        .saydo-icon-btn {
          background: #1e293b;
          border: 1px solid #334155;
          color: #cbd5e1;
          border-radius: 8px;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 14px;
        }
        .saydo-icon-btn.active {
          background: #ef4444;
          color: #ffffff;
        }
        .saydo-send-btn {
          background: #2563eb;
          color: #ffffff;
          border: none;
          border-radius: 8px;
          padding: 8px 14px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
        }
        .saydo-send-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* Teach View Elements */
        .saydo-rec-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 14px;
          border-radius: 12px;
          background: #131b2e;
          border: 1px solid #1e293b;
        }
        .saydo-rec-status {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 600;
          font-size: 12px;
        }
        .saydo-rec-btn {
          padding: 6px 14px;
          border-radius: 8px;
          font-size: 11px;
          font-weight: 600;
          border: none;
          cursor: pointer;
        }
        .saydo-rec-btn.start { background: #ef4444; color: #ffffff; }
        .saydo-rec-btn.stop { background: #334155; color: #f1f5f9; }
        .saydo-label {
          font-size: 11px;
          font-weight: 600;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 4px;
        }
        .saydo-input, .saydo-textarea {
          width: 100%;
          background: #070a12;
          border: 1px solid #1e293b;
          border-radius: 10px;
          padding: 10px 12px;
          color: #f8fafc;
          font-size: 12px;
          outline: none;
          font-family: inherit;
        }
        .saydo-events-box {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .saydo-event-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 6px 10px;
          border-radius: 8px;
          background: #090e1a;
          border: 1px solid #1e293b;
          font-size: 11px;
          font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
        }
        .saydo-method { font-weight: bold; color: #60a5fa; }
        .saydo-path { color: #cbd5e1; max-width: 220px; overflow: hidden; text-overflow: ellipsis; }
        .saydo-save-btn {
          padding: 10px;
          background: #2563eb;
          color: #ffffff;
          border: none;
          border-radius: 10px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
        }
        .saydo-save-btn:disabled { opacity: 0.5; cursor: not-allowed; }
      </style>

      <!-- Launcher Button -->
      <button class="saydo-launcher" id="saydo-launcher">
        <span class="saydo-indicator"></span>
        <span>${this.isRecording ? 'Recording (SayDo)' : this.isAgentBusy ? 'SayDo Working...' : 'SayDo Agent'}</span>
      </button>

      <!-- Panel -->
      <div class="saydo-panel" id="saydo-panel">
        <div class="saydo-header">
          <div class="saydo-brand">
            <span>⚡ SayDo</span>
            <span class="saydo-badge" style="background: rgba(16, 185, 129, 0.15); color: #34d399; border-color: rgba(16, 185, 129, 0.3);">
              Agent-ready: ${this.stats.skillsCount} skills · ${this.stats.rulesCount} rules
            </span>
          </div>
          <button class="saydo-close" id="saydo-close" aria-label="Close SayDo panel">&times;</button>
        </div>

        ${
          isTeachAvailable
            ? `
          <div class="saydo-tabs">
            <button class="saydo-tab-btn ${this.activeTab === 'ask' ? 'active' : ''}" id="tab-ask">
              Ask Agent
            </button>
            <button class="saydo-tab-btn ${this.activeTab === 'teach' ? 'active' : ''}" id="tab-teach">
              Teach by Doing
            </button>
          </div>
        `
            : ''
        }

        <div class="saydo-body" id="saydo-body">
          ${
            this.activeTab === 'teach' && isTeachAvailable
              ? `
            <!-- Teach View -->
            <div class="saydo-rec-bar">
              <div class="saydo-rec-status">
                <span class="saydo-indicator"></span>
                <span>${this.isRecording ? 'Capturing App API Calls...' : 'Recorder Ready'}</span>
              </div>
              <button class="saydo-rec-btn ${this.isRecording ? 'stop' : 'start'}" id="btn-toggle-rec">
                ${this.isRecording ? 'Stop Recording' : '● Record Task'}
              </button>
            </div>

            <div>
              <div class="saydo-label">Task Title</div>
              <input 
                type="text" 
                class="saydo-input" 
                id="input-title" 
                placeholder="e.g. Create Website Revamp Project" 
                value="${this.recordingTitle}"
              />
            </div>

            <div>
              <div class="saydo-label" style="display: flex; align-items: center; justify-content: space-between;">
                <span>Tell Narration</span>
                <span class="saydo-badge" style="background: rgba(168, 85, 247, 0.15); color: #c084fc; border-color: rgba(168, 85, 247, 0.35); font-size: 9px; font-weight: 600;">
                  🎙️ Powered by Wispr Flow
                </span>
              </div>
              <div style="position: relative;">
                <textarea 
                  class="saydo-textarea" 
                  id="textarea-narration" 
                  rows="3" 
                  placeholder="Speak naturally with Wispr Flow while clicking (e.g. 'I am creating Website Revamp with 2 lakh budget...')..."
                >${this.narrationText}</textarea>
                <button class="saydo-icon-btn" id="btn-mic-teach" style="position: absolute; right: 8px; bottom: 8px; background: ${this.isListening ? '#ef4444' : '#7c3aed'}; color: white;" title="Dictate with Wispr Flow">
                  ${this.isListening ? '🛑' : '🎙️'}
                </button>
              </div>
              ${this.isListening ? '<div style="font-size: 10px; color: #c084fc; font-weight: 600; margin-top: 4px; display: flex; align-items: center; gap: 4px;"><span class="saydo-indicator" style="background: #c084fc; box-shadow: 0 0 8px #c084fc;"></span> Wispr Flow listening... Speak aloud at your normal pace.</div>' : ''}
            </div>

            <div>
              <div class="saydo-label">Captured Network Calls (${this.recordedEvents.length})</div>
              <div class="saydo-events-box">
                ${
                  this.recordedEvents.length === 0
                    ? `<div style="font-size: 11px; color: #64748b; font-style: italic; padding: 4px;">Click 'Record Task' and interact with DEHIX-lite. API calls appear here live.</div>`
                    : this.recordedEvents
                        .map(
                          (ev) => `
                        <div class="saydo-event-item">
                          <div>
                            <span class="saydo-method">${ev.method}</span>
                            <span class="saydo-path" title="${ev.path}">${ev.path}</span>
                          </div>
                          <span style="color: #10b981; font-size: 10px;">${ev.status}</span>
                        </div>
                      `
                        )
                        .join('')
                }
              </div>
            </div>

            <button class="saydo-save-btn" id="btn-save-recording" ${this.recordedEvents.length === 0 ? 'disabled' : ''}>
              Stop & Save to SayDo
            </button>
          `
              : `
            <!-- Ask Agent View -->
            ${
              this.activePlan
                ? `
              <div class="saydo-plan-box">
                <div class="saydo-plan-title">
                  <span>📋 Execution Plan</span>
                </div>
                <div style="font-size: 11px; color: #94a3b8; margin-bottom: 6px;">${this.activePlan.summary}</div>
                ${this.activePlan.steps
                  .map(
                    (s) => `
                  <div class="saydo-step-row ${s.completed ? 'saydo-step-done' : ''}">
                    <span>${s.completed ? '✓' : '○'}</span>
                    <span><strong>Step ${s.idx}:</strong> ${s.description || s.skill_name}</span>
                  </div>
                `
                  )
                  .join('')}
              </div>
            `
                : `
              <div style="font-size: 11px; color: #94a3b8; font-weight: 600;">SUGGESTED PROMPTS</div>
              <div class="saydo-chips">
                <button class="saydo-chip" data-prompt="Can I reopen a rejected application?">
                  📚 Can I reopen a rejected application? (Tavily Docs)
                </button>
                <button class="saydo-chip" data-prompt="Create Website Revamp with 2 lakh budget and invite arpit@dehix.org as editor">
                  ⚡ Create Website Revamp (2L) & invite arpit@dehix.org
                </button>
                <button class="saydo-chip" data-prompt="Create a project with 20 lakh budget">
                  🛑 Create 20 lakh project (test policy limit)
                </button>
                <button class="saydo-chip" data-prompt="Show pending applications">
                  🔍 Show pending applications
                </button>
                <button class="saydo-chip" data-prompt="Invite arpit@dehix.org as admin">
                  🛡️ Invite arpit@dehix.org as admin (test role block)
                </button>
              </div>
            `
            }

            <!-- Messages Stream -->
            ${this.chatItems
              .map((item) => {
                if (item.role === 'user') {
                  return `<div class="saydo-msg-user">${item.text}</div>`;
                }

                if (item.toolCall) {
                  const tc = item.toolCall;
                  if (tc.blocked) {
                    return `
                      <div class="saydo-card-blocked">
                        <div class="saydo-card-header" style="color: #f87171;">
                          <span>🛑 Action Blocked by Platform Policy</span>
                          <span>${tc.skill}</span>
                        </div>
                        <div style="font-size: 11px; color: #fca5a5;">${tc.message || 'Blocked by security policy.'}</div>
                        <table class="saydo-args-table">
                          ${Object.entries(tc.args || {})
                            .map(([k, v]) => `<tr><td style="color:#94a3b8;">${k}</td><td>${v}</td></tr>`)
                            .join('')}
                        </table>
                      </div>
                    `;
                  }

                  if (item.status === 'pending') {
                    return `
                      <div class="saydo-card-confirm" data-call-id="${tc.call_id}">
                        <div class="saydo-card-header" style="color: #60a5fa;">
                          <span>⚠️ Confirmation Required</span>
                          <span style="font-size: 10px; background: rgba(59, 130, 246, 0.2); padding: 2px 6px; border-radius: 4px;">WRITE</span>
                        </div>
                        <div style="font-size: 12px; font-weight: 600; color: #f8fafc;">Action: ${tc.skill}</div>
                        <table class="saydo-args-table">
                          ${Object.entries(tc.args || {})
                            .map(
                              ([k, v]) => `
                            <tr>
                              <td style="color: #94a3b8; width: 35%;">${k}</td>
                              <td style="color: #f8fafc; font-weight: 500;">
                                ${k === 'budget' ? '₹' + Number(v).toLocaleString('en-IN') : v}
                              </td>
                            </tr>
                          `
                            )
                            .join('')}
                        </table>
                        <div style="font-size: 10px; color: #94a3b8;">
                          🔒 Policy notice: Writes execute using your browser session.
                        </div>
                        <div class="saydo-card-btns">
                          <button class="saydo-btn-confirm" data-action="confirm" data-id="${item.id}">
                            ✓ Confirm & Execute
                          </button>
                          <button class="saydo-btn-cancel" data-action="cancel" data-id="${item.id}">
                            Cancel
                          </button>
                        </div>
                      </div>
                    `;
                  }

                  if (item.status === 'running') {
                    return `
                      <div class="saydo-msg-assistant" style="opacity: 0.8;">
                        <div>⏳ Executing <strong>${tc.skill}</strong> in your browser...</div>
                      </div>
                    `;
                  }

                  if (item.status === 'completed') {
                    return `
                      <div class="saydo-msg-assistant">
                        <div style="color: #94a3b8; font-size: 11px;">✓ Executed ${tc.skill}</div>
                        ${
                          item.verified
                            ? `<div class="saydo-badge-verified">✓ ${item.verificationNote || 'Verified in system'}</div>`
                            : ''
                        }
                      </div>
                    `;
                  }
                }

                return `
                  <div class="saydo-msg-assistant">
                    <div>${item.text}</div>
                    ${
                      item.sources && item.sources.length > 0
                        ? `
                      <div style="margin-top: 8px; padding-top: 6px; border-top: 1px dashed #334155;">
                        <div style="font-size: 10px; color: #94a3b8; font-weight: 600; margin-bottom: 4px; display: flex; align-items: center; gap: 4px;">
                          <span>🔍 Tavily Grounded Sources:</span>
                        </div>
                        <div style="display: flex; flex-wrap: wrap; gap: 4px;">
                          ${item.sources
                            .map(
                              (s: any) => `
                            <a href="${s.url}" target="_blank" style="font-size: 10px; color: #60a5fa; background: rgba(59, 130, 246, 0.15); border: 1px solid rgba(59, 130, 246, 0.3); padding: 2px 6px; border-radius: 4px; text-decoration: none; display: inline-flex; align-items: center; gap: 3px;" title="${s.content || ''}">
                              <span>📄</span>
                              <span>${s.title || 'Documentation'}</span>
                            </a>
                          `
                            )
                            .join('')}
                        </div>
                      </div>
                    `
                        : ''
                    }
                    ${
                      item.verified
                        ? `<div class="saydo-badge-verified">✓ ${item.verificationNote || 'Verified in system'}</div>`
                        : ''
                    }
                  </div>
                `;
              })
              .join('')}

            ${
              this.isAgentBusy
                ? `
              <div class="saydo-typing-indicator">
                <span class="saydo-typing-dot"></span>
                <span class="saydo-typing-dot"></span>
                <span class="saydo-typing-dot"></span>
                <span class="saydo-typing-text">SayDo is reasoning...</span>
              </div>
            `
                : ''
            }
          `
          }
        </div>

        ${
          this.activeTab === 'ask'
            ? `
          <!-- Footer Chat Input -->
          <div class="saydo-footer">
            <input 
              type="text" 
              class="saydo-chat-input" 
              id="input-chat" 
              placeholder="Ask by voice or text... e.g. 'Create project with 2 lakh budget'" 
              value="${this.chatInputText}"
            />
            <button class="saydo-icon-btn ${this.isListening ? 'active' : ''}" id="btn-mic-ask" title="Dictate voice (Web Speech API / Wispr)">
              ${this.isListening ? '🛑' : '🎙️'}
            </button>
            <button class="saydo-send-btn" id="btn-send-chat" ${this.isAgentBusy ? 'disabled' : ''}>
              Send
            </button>
          </div>
        `
            : ''
        }
      </div>
    `;

    this.attachEventListeners();
  }

  private attachEventListeners() {
    if (!this.shadowRoot) return;

    // Toggle Panel
    this.shadowRoot.getElementById('saydo-launcher')?.addEventListener('click', () => {
      this.isOpen = !this.isOpen;
      this.render();
    });

    this.shadowRoot.getElementById('saydo-close')?.addEventListener('click', () => {
      this.isOpen = false;
      this.render();
    });

    // Tab Switchers
    this.shadowRoot.getElementById('tab-ask')?.addEventListener('click', () => {
      this.activeTab = 'ask';
      this.render();
    });

    this.shadowRoot.getElementById('tab-teach')?.addEventListener('click', () => {
      this.activeTab = 'teach';
      this.render();
    });

    // Teach Handlers
    this.shadowRoot.getElementById('btn-toggle-rec')?.addEventListener('click', () => {
      if (this.isRecording) {
        this.isRecording = false;
      } else {
        this.isRecording = true;
        this.recordedEvents = [];
      }
      this.render();
    });

    this.shadowRoot.getElementById('btn-mic-teach')?.addEventListener('click', () => this.toggleSpeech());
    this.shadowRoot.getElementById('btn-mic-ask')?.addEventListener('click', () => this.toggleSpeech());

    this.shadowRoot.getElementById('input-title')?.addEventListener('input', (e) => {
      this.recordingTitle = (e.target as HTMLInputElement).value;
    });

    this.shadowRoot.getElementById('textarea-narration')?.addEventListener('input', (e) => {
      this.narrationText = (e.target as HTMLTextAreaElement).value;
    });

    this.shadowRoot.getElementById('btn-save-recording')?.addEventListener('click', () => this.saveRecording());

    // Ask Agent Handlers
    const chatInput = this.shadowRoot.getElementById('input-chat') as HTMLInputElement | null;
    chatInput?.addEventListener('input', (e) => {
      this.chatInputText = (e.target as HTMLInputElement).value;
    });

    chatInput?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        this.submitUserPrompt(this.chatInputText);
      }
    });

    this.shadowRoot.getElementById('btn-send-chat')?.addEventListener('click', () => {
      this.submitUserPrompt(this.chatInputText);
    });

    // Prompt Chips
    this.shadowRoot.querySelectorAll('.saydo-chip').forEach((btn) => {
      btn.addEventListener('click', () => {
        const prompt = btn.getAttribute('data-prompt');
        if (prompt) this.submitUserPrompt(prompt);
      });
    });

    // Tool Confirmation Buttons
    this.shadowRoot.querySelectorAll('[data-action="confirm"]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const item = this.chatItems.find((i) => i.id === id);
        if (item) this.executeToolCall(item);
      });
    });

    this.shadowRoot.querySelectorAll('[data-action="cancel"]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const item = this.chatItems.find((i) => i.id === id);
        if (item) this.cancelToolCall(item);
      });
    });

    // Auto-scroll messages body to bottom
    const bodyEl = this.shadowRoot.getElementById('saydo-body');
    if (bodyEl) {
      bodyEl.scrollTop = bodyEl.scrollHeight;
    }
  }

  private async saveRecording() {
    if (this.recordedEvents.length === 0) return;

    const title = this.recordingTitle.trim() || `Recording ${new Date().toLocaleTimeString()}`;
    const narration = this.narrationText.trim();
    const sanitized = sanitizeEvents(this.recordedEvents);

    const payload = {
      publicKey: this.config.publicKey,
      title,
      events: sanitized,
      narration,
    };

    try {
      const res = await fetch(`${this.config.apiUrl}/v1/recordings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-SayDo-Public-Key': this.config.publicKey,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save recording');

      alert(`✅ Recording "${title}" successfully stored in SayDo! (${data.event_count} sanitized events)`);
      this.recordedEvents = [];
      this.recordingTitle = '';
      this.narrationText = '';
      this.render();
    } catch (err: any) {
      alert(`❌ Failed to save recording: ${err.message}`);
    }
  }
}

// Global instance
const sayDoInstance = new SayDoSDK();
if (typeof window !== 'undefined') {
  (window as any).SayDo = sayDoInstance;
}

export default sayDoInstance;
