/* =========================================================================
   MZ Theme Engine
   Defines 4 full color themes and applies them by overriding the CSS
   custom properties every page already uses (--bg, --blue, --cyan, etc).
   ========================================================================= */

(function (global) {
  const THEMES = {
    midnight: {
      label: 'Midnight Blue',
      swatch: ['#0a0d13', '#3b6bff', '#22d3ee'],
      vars: {
        '--bg': '#0a0d13',
        '--bg-panel': '#10141d',
        '--bg-panel-2': '#141a26',
        '--line': '#212938',
        '--text': '#eef2f8',
        '--text-muted': '#93a0b4',
        '--text-dim': '#5c6779',
        '--blue': '#3b6bff',
        '--blue-soft': '#3b6bff33',
        '--cyan': '#22d3ee',
        '--cyan-soft': '#22d3ee33'
      }
    },
    slate: {
      label: 'Deep Slate',
      swatch: ['#0d1013', '#64748b', '#38bdf8'],
      vars: {
        '--bg': '#0d1013',
        '--bg-panel': '#141820',
        '--bg-panel-2': '#191f29',
        '--line': '#262e3a',
        '--text': '#eef1f5',
        '--text-muted': '#9aa4b2',
        '--text-dim': '#606a78',
        '--blue': '#64748b',
        '--blue-soft': '#64748b33',
        '--cyan': '#38bdf8',
        '--cyan-soft': '#38bdf833'
      }
    },
    cyandark: {
      label: 'Cyan Dark',
      swatch: ['#06110f', '#059669', '#2dd4bf'],
      vars: {
        '--bg': '#06110f',
        '--bg-panel': '#0c1a17',
        '--bg-panel-2': '#0f221e',
        '--line': '#1c3530',
        '--text': '#eafaf5',
        '--text-muted': '#8fb3a8',
        '--text-dim': '#557a70',
        '--blue': '#059669',
        '--blue-soft': '#05966933',
        '--cyan': '#2dd4bf',
        '--cyan-soft': '#2dd4bf33'
      }
    },
    graphite: {
      label: 'Graphite',
      swatch: ['#0c0c0e', '#a3a3a3', '#f59e0b'],
      vars: {
        '--bg': '#0c0c0e',
        '--bg-panel': '#151517',
        '--bg-panel-2': '#1b1b1e',
        '--line': '#2b2b2f',
        '--text': '#f2f2f0',
        '--text-muted': '#a3a3a3',
        '--text-dim': '#6b6b6f',
        '--blue': '#a3a3a3',
        '--blue-soft': '#a3a3a333',
        '--cyan': '#f59e0b',
        '--cyan-soft': '#f59e0b33'
      }
    }
  };

  function applyTheme(key) {
    const theme = THEMES[key] || THEMES.midnight;
    const root = document.documentElement.style;
    Object.entries(theme.vars).forEach(([prop, val]) => root.setProperty(prop, val));
    // gradient uses blue+cyan directly, recompute it too
    root.setProperty('--grad-signal', `linear-gradient(120deg, ${theme.vars['--blue']}, ${theme.vars['--cyan']})`);
    document.documentElement.setAttribute('data-theme', key);
  }

  global.MZTheme = { THEMES, applyTheme };
})(window);
