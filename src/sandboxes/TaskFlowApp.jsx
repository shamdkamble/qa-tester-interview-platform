import React, { useState } from 'react';
import {
  LayoutGrid, Plus, Send, Edit2, User
} from 'lucide-react';

export default function TaskFlowApp({ activeBugs, addLog }) {
  const [tasks, setTasks] = useState([
    {
      id: 1,
      title: 'QA Build Review',
      description: 'Review the latest main branch build for regressions.',
      priority: 'Medium',
      subtasks: [
        { id: 1, text: 'Run Smoke Tests', done: true },
        { id: 2, text: 'Inspect Console Logs', done: false }
      ]
    },
    {
      id: 2,
      title: 'Staging Deployment Checklist',
      description: 'Ensure checklist criteria are fully met.',
      priority: 'High',
      subtasks: [
        { id: 3, text: 'SSL check', done: false },
        { id: 4, text: 'DB sync check', done: false }
      ]
    }
  ]);

  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'Low' });
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editingTitle, setEditingTitle] = useState('');

  const [chatMessages, setChatMessages] = useState([
    { id: 1, sender: 'Alex Johnson', text: 'Hey team, let us review the build before tomorrow.', time: '10:00 AM' },
    { id: 2, sender: 'Jane Doe', text: 'I am auditing the registration validations now.', time: '10:02 AM' }
  ]);
  const [newMessage, setNewMessage] = useState('');

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

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;

    const bugXss = activeBugs.includes('task_xss_desc');
    const createdTask = {
      id: Date.now(),
      title: newTask.title,
      description: newTask.description,
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

  const startEdit = (task) => {
    setEditingTaskId(task.id);
    setEditingTitle(task.title);
  };

  const saveEdit = (task) => {
    const bugPriorityReset = activeBugs.includes('task_priority_reset');

    setTasks(prev => prev.map(t => {
      if (t.id === task.id) {
        return {
          ...t,
          title: editingTitle,
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

  const stagingTask = tasks.find(t => t.id === 2);
  const doneCount = stagingTask?.subtasks.filter(st => st.done).length || 0;
  const totalCount = stagingTask?.subtasks.length || 2;

  let progressPercentage = Math.round((doneCount / totalCount) * 100);
  if (doneCount === totalCount && bugProgress) {
    progressPercentage = 120;
  }

  const priorityBadge = (p) => {
    if (p === 'High') return 'badge-critical';
    if (p === 'Medium') return 'badge-medium';
    return 'badge-low';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="app-chrome">
        <div className="flex items-center gap-3">
          <div className="app-icon bg-gradient-to-br from-violet-600 to-indigo-500">
            <LayoutGrid className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-primary flex flex-wrap items-center gap-2">
              TaskFlow Dashboard
              <span className="badge" style={{ background: 'color-mix(in srgb, #8b5cf6 14%, transparent)', color: '#c4b5fd', border: '1px solid color-mix(in srgb, #8b5cf6 30%, transparent)' }}>
                Collaboration
              </span>
            </h2>
            <p className="text-xs text-secondary">Progress math · edit state · XSS · chat scroll</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <h3 className="section-label">Project Task Board</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 stagger">
            {tasks.map(task => (
              <div key={task.id} className="glass-panel p-5 rounded-2xl space-y-4 hover:border-violet-500/35">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    {editingTaskId === task.id ? (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={editingTitle}
                          onChange={(e) => setEditingTitle(e.target.value)}
                          className="glass-input py-1.5 text-xs font-bold font-mono"
                        />
                        <button type="button" onClick={() => saveEdit(task)} className="btn btn-success py-1.5 px-2.5 text-[10px]">
                          Save
                        </button>
                      </div>
                    ) : (
                      <h4 className="font-bold text-primary flex items-center gap-2">
                        <span className="truncate">{task.title}</span>
                        <button type="button" onClick={() => startEdit(task)} className="p-0.5 text-muted hover:text-primary shrink-0">
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </h4>
                    )}
                    {activeBugs.includes('task_xss_desc') && task.description.includes('<') ? (
                      <div className="text-xs text-secondary mt-1" dangerouslySetInnerHTML={{ __html: task.description }} />
                    ) : (
                      <p className="text-xs text-secondary mt-1 leading-relaxed">{task.description}</p>
                    )}
                  </div>
                  <span className={`badge ${priorityBadge(task.priority)} shrink-0`}>{task.priority}</span>
                </div>

                {task.subtasks.length > 0 && (
                  <div className="space-y-2 surface-muted p-3 rounded-xl text-xs">
                    <span className="font-semibold text-muted block pb-1.5 border-b border-[var(--border)]">Checklist</span>
                    {task.subtasks.map(st => (
                      <label key={st.id} className="flex items-center gap-2.5 cursor-pointer text-secondary hover:text-primary">
                        <input
                          type="checkbox"
                          checked={st.done}
                          onChange={() => handleToggleSubtask(task.id, st.id)}
                          className="rounded accent-indigo-500"
                        />
                        <span className={st.done ? 'line-through text-muted' : ''}>{st.text}</span>
                      </label>
                    ))}

                    {task.id === 2 && (
                      <div className="pt-2 space-y-1.5">
                        <div className="flex justify-between text-[10px] font-mono text-muted">
                          <span>Completion</span>
                          <span className={progressPercentage > 100 ? 'text-rose-400 font-bold' : 'text-emerald-400'}>
                            {progressPercentage}%
                          </span>
                        </div>
                        <div className="progress-track">
                          <div
                            className={`progress-fill ${progressPercentage > 100 ? 'danger' : ''}`}
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

          <form onSubmit={handleAddTask} className="glass-panel p-5 rounded-2xl space-y-4">
            <h4 className="font-bold text-primary text-sm">Create New Task</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-secondary mb-1.5">Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Audit checkout CSS"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  className="glass-input"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-secondary mb-1.5">Priority</label>
                <select
                  value={newTask.priority}
                  onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                  className="glass-input"
                >
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-secondary mb-1.5">Description</label>
              <input
                type="text"
                placeholder="e.g. <b>High</b> priority build review"
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                className="glass-input"
              />
            </div>
            <button type="submit" className="btn btn-violet w-full py-2.5">
              <Plus className="w-4 h-4" /> Add Task
            </button>
          </form>
        </div>

        <div className="space-y-4">
          <h3 className="section-label">Team Chat</h3>
          <div className="glass-panel p-4 rounded-2xl flex flex-col h-96">
            <div className={`flex-1 space-y-2.5 mb-3 pr-1 ${bugScroll ? 'overflow-visible' : 'overflow-y-auto'}`}>
              {chatMessages.map(msg => (
                <div key={msg.id} className="surface-muted rounded-xl p-2.5 space-y-1 text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-indigo-300 flex items-center gap-1 truncate">
                      <User className="w-3 h-3 text-muted shrink-0" /> {msg.sender}
                    </span>
                    <span className="text-[10px] text-muted font-mono shrink-0">{msg.time}</span>
                  </div>
                  <p className="text-secondary leading-relaxed">{msg.text}</p>
                </div>
              ))}
            </div>

            <form onSubmit={handleSendMessage} className="pt-2 border-t border-[var(--border)] flex gap-2">
              <input
                type="text"
                placeholder="Type a message…"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-1 glass-input py-2 text-xs"
              />
              <button type="submit" className="btn btn-violet px-3">
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
