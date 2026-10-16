import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { useState } from 'react';
import { View } from 'react-native';
import { DateField } from './DateField';

const meta = {
  title: 'Componentes/Input de fecha',
  component: DateField,
  decorators: [(Story) => <View style={{ width: 160 }}><Story /></View>],
  args: { label: 'Entrada', value: '2026-04-01' },
  render: function Render(args) {
    const [value, setValue] = useState(args.value);
    return <DateField {...args} value={value} onChange={setValue} />;
  },
} satisfies Meta<typeof DateField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ConFecha: Story = {};
export const Vacio: Story = { args: { value: '' } };
export const Error: Story = { args: { invalid: true } };
export const Deshabilitado: Story = { args: { disabled: true } };

export const EntradaYSalida: Story = {
  decorators: [(Story) => <View style={{ width: 322 }}><Story /></View>],
  render: function Render() {
    const [entrada, setEntrada] = useState('2026-04-15');
    const [salida, setSalida] = useState('2026-04-01');
    const invalid = !(salida > entrada);
    return (
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <DateField label="Entrada" value={entrada} onChange={setEntrada} invalid={invalid} />
        <DateField label="Salida" value={salida} onChange={setSalida} invalid={invalid} />
      </View>
    );
  },
};
