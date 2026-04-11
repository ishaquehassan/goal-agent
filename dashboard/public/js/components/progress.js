/**
 * OPS // Session History
 * CP2077 Load Game style list
 */

function renderProgress(state) {
  const el = document.getElementById('page-progress');
  if (!state.goalDefined) return;

  const tracker = state.files['progress-tracker'] || {};
  const metrics = state.metrics || {};

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

  const roadmap = state.files['strategy-roadmap'] || {};
  const milestones = [];
  for (const [title, section] of Object.entries(roadmap.sections || {})) {
    if (section.list) {
      for (const item of section.list) {
        const done = item.includes('\u2705') || item.toLowerCase().includes('done') || item.toLowerCase().includes('complete');
        milestones.push({ text: item.replace(/[\u2705\u274C\u26A0\uFE0F]/g, '').trim(), done, phase: title });
      }
    }
  }

  const progress = metrics.overall_progress || 0;

  el.innerHTML = `
    <h1 class="font-display font-bold text-xl text-white tracking-wider uppercase mb-6">Operations Log</h1>

    <!-- Inline Stats -->
    <div class="cp-stats">
      <div class="cp-stat">
        <div class="cp-stat-value">${progress}%</div>
        <div class="cp-stat-label">Overall</div>
      </div>
      <div class="cp-stat">
        <div class="cp-stat-value red">${metrics.streak || 0}</div>
        <div class="cp-stat-label">Streak</div>
      </div>
      <div class="cp-stat">
        <div class="cp-stat-value">${sessions.length}</div>
        <div class="cp-stat-label">Sessions</div>
      </div>
      <div class="cp-stat">
        <div class="cp-stat-value green">${metrics.days_elapsed || 0}</div>
        <div class="cp-stat-label">Days</div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Session List (Load Game style) -->
      <div class="lg:col-span-2">
        <div class="cp-section">
          <div class="cp-section-header">SESSION_LOG <span class="cp-count">${sessions.length} ENTRIES</span></div>
          ${sessions.length === 0 ? `
            <div class="py-8 text-center font-mono text-sm text-cp-dim">NO SESSIONS RECORDED</div>
          ` : `
            ${sessions.reverse().map((s, i) => `
              <div class="cp-row" style="flex-direction: column; align-items: stretch;">
                <div class="flex items-center justify-between">
                  <span class="cp-row-title">${escapeHtml(s.title)}</span>
                  <div class="flex gap-2">
                    ${s.duration ? `<span class="cp-badge cp-badge-cyan">${escapeHtml(s.duration)}</span>` : ''}
                    ${s.progressGain ? `<span class="cp-badge cp-badge-green">${escapeHtml(s.progressGain)}</span>` : ''}
                  </div>
                </div>
                ${s.summary ? `<div class="font-body text-xs text-cp-text mt-1">${escapeHtml(s.summary)}</div>` : ''}
                ${s.accomplishments.length ? `
                  <div class="mt-2 space-y-1">
                    ${s.accomplishments.slice(0, 5).map(a => `
                      <div class="flex items-start gap-2 text-xs">
                        <span class="text-cp-green font-mono mt-0.5">+</span>
                        <span class="text-cp-dim font-body">${escapeHtml(a)}</span>
                      </div>
                    `).join('')}
                    ${s.accomplishments.length > 5 ? `<div class="text-[10px] font-mono text-cp-dim">+${s.accomplishments.length - 5} more...</div>` : ''}
                  </div>
                ` : ''}
              </div>
            `).join('')}
          `}
        </div>
      </div>

      <!-- Milestones -->
      <div>
        <div class="cp-section">
          <div class="cp-section-header green">MILESTONES</div>
          ${milestones.length === 0 ? `
            <div class="py-6 text-center text-xs font-mono text-cp-dim">NO MILESTONES DEFINED</div>
          ` : `
            ${milestones.map(m => `
              <div class="flex items-start gap-3 py-2">
                <div class="mt-1">
                  ${m.done
                    ? '<div class="cp-dot active"></div>'
                    : '<div class="cp-dot cold"></div>'
                  }
                </div>
                <div>
                  <div class="text-xs font-body ${m.done ? 'text-cp-green' : 'text-cp-text'}">${escapeHtml(m.text).slice(0, 60)}</div>
                  <div class="text-[9px] font-mono text-cp-dim mt-0.5">${escapeHtml(m.phase).replace(/Phase \d+:?\s*/i, 'P')}</div>
                </div>
              </div>
            `).join('')}
          `}
        </div>
      </div>
    </div>
  `;
}
