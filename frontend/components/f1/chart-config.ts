export const COMPOUND_COLORS: Record<string, string> = {
  SOFT: '#E8002D', MEDIUM: '#FFC700', HARD: '#EEEEEE',
  INTERMEDIATE: '#39B54A', WET: '#0067FF',
};

export const CHART_TOOLTIP = {
  contentStyle: {
    fontFamily: 'var(--font-geist-mono), monospace',
    fontSize: 11,
    border: '2px solid #000',
    borderRadius: 0,
    backgroundColor: '#fff',
    boxShadow: '4px 4px 0 rgba(0,0,0,0.1)',
    padding: '8px 12px',
  },
  cursor: { stroke: '#000', strokeDasharray: '4 4' },
};

export const CHART_GRID = { strokeDasharray: '3 3', stroke: '#e5e5e5', strokeOpacity: 0.8 };
export const CHART_AXIS = { fontSize: 10, fontFamily: 'var(--font-geist-mono), monospace', fill: '#666' };
