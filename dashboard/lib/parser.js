/**
 * Zero-dependency YAML frontmatter + markdown parser
 * Parses .md state files into structured JSON
 */

function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return { meta: {}, body: content };

  const yamlStr = match[1];
  const body = content.slice(match[0].length).trim();
  const meta = {};

  for (const line of yamlStr.split('\n')) {
    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) continue;
    const key = line.slice(0, colonIdx).trim();
    let value = line.slice(colonIdx + 1).trim();
    // Strip quotes
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    meta[key] = value;
  }

  return { meta, body };
}

function parseSections(body) {
  const sections = {};
  const parts = body.split(/^## /m);

  for (const part of parts) {
    if (!part.trim()) continue;
    const newline = part.indexOf('\n');
    if (newline === -1) {
      sections[part.trim()] = '';
      continue;
    }
    const title = part.slice(0, newline).trim();
    const content = part.slice(newline + 1).trim();
    sections[title] = content;
  }

  return sections;
}

function parseTable(tableStr) {
  const lines = tableStr.trim().split('\n').filter(l => l.includes('|'));
  if (lines.length < 2) return [];

  const headers = lines[0].split('|')
    .map(h => h.trim())
    .filter(h => h && !h.match(/^-+$/));

  // Skip separator line (index 1)
  const rows = [];
  for (let i = 2; i < lines.length; i++) {
    const cells = lines[i].split('|')
      .map(c => c.trim())
      .filter(c => c !== '');
    if (cells.length === 0) continue;

    const row = {};
    headers.forEach((h, idx) => {
      row[h.toLowerCase().replace(/\s+/g, '_')] = cells[idx] || '';
    });
    rows.push(row);
  }

  return rows;
}

function parseList(content) {
  return content.split('\n')
    .filter(l => l.match(/^\s*[-*\d.]+\s/))
    .map(l => l.replace(/^\s*[-*\d.]+\s*/, '').trim());
}

function parseMarkdownFile(content) {
  const { meta, body } = parseFrontmatter(content);
  const sections = parseSections(body);

  // Auto-detect tables in sections and parse them
  const parsed = { meta, sections: {} };
  for (const [title, sectionContent] of Object.entries(sections)) {
    if (sectionContent.includes('|') && sectionContent.split('\n').filter(l => l.includes('|')).length >= 3) {
      parsed.sections[title] = {
        raw: sectionContent,
        table: parseTable(sectionContent)
      };
    } else if (sectionContent.match(/^\s*[-*\d.]+\s/m)) {
      parsed.sections[title] = {
        raw: sectionContent,
        list: parseList(sectionContent)
      };
    } else {
      parsed.sections[title] = { raw: sectionContent };
    }
  }

  return parsed;
}

function extractMetrics(progressData) {
  const metrics = {};
  const raw = progressData?.sections?.['Global Metrics']?.raw || '';

  for (const line of raw.split('\n')) {
    const match = line.match(/^-\s*(.+?):\s*(.+)$/);
    if (match) {
      const key = match[1].trim().toLowerCase().replace(/\s+/g, '_');
      let value = match[2].trim();
      // Try parsing numbers
      const num = parseFloat(value);
      if (!isNaN(num) && value.match(/^\d/)) {
        value = num;
      }
      metrics[key] = value;
    }
  }

  return metrics;
}

function extractCalendarEntries(calendarData) {
  const entries = [];
  for (const [title, section] of Object.entries(calendarData?.sections || {})) {
    if (section.table) {
      for (const row of section.table) {
        entries.push({ ...row, week: title });
      }
    }
  }
  return entries;
}

function extractContacts(contactsData) {
  const tiers = {};
  for (const [title, section] of Object.entries(contactsData?.sections || {})) {
    if (section.table && title.toLowerCase().includes('tier')) {
      tiers[title] = section.table;
    }
  }
  return tiers;
}

module.exports = {
  parseFrontmatter,
  parseSections,
  parseTable,
  parseList,
  parseMarkdownFile,
  extractMetrics,
  extractCalendarEntries,
  extractContacts
};
