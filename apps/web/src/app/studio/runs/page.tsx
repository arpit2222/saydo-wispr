'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Activity,
  BarChart3,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  Compass,
  ExternalLink,
  Layers,
  Play,
  Plug,
  RefreshCw,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  Terminal,
  Zap,
  XCircle,
  HelpCircle,
  Search,
  MessageSquare,
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
  channel: 'web' | 'mcp' | 'sdk' | 'eval';
  created_at: string;
  steps?: RunStep[];
}

export default function StudioRunsPage() {
  const [runs, setRuns] = useState<RunRecord[]>([]);
  const [expandedRunId, setExpandedRunId] = useState<string | null>(null);
  const [runStepsMap, setRunStepsMap] = useState<Record<string, RunStep[]>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [resettingDemo, setResettingDemo] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [filterChannel, setFilterChannel] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showShortcutsModal, setShowShortcutsModal] = useState<boolean>(false);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchRuns = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/v1/runs`);
      if (res.ok) {
        const data = await res.json();
        setRuns(data.runs || []);
      }
    } catch (err) {
      console.error('Failed to load runs:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleRunExpand = async (runId: string) => {
    if (expandedRunId === runId) {
      setExpandedRunId(null);
      return;
    }

    setExpandedRunId(runId);
    if (!runStepsMap[runId]) {
      try {
        const res = await fetch(`${apiUrl}/v1/runs/${runId}`);
        if (res.ok) {
          const data = await res.json();
          setRunStepsMap((prev) => ({ ...prev, [runId]: data.steps || [] }));
        }
      } catch (err) {
        console.error('Failed to fetch run details:', err);
      }
    }
  };

  const handleResetDemo = async () => {
    setResettingDemo(true);
    try {
      const res = await fetch('/api/demo/reset', { method: 'POST' });
      if (res.ok) {
        showToast('Demo data successfully reseeded. Skills and policies preserved.');
        await fetchRuns();
      }
    } catch (err) {
      showToast('Failed to reset demo data.');
    } finally {
      setResettingDemo(false);
    }
  };

  useEffect(() => {
    fetchRuns();

    // Global Keyboard Shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === '?') {
        setShowShortcutsModal((prev) => !prev);
      } else if (e.key === 'r' && (e.metaKey || e.ctrlKey)) {
        // allow browser refresh
      } else if (e.key === 'Escape') {
        setShowShortcutsModal(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const filteredRuns = runs.filter((r) => {
    if (filterChannel !== 'all' && r.channel !== filterChannel) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        r.user_message.toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q) ||
        r.model_agent.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const completedCount = runs.filter((r) => r.status === 'completed').length;
  const blockedCount = runs.filter((r) => r.status === 'blocked').length;
  const avgLatency = runs.length > 0 ? Math.round(runs.reduce((acc, r) => acc + (r.total_ms || 45), 0) / runs.length) : 48;

  return (
    <div className="min-h-screen bg-[#070b13] text-slate-100 font-sans flex flex-col">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl bg-slate-900 border border-emerald-500/50 text-white text-xs font-semibold shadow-2xl flex items-center gap-3 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Keyboard Shortcuts Modal */}
      {showShortcutsModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0c101a] border border-slate-800 rounded-2xl max-w-md w-full p-6 flex flex-col gap-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="font-bold text-sm text-white">Keyboard Shortcuts</span>
              <button
                onClick={() => setShowShortcutsModal(false)}
                className="text-slate-400 hover:text-white text-xs"
              >
                ESC
              </button>
            </div>
            <div className="flex flex-col gap-2 text-xs">
              <div className="flex items-center justify-between py-1.5">
                <span className="text-slate-300">Open Skills Library</span>
                <kbd className="px-2 py-1 rounded bg-slate-800 border border-slate-700 font-mono text-[11px]">1</kbd>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-slate-300">Spoken Policies</span>
                <kbd className="px-2 py-1 rounded bg-slate-800 border border-slate-700 font-mono text-[11px]">2</kbd>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-slate-300">Discover with Tavily</span>
                <kbd className="px-2 py-1 rounded bg-slate-800 border border-slate-700 font-mono text-[11px]">3</kbd>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-slate-300">Contract Health & Drift</span>
                <kbd className="px-2 py-1 rounded bg-slate-800 border border-slate-700 font-mono text-[11px]">4</kbd>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-slate-300">Integrations (MCP)</span>
                <kbd className="px-2 py-1 rounded bg-slate-800 border border-slate-700 font-mono text-[11px]">5</kbd>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-slate-300">Model Evals & Benchmark</span>
                <kbd className="px-2 py-1 rounded bg-slate-800 border border-slate-700 font-mono text-[11px]">6</kbd>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-slate-300">Agent Runs & Telemetry</span>
                <kbd className="px-2 py-1 rounded bg-slate-800 border border-slate-700 font-mono text-[11px]">7</kbd>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-slate-300">Toggle Shortcuts Menu</span>
                <kbd className="px-2 py-1 rounded bg-slate-800 border border-slate-700 font-mono text-[11px]">?</kbd>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Studio Top Navigation */}
      <header className="h-16 border-b border-slate-800 bg-[#0c101a] px-8 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-6">
          <Link href="/studio" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center font-bold text-black text-sm shadow-md shadow-emerald-500/20">
              SD
            </div>
            <div>
              <div className="font-bold text-white text-sm flex items-center gap-2">
                SayDo Studio
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Agent Telemetry
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Agent Skills & Policy Control Plane</p>
            </div>
          </Link>

          {/* App Switcher */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
            <span className="text-slate-400">Target App:</span>
            <span className="font-semibold text-slate-200">DEHIX-lite</span>
            <code className="text-[11px] text-emerald-400 font-mono">pk_demo_dehix</code>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500 ml-1" />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleResetDemo}
            disabled={resettingDemo}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors border border-slate-700 disabled:opacity-50"
            title="Reseed mock data while preserving skills & policies"
          >
            <RotateCcw className={`w-3.5 h-3.5 text-amber-400 ${resettingDemo ? 'animate-spin' : ''}`} />
            <span>{resettingDemo ? 'Resetting...' : 'Reset Demo'}</span>
          </button>

          <Link
            href="/projects"
            target="_blank"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors"
          >
            <span>Launch Host App</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* Tabs Navigation */}
      <div className="border-b border-slate-800 bg-[#090d16] px-8 flex items-center gap-2 overflow-x-auto">
        <Link
          href="/studio"
          className="px-4 py-3 text-xs font-semibold text-slate-400 hover:text-white border-b-2 border-transparent transition-all flex items-center gap-2 whitespace-nowrap"
        >
          <Layers className="w-4 h-4" />
          Skills Library
        </Link>
        <Link
          href="/studio/policies"
          className="px-4 py-3 text-xs font-semibold text-slate-400 hover:text-white border-b-2 border-transparent transition-all flex items-center gap-2 whitespace-nowrap"
        >
          <ShieldAlert className="w-4 h-4" />
          Spoken Policies & Guardrails
        </Link>
        <Link
          href="/studio/voice"
          className="px-4 py-3 text-xs font-semibold text-purple-400 hover:text-purple-300 border-b-2 border-transparent transition-all flex items-center gap-2 whitespace-nowrap"
        >
          <Mic className="w-4 h-4 text-purple-400" />
          Taught by Voice
        </Link>
        <Link
          href="/studio/discover"
          className="px-4 py-3 text-xs font-semibold text-slate-400 hover:text-white border-b-2 border-transparent transition-all flex items-center gap-2 whitespace-nowrap"
        >
          <Compass className="w-4 h-4" />
          Discover with Tavily
        </Link>
        <Link
          href="/studio/health"
          className="px-4 py-3 text-xs font-semibold text-slate-400 hover:text-white border-b-2 border-transparent transition-all flex items-center gap-2 whitespace-nowrap"
        >
          <Activity className="w-4 h-4" />
          Contract Health & Drift
        </Link>
        <Link
          href="/studio/integrations"
          className="px-4 py-3 text-xs font-semibold text-slate-400 hover:text-white border-b-2 border-transparent transition-all flex items-center gap-2 whitespace-nowrap"
        >
          <Plug className="w-4 h-4" />
          Integrations (MCP / WebMCP)
        </Link>
        <Link
          href="/studio/evals"
          className="px-4 py-3 text-xs font-semibold text-slate-400 hover:text-white border-b-2 border-transparent transition-all flex items-center gap-2 whitespace-nowrap"
        >
          <BarChart3 className="w-4 h-4" />
          Model Evals & Benchmark
        </Link>
        <Link
          href="/studio/runs"
          className="px-4 py-3 text-xs font-semibold text-emerald-400 border-b-2 border-emerald-500 flex items-center gap-2 whitespace-nowrap"
        >
          <Terminal className="w-4 h-4 text-emerald-400" />
          Agent Runs & Telemetry
        </Link>
      </div>

      <main className="p-8 max-w-7xl w-full mx-auto flex flex-col gap-8 flex-1">
        {/* Runs Hero Bar */}
        <section className="p-6 rounded-2xl bg-gradient-to-r from-emerald-950/20 via-[#0c101a] to-blue-950/20 border border-emerald-900/30 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col gap-2 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                <Terminal className="w-3 h-3" />
                Live Agent Telemetry
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                Step Timelines & Verifier Traces
              </span>
            </div>
            <h1 className="text-xl font-bold text-white">Full-Lifecycle Execution Runs & Step Audits</h1>
            <p className="text-xs text-slate-400 leading-relaxed">
              Inspect step-by-step reasoning chains, dynamic tool invocations, voice policy evaluations, read-verification loops, and exact model token latencies across SDK and MCP channels.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <button
              onClick={fetchRuns}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-400 hover:to-cyan-500 text-black font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 disabled:opacity-50 transition-all flex-shrink-0"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Runs</span>
            </button>
          </div>
        </section>

        {/* Top KPI Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-[#0c101a] border border-slate-800 flex flex-col gap-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-semibold">Total Executed Runs</span>
              <Terminal className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-3xl font-black text-white">{runs.length}</div>
            <span className="text-[11px] text-slate-400">Across Web, SDK & MCP channels</span>
          </div>

          <div className="p-5 rounded-2xl bg-[#0c101a] border border-slate-800 flex flex-col gap-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-semibold">Completed Successfully</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-3xl font-black text-emerald-400">{completedCount}</div>
            <span className="text-[11px] text-emerald-400">Verified actions & tool outputs</span>
          </div>

          <div className="p-5 rounded-2xl bg-[#0c101a] border border-slate-800 flex flex-col gap-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-semibold">Blocked by Policy</span>
              <ShieldAlert className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-3xl font-black text-amber-400">{blockedCount}</div>
            <span className="text-[11px] text-amber-400">Strictly halted before execution</span>
          </div>

          <div className="p-5 rounded-2xl bg-[#0c101a] border border-slate-800 flex flex-col gap-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-semibold">Avg Agent Latency</span>
              <Clock className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-3xl font-black text-cyan-400">{avgLatency}ms</div>
            <span className="text-[11px] text-cyan-400">Nebius Token Factory</span>
          </div>
        </section>

        {/* Filter & Search Bar */}
        <section className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs">
            {['all', 'web', 'mcp', 'sdk'].map((ch) => (
              <button
                key={ch}
                onClick={() => setFilterChannel(ch)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold uppercase transition-all ${
                  filterChannel === ch ? 'bg-emerald-500 text-black shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                {ch === 'all' ? 'All Channels' : ch}
              </button>
            ))}
          </div>

          <div className="relative flex-1 sm:max-w-xs">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter runs by prompt or model..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-emerald-500"
            />
          </div>
        </section>

        {/* Runs List Table */}
        <section className="flex flex-col gap-4">
          {loading ? (
            <div className="p-8 rounded-2xl bg-[#0c101a] border border-slate-800 flex flex-col gap-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 rounded-xl bg-slate-900 animate-pulse" />
              ))}
            </div>
          ) : filteredRuns.length === 0 ? (
            <div className="p-12 rounded-2xl bg-[#0c101a] border border-slate-800 flex flex-col items-center justify-center text-center gap-3">
              <Terminal className="w-10 h-10 text-slate-600 mb-2" />
              <h3 className="text-base font-bold text-white">No Agent Runs Recorded Yet</h3>
              <p className="text-xs text-slate-400 max-w-md">
                Launch the DEHIX-lite demo app, click the SayDo Ask Agent button in the corner, and ask a question or request an action to populate live telemetry.
              </p>
              <Link
                href="/projects"
                target="_blank"
                className="mt-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs flex items-center gap-2 transition-all shadow-md shadow-emerald-500/20"
              >
                <span>Open DEHIX-lite Demo</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {filteredRuns.map((run) => {
                const isExpanded = expandedRunId === run.id;
                const steps = runStepsMap[run.id] || [];

                return (
                  <div
                    key={run.id}
                    className={`rounded-2xl border transition-all ${
                      isExpanded
                        ? 'bg-[#0f1523] border-emerald-500/40 shadow-xl'
                        : 'bg-[#0c101a] border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {/* Run Header Row */}
                    <div
                      onClick={() => toggleRunExpand(run.id)}
                      className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 cursor-pointer"
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 ${
                            run.status === 'blocked'
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          }`}
                        >
                          {run.status === 'blocked' ? <ShieldAlert className="w-4 h-4" /> : <Zap className="w-4 h-4" />}
                        </div>

                        <div className="flex flex-col gap-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-bold text-sm text-white">{run.user_message}</span>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                run.status === 'completed'
                                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                  : run.status === 'blocked'
                                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                                  : 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                              }`}
                            >
                              {run.status}
                            </span>
                            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-mono">
                              {run.channel.toUpperCase()}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 font-mono">
                            <span>ID: {run.id.slice(0, 8)}...</span>
                            <span>•</span>
                            <span>Model: {run.model_agent}</span>
                            <span>•</span>
                            <span>{new Date(run.created_at).toLocaleTimeString()}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                        <div className="text-right">
                          <span className="text-xs font-mono font-bold text-slate-200">
                            {run.total_ms || 45} ms
                          </span>
                        </div>
                        <ChevronRight
                          className={`w-4 h-4 text-slate-500 transition-transform ${isExpanded ? 'rotate-90 text-emerald-400' : ''}`}
                        />
                      </div>
                    </div>

                    {/* Expandable Step Timelines */}
                    {isExpanded && (
                      <div className="px-6 pb-6 pt-2 border-t border-slate-800/80 flex flex-col gap-4 animate-fade-in">
                        <div className="flex items-center justify-between text-xs text-slate-400 font-semibold pt-2">
                          <span>STEP TIMELINE ({steps.length})</span>
                          <span>Model Execution & Verifier Audit</span>
                        </div>

                        {steps.length === 0 ? (
                          <div className="p-4 rounded-xl bg-slate-900 text-xs text-slate-400 text-center font-mono">
                            No child steps recorded for this single-turn query.
                          </div>
                        ) : (
                          <div className="flex flex-col gap-3">
                            {steps.map((st) => (
                              <div
                                key={st.id}
                                className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col gap-2.5 text-xs"
                              >
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                  <div className="flex items-center gap-2">
                                    <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 text-[10px] font-mono flex items-center justify-center font-bold">
                                      {st.idx}
                                    </span>
                                    <code className="text-emerald-300 font-mono font-bold text-xs">
                                      {st.skill_name}
                                    </code>
                                    {st.verified && (
                                      <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold flex items-center gap-1">
                                        <CheckCircle2 className="w-3 h-3" />
                                        READ-VERIFIED
                                      </span>
                                    )}
                                  </div>

                                  <div className="flex items-center gap-2 text-[11px] font-mono">
                                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                                      HTTP {st.http_status || 200}
                                    </span>
                                    <span className="text-slate-400">{st.latency_ms || 25}ms</span>
                                  </div>
                                </div>

                                {/* Arguments View */}
                                {st.args && Object.keys(st.args).length > 0 && (
                                  <div className="flex flex-col gap-1">
                                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                                      Arguments:
                                    </span>
                                    <pre className="p-2.5 rounded-lg bg-black/60 border border-slate-800 text-[11px] text-cyan-300 font-mono overflow-x-auto">
                                      {JSON.stringify(st.args, null, 2)}
                                    </pre>
                                  </div>
                                )}

                                {/* Policy Evaluation Result */}
                                {st.policy_result && Object.keys(st.policy_result).length > 0 && (
                                  <div className="flex items-center gap-2 text-[11px]">
                                    <span className="text-slate-400 font-semibold">Policy Guardrail:</span>
                                    {st.policy_result.allowed === false ? (
                                      <span className="text-amber-400 font-mono">
                                        BLOCKED: {st.policy_result.violations?.[0]?.message || 'Policy violation'}
                                      </span>
                                    ) : (
                                      <span className="text-emerald-400 font-mono">ALLOWED (within parameters)</span>
                                    )}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
