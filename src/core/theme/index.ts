// WePost Typography Theme Engine
export interface ThemeDefinition {
  id: string;
  name: string;
  css: string;
}

export const defaultThemes: ThemeDefinition[] = [
  {
    id: 'default',
    name: '经典黑白',
    css: '/* Default theme styles */',
  },
  {
    id: 'elegant-green',
    name: '优雅墨绿',
    css: '/* Elegant green theme styles */',
  },
];
