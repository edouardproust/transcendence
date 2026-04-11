export const board2DThemes = {
  classic: {
    light: '#f0d9b5',
    dark: '#b58863',
    border: '#5b3f2f',
    shadow: '0 8px 18px rgba(0, 0, 0, 0.2)',
  },
  wood: {
    light: '#f3e2c3',
    dark: '#8d5f3a',
    border: '#4d3018',
    shadow: '0 12px 22px rgba(59, 35, 16, 0.35)',
  },
  ocean: {
    light: '#d9f1ff',
    dark: '#3b82a8',
    border: '#174a63',
    shadow: '0 10px 20px rgba(23, 74, 99, 0.32)',
  },
  slate: {
    light: '#d8dde6',
    dark: '#4b5563',
    border: '#1f2937',
    shadow: '0 10px 22px rgba(17, 24, 39, 0.33)',
  },
} as const;

export type Board2DTheme = keyof typeof board2DThemes;
