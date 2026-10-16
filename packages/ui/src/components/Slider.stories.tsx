import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { useState } from 'react';
import { View } from 'react-native';
import { Slider } from './Slider';

const meta = {
  title: 'Componentes/Slider',
  component: Slider,
  decorators: [(Story) => <View style={{ width: 322 }}><Story /></View>],
  args: {
    label: 'Cabezas',
    value: 120,
    min: 1,
    max: 120,
    formatValue: (v: number) => `${v} cab.`,
    maxLabel: '120 en el rodeo',
  },
  render: function Render(args) {
    const [value, setValue] = useState(args.value);
    return <Slider {...args} value={value} onChange={setValue} />;
  },
} satisfies Meta<typeof Slider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Cabezas: Story = {};
export const Parcial: Story = { args: { value: 45 } };
export const PesoVivo: Story = {
  args: { label: 'Peso vivo', value: 280, min: 150, max: 650, step: 5, formatValue: (v: number) => `${v} kg`, minLabel: '150 kg', maxLabel: '650 kg' },
};
export const Minimo: Story = { args: { value: 1 } };
export const Deshabilitado: Story = { args: { disabled: true, value: 60 } };
