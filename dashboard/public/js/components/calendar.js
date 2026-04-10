/**
 * Content calendar panel
 */

function renderCalendar(state) {
  const el = document.getElementById('page-calendar');
  if (!state.goalDefined) return;

  const calendarData = state.files['content-calendar'] || {};
  const entries = state.calendar || [];

  // Group by week
  const weeks = {};
  for (const entry of entries) {
    const week = entry.week || 'Unscheduled';
    if (!weeks[week]) weeks[week] = [];
    weeks[week].push(entry);
  }

  // Backlog from sections
  const backlog = [];
  for (const [title, section] of Object.entries(calendarData.sections || {})) {
    if (title.toLowerCase().includes('backlog') && section.list) {
      backlog.push(...section.list);
    }
  }

  const platformColors = {
    'linkedin': 'bg-blue-500/20 text-blue-400 border-blue-500/20',
    'medium': 'bg-purple-500/20 text-purple-400 border-purple-500/20',
    'twitter': 'bg-sky-500/20 text-sky-400 border-sky-500/20',
    'youtube': 'bg-red-500/20 text-red-400 border-red-500/20',
    'github': 'bg-gray-500/20 text-gray-400 border-gray-500/20'
  };

  const statusBadge = (status) => {
    const s = (status || '').toLowerCase();
    if (s.includes('publish')) return '<span class="badge badge-green">Published</span>';
    if (s.includes('draft')) return '<span class="badge badge-yellow">Draft</span>';
    if (s.includes('overdue')) return '<span class="badge badge-red">Overdue</span>';
    return '<span class="badge badge-blue">Planned</span>';
  };

  el.innerHTML = `
    <div class="max-w-5xl">
      <h1 class="text-2xl font-bold mb-6">Content Calendar</h1>

      <!-- Weekly schedules -->
      ${Object.entries(weeks).map(([week, items]) => `
        <div class="glass-card p-5 mb-6">
          <h2 class="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">${escapeHtml(week)}</h2>
          <div class="space-y-3">
            ${items.map(item => {
              const platform = (item.platform || '').toLowerCase();
              const colorClass = platformColors[platform] || 'bg-gray-500/20 text-gray-400 border-gray-500/20';
              return `
                <div class="flex items-center gap-4 p-3 rounded-lg border ${colorClass}">
                  <div class="w-24 text-xs font-medium">${escapeHtml(item.day || '')}</div>
                  <div class="flex-1">
                    <div class="text-sm font-medium text-gray-200">${escapeHtml(item.topic || item.type || '')}</div>
                    <div class="flex items-center gap-2 mt-1">
                      <span class="text-xs text-gray-400">${escapeHtml(item.platform || '')}</span>
                      <span class="text-xs text-gray-500">${escapeHtml(item.type || '')}</span>
                    </div>
                  </div>
                  <div>${statusBadge(item.status)}</div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `).join('')}

      ${Object.keys(weeks).length === 0 ? `
        <div class="glass-card p-8 text-center text-gray-500 mb-6">
          <p class="text-lg mb-2">📅 No content scheduled yet</p>
          <p class="text-sm">Run /goal:calendar to plan your content</p>
        </div>
      ` : ''}

      <!-- Backlog -->
      ${backlog.length ? `
      <div class="glass-card p-5">
        <h2 class="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">Ideas Backlog (${backlog.length})</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
          ${backlog.map((idea, i) => `
            <div class="flex items-start gap-2 p-2 rounded-lg text-sm text-gray-400 hover:bg-white/[0.02]">
              <span class="text-gray-600 font-mono text-xs mt-0.5">${i + 1}.</span>
              <span>${escapeHtml(idea)}</span>
            </div>
          `).join('')}
        </div>
      </div>` : ''}
    </div>
  `;
}
