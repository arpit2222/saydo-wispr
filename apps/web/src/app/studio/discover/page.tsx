'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Compass,
  Sparkles,
  Layers,
  ShieldCheck,
  Activity,
  ExternalLink,
  ChevronDown,
  CheckCircle2,
  AlertCircle,
  FileText,
  Search,
  Quote,
  ArrowRight,
  ShieldAlert,
  PlusCircle,
  RefreshCw,
  Plug,
  BarChart3,
  RotateCcw,
  Terminal,
  Mic
} from 'lucide-react';

interface SkillSuggestion {
  id: string;
  title: string;
  description: string;
  is_write: boolean;
  quote: string;
  source_url: string;
  covered: boolean;
}

interface RuleSuggestion {
  id: string;
  sentence: string;
  quote: string;
  source_url: string;
}

export default function DiscoverPage() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<{
    app_id?: string;
    docs_url?: string;
    pages_extracted?: number;
    suggestions: {
      skills: SkillSuggestion[];
      rules: RuleSuggestion[];
    };
    coverage: {
      recorded: number;
      suggested: number;
      percent: number;
    };
    powered_by?: string;
  } | null>(null);

  const [addedPolicies, setAddedPolicies] = useState<Record<string, boolean>>({});
  const [addingPolicyId, setAddingPolicyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

  const runDiscovery = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiUrl}/v1/discover`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ app_id: 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b22' }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Discovery request failed');
      }

      const resData = await res.json();
      setData(resData);
    } catch (err: any) {
      console.error('Discovery error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runDiscovery();
  }, []);

  const handleAddPolicy = async (rule: RuleSuggestion) => {
    setAddingPolicyId(rule.id);
    try {
      const res = await fetch(`${apiUrl}/v1/policies/parse`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          publicKey: 'pk_demo_dehix',
          spoken: rule.sentence,
          source: 'docs',
        }),
      });

      if (res.ok) {
        setAddedPolicies((prev) => ({ ...prev, [rule.id]: true }));
      }
    } catch (err) {
      console.error('Failed to add policy:', err);
    } finally {
      setAddingPolicyId(null);
    }
  };

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
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  Tavily Discovery
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
            href="/docs"
            target="_blank"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors"
          >
            <FileText className="w-3.5 h-3.5 text-cyan-400" />
            <span>View Host Docs</span>
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
          className="px-4 py-3 text-xs font-semibold text-cyan-400 border-b-2 border-cyan-500 flex items-center gap-2 whitespace-nowrap"
        >
          <Compass className="w-4 h-4 text-cyan-400" />
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
          className="px-4 py-3 text-xs font-semibold text-slate-400 hover:text-white border-b-2 border-transparent transition-all flex items-center gap-2 whitespace-nowrap"
        >
          <Terminal className="w-4 h-4" />
          Agent Runs & Telemetry
        </Link>
      </div>

      <main className="p-8 max-w-7xl w-full mx-auto flex flex-col gap-8 flex-1">
        {/* Hero & Coverage Meter Card */}
        <section className="p-6 rounded-2xl bg-gradient-to-r from-cyan-950/20 via-[#0c101a] to-blue-950/20 border border-cyan-900/30 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col gap-2 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center gap-1.5">
                <Search className="w-3 h-3" />
                Tavily Extract & Search
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Nemotron Fast Parser
              </span>
            </div>
            <h1 className="text-xl font-bold text-white">Automated Documentation Discovery</h1>
            <p className="text-xs text-slate-400 leading-relaxed">
              Tavily scans your product documentation to discover candidate agent skills and extract business rules. Compare suggested capabilities with your voice-recorded skills to find coverage gaps.
            </p>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto justify-end">
            {/* Coverage Meter */}
            <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="flex flex-col">
                <span className="text-[11px] text-slate-400">Documentation Coverage</span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-2xl font-black text-cyan-400">{data?.coverage?.percent ?? 0}%</span>
                  <span className="text-xs text-slate-400">
                    ({data?.coverage?.recorded ?? 0}/{data?.coverage?.suggested ?? 0} skills)
                  </span>
                </div>
                {/* Progress bar */}
                <div className="w-40 h-2 rounded-full bg-slate-800 mt-2 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-500"
                    style={{ width: `${data?.coverage?.percent ?? 0}%` }}
                  />
                </div>
              </div>
            </div>

            <button
              onClick={runDiscovery}
              disabled={loading}
              className="px-4 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/20 disabled:opacity-50 transition-all"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Discovering...' : 'Re-Discover with Tavily'}</span>
            </button>
          </div>
        </section>

        {error && (
          <div className="p-4 rounded-xl bg-red-950/30 border border-red-500/30 text-red-300 text-xs flex items-center gap-3">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span>Discovery Error: {error}</span>
          </div>
        )}

        {/* Section 1: Discovered Skills */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <h2 className="text-sm font-bold text-white tracking-wide">
                DISCOVERED AGENT SKILLS ({data?.suggestions?.skills?.length ?? 0})
              </h2>
            </div>
            <span className="text-xs text-slate-400">
              Extracted from DEHIX-lite public docs
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data?.suggestions?.skills?.map((skill) => (
              <div
                key={skill.id}
                className="p-5 rounded-xl bg-[#0c101a] border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between gap-4"
              >
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-100 flex items-center gap-2">
                      {skill.title}
                    </span>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                          skill.is_write
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                        }`}
                      >
                        {skill.is_write ? 'WRITE (POST)' : 'READ (GET)'}
                      </span>
                      {skill.covered ? (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Recorded
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                          Unrecorded
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed">{skill.description}</p>

                  {/* Documentation Quote */}
                  <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800/80 flex items-start gap-2 mt-1">
                    <Quote className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0 mt-0.5" />
                    <p className="text-[11px] text-slate-300 italic font-mono leading-relaxed">
                      "{skill.quote}"
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
                  <a
                    href={skill.source_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
                  >
                    <span>Doc Source</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>

                  {skill.covered ? (
                    <Link
                      href="/studio"
                      className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
                    >
                      <span>View in Skills</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  ) : (
                    <Link
                      href={`/projects?saydo=teach&title=${encodeURIComponent(skill.title)}`}
                      className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-[11px] flex items-center gap-1 transition-colors shadow-sm"
                    >
                      <PlusCircle className="w-3 h-3" />
                      <span>Record by Voice</span>
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 2: Discovered Spoken Rules */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-purple-400" />
              <h2 className="text-sm font-bold text-white tracking-wide">
                EXTRACTED PLATFORM GUARDRAILS ({data?.suggestions?.rules?.length ?? 0})
              </h2>
            </div>
            <span className="text-xs text-slate-400">
              Spoken policies synthesized directly from documentation rules
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {data?.suggestions?.rules?.map((rule) => {
              const isAdded = addedPolicies[rule.id];
              const isAdding = addingPolicyId === rule.id;

              return (
                <div
                  key={rule.id}
                  className="p-5 rounded-xl bg-[#0c101a] border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between gap-4"
                >
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20">
                        Docs Rule
                      </span>
                      <a
                        href={rule.source_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] text-slate-400 hover:text-slate-200 flex items-center gap-1"
                      >
                        <span>Source</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>

                    <h3 className="text-xs font-bold text-slate-200 leading-snug">
                      "{rule.sentence}"
                    </h3>

                    <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/60 flex items-start gap-2">
                      <Quote className="w-3 h-3 text-purple-400 flex-shrink-0 mt-0.5" />
                      <p className="text-[11px] text-slate-400 italic leading-relaxed">
                        "{rule.quote}"
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800/60">
                    {isAdded ? (
                      <div className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1.5 py-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Enforced as Policy</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleAddPolicy(rule)}
                        disabled={isAdding}
                        className="w-full py-1.5 px-3 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-purple-300 hover:text-purple-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
                      >
                        <ShieldAlert className="w-3 h-3" />
                        <span>{isAdding ? 'Enforcing...' : 'Add as Policy'}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}
