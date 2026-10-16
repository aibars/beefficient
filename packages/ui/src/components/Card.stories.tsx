import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { View } from 'react-native';
import { Card, FieldLabel, Meta as MetaText, SectionTitle } from './Card';

const meta = {
  title: 'Componentes/Card',
  component: Card,
  decorators: [(Story) => <View style={{ width: 362 }}><Story /></View>],
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ConTitulo: Story = {
  args: { title: 'Datos del pastoreo' },
  render: (args) => (
    <Card {...args}>
      <FieldLabel label="Rodeo" />
      <MetaText>Vaca · gestación · 420 kg de peso vivo promedio</MetaText>
      <FieldLabel label="Cabezas" value="120 cab." />
    </Card>
  ),
};

export const Vacia: Story = { args: { title: 'Parámetros del animal' } };

export const TituloDeSeccion: Story = {
  render: () => <SectionTitle>Resultado · Lote 7</SectionTitle>,
};
