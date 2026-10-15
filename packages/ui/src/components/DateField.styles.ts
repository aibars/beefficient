import { StyleSheet } from 'react-native';
import { color, fontBody, fontSize, MIN_TOUCH, radius } from '../theme';

export const dateStyles = StyleSheet.create({
  wrap: { flex: 1 },
  label: { ...fontBody(), fontSize: fontSize.sm, color: color.muted, marginBottom: 6, marginLeft: 4 },
  field: {
    height: MIN_TOUCH,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: color.borderInput,
    backgroundColor: color.input,
    paddingHorizontal: 14,
    justifyContent: 'center',
  },
  invalid: { borderColor: color.accent.base, borderWidth: 1.5 },
  disabled: { opacity: 0.45 },
  value: { ...fontBody('500'), fontSize: fontSize.base, color: color.text },
  placeholder: { color: color.soft },
});
