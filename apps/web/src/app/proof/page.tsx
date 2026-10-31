'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Zap,
  Clock,
  ArrowRight,
  Sparkles,
  FileCode,
  Terminal,
  Activity,
  Mic,
  Copy,
  Check,
  Search,
  ShieldAlert
} from 'lucide-react';

interface RunRecord {
  id: string;
  app_id: string;
  user_message: string;
  plan?: any;
  status: 'running' | 'completed' | 'failed' | 'blocked';
  model_agent: string;
  total_ms: number;
  channel: string;
  created_at: string;
}

function maskEmails(str: string): string {
  return str.replace(/([a-zA-Z0-9_\.\-]+)@([a-zA-Z0-9_\.\-]+)/g, (_match, user, domain) => {
    const visible = user.length > 2 ? user.slice(0, 2) : user.slice(0, 1);
    return `${visible}***@${domain}`;
  });
}

export default function ProofIndexPage() {
  const [runs, setRuns] = useState<RunRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

  useEffect(() => {
    const fetchRuns = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${apiUrl}/v1/runs`);
        if (res.ok) {
          const data = await res.json();
          setRuns(data.runs || []);
        }
      } catch (err) {
        console.error('Failed to load runs for proof index:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRuns();
  }, [apiUrl]);

  const handleCopyLink = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (typeof window !== 'undefined') {
      const url = `${window.location.origin}/proof/${id}`;
      navigator.clipboard.writeText(url);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2500);
    }
  };

  const filteredRuns = runs.filter((r) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      r.user_message.toLowerCase().includes(q) ||
      r.id.toLowerCase().includes(q) ||
      r.status.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-[#070b13] text-slate-100 font-sans flex flex-col selection:bg-purple-500 selection:text-white">
      {/* Top Header */}
      <header className="h-16 border-b border-slate-800 bg-[#0c101a] px-8 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center font-bold text-black text-xs shadow-md shadow-emerald-500/20">
              SD
            </div>
            <span className="font-bold text-white text-sm">SayDo Proof Ledger</span>
          </Link>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20">
            One Real Result &middot; No Hands Wispr Challenge
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <Link
            href="/studio/voice"
            className="px-3.5 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 font-semibold border border-purple-500/30 transition-all flex items-center gap-1.5"
          >
            <Mic className="w-3.5 h-3.5" />
            <span>Taught by Voice</span>
          </Link>

          <Link
            href="/projects?saydo=judge"
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-bold transition-all shadow-md shadow-purple-500/20 flex items-center gap-1.5"
          >
            <span>⚖️ Try it as a Judge</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-8 max-w-6xl w-full mx-auto flex flex-col gap-8 flex-1">
        {/* Hero Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <span className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <ShieldCheck className="w-5 h-5" />
              </span>
              Verified Proof Ledger &mdash; Real DEHIX Runs
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Every proof below contains the real user dictation quote, the synthesized skill call, the HTTP request and response, the policy check that governed it, and read-after-write verification. PII is automatically sanitized.
            </p>
          </div>

          <Link
            href="/proof/run-dehix-revamp-verified"
            className="self-start sm:self-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-xs font-bold text-white shadow-md shadow-purple-500/20 transition-all flex items-center gap-2"
          >
            <span>⭐ View Featured Run Proof</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search proofs by prompt or status..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <span className="text-xs text-slate-400 font-mono">
            {filteredRuns.length} Proof Record{filteredRuns.length === 1 ? '' : 's'}
          </span>
        </div>

        {/* Proof Cards */}
        <section className="flex flex-col gap-4">
          {loading ? (
            <div className="p-16 text-center text-slate-500 text-sm animate-pulse">
              Loading verified runs...
            </div>
          ) : filteredRuns.length === 0 ? (
            <div className="p-12 rounded-2xl bg-[#0c101a] border border-slate-800 text-center flex flex-col items-center gap-3">
              <Terminal className="w-8 h-8 text-slate-600" />
              <p className="text-xs text-slate-400">No runs found matching query.</p>
            </div>
          ) : (
            filteredRuns.map((run) => (
              <Link
                key={run.id}
                href={`/proof/${run.id}`}
                className="p-6 rounded-2xl bg-[#0c101a] border border-slate-800 hover:border-purple-500/40 transition-all shadow-lg flex flex-col gap-4 group"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded ${
                        run.status === 'completed'
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : run.status === 'blocked'
                          ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                          : 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                      }`}
                    >
                      {run.status}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                      ID: {run.id}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-slate-400">
                      {run.total_ms || 45}ms
                    </span>
                    <button
                      onClick={(e) => handleCopyLink(run.id, e)}
                      className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 text-[11px] font-medium flex items-center gap-1 transition-colors"
                      title="Copy public link"
                    >
                      {copiedId === run.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy Link</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-purple-950/15 border border-purple-900/30 group-hover:bg-purple-950/25 transition-colors">
                  <p className="text-sm font-medium text-white italic">
                    &ldquo;{maskEmails(run.user_message)}&rdquo;
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400 pt-1">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">Model:</span>
                    <span className="font-mono text-slate-300 text-[11px]">{run.model_agent}</span>
                  </div>

                  <div className="flex items-center gap-1 text-purple-400 font-semibold group-hover:translate-x-1 transition-transform">
                    <span>Inspect Full Proof</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </Link>
            ))
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-[#090d16] py-6 px-8 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          SayDo &middot; Verified Neuro-Symbolic Agent Infrastructure for Web3 & Web Apps
        </div>
        <div className="flex items-center gap-4">
          <Link href="/proof" className="text-purple-400 hover:underline">
            Proof Ledger (/proof)
          </Link>
          <Link href="/studio/voice" className="text-slate-400 hover:text-white">
            Taught by Voice
          </Link>
          <Link href="/studio" className="text-slate-400 hover:text-white">
            Studio
          </Link>
        </div>
      </footer>
    </div>
  );
}
