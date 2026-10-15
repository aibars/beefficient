import { Pressable, StyleSheet, Text, View } from 'react-native';
import { color, fontBody, fontSize, MIN_TOUCH, radius, shadow } from '../theme';
import { GoogleLogo, Icon, type IconName } from './Icon';

export interface ButtonProps {
  label: string;
  onPress?: () => void;
  /** `primary`: terracota. `google`: card con el logo. `compact`: acción chica dentro de un aviso. */
  variant?: 'primary' | 'google' | 'compact';
  /** Ícono a la derecha del texto (solo `primary`). */
  trailingIcon?: IconName;
  /** Ocupa todo el ancho, con altura de 52. */
  block?: boolean;
  disabled?: boolean;
}

export function Button({ label, onPress, variant = 'primary', trailingIcon, block, disabled }: ButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        block && styles.block,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
      ]}
    >
      <View style={styles.content}>
        {variant === 'google' && <GoogleLogo />}
        <Text style={[styles.label, variant === 'google' && styles.labelGoogle, variant === 'compact' && styles.labelCompact, block && styles.labelBlock]}>
          {label}
        </Text>
        {trailingIcon && variant === 'primary' && <Icon name={trailingIcon} color={color.onAccent} />}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  content: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  primary: { backgroundColor: color.accent.base, height: MIN_TOUCH, paddingHorizontal: 20 },
  google: {
    backgroundColor: color.card,
    height: 52,
    borderWidth: 1,
    borderColor: color.divider,
    boxShadow: shadow.sm,
    gap: 10,
  },
  compact: { backgroundColor: color.accent.base, paddingVertical: 5, paddingHorizontal: 12 },
  block: { alignSelf: 'stretch', height: 52 },
  disabled: { opacity: 0.45 },
  pressed: { transform: [{ scale: 0.97 }] },
  label: { ...fontBody('600'), color: color.onAccent, fontSize: fontSize.base },
  labelBlock: { fontSize: fontSize.lg },
  labelGoogle: { color: color.text, fontSize: 15.5 },
  labelCompact: { fontSize: 13 },
});
