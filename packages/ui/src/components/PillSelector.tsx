import { Pressable, StyleSheet, Text, View } from 'react-native';
import { color, fontBody, fontSize, MIN_TOUCH, radius } from '../theme';

export interface PillOption<T extends string | number> {
  value: T;
  label: string;
  /** Segunda línea chica (p. ej., hectáreas del lote). */
  sublabel?: string;
  /** Punto de color a la izquierda (color del lote). */
  dotColor?: string;
  disabled?: boolean;
}

export interface PillSelectorProps<T extends string | number> {
  options: PillOption<T>[];
  value: T | null;
  onChange?: (value: T) => void;
  /** Columnas de la grilla. Por defecto 2. */
  columns?: number;
  /** Pastillas más bajas, para el selector segmentado. */
  compact?: boolean;
  accessibilityLabel?: string;
  disabled?: boolean;
}

/** Elección única entre pastillas; la elegida va en oliva. */
export function PillSelector<T extends string | number>({
  options,
  value,
  onChange,
  columns = 2,
  compact,
  accessibilityLabel,
  disabled,
}: PillSelectorProps<T>) {
  return (
    <View style={styles.grid} accessibilityRole="radiogroup" accessibilityLabel={accessibilityLabel}>
      {options.map((o) => {
        const selected = o.value === value;
        const off = disabled || o.disabled;
        return (
          <Pressable
            key={String(o.value)}
            accessibilityRole="radio"
            accessibilityState={{ checked: selected, disabled: !!off }}
            disabled={off}
            onPress={() => onChange?.(o.value)}
            style={({ pressed }) => [
              styles.pill,
              { flexBasis: `${100 / columns - 5}%` },
              compact && styles.compact,
              selected && styles.selected,
              off && styles.disabled,
              pressed && !selected && styles.pressed,
            ]}
          >
            {o.dotColor ? <View style={[styles.dot, { backgroundColor: o.dotColor }]} /> : null}
            <View style={styles.texts}>
              <Text style={[styles.label, compact && styles.labelCompact, selected && styles.textSelected]} numberOfLines={2}>
                {o.label}
              </Text>
              {o.sublabel ? <Text style={[styles.sublabel, selected && styles.textSelected]}>{o.sublabel}</Text> : null}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

/** Selector segmentado: una fila de pastillas, una por opción. */
export function SegmentedControl<T extends string | number>(props: Omit<PillSelectorProps<T>, 'columns' | 'compact'>) {
  return <PillSelector {...props} columns={props.options.length} compact />;
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill: {
    flexGrow: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minHeight: MIN_TOUCH,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: color.divider,
  },
  compact: { minHeight: 46, paddingHorizontal: 8 },
  selected: { backgroundColor: color.olive.base, borderColor: color.olive.base },
  disabled: { opacity: 0.45 },
  pressed: { backgroundColor: color.surface },
  dot: { width: 10, height: 10, borderRadius: 5, boxShadow: `0px 0px 0px 2px ${color.card}` },
  texts: { flexShrink: 1, alignItems: 'center' },
  label: { ...fontBody('500'), fontSize: 14, lineHeight: 17, color: color.text, textAlign: 'center' },
  labelCompact: { fontSize: fontSize.md },
  sublabel: { ...fontBody(), fontSize: 11.5, color: color.text, opacity: 0.8 },
  textSelected: { color: color.onAccent },
});
