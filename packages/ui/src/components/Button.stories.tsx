import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { fn } from 'storybook/test';
import { Button } from './Button';

const meta = {
  title: 'Componentes/Botón',
  component: Button,
  args: { onPress: fn() },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primario: Story = { args: { label: 'Guardar', trailingIcon: 'arrow' } };
export const Ancho: Story = { args: { label: 'Ingresar', block: true } };
export const Google: Story = { args: { label: 'Continuar con Google', variant: 'google', block: true } };
export const Compacto: Story = { args: { label: 'Entrar el 3/4', variant: 'compact' } };
export const Deshabilitado: Story = { args: { label: 'Guardar', trailingIcon: 'arrow', disabled: true } };
