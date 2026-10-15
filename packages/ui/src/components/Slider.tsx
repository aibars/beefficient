import { useState } from 'react';
import { StyleSheet, Text, View, type GestureResponderEvent } from 'react-native';
import { color, fontBody, fontSize, tabular } from '../theme';
import { FieldLabel } from './Card';

export interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange?: (value: number) => void;
  /** Cómo se muestra el valor grande ("120 cab."). */
  formatValue?: (value: number) => string;
  minLabel?: string;
  maxLabel?: string;
  disabled?: boolean;
}

const THUMB = 18;

/** Slider con el valor grande en oliva arriba y los extremos abajo. */
export function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  formatValue = String,
  minLabel = String(min),
  maxLabel = String(max),
  disabled,
}: SliderProps) {
  const [width, setWidth] = useState(0);
  const range = max - min || 1;
  const p = Math.min(1, Math.max(0, (value - min) / range));

  const set = (v: number) => {
    const snapped = Math.round((v - min) / step) * step + min;
    const clamped = Math.min(max, Math.max(min, snapped));
    if (clamped !== value) onChange?.(clamped);
  };
  const fromTouch = (e: GestureResponderEvent) => {
    if (width > 0) set(min + (e.nativeEvent.locationX / width) * range);
  };

  return (
    <View>
      <FieldLabel label={label} value={formatValue(value)} />
      <View
        style={[styles.hit, disabled && styles.disabled]}
        onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
        onStartShouldSetResponder={() => !disabled}
        onMoveShouldSetResponder={() => !disabled}
        onResponderGrant={fromTouch}
        onResponderMove={fromTouch}
        accessible
        role="slider"
        aria-label={label}
        aria-disabled={!!disabled}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-valuetext={formatValue(value)}
        accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
        onAccessibilityAction={(e) => set(value + (e.nativeEvent.actionName === 'increment' ? step : -step))}
      >
        <View style={styles.track} pointerEvents="none">
          <View style={[styles.fill, { width: `${p * 100}%` }]} />
        </View>
        <View pointerEvents="none" style={[styles.thumb, { left: Math.max(0, p * width - THUMB / 2) }]} />
      </View>
      <View style={styles.ends}>
        <Text style={styles.end}>{minLabel}</Text>
        <Text style={styles.end}>{maxLabel}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hit: { height: 32, justifyContent: 'center' },
  disabled: { opacity: 0.45 },
  track: { height: 6, borderRadius: 6, borderWidth: 1, borderColor: color.soft, backgroundColor: color.card, overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: color.olive.base },
  thumb: { position: 'absolute', width: THUMB, height: THUMB, borderRadius: THUMB / 2, backgroundColor: color.olive.base, top: 7 },
  ends: { flexDirection: 'row', justifyContent: 'space-between' },
  end: { ...fontBody(), ...tabular, fontSize: fontSize.xs, color: color.soft },
});
