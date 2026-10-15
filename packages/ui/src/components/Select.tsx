import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { color, fontBody, fontHeading, fontSize, MIN_TOUCH, radius, shadow } from '../theme';
import { Icon } from './Icon';

export interface SelectOption<T extends string> {
  value: T;
  label: string;
}

export interface SelectProps<T extends string> {
  options: SelectOption<T>[];
  value: T | null;
  onChange?: (value: T) => void;
  /** Texto cuando no hay nada elegido. */
  placeholder?: string;
  /** Título de la hoja de opciones y nombre accesible. */
  label: string;
  disabled?: boolean;
}

/** Select en pastilla. Al tocarlo abre una hoja con las opciones. */
export function Select<T extends string>({ options, value, onChange, placeholder = 'Elegí una opción', label, disabled }: SelectProps<T>) {
  const [open, setOpen] = useState(false);
  const current = options.find((o) => o.value === value);
  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${current?.label ?? placeholder}`}
        accessibilityState={{ disabled: !!disabled, expanded: open }}
        disabled={disabled}
        onPress={() => setOpen(true)}
        style={[styles.field, disabled && styles.disabled]}
      >
        <Text style={[styles.value, !current && styles.placeholder]} numberOfLines={1}>
          {current?.label ?? placeholder}
        </Text>
        <Icon name="down" color={color.muted} />
      </Pressable>
      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)} accessibilityLabel="Cerrar" />
        <View style={styles.sheet}>
          <Text style={styles.sheetTitle} accessibilityRole="header">
            {label}
          </Text>
          <ScrollView>
            {options.map((o) => {
              const selected = o.value === value;
              return (
                <Pressable
                  key={o.value}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: selected }}
                  onPress={() => {
                    onChange?.(o.value);
                    setOpen(false);
                  }}
                  style={({ pressed }) => [styles.option, pressed && styles.optionPressed]}
                >
                  <Text style={[styles.optionText, selected && styles.optionSelected]}>{o.label}</Text>
                  {selected ? <Icon name="check" color={color.olive[700]} /> : null}
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  field: {
    height: MIN_TOUCH,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: color.borderInput,
    backgroundColor: color.input,
    paddingLeft: 18,
    paddingRight: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  disabled: { opacity: 0.45 },
  value: { ...fontBody('500'), flex: 1, fontSize: fontSize.base, color: color.text },
  placeholder: { color: color.soft },
  backdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(46, 43, 37, 0.35)' },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    maxHeight: '70%',
    backgroundColor: color.card,
    borderTopLeftRadius: radius.sheet,
    borderTopRightRadius: radius.sheet,
    boxShadow: shadow.bar,
    paddingTop: 18,
    paddingBottom: 24,
    paddingHorizontal: 16,
  },
  sheetTitle: { ...fontHeading, fontSize: fontSize['title-sm'], color: color.text, marginBottom: 8, marginHorizontal: 4 },
  option: {
    minHeight: MIN_TOUCH,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    borderTopWidth: 1,
    borderTopColor: color.divider,
  },
  optionPressed: { backgroundColor: color.surface },
  optionText: { ...fontBody('500'), fontSize: fontSize.base, color: color.text },
  optionSelected: { ...fontBody('600'), color: color.olive[700] },
});
