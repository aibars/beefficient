import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { View } from 'react-native';
import { racionSugerida, type Etapa } from '@beefficient/domain';
import { color } from '../theme';
import { Card } from './Card';
import { RationMix } from './RationMix';

const COLORES: Record<string, string> = {
  'Forraje / pastura': color.olive.base,
  'Forraje / heno': color.olive.base,
  'Silaje de maíz': color.olive[400],
  'Grano de maíz': color.accent.base,
  'Núcleo proteico': color.accent[400],
};
const items = (etapa: Etapa, kg: number) => racionSugerida(etapa, kg).map((i) => ({ ...i, color: COLORES[i.ingrediente]! }));

const meta = {
  title: 'Componentes/Ración',
  component: RationMix,
  decorators: [(Story) => <View style={{ width: 362 }}><Card style={{ paddingTop: 8, paddingBottom: 10 }}><Story /></Card></View>],
  args: { items: items('recria', 7.28) },
} satisfies Meta<typeof RationMix>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Recria: Story = {};
export const EngordeACorral: Story = { args: { items: items('engorde', 8.2) } };
export const VacaDeCria: Story = { args: { items: items('cria', 8.4) } };
