const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', 'osc-frontend', 'src');
const exts = ['.ts', '.tsx', '.js', '.jsx'];

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walk(full);
    else if (exts.includes(path.extname(e.name))) processFile(full);
  }
}

function processFile(file) {
  try {
    const src = fs.readFileSync(file, 'utf8');
    const lines = src.split(/\r?\n/);
    let changed = false;
    const out = lines.filter(l => {
      // Remove lines that contain only a console statement (possibly leading spaces) or that start a statement
      // Match console.log/debug/warn/error with optional whitespace, optional prefix like await or return
      // We'll remove occurrences where console.* appears as a standalone statement or prefixed by await/return
      const trimmed = l.trim();
      const consoleRegex = /(^|[;\s])(console\.(log|debug|warn|error)\s*\(|console\.(log|debug|warn|error)\s*\.)/;
      // Also remove lines that are purely commented console (e.g., // console.log(...))? Not necessary
      if (consoleRegex.test(trimmed)) {
        changed = true;
        return false; // drop the line
      }
      return true;
    }).join('\n');

    if (changed) {
      // backup
      fs.writeFileSync(file + '.bak', src, 'utf8');
      fs.writeFileSync(file, out, 'utf8');
      console.log('Modified', file);
    }
  } catch (err) {
    console.error('ERR processing', file, err.message);
  }
}

walk(ROOT);
console.log('Done');
