/**
 * INTEL // Content Pipeline
 * CP2077 clean list rows
 */

function calendarDoIt(type, platform) {
  const p = platform.toLowerCase();
  let cmd = 'write';
  let args = 'article';
  if (type.includes('post') || (p.includes('linkedin') && !type.includes('article'))) args = 'linkedin-post';
  else if (type.includes('cross')) args = 'cross-post';
  location.hash = 'commands';
  setTimeout(() => { if (typeof handleCmdClick === 'function') handleCmdClick(cmd); }, 100);
}

function renderCalendar(state) {
  const el = document.getElementById('page-calendar');
  if (!state.goalDefined) return;

  const calendarData = state.files['content-calendar'] || {};
  const entries = state.calendar || [];

  const weeks = {};
  for (const entry of entries) {
    const week = entry.week || 'Unscheduled';
    if (!weeks[week]) weeks[week] = [];
    weeks[week].push(entry);
  }

  const backlog = [];
  for (const [title, section] of Object.entries(calendarData.sections || {})) {
    if (title.toLowerCase().includes('backlog') && section.list) backlog.push(...section.list);
  }

  const total = entries.length;
  const published = entries.filter(e => (e.status || '').toLowerCase().includes('publish')).length;
  const overdue = entries.filter(e => (e.status || '').toLowerCase().includes('overdue')).length;
  const planned = total - published - overdue;

  const statusBadge = (status) => {
    const s = (status || '').toLowerCase();
    if (s.includes('publish')) return '<span class="cp-badge cp-badge-green">PUBLISHED</span>';
    if (s.includes('overdue')) return '<span class="cp-badge cp-badge-red">OVERDUE</span>';
    if (s.includes('draft')) return '<span class="cp-badge cp-badge-cyan">DRAFT</span>';
    return '<span class="cp-badge cp-badge-dim">PLANNED</span>';
  };

  const platformColor = { 'linkedin': '#0066ff', 'medium': '#e83535', 'twitter': '#00d4ff', 'youtube': '#e83535', 'github': '#6a6a78' };

  el.innerHTML = `
    <h1 class="font-display font-bold text-xl text-white tracking-wider uppercase mb-6">Mission Pipeline</h1>

    <div class="cp-stats">
      <div class="cp-stat"><div class="cp-stat-value">${total}</div><div class="cp-stat-label">Total Ops</div></div>
      <div class="cp-stat"><div class="cp-stat-value green">${published}</div><div class="cp-stat-label">Published</div></div>
      <div class="cp-stat"><div class="cp-stat-value">${planned}</div><div class="cp-stat-label">Planned</div></div>
      <div class="cp-stat"><div class="cp-stat-value red">${overdue}</div><div class="cp-stat-label">Overdue</div></div>
    </div>

    ${Object.entries(weeks).map(([week, items]) => `
      <div class="cp-section">
        <div class="cp-section-header">${escapeHtml(week).toUpperCase()} <span class="cp-count">${items.length} OPS</span></div>
        ${items.map(item => {
          const platform = (item.platform || '').toLowerCase();
          const color = platformColor[platform] || '#6a6a78';
          const isPublished = (item.status || '').toLowerCase().includes('publish');
          return `
            <div class="cp-equip" style="border-left-color: ${color}">
              <div class="flex items-center justify-between">
                <div>
                  <div class="cp-equip-title" style="color: ${color}">${escapeHtml(item.topic || item.type || 'Untitled')}</div>
                  <div class="cp-equip-sub">
                    <span style="color: ${color}">${escapeHtml(item.platform || '')}</span>
                    ${item.day ? ` / ${escapeHtml(item.day)}` : ''}
                    ${item.type ? ` / ${escapeHtml(item.type)}` : ''}
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  ${statusBadge(item.status)}
                  ${!isPublished ? `<button onclick="calendarDoIt('${escapeHtml((item.type || '').toLowerCase())}', '${escapeHtml(item.platform || '')}')" class="cp-btn cyan" style="padding: 3px 10px; font-size: 10px">DO IT</button>` : ''}
                </div>
              </div>
            </div>`;
        }).join('')}
      </div>
    `).join('')}

    ${Object.keys(weeks).length === 0 ? `
      <div class="cp-section">
        <div class="cp-section-header">NO MISSIONS SCHEDULED</div>
        <div class="py-6 font-mono text-xs text-cp-dim">Run /goal:calendar to plan content</div>
      </div>
    ` : ''}

    ${backlog.length ? `
    <div class="cp-section">
      <div class="cp-section-header cyan">IDEAS_BACKLOG <span class="cp-count">${backlog.length}</span></div>
      ${backlog.map((idea, i) => `
        <div class="cp-row">
          <span class="font-mono text-[10px] text-cp-cyan">${String(i + 1).padStart(2, '0')}</span>
          <span class="text-xs text-cp-text font-body">${escapeHtml(idea)}</span>
        </div>
      `).join('')}
    </div>` : ''}
  `;
}
