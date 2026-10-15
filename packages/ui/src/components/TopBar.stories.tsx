import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { fn } from 'storybook/test';
import { View } from 'react-native';
import { TopBar } from './TopBar';

const meta = {
  title: 'Componentes/Barra superior',
  component: TopBar,
  decorators: [(Story) => <View style={{ width: 390 }}><Story /></View>],
  args: { title: 'Nuevo pastoreo', subtitle: 'La Esperanza · Campaña 26/27', avatarInitial: 'P', onLeadingPress: fn() },
} satisfies Meta<typeof TopBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Volver: Story = {};
export const Menu: Story = { args: { title: 'Planilla de pastoreo', leadingIcon: 'menu' } };
export const SinSubtitulo: Story = { args: { subtitle: undefined } };
export const TextoLargo: Story = {
  args: { title: 'Formulador de dietas para el rodeo', subtitle: 'Establecimiento La Esperanza del Sur · Campaña 26/27' },
};
