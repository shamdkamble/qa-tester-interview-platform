import React, { useState } from 'react';
import { LayoutGrid, Plus, MessageSquare, Send, CheckSquare, Clock, User, Edit2, CheckCircle2, ChevronRight } from 'lucide-react';

export default function TaskFlowApp({ activeBugs, addLog }) {
  const [tasks, setTasks] = useState([
    { id: 1, title: 'QA Build Review', description: 'Review the latest main branch build for regressions.', priority: 'Medium', subtasks: [{ id: 1, text: 'Run Smoke Tests', done: true }, { id: 2, text: 'Inspect Console Logs', done: false }] },
    { id: 2, title: 'Staging Deployment Checklist', description: 'Ensure checklist criteria are fully met.', priority: 'High', subtasks: [{ id: 3, text: 'SSL check', done: false }, { id: 4, text: 'DB sync check', done: false }] }
  ]);

  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'Low' });
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editingTitle, setEditingTitle] = useState('');
  
  const [chatMessages, setChatMessages] = useState([
    { id: 1, sender: 'Alex Johnson', text: 'Hey team, let us review the build before tomorrow.', time: '10:00 AM' },
    { id: 2, sender: 'Jane Doe', text: 'I am auditing the registration validations now.', time: '10:02 AM' }
  ]);
  const [newMessage, setNewMessage] = useState('');

  // Toggle Subtask done
  const handleToggleSubtask = (taskId, subtaskId) => {
    setTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        return {
          ...task,
          subtasks: task.subtasks.map(st => st.id === subtaskId ? { ...st, done: !st.done } : st)
        };
      }
      return task;
    }));
  };

  // Add new task
  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;

    const bugXss = activeBugs.includes('task_xss_desc');

    const createdTask = {
      id: Date.now(),
      title: newTask.title,
      description: newTask.description, // HTML renders directly in UI if XSS enabled
      priority: newTask.priority,
      subtasks: []
    };

    setTasks(prev => [...prev, createdTask]);
    setNewTask({ title: '', description: '', priority: 'Low' });
    addLog('network', 'TaskFlow API', `POST /api/v1/tasks - Created Task "${createdTask.title}"`);
    
    if (bugXss && createdTask.description.includes('<')) {
      addLog('warn', 'TaskFlow XSS', `Rendered unescaped task description containing HTML: "${createdTask.description}"`);
    }
  };

  // Start edit title
  const startEdit = (task) => {
    setEditingTaskId(task.id);
    setEditingTitle(task.title);
  };

  // Save edit title
  const saveEdit = (task) => {
    const bugPriorityReset = activeBugs.includes('task_priority_reset');

    setTasks(prev => prev.map(t => {
      if (t.id === task.id) {
        return {
          ...t,
          title: editingTitle,
          // BUG: resets priority to Low silently during edit title save
          priority: bugPriorityReset ? 'Low' : t.priority 
        };
      }
      return t;
    }));

    setEditingTaskId(null);
    addLog('network', 'TaskFlow API', `PATCH /api/v1/tasks/${task.id} - Updated task title.`);
    
    if (bugPriorityReset) {
      addLog('warn', 'TaskFlow State Glitch', `Task #${task.id} title edited. Priority was silently reset to Low.`);
    }
  };

  // Send chat message
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setChatMessages(prev => [
      ...prev,
      {
        id: Date.now(),
        sender: 'Candidate Tester',
        text: newMessage,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    setNewMessage('');
    addLog('network', 'TaskFlow WS', 'WebSocket Send: chat_msg_broadcast');
  };

  const bugProgress = activeBugs.includes('task_progress_calc');
  const bugScroll = activeBugs.includes('task_scroll_overlap');

  // Calculate progress of Staging Deployment checklist
  const stagingTask = tasks.find(t => t.id === 2);
  const doneCount = stagingTask?.subtasks.filter(st => st.done).length || 0;
  const totalCount = stagingTask?.subtasks.length || 2;
  
  let progressPercentage = Math.round((doneCount / totalCount) * 100);
  if (doneCount === totalCount && bugProgress) {
    progressPercentage = 120; // BUG: calculates as 120% progress
  }

  return (
    <div className="space-y-6">
      {/* App Nav Bar */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-violet-500/20">
            <LayoutGrid className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              TaskFlow Dashboard
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-violet-500/20 text-violet-400 border border-violet-500/30">
                Collaboration Sandbox
              </span>
            </h2>
            <p className="text-xs text-slate-400">Test progress bar logic, state persistence during editing, XSS vulnerability, and chat container scroll limits</p>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tasks Section (2 Cols) */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">Project Task Board</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {tasks.map(task => (
              <div key={task.id} className="glass-panel p-5 rounded-2xl space-y-4 hover:border-violet-500/40 transition">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    {editingTaskId === task.id ? (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={editingTitle}
                          onChange={(e) => setEditingTitle(e.target.value)}
                          className="p-1 glass-input rounded text-xs font-bold font-mono"
                        />
                        <button
                          onClick={() => saveEdit(task)}
                          className="px-2 py-0.5 bg-emerald-600 text-white text-[10px] rounded font-bold"
                        >
                          Save
                        </button>
                      </div>
                    ) : (
                      <h4 className="font-bold text-slate-200 flex items-center gap-2">
                        {task.title}
                        <button onClick={() => startEdit(task)} className="p-0.5 text-slate-500 hover:text-slate-200">
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </h4>
                    )}
                    {/* Render description safely or unescaped for XSS if enabled */}
                    {activeBugs.includes('task_xss_desc') && task.description.includes('<') ? (
                      <div className="text-xs text-slate-400 mt-1" dangerouslySetInnerHTML={{ __html: task.description }} />
                    ) : (
                      <p className="text-xs text-slate-400 mt-1">{task.description}</p>
                    )}
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono shrink-0 ${
                    task.priority === 'High' ? 'badge-critical animate-pulse-glow' :
                    task.priority === 'Medium' ? 'badge-medium' : 'badge-low'
                  }`}>
                    {task.priority}
                  </span>
                </div>

                {/* Subtask checklist */}
                {task.subtasks.length > 0 && (
                  <div className="space-y-2 bg-slate-900/60 p-3 rounded-xl border border-slate-800 text-xs">
                    <span className="font-semibold text-slate-400 block pb-1 border-b border-slate-800">Checklist Actions</span>
                    {task.subtasks.map(st => (
                      <label key={st.id} className="flex items-center gap-2.5 cursor-pointer text-slate-300">
                        <input
                          type="checkbox"
                          checked={st.done}
                          onChange={() => handleToggleSubtask(task.id, st.id)}
                          className="rounded text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className={st.done ? 'line-through text-slate-500' : ''}>{st.text}</span>
                      </label>
                    ))}

                    {/* Progress Bar for Checklist (specifically task 2) */}
                    {task.id === 2 && (
                      <div className="pt-2 space-y-1">
                        <div className="flex justify-between text-[10px] font-mono text-slate-400">
                          <span>Completion Progress:</span>
                          <span className={progressPercentage > 100 ? "text-rose-400 font-bold" : "text-emerald-400"}>
                            {progressPercentage}%
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-300 ${
                              progressPercentage > 100 ? "bg-rose-500 shadow-md shadow-rose-500/50" : "bg-emerald-500"
                            }`}
                            style={{ width: `${Math.min(120, progressPercentage)}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Create Task Form */}
          <form onSubmit={handleAddTask} className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4 text-xs">
            <h4 className="font-bold text-slate-200">Create New Project Task</h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">Task Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Audit checkout CSS"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  className="w-full p-2.5 glass-input rounded-lg"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Priority</label>
                <select
                  value={newTask.priority}
                  onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                  className="w-full p-2.5 glass-input rounded-lg bg-slate-900 text-slate-200"
                >
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Description (HTML Tags Supported)</label>
              <input
                type="text"
                placeholder="e.g. <b>High</b> Priority build review"
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                className="w-full p-2.5 glass-input rounded-lg"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-xl shadow-lg transition flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Add Task
            </button>
          </form>
        </div>

        {/* Live Chat Panel (1 Col) */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">Team Chat Room</h3>

          <div className="glass-panel p-4 rounded-2xl flex flex-col h-96">
            {/* Scroll Container (UI scroll bug if enabled) */}
            <div className={`flex-1 space-y-3 mb-3 pr-1 ${bugScroll ? 'overflow-visible' : 'overflow-y-auto'}`}>
              {chatMessages.map(msg => (
                <div key={msg.id} className="p-2.5 bg-slate-900/80 rounded-xl border border-slate-800 space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-indigo-300 flex items-center gap-1">
                      <User className="w-3 h-3 text-slate-500" /> {msg.sender}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">{msg.time}</span>
                  </div>
                  <p className="text-slate-300 font-sans leading-relaxed">{msg.text}</p>
                </div>
              ))}
            </div>

            {/* Message input */}
            <form onSubmit={handleSendMessage} className="pt-2 border-t border-slate-800 flex gap-2">
              <input
                type="text"
                placeholder="Type team chat message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-1 p-2 glass-input rounded-lg text-xs"
              />
              <button
                type="submit"
                className="p-2 bg-violet-600 hover:bg-violet-500 text-white rounded-lg transition"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
