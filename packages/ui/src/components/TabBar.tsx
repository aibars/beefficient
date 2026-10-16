import { Pressable, StyleSheet, Text, View } from 'react-native';
import { color, fontBody, fontSize, radius, shadow } from '../theme';
import { Icon, type IconName } from './Icon';

export interface TabItem<K extends string> {
  key: K;
  label: string;
  icon: IconName;
}

export interface TabBarProps<K extends string> {
  items: TabItem<K>[];
  active: K;
  onChange?: (key: K) => void;
}

export function TabBar<K extends string>({ items, active, onChange }: TabBarProps<K>) {
  return (
    <View style={styles.bar} accessibilityRole="tablist">
      {items.map((t) => {
        const on = t.key === active;
        return (
          <Pressable
            key={t.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: on }}
            onPress={() => onChange?.(t.key)}
            style={styles.tab}
          >
            <Icon name={t.icon} size={22} color={on ? color.accent.base : color.soft} />
            <Text style={[styles.label, on && styles.labelOn]}>{t.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    paddingTop: 8,
    paddingHorizontal: 12,
    paddingBottom: 14,
    backgroundColor: color.card,
    borderTopLeftRadius: radius.sheet,
    borderTopRightRadius: radius.sheet,
    boxShadow: shadow.bar,
  },
  tab: { flex: 1, alignItems: 'center', gap: 2, paddingVertical: 6, minHeight: 48 },
  label: { ...fontBody('600'), fontSize: fontSize.xs, color: color.soft },
  labelOn: { color: color.accent[700] },
});
