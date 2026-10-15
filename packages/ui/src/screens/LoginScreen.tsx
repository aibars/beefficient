import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Brand, OrDivider } from '../components/Brand';
import { Button } from '../components/Button';
import { Notice } from '../components/Notice';
import { TextField } from '../components/TextField';
import { color, fontBody, fontSize } from '../theme';

const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export interface LoginScreenProps {
  emailInicial?: string;
  passwordInicial?: string;
  /** Error que devolvió el backend. Siempre genérico: no dice si falló el email o la contraseña. */
  error?: string;
  cargando?: boolean;
  onIngresar?: (email: string, password: string) => void;
  onGoogle?: () => void;
  onOlvido?: () => void;
  onCrearCuenta?: () => void;
}

export function LoginScreen({
  emailInicial = '',
  passwordInicial = '',
  error,
  cargando,
  onIngresar,
  onGoogle,
  onOlvido,
  onCrearCuenta,
}: LoginScreenProps) {
  const [email, setEmail] = useState(emailInicial);
  const [password, setPassword] = useState(passwordInicial);
  const [errorLocal, setErrorLocal] = useState<string | null>(null);

  const ingresar = () => {
    if (!EMAIL.test(email.trim())) {
      setErrorLocal('Ingresá un email válido.');
      return;
    }
    setErrorLocal(null);
    onIngresar?.(email.trim(), password);
  };

  const mensaje = errorLocal ?? error;

  return (
    <View style={styles.screen}>
      <View style={styles.brand}>
        <Brand />
      </View>
      <View style={styles.form}>
        <TextField
          label="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoComplete="email"
          textContentType="username"
          invalid={!!errorLocal}
        />
        <TextField
          label="Contraseña"
          value={password}
          onChangeText={setPassword}
          password
          autoComplete="current-password"
          textContentType="password"
        />
        <Pressable accessibilityRole="link" onPress={onOlvido} style={styles.forgot}>
          <Text style={styles.link}>¿Olvidaste tu contraseña?</Text>
        </Pressable>
        {mensaje ? <Notice tone="error" message={mensaje} /> : null}
        <Button block label={cargando ? 'Ingresando…' : 'Ingresar'} onPress={ingresar} disabled={cargando} />
      </View>
      <View style={styles.or}>
        <OrDivider />
      </View>
      <Button block variant="google" label="Continuar con Google" onPress={onGoogle} disabled={cargando} />
      <View style={styles.signup}>
        <Text style={styles.signupText}>¿No tenés cuenta? </Text>
        <Pressable accessibilityRole="link" onPress={onCrearCuenta}>
          <Text style={styles.link}>Crear cuenta</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: color.bg, paddingTop: 28, paddingHorizontal: 22, paddingBottom: 26 },
  brand: { marginTop: 36, marginBottom: 34 },
  form: { gap: 14 },
  forgot: { alignSelf: 'flex-end', marginTop: -4, paddingVertical: 4 },
  link: { ...fontBody('600'), fontSize: fontSize.md, color: color.accent[700] },
  or: { marginVertical: 22 },
  signup: { marginTop: 'auto', paddingTop: 24, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  signupText: { ...fontBody(), fontSize: 14, color: color.muted },
});
