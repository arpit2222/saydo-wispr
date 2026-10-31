'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Plug,
  Copy,
  Check,
  Layers,
  ShieldAlert,
  Compass,
  Activity,
  Code2,
  ExternalLink,
  ChevronDown,
  Terminal,
  Globe,
  Sparkles,
  Cpu,
  BarChart3,
  RotateCcw,
  Mic
} from 'lucide-react';
import { SkillDefinition } from '@saydo/shared';

export default function IntegrationsPage() {
  const [skills, setSkills] = useState<SkillDefinition[]>([]);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [copiedWebMcp, setCopiedWebMcp] = useState(false);
  const [copiedSdk, setCopiedSdk] = useState(false);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
  const mcpEndpointUrl = `${apiUrl}/mcp`;

  useEffect(() => {
    fetch(`${apiUrl}/v1/skills?publicKey=pk_demo_dehix`)
      .then((res) => res.json())
      .then((data) => setSkills(data.skills || []))
      .catch((err) => console.error('Failed to load skills:', err));
  }, [apiUrl]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(id);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const claudeDesktopConfig = JSON.stringify(
    {
      mcpServers: {
        'saydo-dehix': {
          command: 'npx',
          args: ['-y', '@modelcontextprotocol/server-fetch', mcpEndpointUrl],
          env: {
            X_API_KEY: 'pk_demo_dehix',
          },
        },
      },
    },
    null,
    2
  );

  const streamableHttpConfig = JSON.stringify(
    {
      mcpServers: {
        'saydo-dehix': {
          url: mcpEndpointUrl,
          headers: {
            'x-api-key': 'pk_demo_dehix',
          },
        },
      },
    },
    null,
    2
  );

  const generateWebMcpSnippet = () => {
    const toolRegistrations = skills
      .filter((s) => s.status !== 'disabled')
      .map((skill) => {
        const inputProps: Record<string, any> = {};
        if (skill.inputs) {
          for (const [k, v] of Object.entries<any>(skill.inputs)) {
            inputProps[k] = { type: v.type, description: v.description || k };
          }
        }
        if (skill.is_write) {
          inputProps['confirm'] = { type: 'boolean', description: 'User confirmed execution' };
        }

        return `  // Register tool: ${skill.name}
  window.modelContextProtocol?.registerTool({
    name: ${JSON.stringify(skill.name)},
    description: ${JSON.stringify(skill.description || skill.title)},
    inputSchema: ${JSON.stringify({ type: 'object', properties: inputProps }, null, 4).replace(/\n/g, '\n    ')},
    execute: async (args) => {
      console.log('[WebMCP] Executing ${skill.name}', args);
      return await window.saydoSDK?.executeSkill(${JSON.stringify(skill.name)}, args);
    }
  });`;
      })
      .join('\n\n');

    return `/**
 * SayDo WebMCP In-Page Agent Tools Registration
 * (Chrome WebMCP / Model Context Protocol Origin Trial)
 * EXPERIMENTAL: For use with Chrome origin-trial flags enabled.
 */
(function registerSayDoWebMcpTools() {
  if (typeof window === 'undefined') return;

  console.log('[SayDo WebMCP] Registering in-browser agent tools...');

${toolRegistrations}

  console.log('[SayDo WebMCP] ${skills.length} tools successfully registered with browser agent runtime.');
})();`;
  };

  const sdkScriptSnippet = `<script
  data-app="pk_demo_dehix"
  data-api="${apiUrl}"
  src="http://localhost:3000/sdk.js"
  async
></script>`;

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
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  Universal Exports
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
          className="px-4 py-3 text-xs font-semibold text-purple-400 border-b-2 border-purple-500 flex items-center gap-2 whitespace-nowrap"
        >
          <Plug className="w-4 h-4 text-purple-400" />
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
        {/* Hero Card */}
        <section className="p-6 rounded-2xl bg-gradient-to-r from-purple-950/20 via-[#0c101a] to-blue-950/20 border border-purple-900/30 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col gap-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1.5">
                <Plug className="w-3 h-3" />
                Model Context Protocol (MCP)
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Streamable HTTP
              </span>
            </div>
            <h1 className="text-xl font-bold text-white">Universal Agent Integration & Exports</h1>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every voice-recorded skill in SayDo automatically exports into standard Model Context Protocol (MCP) tools for Claude Desktop, Cursor, and any external agent, as well as in-browser WebMCP tools for Chrome's origin trial.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col gap-1 text-right">
            <span className="text-[11px] text-slate-400">Exposed MCP Tools</span>
            <span className="text-2xl font-black text-purple-400">{skills.filter((s) => s.status !== 'disabled').length}</span>
            <span className="text-[10px] text-slate-500">Dual-layer guardrails enforced</span>
          </div>
        </section>

        {/* Section 1: MCP Server Endpoint & Claude Desktop Config */}
        <section className="p-6 rounded-2xl bg-[#0c101a] border border-slate-800 shadow-xl flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <Terminal className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white">Model Context Protocol (MCP) Server</h2>
                <p className="text-xs text-slate-400">Official TypeScript MCP SDK over Streamable HTTP at /mcp</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <code className="text-xs font-mono text-purple-300 bg-purple-950/40 border border-purple-500/30 px-3 py-1.5 rounded-lg">
                {mcpEndpointUrl}
              </code>
              <button
                onClick={() => copyToClipboard(mcpEndpointUrl, 'endpoint')}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                title="Copy Endpoint URL"
              >
                {copiedSection === 'endpoint' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Claude Desktop Config */}
            <div className="flex flex-col gap-2 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200">Claude Desktop Config (claude_desktop_config.json)</span>
                <button
                  onClick={() => copyToClipboard(claudeDesktopConfig, 'claude')}
                  className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 font-semibold"
                >
                  {copiedSection === 'claude' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSection === 'claude' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <pre className="text-[11px] font-mono text-slate-300 p-3 rounded-lg bg-[#070b13] border border-slate-800/80 overflow-x-auto leading-relaxed">
                {claudeDesktopConfig}
              </pre>
            </div>

            {/* Remote Streamable HTTP Config */}
            <div className="flex flex-col gap-2 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200">Direct Streamable HTTP (Cursor / Remote MCP)</span>
                <button
                  onClick={() => copyToClipboard(streamableHttpConfig, 'remote')}
                  className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 font-semibold"
                >
                  {copiedSection === 'remote' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSection === 'remote' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <pre className="text-[11px] font-mono text-slate-300 p-3 rounded-lg bg-[#070b13] border border-slate-800/80 overflow-x-auto leading-relaxed">
                {streamableHttpConfig}
              </pre>
            </div>
          </div>
        </section>

        {/* Section 2: WebMCP In-Page Agent Tools Snippet */}
        <section className="p-6 rounded-2xl bg-[#0c101a] border border-slate-800 shadow-xl flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-white">WebMCP In-Page Agent Tools Registration</h2>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    EXPERIMENTAL: Chrome Origin Trial
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Registers SayDo skills into window.modelContextProtocol / navigator.agentTools for in-browser agents
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                copyToClipboard(generateWebMcpSnippet(), 'webmcp');
                setCopiedWebMcp(true);
                setTimeout(() => setCopiedWebMcp(false), 2000);
              }}
              className="px-3 py-1.5 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/30 text-cyan-300 text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              {copiedWebMcp ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedWebMcp ? 'Snippet Copied' : 'Generate & Copy WebMCP'}</span>
            </button>
          </div>

          <pre className="text-[11px] font-mono text-slate-300 p-4 rounded-xl bg-[#070b13] border border-slate-800/80 overflow-x-auto leading-relaxed max-h-72">
            {generateWebMcpSnippet()}
          </pre>
        </section>

        {/* Section 3: Embed SDK Script */}
        <section className="p-6 rounded-2xl bg-[#0c101a] border border-slate-800 shadow-xl flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Code2 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white">Embeddable SDK Script Tag</h2>
                <p className="text-xs text-slate-400">Inject once into any HTML page to mount the voice recorder and Ask Agent widget</p>
              </div>
            </div>

            <button
              onClick={() => {
                copyToClipboard(sdkScriptSnippet, 'sdk');
                setCopiedSdk(true);
                setTimeout(() => setCopiedSdk(false), 2000);
              }}
              className="px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              {copiedSdk ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSdk ? 'Tag Copied' : 'Copy <script> Tag'}</span>
            </button>
          </div>

          <pre className="text-xs font-mono text-emerald-300 p-3 rounded-xl bg-[#070b13] border border-slate-800/80 overflow-x-auto">
            {sdkScriptSnippet}
          </pre>
        </section>
      </main>
    </div>
  );
}
