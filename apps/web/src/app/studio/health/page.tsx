'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  ChevronDown,
  Layers,
  ShieldAlert,
  Compass,
  FileText,
  RefreshCw,
  Quote,
  ShieldCheck,
  Zap,
  ArrowRight,
  Plug,
  BarChart3,
  Terminal,
  Clock,
  ChevronRight,
  RotateCcw,
  Mic
} from 'lucide-react';
import { SkillDefinition } from '@saydo/shared';

interface HealthCheck {
  id: string;
  app_id: string;
  skill_id?: string;
  skill_name: string;
  method: string;
  path: string;
  status: 'pass' | 'diff' | 'fail';
  http_status?: number;
  latency_ms: number;
  diff_summary?: string;
  expected_shape?: any;
  actual_shape?: any;
  checked_at: string;
}

export default function HealthPage() {
  const [skills, setSkills] = useState<SkillDefinition[]>([]);
  const [loading, setLoading] = useState(false);
  const [probing, setProbing] = useState(false);
  const [driftResult, setDriftResult] = useState<any>(null);
  const [healthChecks, setHealthChecks] = useState<HealthCheck[]>([]);
  const [selectedCheck, setSelectedCheck] = useState<HealthCheck | null>(null);
  const [error, setError] = useState<string | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

  const fetchSkills = async () => {
    try {
      const res = await fetch(`${apiUrl}/v1/skills?publicKey=pk_demo_dehix`);
      if (res.ok) {
        const data = await res.json();
        setSkills(data.skills || []);
      }
    } catch (err) {
      console.error('Failed to load skills:', err);
    }
  };

  const fetchHealthChecks = async () => {
    try {
      const res = await fetch(`${apiUrl}/v1/health/checks`);
      if (res.ok) {
        const data = await res.json();
        setHealthChecks(data.checks || []);
      }
    } catch (err) {
      console.error('Failed to load health checks:', err);
    }
  };

  const runHealthProbes = async () => {
    setProbing(true);
    setError(null);
    try {
      const res = await fetch(`${apiUrl}/v1/health/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ app_id: 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b22' }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Health probe failed');
      }

      const data = await res.json();
      setHealthChecks(data.checks || []);
      await fetchSkills();
    } catch (err: any) {
      console.error('Health probe error:', err);
      setError(err.message);
    } finally {
      setProbing(false);
    }
  };

  const runDriftWatch = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiUrl}/v1/drift`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ app_id: 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b22' }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Drift check failed');
      }

      const data = await res.json();
      setDriftResult(data);
      await fetchSkills();
    } catch (err: any) {
      console.error('Drift check error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSkills();
    runDriftWatch();
    runHealthProbes();
  }, []);

  const atRiskCount = skills.filter((s) => s.status === 'at_risk' || (driftResult?.drifted_skills?.some((ds: any) => ds.id === s.id))).length;
  const healthyCount = skills.length - atRiskCount;
  const probePassCount = healthChecks.filter((c) => c.status === 'pass').length;

  return (
    <div className="min-h-screen bg-[#070b13] text-slate-100 font-sans flex flex-col">
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
                  Tavily Drift Watch
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
            onClick={async () => {
              try {
                await fetch('/api/demo/reset', { method: 'POST' });
                alert('Demo data successfully reseeded. Skills and policies preserved.');
              } catch (e) {
                // ignore
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors border border-slate-700"
            title="Reseed mock data while preserving skills & policies"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
            <span>Reset Demo</span>
          </button>

          <Link
            href="/changelog"
            target="_blank"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors"
          >
            <FileText className="w-3.5 h-3.5 text-emerald-400" />
            <span>View Host Changelog</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

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
          className="px-4 py-3 text-xs font-semibold text-emerald-400 border-b-2 border-emerald-500 flex items-center gap-2 whitespace-nowrap"
        >
          <Activity className="w-4 h-4 text-emerald-400" />
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
          className="px-4 py-3 text-xs font-semibold text-slate-400 hover:text-white border-b-2 border-transparent transition-all flex items-center gap-2 whitespace-nowrap"
        >
          <Terminal className="w-4 h-4" />
          Agent Runs & Telemetry
        </Link>
      </div>

      <main className="p-8 max-w-7xl w-full mx-auto flex flex-col gap-8 flex-1">
        {/* Drift Watch Hero Bar */}
        <section className="p-6 rounded-2xl bg-gradient-to-r from-emerald-950/20 via-[#0c101a] to-blue-950/20 border border-emerald-900/30 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col gap-2 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                <Activity className="w-3 h-3" />
                Continuous Health Probe & Drift Watch
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                Nemotron Contract Analyzer
              </span>
            </div>
            <h1 className="text-xl font-bold text-white">Active Contract Probes & Tavily Drift Watch</h1>
            <p className="text-xs text-slate-400 leading-relaxed">
              Live probes verify your HTTP endpoints against recorded JSON schemas. Tavily scans product changelogs to flag schema changes or deprecations before production breakage.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            {/* Health Score Box */}
            <div className="flex items-center gap-5 p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400">Skills</span>
                <span className="text-xl font-black text-white">{skills.length}</span>
              </div>
              <div className="h-7 w-px bg-slate-800" />
              <div className="flex flex-col">
                <span className="text-[10px] text-emerald-400">Probes Passed</span>
                <span className="text-xl font-black text-emerald-400">{probePassCount}/{healthChecks.length || skills.length}</span>
              </div>
              <div className="h-7 w-px bg-slate-800" />
              <div className="flex flex-col">
                <span className="text-[10px] text-amber-400">At Risk</span>
                <span className="text-xl font-black text-amber-400">{atRiskCount}</span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={runHealthProbes}
                disabled={probing}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-400 hover:to-cyan-500 text-black font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 disabled:opacity-50 transition-all justify-center"
              >
                <Zap className={`w-3.5 h-3.5 ${probing ? 'animate-spin' : ''}`} />
                <span>{probing ? 'Probing...' : 'Run Active Probes'}</span>
              </button>

              <button
                onClick={runDriftWatch}
                disabled={loading}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center gap-2 border border-slate-700 disabled:opacity-50 transition-all justify-center"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>{loading ? 'Scanning Changelog...' : 'Tavily Drift Scan'}</span>
              </button>
            </div>
          </div>
        </section>

        {error && (
          <div className="p-4 rounded-xl bg-red-950/30 border border-red-500/30 text-red-300 text-xs flex items-center gap-3">
            <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span>Health Watch Error: {error}</span>
          </div>
        )}

        {/* Section: Live Health Probes Table */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-400" />
              <h2 className="text-sm font-bold text-white tracking-wide">
                ACTIVE CONTRACT PROBES ({healthChecks.length})
              </h2>
            </div>
            <span className="text-xs text-slate-400">
              Live HTTP probes comparing actual JSON responses against recorded contracts
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-[#0c101a]">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#090d16] text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4 font-semibold">Skill Target</th>
                  <th className="py-3 px-4 font-semibold">Endpoint</th>
                  <th className="py-3 px-4 font-semibold">HTTP Status</th>
                  <th className="py-3 px-4 font-semibold">Latency</th>
                  <th className="py-3 px-4 font-semibold">Shape Integrity</th>
                  <th className="py-3 px-4 font-semibold text-right">Probe Verdict</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {healthChecks.map((check) => (
                  <tr
                    key={check.id}
                    onClick={() => setSelectedCheck(selectedCheck?.id === check.id ? null : check)}
                    className="hover:bg-slate-900/40 transition-colors cursor-pointer"
                  >
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-200">{check.skill_name}</div>
                      <div className="text-[11px] text-slate-500 font-mono">probe #{check.id.slice(0, 8)}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold font-mono ${
                          check.method === 'POST'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                        }`}
                      >
                        {check.method}
                      </span>
                      <span className="ml-2 text-slate-300 font-mono text-[11px]">{check.path}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[11px]">
                        {check.http_status || 200} OK
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                      {check.latency_ms}ms
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-slate-300 text-[11px]">
                        {check.diff_summary || 'Matches recorded JSON schema'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {check.status === 'pass' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                          <CheckCircle2 className="w-3 h-3" />
                          PASS
                        </span>
                      ) : check.status === 'diff' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                          <AlertTriangle className="w-3 h-3" />
                          DIFF
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-500/15 text-red-400 border border-red-500/30">
                          <AlertTriangle className="w-3 h-3" />
                          FAIL
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Expanded Selected Check Schema Diff View */}
          {selectedCheck && (
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-white">
                  Probe Inspector: {selectedCheck.skill_name} ({selectedCheck.method} {selectedCheck.path})
                </span>
                <button
                  onClick={() => setSelectedCheck(null)}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  Close
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <span className="text-[11px] font-semibold text-slate-400">Expected Contract Fields:</span>
                  <pre className="p-3 rounded-lg bg-black/60 border border-slate-800 text-[11px] text-emerald-300 font-mono overflow-x-auto">
                    {JSON.stringify(selectedCheck.expected_shape || { status: 'success' }, null, 2)}
                  </pre>
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="text-[11px] font-semibold text-slate-400">Actual Probe Response:</span>
                  <pre className="p-3 rounded-lg bg-black/60 border border-slate-800 text-[11px] text-cyan-300 font-mono overflow-x-auto">
                    {JSON.stringify(selectedCheck.actual_shape || { ok: true }, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Section: At-Risk Drift Alerts */}
        {driftResult?.drifted_skills && driftResult.drifted_skills.length > 0 && (
          <section className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <h2 className="text-sm font-bold text-white tracking-wide">
                CHANGELOG CONTRACT DRIFT ALERTS ({driftResult.drifted_skills.length})
              </h2>
            </div>

            <div className="flex flex-col gap-3">
              {driftResult.drifted_skills.map((drift: any) => (
                <div
                  key={drift.id}
                  className="p-5 rounded-2xl bg-amber-950/20 border border-amber-500/30 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 flex-shrink-0 mt-0.5">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-sm text-white">{drift.title || drift.name}</span>
                        <code className="text-xs text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded font-mono">
                          {drift.name}
                        </code>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          STATUS: AT RISK
                        </span>
                      </div>

                      <p className="text-xs text-slate-300">{drift.reason}</p>

                      {drift.changelog_quote && (
                        <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 flex items-start gap-2 mt-1">
                          <Quote className="w-3 h-3 text-amber-400 flex-shrink-0 mt-0.5" />
                          <p className="text-[11px] text-slate-300 italic font-mono leading-relaxed">
                            "{drift.changelog_quote}"
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full md:w-auto justify-end pt-2 md:pt-0 border-t md:border-t-0 border-slate-800/60">
                    <Link
                      href={`/projects?saydo=teach&title=${encodeURIComponent(drift.title || drift.name)}`}
                      className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>Re-record Skill</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Section: All Monitored Skills Status */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              <h2 className="text-sm font-bold text-white tracking-wide">
                REGISTERED SKILLS CONTRACT INVENTORY ({skills.length})
              </h2>
            </div>
            <span className="text-xs text-slate-400">
              Active verification rules & schema integrity
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-[#0c101a]">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#090d16] text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4 font-semibold">Skill Name & Title</th>
                  <th className="py-3 px-4 font-semibold">Method & Path</th>
                  <th className="py-3 px-4 font-semibold">Input Contract</th>
                  <th className="py-3 px-4 font-semibold">Read Verifier</th>
                  <th className="py-3 px-4 font-semibold text-right">Contract Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {skills.map((skill) => {
                  const isDrifted = skill.status === 'at_risk' || driftResult?.drifted_skills?.some((ds: any) => ds.id === skill.id);

                  return (
                    <tr key={skill.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-200">{skill.title}</div>
                        <div className="text-[11px] text-slate-500 font-mono">{skill.name}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                            skill.method === 'POST'
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                          }`}
                        >
                          {skill.method}
                        </span>
                        <span className="ml-2 text-slate-300 font-mono text-[11px]">{skill.path}</span>
                      </td>
                      <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                        {Object.keys(skill.inputs || {}).length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {Object.entries(skill.inputs || {}).map(([key, def]: any) => (
                              <span
                                key={key}
                                className="px-1.5 py-0.5 rounded bg-slate-800/80 text-slate-300 text-[10px]"
                              >
                                {key}:{def.type}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-slate-600">none</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                        {skill.verify_with ? (
                          <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px]">
                            {skill.verify_with}
                          </span>
                        ) : (
                          <span className="text-slate-600">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {isDrifted ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                            <AlertTriangle className="w-3 h-3" />
                            At Risk (Drifted)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                            <CheckCircle2 className="w-3 h-3" />
                            Healthy
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
