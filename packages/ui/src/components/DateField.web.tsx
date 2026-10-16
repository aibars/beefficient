// Versión web: input de fecha del navegador con el estilo de la app.
import { Text, View } from 'react-native';
import { color, radius } from '../theme';
import { tokens } from '@beefficient/tokens/native';
import type { DateFieldProps } from './DateField.types';
import { dateStyles as styles } from './DateField.styles';

export type { DateFieldProps } from './DateField.types';

export function DateField({ label, value, onChange, invalid, disabled }: DateFieldProps) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <input
        type="date"
        aria-label={label}
        aria-invalid={invalid || undefined}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange?.(e.currentTarget.value)}
        style={{
          boxSizing: 'border-box',
          width: '100%',
          height: 48,
          borderRadius: radius.pill,
          border: invalid ? `1.5px solid ${color.accent.base}` : `1px solid ${color.borderInput}`,
          background: color.input,
          padding: '0 14px',
          fontFamily: `${tokens.font.family.body}, system-ui, sans-serif`,
          fontSize: 15,
          fontWeight: 500,
          color: color.text,
          opacity: disabled ? 0.45 : 1,
        }}
      />
    </View>
  );
}
