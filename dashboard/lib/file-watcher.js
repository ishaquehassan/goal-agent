/**
 * Cross-platform file watcher with debounce
 * Uses fs.watch (macOS/Windows) with fs.watchFile polling fallback (Linux)
 */

const fs = require('fs');
const path = require('path');

class FileWatcher {
  constructor(dir, options = {}) {
    this.dir = dir;
    this.debounceMs = options.debounce || 500;
    this.pattern = options.pattern || /\.md$/;
    this.listeners = [];
    this.timers = {};
    this.watchers = [];
    this.usePolling = options.polling || process.platform === 'linux';
    this.pollInterval = options.pollInterval || 1000;
    this.polledFiles = new Map(); // filename -> mtime
  }

  onChange(callback) {
    this.listeners.push(callback);
  }

  notify(filename) {
    // Debounce per file
    if (this.timers[filename]) {
      clearTimeout(this.timers[filename]);
    }
    this.timers[filename] = setTimeout(() => {
      delete this.timers[filename];
      for (const cb of this.listeners) {
        try { cb(filename); } catch (e) { console.error('Watcher listener error:', e.message); }
      }
    }, this.debounceMs);
  }

  start() {
    if (this.usePolling) {
      this._startPolling();
    } else {
      this._startNative();
    }
  }

  _startNative() {
    try {
      const watcher = fs.watch(this.dir, { persistent: false }, (eventType, filename) => {
        if (filename && this.pattern.test(filename)) {
          this.notify(filename);
        }
      });

      watcher.on('error', (err) => {
        console.error('File watcher error, falling back to polling:', err.message);
        watcher.close();
        this.usePolling = true;
        this._startPolling();
      });

      this.watchers.push(watcher);
    } catch (e) {
      console.error('fs.watch failed, using polling:', e.message);
      this.usePolling = true;
      this._startPolling();
    }
  }

  _startPolling() {
    // Initial scan
    this._scanFiles();

    this._pollTimer = setInterval(() => {
      this._scanFiles();
    }, this.pollInterval);
  }

  _scanFiles() {
    try {
      const files = fs.readdirSync(this.dir).filter(f => this.pattern.test(f));

      for (const file of files) {
        try {
          const filePath = path.join(this.dir, file);
          const stat = fs.statSync(filePath);
          const mtime = stat.mtimeMs;
          const prevMtime = this.polledFiles.get(file);

          if (prevMtime !== undefined && prevMtime !== mtime) {
            this.notify(file);
          }
          this.polledFiles.set(file, mtime);
        } catch (e) {
          // File might have been deleted between readdir and stat
        }
      }
    } catch (e) {
      console.error('Poll scan error:', e.message);
    }
  }

  stop() {
    for (const w of this.watchers) {
      try { w.close(); } catch (e) {}
    }
    this.watchers = [];

    if (this._pollTimer) {
      clearInterval(this._pollTimer);
      this._pollTimer = null;
    }

    for (const key of Object.keys(this.timers)) {
      clearTimeout(this.timers[key]);
    }
    this.timers = {};
  }
}

module.exports = FileWatcher;
