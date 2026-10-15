// Versión nativa (iOS/Android). La web está en DateField.web.tsx.
// Pendiente de probar en dispositivo cuando exista apps/mobile.
import { useState } from 'react';
import { Platform, Pressable, Text, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { aISO, desdeISO, type DateFieldProps } from './DateField.types';
import { dateStyles as styles } from './DateField.styles';

export type { DateFieldProps } from './DateField.types';

const mostrar = (iso: string) => {
  const [a, m, d] = iso.split('-');
  return `${Number(d)}/${Number(m)}/${a}`;
};

export function DateField({ label, value, onChange, invalid, disabled }: DateFieldProps) {
  const [open, setOpen] = useState(false);
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${value ? mostrar(value) : 'sin fecha'}`}
        accessibilityState={{ disabled: !!disabled }}
        disabled={disabled}
        onPress={() => setOpen(true)}
        style={[styles.field, invalid && styles.invalid, disabled && styles.disabled]}
      >
        <Text style={[styles.value, !value && styles.placeholder]}>{value ? mostrar(value) : 'dd/mm/aaaa'}</Text>
      </Pressable>
      {open ? (
        <DateTimePicker
          mode="date"
          value={value ? desdeISO(value) : new Date()}
          display={Platform.OS === 'ios' ? 'inline' : 'default'}
          onChange={(e, d) => {
            setOpen(false);
            if (e.type === 'set' && d) onChange?.(aISO(d));
          }}
        />
      ) : null}
    </View>
  );
}
