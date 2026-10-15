import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { useState } from 'react';
import { View } from 'react-native';
import { userEvent, within } from 'storybook/test';
import { Select } from './Select';

const RODEOS = [
  { value: 'a', label: 'Vacas preñadas A' },
  { value: 'b', label: 'Vacas con cría' },
  { value: 'c', label: 'Vaquillonas 1er servicio' },
  { value: 'd', label: 'Terneros destete' },
  { value: 'e', label: 'Novillos recría' },
];

const meta = {
  title: 'Componentes/Select',
  component: Select<string>,
  decorators: [(Story) => <View style={{ width: 322 }}><Story /></View>],
  args: { label: 'Rodeo', options: RODEOS, value: 'a' },
  render: function Render(args) {
    const [value, setValue] = useState(args.value);
    return <Select {...args} value={value} onChange={setValue} />;
  },
} satisfies Meta<typeof Select<string>>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Elegido: Story = {};
export const Vacio: Story = { args: { value: null, placeholder: 'Elegí un rodeo' } };
export const Deshabilitado: Story = { args: { disabled: true } };
export const Abierto: Story = {
  parameters: { docs: { story: { inline: false, iframeHeight: 520 } } },
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button'));
  },
};
