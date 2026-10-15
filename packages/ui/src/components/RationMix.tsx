import { StyleSheet, Text, View } from 'react-native';
import { formatearNumero } from '@beefficient/domain';
import { color, fontBody, fontSize, tabular } from '../theme';

export interface RationItem {
  ingrediente: string;
  porcentaje: number;
  kgMS: number;
  color: string;
}

/** Barra de proporciones de la ración y su detalle por ingrediente. */
export function RationMix({ items }: { items: RationItem[] }) {
  return (
    <View>
      <View style={styles.bar} aria-hidden>
        {items.map((i) => (
          <View key={i.ingrediente} style={{ flexGrow: i.porcentaje, flexBasis: 0, backgroundColor: i.color }} />
        ))}
      </View>
      {items.map((i, idx) => (
        <View key={i.ingrediente} style={[styles.row, idx > 0 && styles.rowDivider]}>
          <View style={[styles.swatch, { backgroundColor: i.color }]} />
          <Text style={styles.name}>{i.ingrediente}</Text>
          <Text style={styles.amount}>
            <Text style={styles.pct}>{i.porcentaje}%</Text> · {formatearNumero(i.kgMS, 1)} kg MS/día
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', height: 14, borderRadius: 999, overflow: 'hidden', gap: 2, marginTop: 16, marginBottom: 6 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 11 },
  rowDivider: { borderTopWidth: 1, borderTopColor: color.divider },
  swatch: { width: 12, height: 12, borderRadius: 4 },
  name: { ...fontBody('600'), flex: 1, fontSize: 14, color: color.text },
  amount: { ...fontBody(), ...tabular, fontSize: 13, color: color.muted },
  pct: { ...fontBody('600'), color: color.text },
});
