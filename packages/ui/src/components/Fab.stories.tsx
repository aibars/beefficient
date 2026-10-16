import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { fn } from 'storybook/test';
import { Fab } from './Fab';

const meta = {
  title: 'Componentes/FAB',
  component: Fab,
  args: { label: 'Agregar pastoreo', onPress: fn() },
} satisfies Meta<typeof Fab>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
