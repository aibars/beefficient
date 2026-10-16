import { StyleSheet, Text, View } from 'react-native';
import { color, fontBody, fontSize, radius, shadow } from '../theme';
import { Icon, type IconName } from './Icon';

export type SyncStatus = 'synced' | 'pending';

/** Estampa de una fila: si ya se subió o si espera señal. */
export function SyncStamp({ status }: { status: SyncStatus }) {
  const ok = status === 'synced';
  const fg = ok ? color.olive[700] : color.accent[700];
  return (
    <View style={[styles.stamp, { backgroundColor: ok ? color.olive[100] : color.accent[100] }]}>
      <Icon name={ok ? 'check' : 'clock'} size={11} color={fg} />
      <Text style={[styles.stampText, { color: fg }]}>{ok ? 'Sincronizado' : 'Pendiente'}</Text>
    </View>
  );
}

/** Pastilla de estado general de la pantalla ("Sin conexión", "2 pendientes de sincronizar"). */
export function StatusChip({ icon, label }: { icon: IconName; label: string }) {
  return (
    <View style={styles.chip} accessibilityLiveRegion="polite">
      <Icon name={icon} size={14} color={color.accent.base} />
      <Text style={styles.chipText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  stamp: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 2, paddingHorizontal: 8, borderRadius: radius.pill, alignSelf: 'flex-end' },
  stampText: { ...fontBody('600'), fontSize: fontSize['2xs'] },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: radius.pill,
    backgroundColor: color.card,
    boxShadow: shadow.sm,
  },
  chipText: { ...fontBody('600'), fontSize: fontSize.sm, color: color.text },
});
