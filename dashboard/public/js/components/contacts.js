/**
 * Network/contacts panel
 */

function renderNetwork(state) {
  const el = document.getElementById('page-network');
  if (!state.goalDefined) return;

  const contactsData = state.files['contacts-network'] || {};
  const tiers = state.contacts || {};
  const engagementData = state.files['engagement-log'] || {};

  // Count engagements
  let totalEngagements = 0;
  for (const [title, section] of Object.entries(engagementData.sections || {})) {
    if (section.table) totalEngagements += section.table.length;
  }

  const tierColors = {
    'tier 1': { bg: 'bg-amber-500/10', border: 'border-amber-500/20', label: 'badge-yellow', icon: '⭐' },
    'tier 2': { bg: 'bg-blue-500/10', border: 'border-blue-500/20', label: 'badge-blue', icon: '🔵' },
    'tier 3': { bg: 'bg-gray-500/10', border: 'border-gray-500/20', label: 'badge-purple', icon: '👤' }
  };

  const statusColor = (status) => {
    const s = (status || '').toLowerCase();
    if (s.includes('connected') || s.includes('replied') || s.includes('warm')) return 'text-green-400';
    if (s.includes('pending') || s.includes('sent') || s.includes('cooldown')) return 'text-yellow-400';
    if (s.includes('cold') || s.includes('no response')) return 'text-gray-500';
    return 'text-gray-400';
  };

  el.innerHTML = `
    <div class="max-w-5xl">
      <h1 class="text-2xl font-bold mb-6">Network</h1>

      <!-- Stats -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div class="glass-card stat-card">
          <div class="stat-value">${Object.values(tiers).reduce((a, t) => a + t.length, 0)}</div>
          <div class="stat-label">Total Contacts</div>
        </div>
        <div class="glass-card stat-card">
          <div class="stat-value">${(tiers['Tier 1'] || tiers['Tier 1: Decision Makers'] || []).length || 0}</div>
          <div class="stat-label">Tier 1</div>
        </div>
        <div class="glass-card stat-card">
          <div class="stat-value">${totalEngagements}</div>
          <div class="stat-label">Engagements</div>
        </div>
        <div class="glass-card stat-card">
          <div class="stat-value">${Object.keys(tiers).length}</div>
          <div class="stat-label">Tiers</div>
        </div>
      </div>

      <!-- Tier tables -->
      ${Object.entries(tiers).map(([tierName, contacts]) => {
        const tierKey = tierName.toLowerCase();
        const color = Object.entries(tierColors).find(([k]) => tierKey.includes(k))?.[1] || tierColors['tier 3'];

        return `
          <div class="glass-card p-5 mb-6">
            <div class="flex items-center gap-2 mb-4">
              <span>${color.icon}</span>
              <h2 class="text-sm font-semibold text-gray-400 uppercase tracking-wide">${escapeHtml(tierName)}</h2>
              <span class="badge ${color.label} ml-auto">${contacts.length}</span>
            </div>
            ${contacts.length ? `
              <table class="data-table">
                <thead>
                  <tr>
                    ${Object.keys(contacts[0]).map(h => `<th>${escapeHtml(h.replace(/_/g, ' '))}</th>`).join('')}
                  </tr>
                </thead>
                <tbody>
                  ${contacts.map(contact => `
                    <tr>
                      ${Object.entries(contact).map(([key, val]) => {
                        const isStatus = key.toLowerCase().includes('status');
                        return `<td class="${isStatus ? statusColor(val) : ''}">${escapeHtml(val)}</td>`;
                      }).join('')}
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            ` : '<p class="text-sm text-gray-500">No contacts in this tier yet.</p>'}
          </div>
        `;
      }).join('')}

      ${Object.keys(tiers).length === 0 ? `
        <div class="glass-card p-8 text-center text-gray-500">
          <p class="text-lg mb-2">👥 No contacts tracked yet</p>
          <p class="text-sm">Run /goal:contacts to manage your network</p>
        </div>
      ` : ''}
    </div>
  `;
}
