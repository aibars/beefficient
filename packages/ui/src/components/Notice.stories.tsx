import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { fn } from 'storybook/test';
import { View } from 'react-native';
import { Notice } from './Notice';

const meta = {
  title: 'Componentes/Aviso',
  component: Notice,
  decorators: [(Story) => <View style={{ width: 322 }}><Story /></View>],
  args: { tone: 'warning', message: 'Vacas preñadas A sigue en el Lote 4 · Monte hasta el 3/4.' },
} satisfies Meta<typeof Notice>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AdvertenciaConAccion: Story = { args: { action: { label: 'Entrar el 3/4', onPress: fn() } } };
export const Advertencia: Story = {};
export const Error: Story = {
  args: { tone: 'error', message: 'La salida tiene que ser posterior a la entrada. Corregí las fechas para ver el cálculo.' },
};
export const ErrorDeLogin: Story = { args: { tone: 'error', message: 'Email o contraseña incorrectos.' } };
