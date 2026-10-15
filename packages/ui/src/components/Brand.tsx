import { StyleSheet, Text, View } from 'react-native';
import { color, fontBody, fontHeading, fontSize } from '../theme';

/** Marca de texto: BEEF en terracota + ICIENT. */
export function Brand() {
  return (
    <Text style={styles.brand} accessibilityRole="header" accessibilityLabel="Beefficient">
      <Text style={styles.beef}>BEEF</Text>ICIENT
    </Text>
  );
}

/** Separador con texto al medio ("o"). */
export function OrDivider({ label = 'o' }: { label?: string }) {
  return (
    <View style={styles.or}>
      <View style={styles.line} />
      <Text style={styles.orText}>{label}</Text>
      <View style={styles.line} />
    </View>
  );
}

const styles = StyleSheet.create({
  brand: { ...fontHeading, fontSize: fontSize.brand, lineHeight: 44, letterSpacing: 0.4, textAlign: 'center', color: color.text },
  beef: { color: color.accent.base },
  or: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  line: { flex: 1, height: 1, backgroundColor: color.divider },
  orText: { ...fontBody(), fontSize: 13, color: color.soft },
});
