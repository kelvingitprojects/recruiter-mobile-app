const light = {
  primary: '#2563eb',
  accent: '#f59e0b',
  success: '#22c55e',
  danger: '#ef4444',
  text: '#111827',
  muted: '#6b7280',
  pillBg: '#f3f4f6',
  chipBg: '#ffffffcc',
  pageBg: '#f5f7fb',
  cardBg: '#ffffff',
  border: '#e5e7eb',
};

const dark = {
  primary: '#0B2340',
  accent: '#1F6FEB',
  success: '#22c55e',
  danger: '#ef4444',
  text: '#E6EDF3',
  muted: '#9aa9bb',
  pillBg: '#0d1b2e',
  chipBg: '#ffffff22',
  pageBg: '#0B2340',
  cardBg: '#162D4B',
  border: '#2a3f5d',
};

const colors = { ...light };

export function applyTheme(mode) {
  const palette = mode === 'dark' ? dark : light;
  Object.keys(palette).forEach(k => { colors[k] = palette[k]; });
}

export default colors;
