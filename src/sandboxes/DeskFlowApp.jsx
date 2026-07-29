import React, { useState } from 'react';
import {
  Users, Shield, RefreshCw, Key, Calendar, CheckCircle, AlertOctagon,
  UserPlus, Server
} from 'lucide-react';

export default function DeskFlowApp({ activeBugs, addLog }) {
  const [activeTab, setActiveTab] = useState('register');

  const [formData, setFormData] = useState({
    fullName: 'Jane Doe',
    email: 'jane.qa@deskflow.io',
    password: 'password123',
    dob: '2030-08-15',
    role: 'QA Automation Engineer'
  });

  const [usersList, setUsersList] = useState([
    { id: 1, name: 'Alex Johnson', email: 'alex@deskflow.io', role: 'Lead QA Engineer', created: '2026-07-20' },
    { id: 2, name: 'Sarah Conner', email: 'sarah@deskflow.io', role: 'DevOps Specialist', created: '2026-07-22' }
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formFeedback, setFormFeedback] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();

    const bugPasswordRule = activeBugs.includes('desk_password_rule');
    const bugDobFuture = activeBugs.includes('desk_dob_future');
    const bugDoubleSubmit = activeBugs.includes('desk_double_submit');

    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(formData.password);
    if (!bugPasswordRule && !hasSpecialChar) {
      setFormFeedback({ type: 'error', text: 'Validation Error: Password must contain at least one special character (!@#$).' });
      addLog('error', 'DeskFlow Form Validation', 'Password validation failed: Missing required special character.');
      return;
    } else if (bugPasswordRule && !hasSpecialChar) {
      addLog('warn', 'DeskFlow Validation Flaw', `Accepted password "${formData.password}" missing special character despite instructions.`);
    }

    const selectedDate = new Date(formData.dob);
    const today = new Date();
    if (!bugDobFuture && selectedDate > today) {
      setFormFeedback({ type: 'error', text: 'Validation Error: Date of Birth cannot be in the future.' });
      addLog('error', 'DeskFlow DOB Validation', `Rejected future Date of Birth: ${formData.dob}`);
      return;
    } else if (bugDobFuture && selectedDate > today) {
      addLog('warn', 'DeskFlow Equivalence Glitch', `Accepted future Date of Birth: ${formData.dob}`);
    }

    if (!bugDoubleSubmit) {
      setIsSubmitting(true);
    } else {
      addLog('warn', 'DeskFlow UI Concurrency', 'Submit button left enabled during async network request!');
    }

    setTimeout(() => {
      const newUser = {
        id: Date.now(),
        name: formData.fullName,
        email: formData.email,
        role: formData.role,
        created: new Date().toISOString().split('T')[0]
      };
      setUsersList(prev => [newUser, ...prev]);
      setFormFeedback({ type: 'success', text: `Account for ${formData.fullName} created successfully!` });
      addLog('network', 'DeskFlow API', `POST /api/v2/users/register - Created user #${newUser.id}`);
      setIsSubmitting(false);
    }, 600);
  };

  const handleSyncCloud = () => {
    const bugConsoleError = activeBugs.includes('desk_console_error');
    if (bugConsoleError) {
      addLog('error', 'Uncaught TypeError', 'Cannot read properties of undefined (reading "syncState") at handleSyncCloud (DeskFlowApp.jsx:78)');
    } else {
      addLog('network', 'DeskFlow Sync', 'POST /api/v2/cloud/sync - Synced 12 records with remote server (HTTP 200 OK)');
    }
  };

  const bugXssEnabled = activeBugs.includes('desk_xss_display');

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="app-chrome">
        <div className="flex items-center gap-3">
          <div className="app-icon bg-gradient-to-br from-indigo-600 to-violet-500">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-primary flex flex-wrap items-center gap-2">
              DeskFlow User Portal
              <span className="badge badge-brand">SaaS Onboarding</span>
            </h2>
            <p className="text-xs text-secondary">Signup validation · double-submit · XSS · console errors</p>
          </div>
        </div>

        <div className="nav-track">
          <button type="button" onClick={() => setActiveTab('register')} className={`nav-pill ${activeTab === 'register' ? 'active' : ''}`}>
            <UserPlus className="w-3.5 h-3.5" /> Signup
          </button>
          <button type="button" onClick={() => setActiveTab('users')} className={`nav-pill ${activeTab === 'users' ? 'active' : ''}`}>
            <Users className="w-3.5 h-3.5" /> Directory ({usersList.length})
          </button>
          <button type="button" onClick={() => setActiveTab('settings')} className={`nav-pill ${activeTab === 'settings' ? 'active' : ''}`}>
            <Server className="w-3.5 h-3.5" /> Settings
          </button>
        </div>
      </div>

      {activeTab === 'register' && (
        <div className="max-w-xl mx-auto glass-panel p-6 rounded-2xl space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
            <h3 className="text-base font-bold text-primary flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400" /> New Account Registration
            </h3>
            <span className="text-[11px] text-muted">Step 1 of 2</span>
          </div>

          {formFeedback && (
            <div className={`alert ${formFeedback.type === 'success' ? 'alert-success' : 'alert-error'}`}>
              {formFeedback.type === 'success'
                ? <CheckCircle className="w-4 h-4 shrink-0" />
                : <AlertOctagon className="w-4 h-4 shrink-0" />}
              <span>{formFeedback.text}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-secondary mb-1.5 flex items-center justify-between">
                <span>Full Name</span>
                <span className="text-[10px] text-muted font-mono font-normal">XSS test surface</span>
              </label>
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="glass-input"
                placeholder="e.g. Jane Doe or <h1>John</h1>"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-secondary mb-1.5">Work Email</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="glass-input"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-secondary mb-1.5 flex items-center gap-1">
                  <Key className="w-3.5 h-3.5 text-indigo-400" /> Password
                </label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="glass-input font-mono"
                />
                <p className="text-[10px] text-muted mt-1.5 leading-relaxed">
                  Must contain at least 8 characters and 1 special character (!@#$).
                </p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-secondary mb-1.5 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-cyan-400" /> Date of Birth
                </label>
                <input
                  type="date"
                  required
                  value={formData.dob}
                  onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                  onClick={(e) => e.target.showPicker && e.target.showPicker()}
                  onFocus={(e) => e.target.showPicker && e.target.showPicker()}
                  className="glass-input cursor-pointer"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-secondary mb-1.5">Job Title</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="glass-input"
              >
                <option>QA Automation Engineer</option>
                <option>Manual QA Intern</option>
                <option>SDET Lead</option>
                <option>Performance & Security Analyst</option>
              </select>
            </div>

            <button type="submit" disabled={isSubmitting} className="btn btn-primary w-full py-3">
              {isSubmitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Create Account & Register'}
            </button>
          </form>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="section-label">Registered Portal Users</h3>
            <span className="text-[11px] text-indigo-400 font-mono">XSS render surface active</span>
          </div>

          <div className="glass-panel rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[var(--bg-muted)] text-muted border-b border-[var(--border)] font-mono">
                  <tr>
                    <th className="p-3 font-semibold">ID</th>
                    <th className="p-3 font-semibold">Full Name</th>
                    <th className="p-3 font-semibold">Email</th>
                    <th className="p-3 font-semibold">Role</th>
                    <th className="p-3 font-semibold">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {usersList.map(u => (
                    <tr key={u.id} className="hover:bg-[var(--bg-muted)] transition">
                      <td className="p-3 font-mono text-muted">#{u.id}</td>
                      <td className="p-3 font-medium text-primary">
                        {bugXssEnabled ? (
                          <div dangerouslySetInnerHTML={{ __html: u.name }} />
                        ) : (
                          <span>{u.name}</span>
                        )}
                      </td>
                      <td className="p-3 text-secondary font-mono">{u.email}</td>
                      <td className="p-3">
                        <span className="badge badge-brand">{u.role}</span>
                      </td>
                      <td className="p-3 text-secondary">{u.created}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="max-w-md mx-auto glass-panel p-6 rounded-2xl space-y-4">
          <h3 className="text-base font-bold text-primary flex items-center gap-2">
            <Server className="w-4 h-4 text-violet-400" /> Cloud Synchronization
          </h3>
          <p className="text-xs text-secondary leading-relaxed">
            Push local candidate user records to the remote staging cloud. Inspect the console after syncing.
          </p>
          <button type="button" onClick={handleSyncCloud} className="btn btn-violet w-full py-2.5">
            <RefreshCw className="w-4 h-4" /> Sync Cloud Data
          </button>
          <p className="text-[11px] text-muted text-center">
            Open the bottom DevTools console after clicking sync.
          </p>
        </div>
      )}
    </div>
  );
}
