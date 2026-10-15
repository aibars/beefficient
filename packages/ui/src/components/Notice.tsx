import { StyleSheet, Text, View } from 'react-native';
import { color, fontBody, fontSize, radius } from '../theme';
import { Button } from './Button';
import { Icon } from './Icon';

export interface NoticeProps {
  /** `warning`: algo a revisar que no bloquea. `error`: bloquea la acción. */
  tone: 'warning' | 'error';
  message: string;
  action?: { label: string; onPress: () => void };
}

export function Notice({ tone, message, action }: NoticeProps) {
  const fg = tone === 'error' ? color.errorText : color.accent[700];
  return (
    <View
      style={[styles.box, tone === 'error' ? styles.error : styles.warning]}
      accessibilityRole={tone === 'error' ? 'alert' : undefined}
      accessibilityLiveRegion="polite"
    >
      <Icon name="alert" color={fg} />
      <View style={styles.body}>
        <Text style={[styles.text, { color: fg }]}>{message}</Text>
        {action ? (
          <View style={styles.action}>
            <Button variant="compact" label={action.label} onPress={action.onPress} />
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { flexDirection: 'row', gap: 10, alignItems: 'flex-start', borderRadius: radius.md, paddingVertical: 12, paddingHorizontal: 14 },
  warning: { backgroundColor: color.accent[100] },
  error: { backgroundColor: color.accent[200] },
  body: { flex: 1 },
  text: { ...fontBody(), fontSize: fontSize.md, lineHeight: 19 },
  action: { marginTop: 6 },
});
