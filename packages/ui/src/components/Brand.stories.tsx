import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { View } from 'react-native';
import { Brand, OrDivider } from './Brand';

const meta = {
  title: 'Fundamentos/Marca',
  component: Brand,
} satisfies Meta<typeof Brand>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Marca: Story = {};
export const Separador: Story = {
  render: () => (
    <View style={{ width: 346 }}>
      <OrDivider />
    </View>
  ),
};
