import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { useState } from 'react';
import { View } from 'react-native';
import { userEvent, within } from 'storybook/test';
import { TextField } from './TextField';

const meta = {
  title: 'Componentes/Input de texto',
  component: TextField,
  decorators: [(Story) => <View style={{ width: 346 }}><Story /></View>],
  args: { label: 'Email', value: 'productor@laesperanza.com.ar', keyboardType: 'email-address' },
  render: function Render(args) {
    const [value, setValue] = useState(args.value);
    return <TextField {...args} value={value} onChangeText={setValue} />;
  },
} satisfies Meta<typeof TextField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Email: Story = {};
export const Vacio: Story = { args: { value: '', placeholder: 'nombre@campo.com.ar' } };
export const Error: Story = { args: { value: 'productor@', invalid: true } };
export const Deshabilitado: Story = { args: { disabled: true } };
export const Contrasena: Story = { args: { label: 'Contraseña', value: 'campo2026', password: true, keyboardType: 'default' } };
export const ContrasenaVisible: Story = {
  args: Contrasena.args,
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Mostrar contraseña' }));
  },
};
