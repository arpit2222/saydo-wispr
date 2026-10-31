'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, 
  Mic, 
  Trash2, 
  CheckCircle2, 
  X, 
  Sparkles, 
  BookOpen, 
  Cpu, 
  AlertTriangle, 
  HelpCircle,
  ExternalLink,
  ChevronDown,
  Layers,
  ArrowRight,
  Compass,
  Activity,
  Plug,
  BarChart3,
  RotateCcw,
  Terminal
} from 'lucide-react';
import { PolicyRule } from '@saydo/shared';

export default function PoliciesPage() {
  const [policies, setPolicies] = useState<PolicyRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [spokenInput, setSpokenInput] = useState('');
  const [ruleSource, setRuleSource] = useState<'voice' | 'typed'>('typed');
  const [isListening, setIsListening] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const wordCount = spokenInput.trim() ? spokenInput.trim().split(/\s+/).filter(Boolean).length : 0;

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

  const fetchPolicies = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${apiUrl}/v1/policies?publicKey=pk_demo_dehix`);
      if (res.ok) {
        const data = await res.json();
        setPolicies(data.policies || []);
      }
    } catch (err) {
      console.error('Failed to load policies:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicies();
  }, []);

  const handleToggleSpeech = () => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Web Speech API is not supported in this browser. Please type directly into the box.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-IN';
      recognition.interimResults = false;
      recognition.onstart = () => {
        setIsListening(true);
        setRuleSource('voice');
      };
      recognition.onresult = (e: any) => {
        const transcript = e.results[0][0].transcript;
        setRuleSource('voice');
        setSpokenInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognition.start();
    } catch (err) {
      console.warn('Speech error:', err);
      setIsListening(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const nextVal = e.target.value;
    const delta = nextVal.length - spokenInput.length;
    if (delta > 15) {
      setRuleSource('voice');
    }
    setSpokenInput(nextVal);
  };

  const handleParseAndSave = async (ruleText?: string) => {
    const textToSubmit = ruleText || spokenInput;
    if (!textToSubmit.trim()) return;

    const sourceToSend = ruleText ? 'voice' : ruleSource;

    setParsing(true);
    setFeedback(null);

    try {
      const res = await fetch(`${apiUrl}/v1/policies/parse`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          publicKey: 'pk_demo_dehix',
          spoken: textToSubmit,
          source: sourceToSend,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to parse policy');
      }

      setFeedback(`✓ Created ${data.count || 1} policy rule(s) from spoken text!`);
      setSpokenInput('');
      setRuleSource('typed');
      fetchPolicies();
    } catch (err: any) {
      setFeedback(`Error: ${err.message}`);
    } finally {
      setParsing(false);
    }
  };

  const handleDeletePolicy = async (id?: string) => {
    if (!id) return;
    try {
      const res = await fetch(`${apiUrl}/v1/policies/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setPolicies((prev) => prev.filter((p) => p.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete policy:', err);
    }
  };

  const presetRules = [
    'Budget can never exceed 10 lakh',
    'Never invite admins through the assistant',
    'Always ask before rejecting an application',
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
                  Policies & Safety
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
          className="px-4 py-3 text-xs font-semibold text-blue-400 border-b-2 border-blue-500 flex items-center gap-2 whitespace-nowrap"
        >
          <ShieldCheck className="w-4 h-4 text-blue-400" />
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

      <main className="p-8 max-w-7xl w-full mx-auto flex flex-col gap-8 flex-1">
        {/* "Speak a Rule" Hero Box */}
        <section className="p-6 rounded-2xl bg-gradient-to-r from-purple-950/20 via-[#0c101a] to-blue-950/20 border border-purple-900/30 shadow-xl flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  Speak a Rule
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30">
                    🎙️ Works with Wispr Flow
                  </span>
                </h2>
                <p className="text-xs text-slate-400">
                  Dictate natural language business constraints. Nemotron Fast maps them into structured code policies enforced on the server and SDK.
                </p>
              </div>
            </div>

            {/* Hint Chip & Fallback */}
            <div className="flex items-center gap-2 self-start sm:self-auto bg-purple-950/40 border border-purple-800/40 px-3 py-1.5 rounded-xl text-xs text-purple-300">
              <span className="font-medium">✨ Hold Wispr key & talk</span>
              <span className="text-slate-500">|</span>
              <button
                onClick={handleToggleSpeech}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-semibold transition-all ${
                  isListening
                    ? 'bg-rose-500 text-white border-rose-400 animate-pulse'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-700'
                }`}
                title="Browser Web Speech API fallback (en-IN)"
              >
                <Mic className="w-3.5 h-3.5" />
                <span>{isListening ? 'Listening...' : 'Mic Fallback'}</span>
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <textarea
              rows={3}
              value={spokenInput}
              onChange={handleInputChange}
              onPaste={() => setRuleSource('voice')}
              placeholder="Hold your Wispr key and explain this rule like you'd tell a team member (e.g. 'Budget can never exceed 10 lakh')..."
              className="w-full px-4 py-3 rounded-xl bg-slate-900/80 border border-slate-700 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500 leading-relaxed"
            />

            <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
              <span>{wordCount} words</span>
              <span className={ruleSource === 'voice' ? 'text-purple-300 font-semibold' : 'text-slate-500'}>
                {ruleSource === 'voice' ? '🎙️ likely dictated' : '⌨️ typed'}
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] text-slate-500">Quick Presets:</span>
                {presetRules.map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleParseAndSave(preset)}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/60 transition-colors"
                  >
                    "{preset}"
                  </button>
                ))}
              </div>

              <button
                onClick={() => handleParseAndSave()}
                disabled={parsing || !spokenInput.trim()}
                className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-xs font-semibold text-white shadow-md shadow-purple-500/20 transition-all flex items-center gap-2 self-end"
              >
                <span>{parsing ? 'Parsing with Nemotron...' : 'Save Policy Rule'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {feedback && (
            <div className={`p-3.5 rounded-xl text-xs flex items-center justify-between border ${
              feedback.startsWith('Error')
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
            }`}>
              <span>{feedback}</span>
              <button onClick={() => setFeedback(null)}>
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </section>

        {/* Policies Feed */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                Active Enforced Policies ({policies.length})
              </h2>
              <p className="text-xs text-slate-400">
                These rules are evaluated deterministically in the API before returning tool calls, and in the SDK before browser execution.
              </p>
            </div>

            <button onClick={fetchPolicies} className="text-xs text-slate-400 hover:text-white">
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="p-16 text-center text-slate-500 text-sm">Loading policies...</div>
          ) : policies.length === 0 ? (
            <div className="p-16 text-center rounded-2xl bg-[#0c101a] border border-slate-800 text-slate-500 text-sm">
              No policies registered yet. Speak or type a rule above!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {policies.map((p) => (
                <div
                  key={p.id}
                  className="p-5 rounded-2xl bg-[#0c101a] border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between gap-4 shadow-lg"
                >
                  <div className="flex flex-col gap-2.5">
                    {/* Header: Kind, Skill Name, Source Badge */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded-md uppercase ${
                          p.kind === 'block'
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                            : p.kind === 'limit'
                            ? 'bg-purple-500/10 text-purple-400 border border-purple-500/30'
                            : p.kind === 'confirm'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                            : 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                        }`}>
                          {p.kind}
                        </span>

                        <span className="font-mono text-xs text-slate-300 font-semibold">
                          {p.skill_name}
                        </span>
                      </div>

                      {/* Source Badge */}
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                        p.source === 'voice'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : p.source === 'docs'
                          ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                          : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                      }`}>
                        {p.source === 'voice' && <Mic className="w-2.5 h-2.5" />}
                        {p.source === 'docs' && <BookOpen className="w-2.5 h-2.5" />}
                        {p.source === 'compile' && <Cpu className="w-2.5 h-2.5" />}
                        {p.source}
                      </span>
                    </div>

                    {/* Human Readable Policy Sentence */}
                    <h3 className="font-semibold text-white text-sm leading-snug">
                      {p.message}
                    </h3>

                    {/* Technical Condition */}
                    {p.field && (
                      <div className="font-mono text-[11px] text-slate-400 bg-slate-900/60 px-2.5 py-1 rounded-md border border-slate-800 inline-block self-start">
                        {p.field} {p.op || '=='} {JSON.stringify(p.value)}
                      </div>
                    )}

                    {/* Original Quote */}
                    {p.spoken && (
                      <div className="text-[11px] text-slate-500 italic bg-black/20 p-2 rounded-lg border border-slate-800/40">
                        Quote: "{p.spoken}"
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                    <span className="text-[10px] text-slate-500 font-mono">
                      ID: {p.id?.slice(0, 8)}...
                    </span>

                    <button
                      onClick={() => handleDeletePolicy(p.id)}
                      className="text-slate-500 hover:text-rose-400 p-1 rounded-lg transition-colors"
                      title="Delete Policy"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
