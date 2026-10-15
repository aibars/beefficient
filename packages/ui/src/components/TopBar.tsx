import { Pressable, StyleSheet, Text, View } from 'react-native';
import { color, fontBody, fontHeading, fontSize, radius, shadow } from '../theme';
import { Icon, type IconName } from './Icon';

export interface SquareButtonProps {
  icon: IconName;
  accessibilityLabel: string;
  onPress?: () => void;
}

/** Botón cuadrado redondeado de la barra superior (volver, menú). */
export function SquareButton({ icon, accessibilityLabel, onPress }: SquareButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      hitSlop={4}
      style={({ pressed }) => [styles.square, pressed && styles.pressed]}
    >
      <Icon name={icon} />
    </Pressable>
  );
}

export function Avatar({ initial }: { initial: string }) {
  return (
    <View style={styles.avatar} accessibilityLabel="Tu cuenta">
      <Text style={styles.avatarText}>{initial.slice(0, 1).toUpperCase()}</Text>
    </View>
  );
}

export interface TopBarProps {
  title: string;
  subtitle?: string;
  leadingIcon?: 'back' | 'menu';
  leadingLabel?: string;
  onLeadingPress?: () => void;
  avatarInitial?: string;
}

export function TopBar({
  title,
  subtitle,
  leadingIcon = 'back',
  leadingLabel = leadingIcon === 'back' ? 'Volver' : 'Menú',
  onLeadingPress,
  avatarInitial,
}: TopBarProps) {
  return (
    <View style={styles.bar}>
      <SquareButton icon={leadingIcon} accessibilityLabel={leadingLabel} onPress={onLeadingPress} />
      <View style={styles.titles}>
        <Text style={styles.title} accessibilityRole="header" numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {avatarInitial ? <Avatar initial={avatarInitial} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingTop: 10, paddingBottom: 12 },
  square: {
    width: 40,
    height: 40,
    borderRadius: radius.control,
    backgroundColor: color.card,
    boxShadow: shadow.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.7 },
  titles: { flex: 1, minWidth: 0 },
  title: { ...fontHeading, fontSize: fontSize.title, lineHeight: 24, color: color.text },
  subtitle: { ...fontBody(), fontSize: fontSize.sm, color: color.muted },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: color.accent.base,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: `0px 0px 0px 5px ${color.card}`,
  },
  avatarText: { ...fontBody('600'), color: color.onAccent, fontSize: fontSize.base },
});
