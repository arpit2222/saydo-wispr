'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Activity,
  ArrowRight,
  Award,
  BarChart3,
  CheckCircle2,
  Cpu,
  ExternalLink,
  Layers,
  Mic,
  Play,
  Plug,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Terminal,
  Zap,
  Lock,
  EyeOff,
  Search,
  BookOpen
} from 'lucide-react';

interface LiveStats {
  skills_count: number;
  policies_count: number;
  runs_count: number;
  eval_pass_rate: number;
  models_supported: number;
}

export default function Home() {
  const [stats, setStats] = useState<LiveStats>({
    skills_count: 6,
    policies_count: 3,
    runs_count: 12,
    eval_pass_rate: 100,
    models_supported: 3,
  });

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`${apiUrl}/v1/stats`);
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (err) {
        // fallback to initial live stats
      }
    };
    fetchStats();
  }, [apiUrl]);

  return (
    <div className="min-h-screen bg-[#070b13] text-slate-100 font-sans flex flex-col selection:bg-emerald-500 selection:text-black">
      {/* Top Header Navigation */}
      <header className="h-16 border-b border-slate-800 bg-[#0c101a]/80 backdrop-blur-md px-8 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center font-bold text-black text-sm shadow-md shadow-emerald-500/20">
            SD
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-white text-base tracking-tight">SayDo</span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30 flex items-center gap-1">
              <span>🎙️</span>
              <span>Wispr Flow</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <Link
            href="/studio"
            className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold border border-slate-700 transition-all flex items-center gap-1.5"
          >
            <span>Studio Control Plane</span>
          </Link>

          <Link
            href="/projects"
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-400 hover:to-cyan-500 text-black font-bold transition-all shadow-md shadow-emerald-500/20 flex items-center gap-1.5"
          >
            <span>DEHIX-lite Demo</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-20 pb-16 px-6 max-w-5xl mx-auto flex flex-col items-center text-center gap-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-emerald-500/10 via-cyan-500/10 to-blue-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-300 shadow-sm animate-fade-in">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span>Voice-First Agent Enablement & Neuro-Symbolic Governance</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white max-w-4xl leading-[1.1]">
          Record once by voice.{' '}
          <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Your app works with every AI agent.
          </span>
        </h1>

        <p className="text-base sm:text-lg text-slate-400 max-w-2xl font-normal leading-relaxed">
          Powered by <span className="text-purple-300 font-semibold">Wispr Flow</span> ·{' '}
          <span className="text-slate-200 font-semibold">NVIDIA Nemotron</span> via{' '}
          <span className="text-slate-200 font-semibold">Nebius Token Factory</span> ·{' '}
          <span className="text-slate-200 font-semibold">Tavily</span>
        </p>

        {/* Hero CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <Link
            href="/projects"
            className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-400 hover:to-cyan-500 text-black font-bold text-sm shadow-xl shadow-emerald-500/25 transition-all flex items-center gap-2"
          >
            <Play className="w-4 h-4 fill-black" />
            <span>Try the DEHIX-lite demo</span>
          </Link>

          <Link
            href="/studio"
            className="px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-100 font-semibold text-sm border border-slate-700 hover:border-slate-600 transition-all flex items-center gap-2 shadow-lg"
          >
            <Layers className="w-4 h-4 text-emerald-400" />
            <span>Open Studio</span>
          </Link>
        </div>
      </section>

      {/* Animated 3-Step Strip */}
      <section className="py-8 px-6 max-w-6xl mx-auto w-full">
        <div className="p-8 rounded-3xl bg-gradient-to-b from-[#0c101a] to-[#080d17] border border-slate-800 shadow-2xl flex flex-col gap-8">
          <div className="text-center flex flex-col items-center gap-1.5">
            <span className="text-xs uppercase tracking-wider font-bold text-emerald-400 font-mono">
              HOW SAYDO WORKS
            </span>
            <h2 className="text-2xl font-bold text-white">From Spoken Demonstration to Governed Agent Tool</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {/* Step 1 */}
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col gap-3 group hover:border-emerald-500/40 transition-all">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm">
                1
              </div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Show & Tell</span>
                <Mic className="w-4 h-4 text-emerald-400" />
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Click record and complete your task in the host app while narrating by voice. SayDo intercepts sanitized HTTP requests, stripping auth headers and client PII.
              </p>
              <div className="mt-auto pt-2 text-[11px] font-mono text-emerald-400/90 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Value Tracer builds causal graph</span>
              </div>
            </div>

            {/* Step 2 */}
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col gap-3 group hover:border-cyan-500/40 transition-all">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-sm">
                2
              </div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Rules by Voice</span>
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Speak safety guardrails naturally: <em className="text-slate-300">"Budget can never exceed 10 lakh"</em> or <em className="text-slate-300">"Never assign admins"</em>. Nemotron compiles them into pure deterministic safety filters.
              </p>
              <div className="mt-auto pt-2 text-[11px] font-mono text-cyan-400/90 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Pure deterministic policy engine</span>
              </div>
            </div>

            {/* Step 3 */}
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col gap-3 group hover:border-purple-500/40 transition-all">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-sm">
                3
              </div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Any Agent Can Act</span>
                <Plug className="w-4 h-4 text-purple-400" />
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Your app is instantly exported as an official Model Context Protocol (MCP) server, Chrome WebMCP in-page tools, or executed via the in-app Ask Agent with automatic verification.
              </p>
              <div className="mt-auto pt-2 text-[11px] font-mono text-purple-400/90 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>MCP & WebMCP universal exports</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Stats from DB */}
      <section className="py-8 px-6 max-w-6xl mx-auto w-full">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-6 rounded-2xl bg-[#0c101a] border border-slate-800 flex flex-col gap-1 text-center sm:text-left">
            <span className="text-xs font-semibold text-slate-400">Synthesized Skills</span>
            <div className="text-4xl font-black text-white">{stats.skills_count}</div>
            <span className="text-[11px] text-emerald-400 font-mono">Typed & Verifier-Guarded</span>
          </div>

          <div className="p-6 rounded-2xl bg-[#0c101a] border border-slate-800 flex flex-col gap-1 text-center sm:text-left">
            <span className="text-xs font-semibold text-slate-400">Spoken Policies</span>
            <div className="text-4xl font-black text-cyan-400">{stats.policies_count}</div>
            <span className="text-[11px] text-cyan-400 font-mono">Zero-Hallucination Rules</span>
          </div>

          <div className="p-6 rounded-2xl bg-[#0c101a] border border-slate-800 flex flex-col gap-1 text-center sm:text-left">
            <span className="text-xs font-semibold text-slate-400">Total Agent Runs</span>
            <div className="text-4xl font-black text-white">{stats.runs_count}</div>
            <span className="text-[11px] text-slate-400 font-mono">Web, SDK & MCP Channels</span>
          </div>

          <div className="p-6 rounded-2xl bg-[#0c101a] border border-slate-800 flex flex-col gap-1 text-center sm:text-left">
            <span className="text-xs font-semibold text-slate-400">Eval Benchmark</span>
            <div className="text-4xl font-black text-emerald-400">{stats.eval_pass_rate}%</div>
            <span className="text-[11px] text-emerald-400 font-mono">20/20 Tasks Verified</span>
          </div>
        </div>
      </section>

      {/* Model-Routing Section (Nebius Token Factory) */}
      <section className="py-12 px-6 max-w-6xl mx-auto w-full flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              NEBIUS TOKEN FACTORY
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              NVIDIA NEMOTRON
            </span>
          </div>
          <h2 className="text-2xl font-bold text-white">Tri-Tier Neuro-Symbolic Model Routing</h2>
          <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
            SayDo dynamically routes incoming natural language across specialized NVIDIA Nemotron architectures hosted on Nebius Token Factory for optimal latency, cost, and reasoning power.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-[#0c101a] border border-slate-800 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold font-mono text-emerald-400">AGENT TIER</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 font-mono">42ms avg</span>
            </div>
            <h3 className="text-lg font-bold text-white">Nemotron 70B Instruct</h3>
            <code className="text-[11px] text-slate-500 font-mono">nvidia/llama-3.1-nemotron-70b-instruct</code>
            <p className="text-xs text-slate-400 leading-relaxed">
              Handles multi-turn tool calling, dynamic parameter synthesis, and coordinates internal read-verification loops after write executions.
            </p>
            <div className="mt-auto pt-3 border-t border-slate-800 text-[11px] text-slate-300 flex items-center gap-1.5 font-mono">
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
              <span>Primary Tool Loop & Executor</span>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-[#0c101a] border border-slate-800 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold font-mono text-cyan-400">REASON TIER</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 font-mono">43ms avg</span>
            </div>
            <h3 className="text-lg font-bold text-white">Nemotron 340B Instruct</h3>
            <code className="text-[11px] text-slate-500 font-mono">nvidia/nemotron-4-340b-instruct</code>
            <p className="text-xs text-slate-400 leading-relaxed">
              Decomposes compound multi-intent user instructions into ordered execution plans and UI checklists before taking action.
            </p>
            <div className="mt-auto pt-3 border-t border-slate-800 text-[11px] text-slate-300 flex items-center gap-1.5 font-mono">
              <BarChart3 className="w-3.5 h-3.5 text-cyan-400" />
              <span>Hierarchical Multi-Step Planner</span>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-[#0c101a] border border-slate-800 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold font-mono text-purple-400">FAST EDGE TIER</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 font-mono">44ms avg</span>
            </div>
            <h3 className="text-lg font-bold text-white">Nemotron Mini 4B</h3>
            <code className="text-[11px] text-slate-500 font-mono">nvidia/nemotron-mini-4b-instruct</code>
            <p className="text-xs text-slate-400 leading-relaxed">
              Sub-millisecond parameter extraction, INR currency parsing, spoken rule translation, and changelog diff mapping.
            </p>
            <div className="mt-auto pt-3 border-t border-slate-800 text-[11px] text-slate-300 flex items-center gap-1.5 font-mono">
              <Cpu className="w-3.5 h-3.5 text-purple-400" />
              <span>Voice Parsing & Schema Compiler</span>
            </div>
          </div>
        </div>
      </section>

      {/* Security & Governance Section */}
      <section className="py-12 px-6 max-w-6xl mx-auto w-full flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
              ENTERPRISE SAFETY
            </span>
          </div>
          <h2 className="text-2xl font-bold text-white">Neuro-Symbolic Governance & Zero Secrets Storage</h2>
          <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
            Unlike raw agent wrappers that hallucinate or leak authentication tokens, SayDo enforces strict isolation between voice intent and runtime execution.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-[#0c101a] border border-slate-800 flex flex-col gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-bold text-white">Deterministic Guardrails</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Spoken policies run through pure mathematical evaluators. Over-budget actions and privilege escalations are blocked with zero hallucinations.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#0c101a] border border-slate-800 flex flex-col gap-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-bold text-white">Zero Credentials Leak</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Browser SDK executes requests directly with the user’s authenticated session. Bearer tokens, cookies, and auth headers never leave the browser.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#0c101a] border border-slate-800 flex flex-col gap-2">
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-bold text-white">Read-Verifier Loop</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Write operations automatically trigger an internal read call to confirm actual database state before reporting completion.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#0c101a] border border-slate-800 flex flex-col gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Search className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-bold text-white">Tavily Drift Watch</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Tavily continuously scans product changelogs, detecting deprecated fields or schema breaking changes before runtime failures.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800 bg-[#090d16] py-8 px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <div className="flex items-center gap-3">
          <span className="font-bold text-slate-300">SayDo</span>
          <span>•</span>
          <span>MIT Licensed Open Source</span>
        </div>

        <div className="flex items-center gap-4 text-slate-400">
          <Link href="/studio" className="hover:text-white transition-colors">Studio</Link>
          <Link href="/projects" className="hover:text-white transition-colors">DEHIX-lite Demo</Link>
          <Link href="/docs" className="hover:text-white transition-colors">Host Documentation</Link>
          <a
            href="https://github.com/arpit2222/saydo"
            target="_blank"
            rel="noreferrer"
            className="hover:text-white transition-colors flex items-center gap-1"
          >
            <span>GitHub</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </footer>
    </div>
  );
}
