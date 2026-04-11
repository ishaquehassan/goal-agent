/**
 * NET // Intel Network
 * CP2077 table style contacts
 */

function renderNetwork(state) {
  const el = document.getElementById('page-network');
  if (!state.goalDefined) return;

  const tiers = state.contacts || {};
  const engagementData = state.files['engagement-log'] || {};

  let totalEngagements = 0;
  for (const [, section] of Object.entries(engagementData.sections || {})) {
    if (section.table) totalEngagements += section.table.length;
  }

  const totalContacts = Object.values(tiers).reduce((a, t) => a + t.length, 0);
  const tier1Count = Object.entries(tiers).find(([k]) => k.toLowerCase().includes('tier 1'))?.[1]?.length || 0;

  const tierConfig = {
    'tier 1': { label: 'PRIORITY', headerClass: '' },
    'tier 2': { label: 'ACTIVE', headerClass: 'cyan' },
    'tier 3': { label: 'MONITOR', headerClass: 'green' }
  };

  const statusDot = (status) => {
    const s = (status || '').toLowerCase();
    if (s.includes('connected') || s.includes('replied') || s.includes('warm')) return '<div class="cp-dot active"></div>';
    if (s.includes('pending') || s.includes('sent') || s.includes('cooldown')) return '<div class="cp-dot pending"></div>';
    return '<div class="cp-dot cold"></div>';
  };

  el.innerHTML = `
    <h1 class="font-display font-bold text-xl text-white tracking-wider uppercase mb-6">Intel Network</h1>

    <div class="cp-stats">
      <div class="cp-stat"><div class="cp-stat-value">${totalContacts}</div><div class="cp-stat-label">Total Assets</div></div>
      <div class="cp-stat"><div class="cp-stat-value red">${tier1Count}</div><div class="cp-stat-label">Priority</div></div>
      <div class="cp-stat"><div class="cp-stat-value">${totalEngagements}</div><div class="cp-stat-label">Engagements</div></div>
      <div class="cp-stat"><div class="cp-stat-value green">${Object.keys(tiers).length}</div><div class="cp-stat-label">Tiers</div></div>
    </div>

    ${Object.entries(tiers).map(([tierName, contacts]) => {
      const tierKey = tierName.toLowerCase();
      const config = Object.entries(tierConfig).find(([k]) => tierKey.includes(k))?.[1] || tierConfig['tier 3'];

      return `
        <div class="cp-section">
          <div class="cp-section-header ${config.headerClass}">${escapeHtml(tierName).toUpperCase()} <span class="cp-count">${contacts.length} ASSETS</span></div>
          ${contacts.length ? `
            <table class="cp-table">
              <thead>
                <tr>
                  <th style="width: 20px"></th>
                  ${Object.keys(contacts[0]).map(h => `<th>${escapeHtml(h.replace(/_/g, ' '))}</th>`).join('')}
                </tr>
              </thead>
              <tbody>
                ${contacts.map(contact => {
                  const statusVal = Object.entries(contact).find(([k]) => k.toLowerCase().includes('status'))?.[1] || '';
                  return `
                    <tr>
                      <td>${statusDot(statusVal)}</td>
                      ${Object.entries(contact).map(([key, val]) => {
                        const isName = key.toLowerCase().includes('name');
                        const isStatus = key.toLowerCase().includes('status');
                        let style = '';
                        if (isName) style = 'color: white; font-weight: 600;';
                        if (isStatus) {
                          const s = (val || '').toLowerCase();
                          if (s.includes('connected') || s.includes('replied') || s.includes('warm')) style = 'color: #3dd83d';
                          else if (s.includes('pending') || s.includes('sent') || s.includes('cooldown')) style = 'color: #00d4ff';
                          else style = 'color: #6a6a78';
                        }
                        return `<td style="${style}">${escapeHtml(val)}</td>`;
                      }).join('')}
                    </tr>`;
                }).join('')}
              </tbody>
            </table>
          ` : '<div class="py-4 text-center text-xs font-mono text-cp-dim">NO ASSETS IN THIS TIER</div>'}
        </div>
      `;
    }).join('')}

    ${Object.keys(tiers).length === 0 ? `
      <div class="cp-section">
        <div class="cp-section-header">NO INTEL ASSETS TRACKED</div>
        <div class="py-6 font-mono text-xs text-cp-dim">Run /goal:contacts to manage your network</div>
      </div>
    ` : ''}
  `;
}
