import React, { useState } from 'react';
import { Users, Shield, RefreshCw, Key, Calendar, Code, CheckCircle, AlertOctagon, UserPlus, Server } from 'lucide-react';

export default function DeskFlowApp({ activeBugs, addLog }) {
  const [activeTab, setActiveTab] = useState('register'); // 'register' | 'users' | 'settings'

  // Registration state
  const [formData, setFormData] = useState({
    fullName: 'Jane Doe',
    email: 'jane.qa@deskflow.io',
    password: 'password123',
    dob: '2030-08-15', // Defaults to future date to test candidate observation
    role: 'QA Automation Engineer'
  });

  const [usersList, setUsersList] = useState([
    { id: 1, name: 'Alex Johnson', email: 'alex@deskflow.io', role: 'Lead QA Engineer', created: '2026-07-20' },
    { id: 2, name: 'Sarah Conner', email: 'sarah@deskflow.io', role: 'DevOps Specialist', created: '2026-07-22' }
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formFeedback, setFormFeedback] = useState(null);

  // Submit Registration
  const handleSubmit = (e) => {
    e.preventDefault();
    
    const bugPasswordRule = activeBugs.includes('desk_password_rule');
    const bugDobFuture = activeBugs.includes('desk_dob_future');
    const bugDoubleSubmit = activeBugs.includes('desk_double_submit');
    const bugXss = activeBugs.includes('desk_xss_display');

    // 1. Password check
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(formData.password);
    if (!bugPasswordRule && !hasSpecialChar) {
      setFormFeedback({ type: 'error', text: 'Validation Error: Password must contain at least one special character (!@#$).' });
      addLog('error', 'DeskFlow Form Validation', 'Password validation failed: Missing required special character.');
      return;
    } else if (bugPasswordRule && !hasSpecialChar) {
      addLog('warn', 'DeskFlow Validation Flaw', `Accepted password "${formData.password}" missing special character despite instructions.`);
    }

    // 2. Future DOB check
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

    // Process user addition
    setTimeout(() => {
      const newUser = {
        id: Date.now(),
        name: formData.fullName, // Raw value stored (will test XSS on render if enabled)
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

  // Sync Cloud Data (Triggers Console Error if bug enabled)
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
    <div className="space-y-6">
      {/* App Nav Bar */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              DeskFlow User Portal
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                SaaS Onboarding Sandbox
              </span>
            </h2>
            <p className="text-xs text-slate-400">Test user signup validations, concurrency multi-submit, XSS sanitization & JS console errors</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => setActiveTab('register')} 
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${activeTab === 'register' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
          >
            <UserPlus className="w-3.5 h-3.5" /> User Signup
          </button>
          <button 
            onClick={() => setActiveTab('users')} 
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${activeTab === 'users' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
          >
            <Users className="w-3.5 h-3.5" /> Directory ({usersList.length})
          </button>
          <button 
            onClick={() => setActiveTab('settings')} 
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${activeTab === 'settings' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
          >
            <Server className="w-3.5 h-3.5" /> Settings & Cloud
          </button>
        </div>
      </div>

      {/* Tab 1: Registration Form */}
      {activeTab === 'register' && (
        <div className="max-w-xl mx-auto glass-panel p-6 rounded-2xl space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400" /> New Account Registration
            </h3>
            <span className="text-[11px] text-slate-400">Step 1 of 2</span>
          </div>

          {formFeedback && (
            <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${formFeedback.type === 'success' ? 'bg-emerald-950/60 border border-emerald-800 text-emerald-300' : 'bg-rose-950/60 border border-rose-800 text-rose-300'}`}>
              {formFeedback.type === 'success' ? <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" /> : <AlertOctagon className="w-4 h-4 text-rose-400 shrink-0" />}
              <span>{formFeedback.text}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 mb-1 font-medium flex items-center justify-between">
                <span>Full Name</span>
                <span className="text-[10px] text-slate-500 font-mono">Test XSS inputs here</span>
              </label>
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full p-2.5 glass-input rounded-lg"
                placeholder="e.g. <h1>John Doe</h1> or Plain Name"
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-1 font-medium">Work Email Address</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full p-2.5 glass-input rounded-lg"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 mb-1 font-medium flex items-center gap-1">
                  <Key className="w-3.5 h-3.5 text-indigo-400" /> Password
                </label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full p-2.5 glass-input rounded-lg font-mono"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  ⚠️ Note: Must contain at least 8 characters and 1 special character (!@#$).
                </p>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-cyan-400" /> Date of Birth
                </label>
                <input
                  type="date"
                  required
                  value={formData.dob}
                  onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                  onClick={(e) => e.target.showPicker && e.target.showPicker()}
                  onFocus={(e) => e.target.showPicker && e.target.showPicker()}
                  className="w-full p-2.5 glass-input rounded-lg text-slate-200 cursor-pointer"
                />
                <p className="text-[10px] text-slate-400 mt-1">Select candidate Date of Birth</p>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 mb-1 font-medium">Job Title / Specialty</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full p-2.5 glass-input rounded-lg bg-slate-900 text-slate-200"
              >
                <option>QA Automation Engineer</option>
                <option>Manual QA Intern</option>
                <option>SDET Lead</option>
                <option>Performance & Security Analyst</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg transition flex items-center justify-center gap-2"
            >
              {isSubmitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Create Account & Register'}
            </button>
          </form>
        </div>
      )}

      {/* Tab 2: Users Directory & XSS Test View */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">Registered Portal Users</h3>
            <span className="text-xs text-indigo-400">XSS Test Sandbox active</span>
          </div>

          <div className="glass-panel rounded-2xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800 font-mono">
                <tr>
                  <th className="p-3">User ID</th>
                  <th className="p-3">Full Name (Render Output)</th>
                  <th className="p-3">Email Address</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Joined Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {usersList.map(u => (
                  <tr key={u.id} className="hover:bg-slate-900/50 transition">
                    <td className="p-3 font-mono text-slate-500">#{u.id}</td>
                    <td className="p-3 font-medium text-slate-200">
                      {/* If XSS bug is enabled, render raw HTML via dangerouslySetInnerHTML to demonstrate vulnerability */}
                      {bugXssEnabled ? (
                        <div dangerouslySetInnerHTML={{ __html: u.name }} />
                      ) : (
                        <span>{u.name}</span>
                      )}
                    </td>
                    <td className="p-3 text-slate-400 font-mono">{u.email}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-indigo-300 text-[11px]">{u.role}</span>
                    </td>
                    <td className="p-3 text-slate-400">{u.created}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Settings & Cloud Sync */}
      {activeTab === 'settings' && (
        <div className="max-w-md mx-auto glass-panel p-6 rounded-2xl space-y-4">
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Server className="w-4 h-4 text-violet-400" /> Cloud Synchronization Settings
          </h3>
          <p className="text-xs text-slate-400">Click below to push local candidate user records to the remote staging cloud server.</p>
          
          <button
            onClick={handleSyncCloud}
            className="w-full py-2.5 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg transition"
          >
            <RefreshCw className="w-4 h-4" /> Sync Cloud Data
          </button>
          
          <p className="text-[11px] text-slate-500 italic text-center">
            (Inspect developer console or bottom simulator after clicking sync)
          </p>
        </div>
      )}
    </div>
  );
}
