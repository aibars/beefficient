import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { fn } from 'storybook/test';
import { View } from 'react-native';
import { BottomBar } from './BottomBar';

const meta = {
  title: 'Componentes/Barra inferior',
  component: BottomBar,
  decorators: [(Story) => <View style={{ width: 390 }}><Story /></View>],
  args: { summary: '1.603 raciones', detail: 'Lote 7 · 2,73 EV/ha · 14 días', actionLabel: 'Guardar', onAction: fn() },
} satisfies Meta<typeof BottomBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ConResultado: Story = {};
export const FechasInvalidas: Story = { args: { summary: 'Revisá las fechas', detail: 'Lote 7', actionDisabled: true } };
