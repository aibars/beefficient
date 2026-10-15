import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { color, fontBody, fontHeading, fontSize, radius, shadow, tabular } from '../theme';
import { Icon, type IconName } from './Icon';

export interface ResultTileProps {
  label: string;
  value: string;
  unit?: string;
  detail?: string;
  icon?: IconName;
  /** `lead`: cifra principal en terracota. `herd`: total del rodeo en oliva. */
  variant?: 'default' | 'lead' | 'herd';
  /** Ocupa las dos columnas. `lead` y `herd` siempre lo hacen. */
  wide?: boolean;
  /** Sin dato calculable: muestra una raya. */
  empty?: boolean;
}

export function ResultTile({ label, value, unit, detail, icon, variant = 'default', wide, empty }: ResultTileProps) {
  const full = wide || variant !== 'default';
  return (
    <View style={[styles.tile, full ? styles.wide : styles.half, variant === 'lead' && styles.lead, variant === 'herd' && styles.herd]}>
      {icon ? (
        <View style={styles.icon}>
          <Icon name={icon} size={16} color={color.olive[700]} />
        </View>
      ) : null}
      <Text style={styles.label}>{label}</Text>
      <Text
        style={[styles.value, variant === 'lead' && styles.valueLead, variant === 'herd' && styles.valueHerd, empty && styles.valueEmpty]}
        numberOfLines={1}
      >
        {empty ? '—' : value}
        {unit && !empty ? <Text style={styles.unit}> {unit}</Text> : null}
      </Text>
      {detail && !empty ? <Text style={styles.detail}>{detail}</Text> : null}
    </View>
  );
}

/** Grilla de dos columnas para los tiles de resultado. */
export function TileGrid({ children }: { children: ReactNode }) {
  return <View style={styles.grid}>{children}</View>;
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  tile: { backgroundColor: color.card, borderRadius: radius.tile, boxShadow: shadow.md, paddingVertical: 14, paddingHorizontal: 16 },
  half: { flexBasis: '40%', flexGrow: 1 },
  wide: { flexBasis: '100%' },
  lead: { backgroundColor: color.tile, boxShadow: 'none' },
  herd: { backgroundColor: color.olive[100], boxShadow: 'none' },
  icon: { width: 32, height: 32, borderRadius: 10, backgroundColor: color.olive[100], alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  label: { ...fontBody(), fontSize: 13, color: color.muted },
  value: { ...fontHeading, ...tabular, fontSize: fontSize.figure, lineHeight: 31, color: color.text },
  valueLead: { fontSize: fontSize.display, lineHeight: 42, color: color.accent[700] },
  valueHerd: { color: color.olive[700] },
  valueEmpty: { color: color.soft },
  unit: { ...fontBody(), fontSize: fontSize.sm, color: color.muted },
  detail: { ...fontBody(), ...tabular, fontSize: fontSize.xs, color: color.soft },
});
