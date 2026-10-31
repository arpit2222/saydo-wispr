'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Sparkles, 
  Layers, 
  CheckCircle2, 
  Circle, 
  ChevronRight, 
  ShieldAlert, 
  FileCode, 
  Power, 
  Link2, 
  RefreshCw, 
  ExternalLink,
  ChevronDown,
  X,
  Mail,
  Zap,
  BookOpen,
  Compass,
  Activity,
  Plug,
  BarChart3,
  RotateCcw,
  Terminal
} from 'lucide-react';
import { SkillDefinition, TracerEdge } from '@saydo/shared';

export default function StudioPage() {
  const [skills, setSkills] = useState<SkillDefinition[]>([]);
  const [recordings, setRecordings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [compiling, setCompiling] = useState(false);
  const [selectedRecordingId, setSelectedRecordingId] = useState<string>('');
  const [selectedJsonSkill, setSelectedJsonSkill] = useState<SkillDefinition | null>(null);
  const [compileMessage, setCompileMessage] = useState<string | null>(null);
  const [lastTracerEdges, setLastTracerEdges] = useState<TracerEdge[]>([]);

  // Magic Link Auth Modal State
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authEmail, setAuthEmail] = useState('');
  const [authSent, setAuthSent] = useState(false);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch skills
      const skillsRes = await fetch(`${apiUrl}/v1/skills?publicKey=pk_demo_dehix`);
      if (skillsRes.ok) {
        const skillsData = await skillsRes.json();
        setSkills(skillsData.skills || []);
      }

      // Fetch recordings
      const recRes = await fetch(`${apiUrl}/v1/recordings?publicKey=pk_demo_dehix`);
      if (recRes.ok) {
        const recData = await recRes.json();
        setRecordings(recData.recordings || []);
        if (recData.recordings?.length > 0 && !selectedRecordingId) {
          setSelectedRecordingId(recData.recordings[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to load Studio data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCompile = async () => {
    if (!selectedRecordingId) return;
    setCompiling(true);
    setCompileMessage(null);

    try {
      const res = await fetch(`${apiUrl}/v1/compile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recording_id: selectedRecordingId }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Compilation failed');
      }

      setCompileMessage(`Successfully compiled ${data.skills?.length || 0} skills! Value tracer identified ${data.tracer_edges?.length || 0} dependency edges.`);
      if (data.tracer_edges) {
        setLastTracerEdges(data.tracer_edges);
      }
      fetchData();
    } catch (err: any) {
      setCompileMessage(`Error: ${err.message}`);
    } finally {
      setCompiling(false);
    }
  };

  const handleToggleSkill = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'active' ? 'disabled' : 'active';
    try {
      const res = await fetch(`${apiUrl}/v1/skills/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (res.ok) {
        setSkills((prev) =>
          prev.map((s) => (s.id === id ? { ...s, status: nextStatus as any } : s))
        );
      }
    } catch (err) {
      console.error('Failed to toggle skill status:', err);
    }
  };

  const handleMagicLink = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthSent(true);
  };

  const checklistItems = [
    { id: 1, title: 'Discover', desc: 'Scan docs for skills & policy rules', done: true },
    { id: 2, title: 'Record', desc: 'Teach tasks by voice in host app', done: recordings.length > 0 },
    { id: 3, title: 'Compile & Trace', desc: 'Synthesize typed skills & value edges', done: skills.length > 0 },
    { id: 4, title: 'Policies', desc: 'Guardrails & spoken rules enforced', done: true },
    { id: 5, title: 'Export', desc: 'MCP server & WebMCP tool registration', done: false },
  ];

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
                  Nebius Nemotron Fast
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
            <span>Launch Host App</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <button
            onClick={() => setIsAuthOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-xs font-semibold text-blue-400 transition-all"
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Sign In (Magic Link)</span>
          </button>
        </div>
      </header>

      {/* Tabs Navigation */}
      <div className="border-b border-slate-800 bg-[#090d16] px-8 flex items-center gap-2 overflow-x-auto">
        <Link
          href="/studio"
          className="px-4 py-3 text-xs font-semibold text-blue-400 border-b-2 border-blue-500 flex items-center gap-2 whitespace-nowrap"
        >
          <Layers className="w-4 h-4 text-blue-400" />
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

      {/* Main Studio Viewport */}
      <main className="p-8 max-w-7xl w-full mx-auto flex flex-col gap-8 flex-1">
        {/* Onboarding Checklist */}
        <section className="p-6 rounded-2xl bg-[#0c101a] border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                Agent Readiness Checklist
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                From voice recording to universal MCP & WebMCP tool availability.
              </p>
            </div>
            <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              {checklistItems.filter((i) => i.done).length} / {checklistItems.length} Complete
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {checklistItems.map((item) => (
              <div
                key={item.id}
                className={`p-3.5 rounded-xl border flex flex-col justify-between transition-all ${
                  item.done
                    ? 'bg-emerald-500/5 border-emerald-500/20 text-slate-200'
                    : 'bg-slate-900/40 border-slate-800 text-slate-400'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold">{item.title}</span>
                  {item.done ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Circle className="w-4 h-4 text-slate-600" />
                  )}
                </div>
                <p className="text-[11px] text-slate-400 mt-2 leading-tight">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Compiler Action Bar */}
        <section className="p-6 rounded-2xl bg-gradient-to-r from-blue-950/30 via-[#0c101a] to-indigo-950/30 border border-blue-900/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              Compile Recording with Nemotron Fast + Value Tracer
            </h3>
            <p className="text-xs text-slate-400">
              Select a raw voice recording to synthesize typed skills, discover dependencies, and create policy rules.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <select
              value={selectedRecordingId}
              onChange={(e) => setSelectedRecordingId(e.target.value)}
              className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {recordings.length === 0 ? (
                <option value="">No recordings found. Use SDK recorder first!</option>
              ) : (
                recordings.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.title} ({r.events?.length || 0} calls)
                  </option>
                ))
              )}
            </select>

            <button
              onClick={handleCompile}
              disabled={compiling || !selectedRecordingId}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-xs font-semibold text-white shadow-md shadow-blue-500/20 transition-all flex items-center gap-2 whitespace-nowrap"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${compiling ? 'animate-spin' : ''}`} />
              <span>{compiling ? 'Compiling...' : 'Run Compiler'}</span>
            </button>
          </div>
        </section>

        {compileMessage && (
          <div className={`p-4 rounded-xl text-xs flex items-center justify-between border ${
            compileMessage.startsWith('Error') 
              ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' 
              : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
          }`}>
            <span>{compileMessage}</span>
            <button onClick={() => setCompileMessage(null)}>
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Value Tracer Graph Banner */}
        {lastTracerEdges.length > 0 && (
          <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-800/40 text-xs text-indigo-300 flex flex-col gap-2">
            <div className="font-semibold flex items-center gap-2 text-indigo-200">
              <Link2 className="w-4 h-4 text-indigo-400" />
              <span>Value Tracer Dependency Graph ({lastTracerEdges.length} Edges Discovered)</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {lastTracerEdges.map((edge, idx) => (
                <div key={idx} className="px-3 py-1.5 rounded-lg bg-slate-900 border border-indigo-700/50 font-mono text-[11px] text-slate-200">
                  <span className="text-emerald-400">Event #{edge.from_event}.{edge.from_path}</span>
                  <span className="text-slate-500 mx-1.5">&rarr;</span>
                  <span className="text-cyan-400">Event #{edge.to_event}.{edge.to_field}</span>
                  <span className="text-slate-400 text-[10px] ml-2">({String(edge.value).slice(0, 16)}...)</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skills Catalog */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-blue-400" />
                Compiled Skills Library ({skills.length})
              </h2>
              <p className="text-xs text-slate-400">
                Typed, self-verifying API tools available for browser agent execution and MCP export.
              </p>
            </div>

            <button
              onClick={fetchData}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5"
            >
              <RefreshCw className="w-3 h-3" /> Refresh
            </button>
          </div>

          {loading ? (
            <div className="p-16 text-center text-slate-500 text-sm">Loading skills catalog...</div>
          ) : skills.length === 0 ? (
            <div className="p-16 text-center rounded-2xl bg-[#0c101a] border border-slate-800 text-slate-500 text-sm">
              No skills compiled yet. Record a task in DEHIX-lite with the SayDo SDK and compile it above!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {skills.map((skill) => (
                <div
                  key={skill.id}
                  className={`p-6 rounded-2xl bg-[#0c101a] border transition-all flex flex-col justify-between gap-5 shadow-lg ${
                    skill.status === 'disabled'
                      ? 'border-slate-800/60 opacity-60'
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex flex-col gap-3">
                    {/* Card Top: Method, Name, Version, Status */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`font-mono text-[11px] font-bold px-2.5 py-0.5 rounded-md ${
                            skill.method === 'GET'
                              ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          }`}
                        >
                          {skill.method}
                        </span>
                        <h3 className="font-bold text-white text-base">{skill.title || skill.name}</h3>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                          v{skill.version || 1}
                        </span>
                      </div>

                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${
                          skill.status === 'active'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {skill.status}
                      </span>
                    </div>

                    {/* Endpoint Path */}
                    <div className="font-mono text-xs text-slate-300 bg-slate-900/60 px-3 py-1.5 rounded-lg border border-slate-800/80">
                      {skill.path}
                    </div>

                    {/* Write Action & Verification Badges */}
                    <div className="flex flex-wrap items-center gap-2 text-[11px]">
                      {skill.is_write && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium">
                          <Zap className="w-3 h-3" />
                          Write Action (Requires Confirm)
                        </span>
                      )}
                      {skill.verify_with && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-mono">
                          ✓ Verify with: {skill.verify_with}
                        </span>
                      )}
                      {skill.depends_on && skill.depends_on.length > 0 && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-mono">
                          <Link2 className="w-3 h-3" />
                          Depends on: {skill.depends_on.join(', ')}
                        </span>
                      )}
                    </div>

                    {/* Inputs Chips */}
                    {skill.inputs && Object.keys(skill.inputs).length > 0 && (
                      <div>
                        <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                          Inputs
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {Object.entries(skill.inputs).map(([key, param]: [string, any]) => (
                            <span
                              key={key}
                              className="font-mono text-[11px] px-2 py-0.5 rounded-md bg-slate-900 text-slate-300 border border-slate-800"
                            >
                              {key}: <span className="text-blue-400">{param.type || 'any'}</span>
                              {param.required && <span className="text-rose-400 ml-0.5">*</span>}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Outputs */}
                    {skill.outputs && Object.keys(skill.outputs).length > 0 && (
                      <div>
                        <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                          Outputs
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {Object.entries(skill.outputs).map(([key, type]: [string, any]) => (
                            <span
                              key={key}
                              className="font-mono text-[11px] px-2 py-0.5 rounded-md bg-slate-900/40 text-emerald-400 border border-emerald-900/30"
                            >
                              {key}: {type}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Owner Narration Quote & Voice Badge */}
                    {skill.narration && (
                      <div className="text-xs bg-slate-900/60 p-3 rounded-xl border border-slate-800/80 flex flex-col gap-1.5 mt-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
                            Owner Narration
                          </span>
                          {skill.narration_metadata?.source === 'voice' || (!skill.narration_metadata && skill.narration) ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30">
                              🎙️ taught by voice (likely dictated)
                              {skill.narration_metadata?.words ? ` · ${skill.narration_metadata.words}w` : ''}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                              ⌨️ typed {skill.narration_metadata?.words ? ` · ${skill.narration_metadata.words}w` : ''}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-300 italic leading-relaxed">
                          &ldquo;{skill.narration}&rdquo;
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Card Actions */}
                  <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
                    <button
                      onClick={() => setSelectedJsonSkill(skill)}
                      className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 font-medium"
                    >
                      <FileCode className="w-3.5 h-3.5" />
                      View JSON Schema
                    </button>

                    <button
                      onClick={() => handleToggleSkill(skill.id, skill.status)}
                      className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg border font-medium transition-all ${
                        skill.status === 'active'
                          ? 'text-slate-400 hover:text-rose-400 border-slate-800 hover:border-rose-900/50'
                          : 'text-emerald-400 border-emerald-900/50 hover:bg-emerald-500/10'
                      }`}
                    >
                      <Power className="w-3 h-3" />
                      {skill.status === 'active' ? 'Disable' : 'Enable'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* View JSON Modal */}
      {selectedJsonSkill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-[#0b0f19] border border-slate-700 shadow-2xl p-6 flex flex-col gap-4 max-h-[85vh]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FileCode className="w-4 h-4 text-blue-400" />
                Typed Skill Definition ({selectedJsonSkill.name})
              </h3>
              <button onClick={() => setSelectedJsonSkill(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <pre className="p-4 rounded-xl bg-black/60 border border-slate-800 font-mono text-xs text-emerald-300 overflow-auto flex-1">
              {JSON.stringify(selectedJsonSkill, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {/* Supabase Auth Email Magic Link Modal */}
      {isAuthOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-[#0f172a] border border-slate-700 shadow-2xl p-6 flex flex-col gap-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Mail className="w-5 h-5 text-blue-400" />
                Supabase Auth (Magic Link)
              </h3>
              <button onClick={() => setIsAuthOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {authSent ? (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex flex-col gap-2">
                <div className="font-semibold text-sm">Magic link sent!</div>
                <p>Check your inbox at <code>{authEmail}</code>. You are authenticated as an org owner.</p>
                <button
                  onClick={() => { setIsAuthOpen(false); setAuthSent(false); }}
                  className="mt-2 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold self-start"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleMagicLink} className="flex flex-col gap-4">
                <p className="text-xs text-slate-400">
                  Enter your email to receive an instant magic link login for SayDo Studio multi-tenant organizations.
                </p>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="arpit@dehix.org"
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAuthOpen(false)}
                    className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-all"
                  >
                    Send Magic Link
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
