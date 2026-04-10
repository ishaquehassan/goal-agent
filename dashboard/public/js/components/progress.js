/**
 * Progress & session logs panel
 */

function renderProgress(state) {
  const el = document.getElementById('page-progress');
  if (!state.goalDefined) return;

  const tracker = state.files['progress-tracker'] || {};
  const metrics = state.metrics || {};

  // Parse session logs
  const sessions = [];
  for (const [title, section] of Object.entries(tracker.sections || {})) {
    if (title.toLowerCase().startsWith('session')) {
      const lines = (section.raw || '').split('\n');
      const summary = lines.find(l => l.startsWith('**Summary**'))?.replace('**Summary**:', '').trim() || '';
      const duration = lines.find(l => l.includes('Duration'))?.replace(/.*Duration.*?:\s*/, '').trim() || '';
      const progressGain = lines.find(l => l.includes('Progress gain'))?.replace(/.*Progress gain.*?:\s*/, '').trim() || '';
      const accomplishments = lines.filter(l => l.startsWith('- ')).map(l => l.replace(/^-\s*/, ''));

      sessions.push({ title, summary, duration, progressGain, accomplishments });
    }
  }

  // Milestones from strategy
  const roadmap = state.files['strategy-roadmap'] || {};
  const milestones = [];
  for (const [title, section] of Object.entries(roadmap.sections || {})) {
    if (section.list) {
      for (const item of section.list) {
        const done = item.includes('✅') || item.toLowerCase().includes('done') || item.toLowerCase().includes('complete');
        milestones.push({ text: item.replace(/[✅❌⚠️]/g, '').trim(), done, phase: title });
      }
    }
  }

  el.innerHTML = `
    <div class="max-w-5xl">
      <h1 class="text-2xl font-bold mb-6">Progress</h1>

      <!-- Metrics Row -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div class="glass-card stat-card">
          <div class="stat-value">${metrics.overall_progress || 0}%</div>
          <div class="stat-label">Overall</div>
        </div>
        <div class="glass-card stat-card">
          <div class="stat-value">${metrics.streak || 0} 🔥</div>
          <div class="stat-label">Streak</div>
        </div>
        <div class="glass-card stat-card">
          <div class="stat-value">${sessions.length}</div>
          <div class="stat-label">Sessions</div>
        </div>
        <div class="glass-card stat-card">
          <div class="stat-value">${metrics.days_elapsed || 0}</div>
          <div class="stat-label">Days</div>
        </div>
      </div>

      <!-- Session Log -->
      <div class="glass-card p-5 mb-8">
        <h2 class="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">Session History</h2>
        ${sessions.length === 0 ? '<p class="text-gray-500 text-sm">No sessions logged yet. Use /goal:log to record work.</p>' : ''}
        <div class="space-y-4">
          ${sessions.reverse().map(s => `
            <div class="p-4 rounded-lg bg-white/[0.02] border border-white/5">
              <div class="flex justify-between items-start mb-2">
                <span class="font-medium text-gray-200">${escapeHtml(s.title)}</span>
                <div class="flex gap-2">
                  ${s.duration ? `<span class="badge badge-blue">${escapeHtml(s.duration)}</span>` : ''}
                  ${s.progressGain ? `<span class="badge badge-green">${escapeHtml(s.progressGain)}</span>` : ''}
                </div>
              </div>
              ${s.summary ? `<p class="text-sm text-gray-400 mb-2">${escapeHtml(s.summary)}</p>` : ''}
              ${s.accomplishments.length ? `
                <ul class="text-xs text-gray-500 space-y-1">
                  ${s.accomplishments.slice(0, 5).map(a => `<li class="flex items-start gap-2"><span class="text-green-400 mt-0.5">+</span>${escapeHtml(a)}</li>`).join('')}
                  ${s.accomplishments.length > 5 ? `<li class="text-gray-600">+${s.accomplishments.length - 5} more...</li>` : ''}
                </ul>
              ` : ''}
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Milestones -->
      ${milestones.length ? `
      <div class="glass-card p-5">
        <h2 class="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">Milestones</h2>
        <div class="space-y-2">
          ${milestones.map(m => `
            <div class="flex items-center gap-3 text-sm">
              <span class="${m.done ? 'text-green-400' : 'text-gray-600'}">${m.done ? '✅' : '⬜'}</span>
              <span class="${m.done ? 'text-gray-400 line-through' : 'text-gray-300'}">${escapeHtml(m.text)}</span>
              <span class="text-xs text-gray-600 ml-auto">${escapeHtml(m.phase)}</span>
            </div>
          `).join('')}
        </div>
      </div>` : ''}
    </div>
  `;
}
