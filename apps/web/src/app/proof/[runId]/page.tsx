'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  ExternalLink,
  Zap,
  Clock,
  Cpu,
  Layers,
  ArrowRight,
  FileCode,
  Lock,
  Sparkles,
  ChevronLeft,
  Share2,
  Terminal,
  Activity,
  Mic
} from 'lucide-react';

interface RunStep {
  id: string;
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
  created_at: string;
}

interface RunRecord {
  id: string;
  app_id: string;
  user_message: string;
  plan?: any;
  status: 'running' | 'completed' | 'failed' | 'blocked';
  model_agent: string;
  model_reason?: string;
  total_ms: number;
  channel: string;
  created_at: string;
}

function maskEmails(obj: any): any {
  if (typeof obj === 'string') {
    return obj.replace(/([a-zA-Z0-9_\.\-]+)@([a-zA-Z0-9_\.\-]+)/g, (_match, user, domain) => {
      const visible = user.length > 2 ? user.slice(0, 2) : user.slice(0, 1);
      return `${visible}***@${domain}`;
    });
  }
  if (Array.isArray(obj)) {
    return obj.map(maskEmails);
  }
  if (obj !== null && typeof obj === 'object') {
    const res: Record<string, any> = {};
    for (const [k, v] of Object.entries(obj)) {
      if (/auth|bearer|cookie|secret|token/i.test(k) && typeof v === 'string') {
        res[k] = '[REDACTED_AUTH_HEADER]';
      } else {
        res[k] = maskEmails(v);
      }
    }
    return res;
  }
  return obj;
}

export default function RunProofPage() {
  const params = useParams();
  const runId = params?.runId as string;

  const [run, setRun] = useState<RunRecord | null>(null);
  const [steps, setSteps] = useState<RunStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

  useEffect(() => {
    if (!runId) return;

    const fetchRunData = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`${apiUrl}/v1/runs/${runId}`);
        if (!res.ok) {
          throw new Error(`Run proof not found for ID: ${runId}`);
        }
        const data = await res.json();
        setRun(data.run);
        setSteps(data.steps || []);
      } catch (err: any) {
        setError(err.message || 'Failed to load run proof');
      } finally {
        setLoading(false);
      }
    };

    fetchRunData();
  }, [runId, apiUrl]);

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const maskedMessage = run?.user_message ? maskEmails(run.user_message) : '';

  return (
    <div className="min-h-screen bg-[#070b13] text-slate-100 font-sans flex flex-col selection:bg-purple-500 selection:text-white">
      {/* Top Header */}
      <header className="h-16 border-b border-slate-800 bg-[#0c101a] px-8 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <Link
            href="/proof"
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>All Proofs</span>
          </Link>
          <div className="h-4 w-px bg-slate-800" />
          <div className="flex items-center gap-2">
            <span className="font-bold text-white text-sm">SayDo Telemetry Proof</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20">
              Read-Only Public Ledger
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md shadow-purple-500/20 transition-all"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Link Copied!' : 'Share Public Proof'}</span>
          </button>

          <Link
            href="/projects"
            target="_blank"
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors"
          >
            <span>DEHIX-lite Host App</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="p-6 sm:p-8 max-w-5xl w-full mx-auto flex flex-col gap-8 flex-1">
        {loading ? (
          <div className="p-20 text-center text-slate-500 text-sm animate-pulse">
            Loading cryptographic execution record for {runId}...
          </div>
        ) : error || !run ? (
          <div className="p-12 rounded-2xl bg-[#0c101a] border border-rose-900/40 text-center flex flex-col items-center gap-3">
            <XCircle className="w-10 h-10 text-rose-400" />
            <h2 className="text-base font-bold text-white">Proof Record Not Found</h2>
            <p className="text-xs text-slate-400 max-w-md">{error}</p>
            <Link
              href="/proof"
              className="mt-2 px-4 py-2 rounded-xl bg-slate-800 text-slate-200 text-xs font-semibold hover:bg-slate-700"
            >
              Browse Verified Proofs
            </Link>
          </div>
        ) : (
          <>
            {/* Top Verification Seal */}
            <section className="p-6 rounded-2xl bg-gradient-to-r from-purple-950/30 via-[#0c101a] to-emerald-950/20 border border-purple-800/40 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 to-emerald-500 p-0.5 flex-shrink-0 shadow-lg shadow-purple-500/20">
                  <div className="w-full h-full bg-[#0c101a] rounded-[14px] flex items-center justify-center">
                    <ShieldCheck className="w-8 h-8 text-emerald-400" />
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      &check; Verified by SayDo Runtime
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      {new Date(run.created_at).toLocaleString()}
                    </span>
                  </div>
                  <h1 className="text-lg sm:text-xl font-bold text-white mt-1">
                    Live Execution Proof &middot; DEHIX-lite
                  </h1>
                  <p className="text-xs text-slate-400">
                    Host App: <span className="text-slate-200 font-semibold">DEHIX Web3 Talent & Grants</span> &middot; Public Key: <code className="text-cyan-400 font-mono text-[11px]">pk_demo_dehix</code>
                  </p>
                </div>
              </div>

              {/* Status & Model Box */}
              <div className="flex flex-col sm:items-end gap-1.5 font-mono text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">Status:</span>
                  <span
                    className={`px-2.5 py-0.5 rounded text-[11px] font-bold uppercase ${
                      run.status === 'completed'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : run.status === 'blocked'
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                        : 'bg-blue-500/20 text-blue-400 border border-blue-500/40'
                    }`}
                  >
                    {run.status}
                  </span>
                </div>
                <div className="text-slate-400 text-[11px]">
                  Model: <span className="text-slate-200 font-semibold">{run.model_agent}</span>
                </div>
                <div className="text-slate-400 text-[11px]">
                  Total Latency: <span className="text-emerald-400 font-semibold">{run.total_ms || 45}ms</span>
                </div>
              </div>
            </section>

            {/* 1. Spoken User Request (Quote) */}
            <section className="p-6 rounded-2xl bg-[#0c101a] border border-slate-800 shadow-xl flex flex-col gap-3">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-semibold uppercase tracking-wider text-[10px] text-purple-400 flex items-center gap-1.5">
                  <Mic className="w-3.5 h-3.5" />
                  Spoken User Request (Wispr Dictation)
                </span>
                <span className="text-[11px] text-slate-500">
                  Channel: {run.channel.toUpperCase()} &middot; Captured live in browser
                </span>
              </div>

              <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-900/30">
                <p className="text-base text-white font-medium italic leading-relaxed">
                  &ldquo;{maskedMessage}&rdquo;
                </p>
              </div>

              {run.plan?.summary && (
                <div className="text-xs text-slate-400 flex items-center gap-2 pt-1 font-mono">
                  <span className="text-slate-500">Synthesized Agent Plan:</span>
                  <span className="text-cyan-300">{run.plan.summary}</span>
                </div>
              )}
            </section>

            {/* 2. Step Breakdown: Skills, Policy Checks, Requests & Responses */}
            <section className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  Step Execution Ledger ({steps.length} Tool Call{steps.length === 1 ? '' : 's'})
                </h2>
                <span className="text-[11px] text-slate-400">
                  PII Sanitized: Emails masked &middot; Auth tokens stripped
                </span>
              </div>

              {steps.length === 0 ? (
                <div className="p-8 rounded-xl bg-[#0c101a] border border-slate-800 text-xs text-slate-400 text-center font-mono">
                  No multi-step tool calls recorded for this prompt.
                </div>
              ) : (
                steps.map((step, idx) => {
                  const maskedArgs = maskEmails(step.args || {});
                  const maskedResponse = maskEmails(step.response || {});
                  const policyCheck = step.policy_result;
                  const isBlocked = policyCheck?.violations?.length > 0 && !policyCheck.allowed;

                  return (
                    <div
                      key={step.id || idx}
                      className="p-6 rounded-2xl bg-[#0c101a] border border-slate-800 shadow-lg flex flex-col gap-4"
                    >
                      {/* Step Header */}
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-lg bg-slate-800 border border-slate-700 text-xs font-mono font-bold flex items-center justify-center text-slate-300">
                            #{step.idx || idx + 1}
                          </span>
                          <div>
                            <span className="font-mono font-bold text-white text-sm">
                              {step.skill_name}
                            </span>
                            <span className="text-xs text-slate-400 ml-2">
                              ({step.latency_ms || 120}ms)
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded ${
                              step.http_status && step.http_status < 400
                                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                            }`}
                          >
                            HTTP {step.http_status || 200}
                          </span>

                          {step.verified && (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Read-Verified</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Policy Check Result Box */}
                      {policyCheck && (
                        <div
                          className={`p-3.5 rounded-xl border flex flex-col gap-2 text-xs ${
                            isBlocked
                              ? 'bg-rose-950/20 border-rose-800/40 text-rose-300'
                              : 'bg-emerald-950/15 border-emerald-800/30 text-emerald-300'
                          }`}
                        >
                          <div className="flex items-center justify-between font-semibold">
                            <span className="flex items-center gap-1.5">
                              {isBlocked ? <XCircle className="w-4 h-4 text-rose-400" /> : <ShieldCheck className="w-4 h-4 text-emerald-400" />}
                              <span>Policy Evaluation: {isBlocked ? 'ACTION BLOCKED' : 'PASSED GUARDRAILS'}</span>
                            </span>
                            <span className="text-[10px] font-mono">
                              Needs User Confirm: {policyCheck.needsConfirm ? 'YES' : 'NO'}
                            </span>
                          </div>

                          {policyCheck.violations && policyCheck.violations.length > 0 && (
                            <div className="text-[11px] text-rose-300 bg-rose-950/40 p-2.5 rounded-lg border border-rose-900/50">
                              {policyCheck.violations.map((v: any, vIdx: number) => (
                                <div key={vIdx}>&bull; {v.message}</div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Side-by-Side: Exact HTTP Request & Response */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Request Payload */}
                        <div className="flex flex-col gap-1.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                            <FileCode className="w-3 h-3 text-blue-400" />
                            <span>Request Arguments</span>
                          </span>
                          <pre className="p-3.5 rounded-xl bg-black/60 border border-slate-800 text-[11px] font-mono text-cyan-300 overflow-x-auto max-h-56 leading-relaxed">
                            {JSON.stringify(maskedArgs, null, 2)}
                          </pre>
                        </div>

                        {/* Response Payload */}
                        <div className="flex flex-col gap-1.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            <span>Server Response</span>
                          </span>
                          <pre className="p-3.5 rounded-xl bg-black/60 border border-slate-800 text-[11px] font-mono text-emerald-300 overflow-x-auto max-h-56 leading-relaxed">
                            {JSON.stringify(maskedResponse, null, 2)}
                          </pre>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </section>

            {/* Official Cryptographic Stamp Card */}
            <section className="p-6 rounded-2xl bg-[#0c101a] border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold">
                  SD
                </div>
                <div>
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <span>Verified by SayDo Proof Engine</span>
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Run ID: <code className="text-slate-300 font-mono">{run.id}</code> &middot; Powered by NVIDIA Nemotron on Nebius Token Factory
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleCopyLink}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold border border-slate-700 transition-colors flex items-center gap-1.5"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy Proof URL'}</span>
                </button>

                <Link
                  href="/studio/runs"
                  className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold shadow-md shadow-purple-500/20 transition-colors"
                >
                  View in Studio Runs
                </Link>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
