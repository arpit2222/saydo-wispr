'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { 
  FolderPlus, 
  UserPlus, 
  Coins, 
  Briefcase, 
  Users, 
  CheckCircle2, 
  X, 
  AlertCircle,
  ExternalLink 
} from 'lucide-react';
import { Project } from '@/lib/dehix-store';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  // New Project Modal State
  const [isNewProjectOpen, setIsNewProjectOpen] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [projectBudget, setProjectBudget] = useState('200000');
  const [projectDesc, setProjectDesc] = useState('');
  const [projectSubmitting, setProjectSubmitting] = useState(false);
  const [projectError, setProjectError] = useState<string | null>(null);

  // Invite Member Modal State
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'viewer' | 'editor' | 'admin'>('editor');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [inviteSubmitting, setInviteSubmitting] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);

  // Notification Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/dehix/projects');
      const data = await res.json();
      if (data.projects) {
        setProjects(data.projects);
        if (data.projects.length > 0 && !selectedProjectId) {
          setSelectedProjectId(data.projects[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to load projects:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();

    const handleSayDoChange = () => {
      fetchProjects();
    };

    window.addEventListener('saydo:changed', handleSayDoChange);
    return () => {
      window.removeEventListener('saydo:changed', handleSayDoChange);
    };
  }, []);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setProjectSubmitting(true);
    setProjectError(null);

    try {
      const res = await fetch('/api/dehix/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: projectName,
          budget: Number(projectBudget),
          description: projectDesc,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create project');
      }

      setToastMessage(`Project "${data.project.name}" created successfully!`);
      setIsNewProjectOpen(false);
      setProjectName('');
      setProjectBudget('200000');
      setProjectDesc('');
      fetchProjects();
    } catch (err: any) {
      setProjectError(err.message);
    } finally {
      setProjectSubmitting(false);
    }
  };

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteSubmitting(true);
    setInviteError(null);

    try {
      const res = await fetch('/api/dehix/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: selectedProjectId,
          email: inviteEmail,
          role: inviteRole,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to invite member');
      }

      setToastMessage(`Invited ${data.member.email} as ${data.member.role}!`);
      setIsInviteOpen(false);
      setInviteEmail('');
      setInviteRole('editor');
    } catch (err: any) {
      setInviteError(err.message);
    } finally {
      setInviteSubmitting(false);
    }
  };

  const totalBudget = projects.reduce((acc, p) => acc + (p.budget || 0), 0);

  return (
    <div className="flex min-h-screen bg-[#080c14] text-slate-100 font-sans">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Header title="Projects Management" />

        <main className="p-8 max-w-7xl w-full mx-auto flex flex-col gap-8">
          {/* Toast Notification */}
          {toastMessage && (
            <div className="flex items-center justify-between p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span>{toastMessage}</span>
              </div>
              <button 
                onClick={() => setToastMessage(null)}
                className="text-emerald-400 hover:text-emerald-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Wispr Hackathon Judge Quick-Guide */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/40 via-indigo-950/30 to-slate-900 border border-purple-500/30 text-xs text-slate-300 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/40 flex items-center justify-center font-bold text-base shrink-0">
                🎙️
              </div>
              <div>
                <span className="font-bold text-white text-sm">Wispr Challenge 60-Second Test:</span>
                <p className="text-slate-400 text-xs">
                  Click the bottom right <span className="text-purple-300 font-semibold">&ldquo;SayDo Agent&rdquo;</span> button &rarr; click <span className="text-purple-300 font-semibold">&ldquo;● Record Task&rdquo;</span> &rarr; speak aloud with <span className="text-purple-300 font-semibold">Wispr Flow</span> &rarr; create a project &rarr; view the compiled skill in <a href="/studio" className="underline text-emerald-400 font-semibold">Studio</a>!
                </p>
              </div>
            </div>
            <a
              href="/studio"
              className="px-3 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 border border-purple-500/40 font-semibold whitespace-nowrap transition-colors shrink-0"
            >
              Open Studio &rarr;
            </a>
          </div>

          {/* Action Header & Summary Stats */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-white">Active Projects</h2>
              <p className="text-sm text-slate-400">
                Manage talent grants, track allocated budgets, and collaborate with team leads.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsInviteOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-sm font-semibold text-slate-200 transition-colors shadow-sm"
              >
                <UserPlus className="w-4 h-4" />
                Invite Member
              </button>
              <button
                onClick={() => setIsNewProjectOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-sm font-semibold text-white transition-all shadow-md shadow-blue-500/20"
              >
                <FolderPlus className="w-4 h-4" />
                New Project
              </button>
            </div>
          </div>

          {/* Metrics Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="p-5 rounded-2xl bg-[#0d121f] border border-slate-800/80 flex items-center justify-between">
              <div>
                <span className="text-xs font-medium text-slate-400">Total Projects</span>
                <div className="text-2xl font-bold text-white mt-1">{projects.length}</div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <Briefcase className="w-5 h-5" />
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[#0d121f] border border-slate-800/80 flex items-center justify-between">
              <div>
                <span className="text-xs font-medium text-slate-400">Total Allocated Budget</span>
                <div className="text-2xl font-bold text-white mt-1">
                  ₹{totalBudget.toLocaleString('en-IN')}
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Coins className="w-5 h-5" />
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[#0d121f] border border-slate-800/80 flex items-center justify-between">
              <div>
                <span className="text-xs font-medium text-slate-400">Active Contributors</span>
                <div className="text-2xl font-bold text-white mt-1">12</div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <Users className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Projects Table */}
          <div className="rounded-2xl border border-slate-800 bg-[#0d121f] overflow-hidden shadow-xl">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-semibold text-slate-200 text-sm">All Platform Projects</h3>
              <span className="text-xs text-slate-500 font-mono">
                Auto-synced with /api/dehix/projects
              </span>
            </div>

            {loading ? (
              <div className="p-12 text-center text-slate-500 text-sm">Loading projects...</div>
            ) : projects.length === 0 ? (
              <div className="p-12 text-center text-slate-500 text-sm">No projects found. Create one above!</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-900/60 text-slate-400 text-xs font-semibold uppercase tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="px-6 py-3.5">Project Name</th>
                      <th className="px-6 py-3.5">Description</th>
                      <th className="px-6 py-3.5">Budget (INR)</th>
                      <th className="px-6 py-3.5">Status</th>
                      <th className="px-6 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {projects.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="px-6 py-4 font-medium text-white flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                          {p.name}
                        </td>
                        <td className="px-6 py-4 text-slate-400 max-w-md truncate">
                          {p.description || '—'}
                        </td>
                        <td className="px-6 py-4 font-mono font-semibold text-emerald-400">
                          ₹{Number(p.budget).toLocaleString('en-IN')}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            p.status === 'active'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-slate-800 text-slate-400'
                          }`}>
                            {p.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <a
                            href={`/api/dehix/projects/get?id=${p.id}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 font-mono hover:underline"
                          >
                            inspect <ExternalLink className="w-3 h-3" />
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* New Project Dialog Modal */}
      {isNewProjectOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-[#0f172a] border border-slate-700 shadow-2xl p-6 flex flex-col gap-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <FolderPlus className="w-5 h-5 text-blue-400" />
                Create New Project
              </h3>
              <button 
                onClick={() => setIsNewProjectOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {projectError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{projectError}</span>
              </div>
            )}

            <form onSubmit={handleCreateProject} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Project Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. DeFi Staking Dashboard"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Budget in INR (₹10,000 to ₹10,00,000) *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-slate-400 text-sm">₹</span>
                  <input
                    type="number"
                    required
                    min={10000}
                    max={1000000}
                    step={5000}
                    value={projectBudget}
                    onChange={(e) => setProjectBudget(e.target.value)}
                    className="w-full pl-8 pr-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Enforces platform rule: ₹10,000 minimum up to ₹10,00,000 max.
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Goals, technical stack, milestones..."
                  value={projectDesc}
                  onChange={(e) => setProjectDesc(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewProjectOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={projectSubmitting}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-all disabled:opacity-50"
                >
                  {projectSubmitting ? 'Creating...' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invite Member Dialog Modal */}
      {isInviteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-[#0f172a] border border-slate-700 shadow-2xl p-6 flex flex-col gap-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-indigo-400" />
                Invite Team Member
              </h3>
              <button 
                onClick={() => setIsInviteOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {inviteError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{inviteError}</span>
              </div>
            )}

            <form onSubmit={handleInviteMember} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Select Project
                </label>
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (₹{Number(p.budget).toLocaleString('en-IN')})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Member Email *
                </label>
                <input
                  type="email"
                  required
                  placeholder="collaborator@dehix.org"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Role Permission *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['viewer', 'editor', 'admin'] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setInviteRole(r)}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold capitalize border transition-all ${
                        inviteRole === r
                          ? 'bg-blue-600/20 text-blue-400 border-blue-500/40 ring-1 ring-blue-500/30'
                          : 'bg-slate-900 text-slate-400 border-slate-700 hover:border-slate-600'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-slate-400 mt-1.5">
                  Platform Rule: Admin role invitations can only be issued by verified administrators.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsInviteOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={inviteSubmitting}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-all disabled:opacity-50"
                >
                  {inviteSubmitting ? 'Sending Invite...' : 'Send Invitation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
