import { Pressable, StyleSheet, Text } from 'react-native';
import { color, fontBody, fontSize, radius, shadow } from '../theme';
import { Icon, type IconName } from './Icon';

export interface FabProps {
  label: string;
  icon?: IconName;
  onPress?: () => void;
}

/** Botón flotante con texto para la acción principal de una lista. */
export function Fab({ label, icon = 'plus', onPress }: FabProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.fab, pressed && styles.pressed]}
    >
      <Icon name={icon} color={color.onAccent} />
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    height: 52,
    paddingLeft: 16,
    paddingRight: 20,
    borderRadius: radius.pill,
    backgroundColor: color.accent.base,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    boxShadow: shadow.lg,
    alignSelf: 'flex-start',
  },
  pressed: { transform: [{ scale: 0.97 }] },
  label: { ...fontBody('600'), fontSize: fontSize.base, color: color.onAccent },
});
