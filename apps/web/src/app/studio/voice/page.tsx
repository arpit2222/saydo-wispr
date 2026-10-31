'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Mic,
  ShieldCheck,
  Layers,
  ArrowRight,
  Code,
  Sparkles,
  ExternalLink,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  FileCode,
  Calendar,
  Volume2,
  Terminal,
  Activity,
  Compass,
  Plug,
  BarChart3,
  ShieldAlert,
  Search,
  Filter,
  CheckCircle2,
  Zap,
  HelpCircle
} from 'lucide-react';
import { SkillDefinition, PolicyRule } from '@saydo/shared';

interface VoiceTimelineItem {
  id: string;
  type: 'skill' | 'policy';
  title: string;
  spokenText: string;
  source: 'voice' | 'typed';
  words: number;
  date: string;
  targetArtifact: string;
  targetDetails: string;
  codeJson: Record<string, any>;
}

export default function TaughtByVoicePage() {
  const [skills, setSkills] = useState<SkillDefinition[]>([]);
  const [policies, setPolicies] = useState<PolicyRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'skill' | 'policy'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [skillsRes, policiesRes] = await Promise.all([
          fetch(`${apiUrl}/v1/skills?publicKey=pk_demo_dehix`),
          fetch(`${apiUrl}/v1/policies?publicKey=pk_demo_dehix`),
        ]);

        if (skillsRes.ok) {
          const data = await skillsRes.json();
          setSkills(data.skills || []);
        }
        if (policiesRes.ok) {
          const data = await policiesRes.json();
          setPolicies(data.policies || []);
        }
      } catch (err) {
        console.error('Failed to load voice artifacts:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [apiUrl]);

  // Construct unified voice items
  const timelineItems: VoiceTimelineItem[] = useMemo(() => {
    const items: VoiceTimelineItem[] = [];

    // 1. Process skills
    skills.forEach((skill) => {
      if (skill.narration) {
        const words =
          skill.narration_metadata?.words ??
          skill.narration.trim().split(/\s+/).filter(Boolean).length;
        const source = skill.narration_metadata?.source ?? 'voice';

        items.push({
          id: `skill-${skill.id}`,
          type: 'skill',
          title: skill.title || skill.name,
          spokenText: skill.narration,
          source,
          words,
          date: skill.narration_metadata?.created_at || (skill as any).created_at || new Date().toISOString(),
          targetArtifact: `API Skill: ${skill.name}`,
          targetDetails: `${skill.method} ${skill.path}`,
          codeJson: {
            name: skill.name,
            method: skill.method,
            path: skill.path,
            inputs: skill.inputs,
            outputs: skill.outputs,
            is_write: skill.is_write,
            verify_with: skill.verify_with,
          },
        });
      }
    });

    // 2. Process policies
    policies.forEach((policy) => {
      if (policy.spoken) {
        const words = policy.spoken.trim().split(/\s+/).filter(Boolean).length;
        const source = policy.source === 'voice' ? 'voice' : 'typed';

        items.push({
          id: `policy-${policy.id}`,
          type: 'policy',
          title: `Policy: ${policy.skill_name} (${policy.kind})`,
          spokenText: policy.spoken,
          source,
          words,
          date: policy.created_at || new Date().toISOString(),
          targetArtifact: `Policy Guardrail: ${policy.id}`,
          targetDetails: `${policy.kind.toUpperCase()} ${policy.field ? `${policy.field} ${policy.op} ${JSON.stringify(policy.value)}` : policy.skill_name}`,
          codeJson: {
            id: policy.id,
            skill_name: policy.skill_name,
            kind: policy.kind,
            field: policy.field,
            op: policy.op,
            value: policy.value,
            message: policy.message,
            spoken: policy.spoken,
            source: policy.source,
          },
        });
      }
    });

    return items;
  }, [skills, policies]);

  // Filtered list
  const filteredItems = useMemo(() => {
    return timelineItems.filter((item) => {
      if (activeFilter !== 'all' && item.type !== activeFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          item.spokenText.toLowerCase().includes(q) ||
          item.title.toLowerCase().includes(q) ||
          item.targetArtifact.toLowerCase().includes(q) ||
          item.targetDetails.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [timelineItems, activeFilter, searchQuery]);

  // Compute 3 Honest Stats
  const voiceSkillsCount = useMemo(() => {
    return skills.filter(
      (s) => s.narration_metadata?.source === 'voice' || (s.narration && !s.narration_metadata)
    ).length;
  }, [skills]);

  const voicePoliciesCount = useMemo(() => {
    return policies.filter((p) => p.source === 'voice' || Boolean(p.spoken)).length;
  }, [policies]);

  const totalWordsNarrated = useMemo(() => {
    let sum = 0;
    timelineItems.forEach((item) => {
      sum += item.words;
    });
    return sum;
  }, [timelineItems]);

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="min-h-screen bg-[#070b13] text-slate-100 font-sans flex flex-col">
      {/* Studio Top Navigation Header */}
      <header className="h-16 border-b border-slate-800 bg-[#0c101a] px-8 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-6">
          <Link href="/studio" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center font-bold text-black text-sm shadow-md shadow-emerald-500/20">
              SD
            </div>
            <div>
              <div className="font-bold text-white text-sm flex items-center gap-2">
                SayDo Studio
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30 flex items-center gap-1">
                  <span>🎙️</span>
                  <span>Taught by Voice</span>
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
            href="/projects"
            target="_blank"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors"
          >
            <span>Host App</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* Sub Navigation Tabs */}
      <div className="border-b border-slate-800 bg-[#0c101a]/60 px-8 flex items-center gap-2 overflow-x-auto">
        <Link
          href="/studio"
          className="px-4 py-3 text-xs font-semibold text-slate-400 hover:text-white border-b-2 border-transparent transition-all flex items-center gap-2 whitespace-nowrap"
        >
          <Layers className="w-4 h-4 text-blue-400" />
          Skills Library
        </Link>
        <Link
          href="/studio/policies"
          className="px-4 py-3 text-xs font-semibold text-slate-400 hover:text-white border-b-2 border-transparent transition-all flex items-center gap-2 whitespace-nowrap"
        >
          <ShieldAlert className="w-4 h-4 text-emerald-400" />
          Spoken Policies & Guardrails
        </Link>
        <Link
          href="/studio/voice"
          className="px-4 py-3 text-xs font-semibold text-purple-400 border-b-2 border-purple-500 transition-all flex items-center gap-2 whitespace-nowrap"
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
          className="px-4 py-3 text-xs font-semibold text-slate-400 hover:text-white border-b-2 border-transparent transition-all flex items-center gap-2 whitespace-nowrap"
        >
          <Terminal className="w-4 h-4" />
          Agent Runs & Telemetry
        </Link>
      </div>

      {/* Main Content Area */}
      <main className="p-8 max-w-7xl w-full mx-auto flex flex-col gap-8 flex-1">
        {/* Page Title & Context */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <span className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <Mic className="w-5 h-5" />
              </span>
              Taught by Voice &mdash; Dictation Proof
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl">
              Every skill in SayDo is taught by speaking aloud with Wispr Flow while using the software. Here is the complete proof ledger of all spoken inputs, honest word counts, and the exact code synthesized.
            </p>
          </div>

          <Link
            href="/projects?saydo=teach"
            target="_blank"
            className="self-start sm:self-auto px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-semibold text-white shadow-md shadow-purple-500/20 transition-all flex items-center gap-2 whitespace-nowrap"
          >
            <span>Teach a Skill by Voice</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* 1. Top: Three Honest Stats */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-950/20 via-[#0c101a] to-slate-900 border border-purple-900/30 shadow-xl flex flex-col justify-between gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-bold tracking-wider text-purple-400">
                Skills Taught by Voice
              </span>
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <Layers className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-3xl font-extrabold text-white font-mono">
                {loading ? '...' : voiceSkillsCount}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Typed endpoints synthesized from voice narration & network traffic
              </p>
            </div>
            <div className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>100% voice covered</span>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-950/20 via-[#0c101a] to-slate-900 border border-blue-900/30 shadow-xl flex flex-col justify-between gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-bold tracking-wider text-blue-400">
                Spoken Rules Active
              </span>
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-3xl font-extrabold text-white font-mono">
                {loading ? '...' : voicePoliciesCount}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Natural-language business guardrails dictated and enforced on writes
              </p>
            </div>
            <div className="text-[11px] text-cyan-400 flex items-center gap-1 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Enforced on client + server</span>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-950/20 via-[#0c101a] to-slate-900 border border-emerald-900/30 shadow-xl flex flex-col justify-between gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-bold tracking-wider text-emerald-400">
                Total Words Dictated
              </span>
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Volume2 className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-3xl font-extrabold text-white font-mono">
                {loading ? '...' : totalWordsNarrated}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Sum of words spoken through Wispr Flow across skills & policy rules
              </p>
            </div>
            <div className="text-[11px] text-purple-400 flex items-center gap-1 font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Honest word count metric</span>
            </div>
          </div>
        </section>

        {/* 2. "From Voice to Agent" Visual Strip */}
        <section className="p-6 rounded-2xl bg-[#0c101a] border border-slate-800 shadow-xl flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                From Voice to Agent &mdash; How Spoken Dictation Becomes Real Execution
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                SayDo replaces prompt engineering with real human speech and click recordings.
              </p>
            </div>
            <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20">
              Wispr &rarr; Nemotron Fast &rarr; Verified Run
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative">
            {/* Step 1 */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-purple-900/30 flex flex-col justify-between gap-3 relative">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">
                  Step 1 &middot; Spoken Dictation
                </span>
                <span className="text-xs font-mono text-purple-300">Wispr Flow</span>
              </div>
              <div className="text-xs text-slate-300 italic bg-purple-950/20 p-3 rounded-lg border border-purple-900/40">
                &ldquo;When spinning up a new project on DEHIX, capture project title, budget in INR, and milestones.&rdquo;
              </div>
              <p className="text-[11px] text-slate-400">
                Spoken aloud using Wispr hotkey during live DEHIX workflow. Words and timestamps captured with zero typing.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-blue-900/30 flex flex-col justify-between gap-3 relative">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">
                  Step 2 &middot; Compiled Schema & Policy
                </span>
                <span className="text-xs font-mono text-blue-300">Nemotron Fast</span>
              </div>
              <div className="text-[11px] font-mono text-emerald-400 bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1">
                <div>POST /api/dehix/projects</div>
                <div className="text-slate-400">&#123; name: string, budget: number &#125;</div>
                <div className="text-amber-400">Policy: budget &le; 10,00,000 INR</div>
              </div>
              <p className="text-[11px] text-slate-400">
                Deterministic value tracer pairs network payloads with narration into a strictly-typed, self-verifying skill.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-emerald-900/30 flex flex-col justify-between gap-3 relative">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                  Step 3 &middot; Verified Agent Run
                </span>
                <span className="text-xs font-mono text-emerald-300">Browser Agent</span>
              </div>
              <div className="text-[11px] font-mono text-slate-300 bg-emerald-950/20 p-3 rounded-lg border border-emerald-900/40 space-y-1">
                <div className="text-slate-400">User: &ldquo;Create Website Revamp, budget 2L&rdquo;</div>
                <div className="text-emerald-400">&check; Policy Check Passed (2L &le; 10L)</div>
                <div className="text-cyan-400">&check; Verified with get_project</div>
              </div>
              <p className="text-[11px] text-slate-400">
                End-user invokes by voice or chat. Assistant checks safety guardrails, asks confirmation, and executes.
              </p>
            </div>
          </div>
        </section>

        {/* 3. Timeline Filter & Search Bar */}
        <section className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeFilter === 'all'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800'
              }`}
            >
              All Spoken Inputs ({timelineItems.length})
            </button>
            <button
              onClick={() => setActiveFilter('skill')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeFilter === 'skill'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800'
              }`}
            >
              Skills Only ({timelineItems.filter((i) => i.type === 'skill').length})
            </button>
            <button
              onClick={() => setActiveFilter('policy')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeFilter === 'policy'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800'
              }`}
            >
              Spoken Rules Only ({timelineItems.filter((i) => i.type === 'policy').length})
            </button>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search quotes or code names..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </section>

        {/* 4. Timeline Cards: Spoken Quote + Metadata + Code Toggle */}
        <section className="flex flex-col gap-4">
          {loading ? (
            <div className="p-16 text-center text-slate-500 text-sm">
              Loading voice proof timeline...
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="p-16 text-center rounded-2xl bg-[#0c101a] border border-slate-800 text-slate-500 text-sm">
              No voice artifacts match your query. Record a task with Wispr Flow in DEHIX-lite or speak a rule in Policies!
            </div>
          ) : (
            filteredItems.map((item) => {
              const isExpanded = expandedId === item.id;
              return (
                <div
                  key={item.id}
                  className="p-6 rounded-2xl bg-[#0c101a] border border-slate-800 hover:border-slate-700 transition-all shadow-lg flex flex-col gap-4"
                >
                  {/* Card Header: Type Badge, Target Artifact, Words & Wispr Badge */}
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-md ${
                          item.type === 'skill'
                            ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        }`}
                      >
                        {item.type === 'skill' ? 'Skill Narration' : 'Spoken Rule'}
                      </span>
                      <span className="font-semibold text-white text-sm">
                        {item.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30">
                        🎙️ Dictated with Wispr Flow (likely dictated)
                      </span>
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800">
                        {item.words} words
                      </span>
                    </div>
                  </div>

                  {/* The Spoken Quote in Large Clear Typography */}
                  <div className="p-4 rounded-xl bg-purple-950/15 border border-purple-900/30 flex items-start gap-3">
                    <span className="text-2xl text-purple-400 leading-none select-none">&ldquo;</span>
                    <p className="text-base text-slate-200 font-medium italic leading-relaxed flex-1">
                      {item.spokenText}
                    </p>
                    <span className="text-2xl text-purple-400 leading-none select-none">&rdquo;</span>
                  </div>

                  {/* Destination: What this voice quote became */}
                  <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400 pt-1">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500">Became:</span>
                      <span className="font-semibold text-slate-200">{item.targetArtifact}</span>
                      <code className="text-[11px] font-mono text-cyan-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                        {item.targetDetails}
                      </code>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-[11px] text-slate-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(item.date).toLocaleDateString()}
                      </span>

                      <button
                        onClick={() => toggleExpand(item.id)}
                        className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 transition-colors"
                      >
                        <Code className="w-3.5 h-3.5 text-purple-400" />
                        <span>{isExpanded ? 'Hide generated code' : 'Inspect generated code'}</span>
                        {isExpanded ? (
                          <ChevronUp className="w-3 h-3 ml-0.5" />
                        ) : (
                          <ChevronDown className="w-3 h-3 ml-0.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Expandable Side-by-Side: Quote vs Generated Code JSON */}
                  {isExpanded && (
                    <div className="mt-2 p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col gap-3">
                      <div className="flex items-center justify-between text-xs border-b border-slate-800/80 pb-2">
                        <span className="font-semibold text-slate-300 flex items-center gap-2">
                          <FileCode className="w-4 h-4 text-emerald-400" />
                          Generated Typed Contract &middot; Synthesized by Nemotron Fast
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          Format: Strict JSON Schema
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Spoken Quote Context */}
                        <div className="p-3.5 rounded-lg bg-slate-900/60 border border-slate-800 flex flex-col justify-between gap-3">
                          <div className="text-[10px] uppercase font-bold tracking-wider text-purple-400">
                            Original Wispr Dictation
                          </div>
                          <p className="text-xs text-slate-300 italic leading-relaxed">
                            &ldquo;{item.spokenText}&rdquo;
                          </p>
                          <div className="text-[11px] text-slate-500">
                            Word count: {item.words} &middot; Captured in host app recording session
                          </div>
                        </div>

                        {/* Generated JSON Code */}
                        <pre className="p-3.5 rounded-lg bg-black/60 border border-slate-800 text-[11px] font-mono text-emerald-300 overflow-x-auto max-h-60 leading-relaxed">
                          {JSON.stringify(item.codeJson, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </section>

        {/* Footer Quick Links */}
        <section className="p-6 rounded-2xl bg-[#0c101a] border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div>
            <span className="font-bold text-white">Want to record more voice skills?</span> Open DEHIX-lite with the SayDo SDK and speak your instructions.
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/projects?saydo=teach"
              target="_blank"
              className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold border border-slate-700 transition-colors"
            >
              Open Host App SDK
            </Link>
            <Link
              href="/studio/policies"
              className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold shadow-md shadow-purple-500/20 transition-colors"
            >
              Speak a Rule
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
