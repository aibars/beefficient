import { StyleSheet, Text, View } from 'react-native';
import { color, fontBody, fontHeading, fontSize, radius, shadow, tabular } from '../theme';
import { Button } from './Button';

export interface BottomBarProps {
  summary: string;
  detail?: string;
  actionLabel: string;
  onAction?: () => void;
  actionDisabled?: boolean;
}

/** Barra inferior con el resumen del cálculo siempre a la vista y el CTA. */
export function BottomBar({ summary, detail, actionLabel, onAction, actionDisabled }: BottomBarProps) {
  return (
    <View style={styles.bar}>
      <View style={styles.sum} accessibilityLiveRegion="polite">
        <Text style={styles.summary} numberOfLines={1}>
          {summary}
        </Text>
        {detail ? (
          <Text style={styles.detail} numberOfLines={1}>
            {detail}
          </Text>
        ) : null}
      </View>
      <Button label={actionLabel} trailingIcon="arrow" onPress={onAction} disabled={actionDisabled} />
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingTop: 12,
    paddingHorizontal: 14,
    paddingBottom: 18,
    backgroundColor: color.card,
    borderTopLeftRadius: radius.sheet,
    borderTopRightRadius: radius.sheet,
    boxShadow: shadow.bar,
  },
  sum: { flex: 1, minWidth: 0 },
  summary: { ...fontHeading, ...tabular, fontSize: fontSize['title-sm'], color: color.text },
  detail: { ...fontBody(), ...tabular, fontSize: fontSize.sm, lineHeight: 16, color: color.muted },
});
