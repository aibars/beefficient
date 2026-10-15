import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { useState } from 'react';
import { View } from 'react-native';
import { TABS, type Seccion } from '../screens/tabs';
import { TabBar } from './TabBar';

const meta = {
  title: 'Componentes/Barra de pestañas',
  component: TabBar<Seccion>,
  decorators: [(Story) => <View style={{ width: 390 }}><Story /></View>],
  args: { items: TABS, active: 'planilla' },
  render: function Render(args) {
    const [active, setActive] = useState(args.active);
    return <TabBar {...args} active={active} onChange={setActive} />;
  },
} satisfies Meta<typeof TabBar<Seccion>>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Planilla: Story = {};
export const Formulador: Story = { args: { active: 'formulador' } };
