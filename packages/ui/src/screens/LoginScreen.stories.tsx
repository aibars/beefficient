import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { fn, userEvent, within } from 'storybook/test';
import { LoginScreen } from './LoginScreen';

const meta = {
  title: 'Pantallas/Login',
  component: LoginScreen,
  parameters: { phone: true, layout: 'fullscreen' },
  args: {
    emailInicial: 'productor@laesperanza.com.ar',
    passwordInicial: 'campo2026',
    onIngresar: fn(),
    onGoogle: fn(),
    onOlvido: fn(),
    onCrearCuenta: fn(),
  },
} satisfies Meta<typeof LoginScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Vacio: Story = { args: { emailInicial: '', passwordInicial: '' } };
export const ErrorDeCredenciales: Story = { args: { error: 'Email o contraseña incorrectos.' } };
export const EmailInvalido: Story = {
  args: { emailInicial: 'productor@laesperanza' },
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Ingresar' }));
  },
};
export const Ingresando: Story = { args: { cargando: true } };
