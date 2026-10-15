import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';
import { color, fontBody, fontSize, radius } from '../theme';

export interface TextFieldProps
  extends Pick<TextInputProps, 'keyboardType' | 'autoComplete' | 'textContentType' | 'autoCapitalize' | 'placeholder'> {
  label: string;
  value: string;
  onChangeText?: (value: string) => void;
  /** Campo de contraseña, con el botón "Mostrar"/"Ocultar". */
  password?: boolean;
  invalid?: boolean;
  disabled?: boolean;
}

export function TextField({ label, value, onChangeText, password, invalid, disabled, ...input }: TextFieldProps) {
  const [visible, setVisible] = useState(false);
  return (
    <View>
      <Text style={styles.label}>{label}</Text>
      <View>
        <TextInput
          {...input}
          accessibilityLabel={label}
          value={value}
          onChangeText={onChangeText}
          editable={!disabled}
          secureTextEntry={password && !visible}
          autoCapitalize={input.autoCapitalize ?? 'none'}
          autoCorrect={false}
          placeholderTextColor={color.soft}
          style={[styles.input, password && styles.inputPassword, invalid && styles.invalid, disabled && styles.disabled]}
        />
        {password ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            onPress={() => setVisible((v) => !v)}
            disabled={disabled}
            style={styles.toggle}
          >
            <Text style={styles.toggleText}>{visible ? 'Ocultar' : 'Mostrar'}</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  label: { ...fontBody('600'), fontSize: fontSize.md, color: color.text, marginBottom: 6, marginLeft: 4 },
  input: {
    ...fontBody(),
    height: 50,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: color.borderInput,
    backgroundColor: color.input,
    paddingHorizontal: 18,
    fontSize: 15.5,
    color: color.text,
  },
  inputPassword: { paddingRight: 92 },
  invalid: { borderColor: color.accent.base, borderWidth: 1.5 },
  disabled: { opacity: 0.45 },
  toggle: { position: 'absolute', right: 6, top: 6, height: 38, paddingHorizontal: 14, justifyContent: 'center', borderRadius: radius.pill },
  toggleText: { ...fontBody('600'), fontSize: fontSize.md, color: color.accent[700] },
});
