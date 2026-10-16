import { Children, Fragment, type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { color, fontBody, fontHeading, fontSize, radius, shadow, tabular } from '../theme';
import { SyncStamp, type SyncStatus } from './SyncStamp';

export interface PlanillaRowProps {
  title: string;
  figure: string;
  figureUnit?: string;
  meta: string;
  status: SyncStatus;
  /** Recién guardada: fondo terracota suave. */
  highlighted?: boolean;
}

/** Fila de la planilla: un pastoreo. */
export function PlanillaRow({ title, figure, figureUnit = 'raciones', meta, status, highlighted }: PlanillaRowProps) {
  return (
    <View style={[styles.row, highlighted && styles.highlighted]}>
      <View style={styles.left}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.meta}>{meta}</Text>
      </View>
      <View style={styles.right}>
        <Text style={styles.figure}>{figure}</Text>
        <Text style={styles.unit}>{figureUnit}</Text>
        <View style={styles.stamp}>
          <SyncStamp status={status} />
        </View>
      </View>
    </View>
  );
}

/** Encabezado de un grupo de la planilla: color, nombre del lote y totales. */
export function LoteHeader({ dotColor, title, meta }: { dotColor: string; title: string; meta: string }) {
  return (
    <View style={styles.header}>
      <View style={[styles.dot, { backgroundColor: dotColor }]} />
      <Text style={styles.headerTitle} accessibilityRole="header" numberOfLines={1}>
        {title}
      </Text>
      <Text style={styles.headerMeta}>{meta}</Text>
    </View>
  );
}

/** Card que agrupa filas con separadores. */
export function PlanillaList({ children }: { children: ReactNode }) {
  const items = Children.toArray(children);
  return (
    <View style={styles.list}>
      {items.map((child, i) => (
        <Fragment key={i}>
          {i > 0 ? <View style={styles.divider} /> : null}
          {child}
        </Fragment>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { backgroundColor: color.card, borderRadius: radius.tile, boxShadow: shadow.md, overflow: 'hidden' },
  divider: { height: 1, backgroundColor: color.divider },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 13, paddingHorizontal: 16 },
  highlighted: { backgroundColor: color.accent[100] },
  left: { flex: 1, minWidth: 0, gap: 2 },
  title: { ...fontBody('600'), fontSize: fontSize.base, color: color.text },
  meta: { ...fontBody(), ...tabular, fontSize: fontSize.sm, color: color.muted },
  right: { alignItems: 'flex-end' },
  figure: { ...fontHeading, ...tabular, fontSize: fontSize['title-sm'], lineHeight: 20, color: color.text },
  unit: { ...fontBody(), fontSize: fontSize['2xs'], color: color.muted },
  stamp: { marginTop: 4 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8, marginHorizontal: 4, marginTop: 18, marginBottom: 8 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  headerTitle: { ...fontHeading, flex: 1, minWidth: 0, fontSize: fontSize['title-sm'], color: color.text },
  headerMeta: { ...fontBody(), ...tabular, fontSize: fontSize.sm, color: color.muted },
});
