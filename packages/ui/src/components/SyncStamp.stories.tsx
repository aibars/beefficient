import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { View } from 'react-native';
import { StatusChip, SyncStamp } from './SyncStamp';

const meta = {
  title: 'Componentes/Estado de sync',
  component: SyncStamp,
  args: { status: 'synced' },
} satisfies Meta<typeof SyncStamp>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Sincronizado: Story = {};
export const Pendiente: Story = { args: { status: 'pending' } };

export const PastillasDeEstado: Story = {
  render: () => (
    <View style={{ gap: 12 }}>
      <StatusChip icon="offline" label="Sin conexión" />
      <StatusChip icon="clock" label="2 pendientes de sincronizar" />
      <StatusChip icon="check" label="Todo sincronizado" />
    </View>
  ),
};
