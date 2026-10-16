import type { ReactNode } from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { color, fontBody, fontHeading, fontSize, radius, shadow } from '../theme';

export interface CardProps {
  title?: string;
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function Card({ title, children, style }: CardProps) {
  return (
    <View style={[styles.card, style]}>
      {title ? (
        <Text style={styles.title} accessibilityRole="header">
          {title}
        </Text>
      ) : null}
      {children}
    </View>
  );
}

/** Título de sección fuera de una card ("Resultado · Lote 7"). */
export function SectionTitle({ children }: { children: string }) {
  return (
    <Text style={styles.section} accessibilityRole="header">
      {children}
    </Text>
  );
}

/** Label de un campo, con un valor opcional a la derecha. */
export function FieldLabel({ label, value }: { label: string; value?: string }) {
  return (
    <View style={styles.label}>
      <Text style={styles.labelText}>{label}</Text>
      {value ? <Text style={styles.labelValue}>{value}</Text> : null}
    </View>
  );
}

/** Dato secundario debajo de un campo. */
export function Meta({ children }: { children: string }) {
  return <Text style={styles.meta}>{children}</Text>;
}

const styles = StyleSheet.create({
  card: { backgroundColor: color.card, borderRadius: radius.lg, boxShadow: shadow.md, paddingVertical: 22, paddingHorizontal: 20 },
  title: { ...fontHeading, fontSize: fontSize.title, lineHeight: 25, color: color.text },
  section: { ...fontHeading, fontSize: fontSize.title, lineHeight: 25, color: color.text, marginTop: 26, marginBottom: 12, marginHorizontal: 2 },
  label: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 20, marginBottom: 10 },
  labelText: { ...fontBody('600'), fontSize: fontSize.md, color: color.text },
  labelValue: { ...fontHeading, fontSize: fontSize['figure-md'], lineHeight: 24, color: color.olive[700] },
  meta: { ...fontBody(), fontSize: fontSize.sm, color: color.muted, marginTop: 8, marginHorizontal: 4 },
});
