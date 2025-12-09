export type Colors = {
  primary: string;
  secondary: string;
  success: string;
  danger: string;
  warning: string;

  background: string;
  surface: string;

  text: string;
  textLight: string;
  border: string;
  onPrimary?: string;
};

// --- MODO CLARO  ---
export const LIGHT_COLORS: Colors = {
  primary: '#0066CC',    // Azul vibrante
  secondary: '#FF6B35',  // Laranja queimado
  success: '#10B981',    // Verde esmeralda
  danger: '#EF4444',     // Vermelho
  warning: '#F59E0B',    // Âmbar

  background: '#F8FAFC', // Slate 50
  surface: '#FFFFFF',    // Branco
  
  text: '#0F172A',       // Slate 900
  textLight: '#64748B',  // Slate 500
  border: '#E2E8F0',     // Slate 200
  onPrimary: '#FFFFFF',
};

// --- MODO ESCURO ---
export const DARK_COLORS: Colors = {
  primary: '#60A5FA',    // Azul claro (Blue 400)
  secondary: '#FB923C',  // Laranja (Orange 400)
  success: '#34D399',    // Verde (Emerald 400)
  danger: '#F87171',     // Vermelho claro (Red 400)
  warning: '#FBBF24',    // Âmbar (Amber 400)

  background: '#0F172A', // Slate 900
  surface: '#1E293B',    // Slate 800
  
  text: '#F1F5F9',       // Slate 100
  textLight: '#94A3B8',  // Slate 400
  border: '#334155',     // Slate 700
  onPrimary: '#FFFFFF',
};

// Helper para uso sem contexto (Default)
export const COLORS = LIGHT_COLORS;