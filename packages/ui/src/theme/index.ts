// Tema de la app móvil. Los valores salen de @beefficient/tokens (prototipo 29/7);
// acá solo se les da nombre de uso.
import { Platform, type TextStyle } from 'react-native';
import { tokens } from '@beefficient/tokens/native';

const c = tokens.color;

export const color = {
  bg: c.bg,
  surface: c.surface,
  card: c.card,
  tile: c.tile,
  input: c.input,
  text: c.text.base,
  muted: c.text.muted,
  soft: c.text.soft,
  onAccent: c.text['on-accent'],
  errorText: c.text.error,
  divider: c.divider,
  borderInput: c.border.input,
  accent: c.accent,
  olive: c.olive,
  neutral: c.neutral,
} as const;

const series = [c.series[1], c.series[2], c.series[3], c.series[4]];
/** Color estable de un lote según su posición; se mantiene en todos los gráficos. */
export const colorDeSerie = (indice: number): string => series[indice % series.length]!;

export const radius = tokens.radius;
export const space = tokens.spacing;
export const fontSize = tokens.font.size;
export const shadow = tokens.shadow;

type Peso = '400' | '500' | '600' | '700';
const NOMBRE_PESO: Record<Peso, string> = { '400': '400Regular', '500': '500Medium', '600': '600SemiBold', '700': '700Bold' };

// En web la familia se elige por nombre + peso. En nativo cada peso es una
// fuente aparte: la app tiene que cargar Figtree_* y Caprasimo_400Regular con
// @expo-google-fonts.
export const fontBody = (peso: Peso = '400'): TextStyle =>
  Platform.OS === 'web'
    ? { fontFamily: `${tokens.font.family.body}, system-ui, sans-serif`, fontWeight: peso }
    : { fontFamily: `${tokens.font.family.body}_${NOMBRE_PESO[peso]}` };

export const fontHeading: TextStyle =
  Platform.OS === 'web'
    ? { fontFamily: `${tokens.font.family.heading}, Georgia, serif`, fontWeight: '400' }
    : { fontFamily: `${tokens.font.family.heading}_400Regular` };

/** Cifras alineadas en columnas. */
export const tabular: TextStyle = { fontVariant: ['tabular-nums'] };

/** Objetivo táctil mínimo: se usa con guantes y al sol. */
export const MIN_TOUCH = 48;
