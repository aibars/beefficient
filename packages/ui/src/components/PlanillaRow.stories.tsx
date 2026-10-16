import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { View } from 'react-native';
import { colorDeSerie } from '../theme';
import { LoteHeader, PlanillaList, PlanillaRow } from './PlanillaRow';

const meta = {
  title: 'Componentes/Fila de planilla',
  component: PlanillaRow,
  decorators: [(Story) => <View style={{ width: 362 }}><PlanillaList><Story /></PlanillaList></View>],
  args: { title: 'Vacas preñadas A', figure: '2.081', meta: '120 cab. · 15/3 → 3/4 (19 d)', status: 'synced' },
} satisfies Meta<typeof PlanillaRow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Sincronizada: Story = {};
export const Pendiente: Story = { args: { status: 'pending' } };
export const RecienGuardada: Story = { args: { status: 'pending', highlighted: true } };
export const NombreLargo: Story = { args: { title: 'Vaquillonas 1er servicio del campo de arriba' } };

export const GrupoDeLote: Story = {
  decorators: [(Story) => <View style={{ width: 362 }}><Story /></View>],
  render: () => (
    <View>
      <LoteHeader dotColor={colorDeSerie(2)} title="Lote 7 · El Bajo" meta="42 ha · 3.211 rac." />
      <PlanillaList>
        <PlanillaRow title="Vacas preñadas A" figure="1.603" meta="120 cab. · 3/4 → 17/4 (14 d)" status="pending" highlighted />
        <PlanillaRow title="Novillos recría" figure="1.608" meta="96 cab. · 10/2 → 2/3 (20 d)" status="synced" />
      </PlanillaList>
    </View>
  ),
};
