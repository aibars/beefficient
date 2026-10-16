import type { Preview } from '@storybook/react-native-web-vite';
import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { color, fontBody, shadow } from '@beefficient/ui';
import '@beefficient/tokens/css';

/** Marco de teléfono (390×812) para las pantallas. La leyenda queda fuera de la pantalla. */
function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <View style={styles.wrap}>
      <View style={styles.phone}>{children}</View>
      <Text style={styles.caption}>Datos de ejemplo · a validar con Gastón Alfaro y Federico Podversich</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: 24, alignItems: 'center', backgroundColor: color.bg },
  phone: {
    width: 390,
    height: 812,
    borderRadius: 44,
    borderWidth: 10,
    borderColor: color.neutral[900],
    overflow: 'hidden',
    backgroundColor: color.bg,
    boxShadow: shadow.lg,
  },
  caption: {
    ...fontBody('600'),
    marginTop: 16,
    maxWidth: 390,
    textAlign: 'center',
    fontSize: 12.5,
    color: color.accent[700],
    backgroundColor: color.accent[100],
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 999,
  },
  pad: { padding: 24, backgroundColor: color.bg, minWidth: 360 },
});

const preview: Preview = {
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    controls: { expanded: true },
    docs: { canvas: { sourceState: 'hidden' } },
    options: {
      storySort: {
        order: ['Introducción', 'Fundamentos', 'Componentes', 'Pantallas', 'Documentación'],
      },
    },
  },
  decorators: [
    (Story, { parameters }) =>
      parameters.phone ? (
        <PhoneFrame>
          <Story />
        </PhoneFrame>
      ) : (
        <View style={styles.pad}>
          <Story />
        </View>
      ),
  ],
};

export default preview;
