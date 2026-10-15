import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { View } from 'react-native';
import { ResultTile, TileGrid } from './ResultTile';

const meta = {
  title: 'Componentes/Tile de resultado',
  component: ResultTile,
  decorators: [(Story) => <View style={{ width: 362 }}><TileGrid><Story /></TileGrid></View>],
  args: { icon: 'cow', label: 'EV totales', value: '114,5', detail: '0,95 EV/cab.' },
} satisfies Meta<typeof ResultTile>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const ConUnidad: Story = { args: { icon: 'area', label: 'Carga', value: '2,73', unit: 'EV/ha', detail: undefined } };
export const Destacado: Story = {
  args: { variant: 'lead', icon: undefined, label: 'Raciones', value: '1.603', detail: '38,2 raciones/ha · 42 ha' },
};
export const Rodeo: Story = {
  args: {
    variant: 'herd',
    icon: undefined,
    label: 'Para todo el rodeo · 120 cabezas',
    value: '1.008',
    unit: 'kg MS/día',
    detail: '2.066 Mcal EM · 91 kg PB por día',
  },
};
export const Ancho: Story = {
  args: { wide: true, icon: 'scale', label: 'Oferta necesaria', value: '2.016', unit: 'kg MS/día', detail: '28.224 kg MS en el período' },
};
export const Vacio: Story = { args: { empty: true } };
export const DestacadoVacio: Story = { args: { ...Destacado.args, empty: true } };

export const Grilla: Story = {
  decorators: [(Story) => <View style={{ width: 362 }}><Story /></View>],
  render: () => (
    <TileGrid>
      <ResultTile variant="lead" label="Raciones" value="1.603" detail="38,2 raciones/ha · 42 ha" />
      <ResultTile icon="calendar" label="Días de pastoreo" value="14" />
      <ResultTile icon="cow" label="EV totales" value="114,5" detail="0,95 EV/cab." />
      <ResultTile icon="area" label="Carga" value="2,73" unit="EV/ha" />
      <ResultTile icon="leaf" label="Consumo de MS" value="1.008" unit="kg/día" detail="2,0% del peso vivo" />
      <ResultTile wide icon="scale" label="Oferta necesaria" value="2.016" unit="kg MS/día" detail="28.224 kg MS en el período" />
    </TileGrid>
  ),
};
