/**
 * State manager: reads .md files, caches parsed state, detects changes
 */

const fs = require('fs');
const path = require('path');
const { parseMarkdownFile, extractMetrics, extractCalendarEntries, extractContacts } = require('./parser');

const STATE_FILES = [
  'goal-definition.md',
  'goal-profile.md',
  'strategy-roadmap.md',
  'progress-tracker.md',
  'content-calendar.md',
  'contacts-network.md',
  'engagement-log.md',
  'profile-audit.md',
  'blockers.md',
  'research-findings.md'
];

class StateManager {
  constructor(workDir) {
    this.workDir = workDir;
    this.cache = null;
    this.cacheTTL = 2000; // 2 seconds
    this.lastParsed = 0;
    this.listeners = [];
  }

  onChange(callback) {
    this.listeners.push(callback);
  }

  notify() {
    this.cache = null; // Invalidate cache
    const state = this.getState();
    for (const cb of this.listeners) {
      try { cb(state); } catch (e) { console.error('State listener error:', e.message); }
    }
  }

  getState() {
    const now = Date.now();
    if (this.cache && (now - this.lastParsed) < this.cacheTTL) {
      return this.cache;
    }

    const files = {};
    const errors = [];

    for (const filename of STATE_FILES) {
      const filePath = path.join(this.workDir, filename);
      const key = filename.replace('.md', '');

      try {
        if (!fs.existsSync(filePath)) {
          continue;
        }
        const content = fs.readFileSync(filePath, 'utf-8');
        files[key] = parseMarkdownFile(content);
      } catch (e) {
        errors.push({ file: filename, error: e.message });
      }
    }

    // Build enriched state
    const state = {
      goalDefined: !!files['goal-definition'],
      files,
      metrics: files['progress-tracker'] ? extractMetrics(files['progress-tracker']) : {},
      calendar: files['content-calendar'] ? extractCalendarEntries(files['content-calendar']) : [],
      contacts: files['contacts-network'] ? extractContacts(files['contacts-network']) : {},
      errors,
      parsedAt: new Date().toISOString()
    };

    this.cache = state;
    this.lastParsed = now;
    return state;
  }

  getFile(filename) {
    const key = filename.replace('.md', '');
    const filePath = path.join(this.workDir, filename.endsWith('.md') ? filename : filename + '.md');

    try {
      if (!fs.existsSync(filePath)) {
        return null;
      }
      const content = fs.readFileSync(filePath, 'utf-8');
      const stat = fs.statSync(filePath);
      return {
        file: key,
        data: parseMarkdownFile(content),
        rawContent: content,
        mtime: stat.mtimeMs
      };
    } catch (e) {
      return { file: key, error: e.message };
    }
  }
}

module.exports = StateManager;
