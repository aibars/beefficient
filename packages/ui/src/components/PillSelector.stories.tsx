import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { useState } from 'react';
import { View } from 'react-native';
import { colorDeSerie } from '../theme';
import { PillSelector, SegmentedControl, type PillOption } from './PillSelector';

const LOTES: PillOption<number>[] = [
  { value: 1, label: 'Lote 1 · La Loma', sublabel: '38 ha', dotColor: colorDeSerie(0) },
  { value: 4, label: 'Lote 4 · Monte', sublabel: '55 ha', dotColor: colorDeSerie(1) },
  { value: 7, label: 'Lote 7 · El Bajo', sublabel: '42 ha', dotColor: colorDeSerie(2) },
  { value: 9, label: 'Lote 9 · Verdeo', sublabel: '25 ha', dotColor: colorDeSerie(3) },
];

const meta = {
  title: 'Componentes/Selector de pastillas',
  component: PillSelector<number>,
  decorators: [(Story) => <View style={{ width: 322 }}><Story /></View>],
  args: { options: LOTES, value: 7, accessibilityLabel: 'Lote' },
  render: function Render(args) {
    const [value, setValue] = useState(args.value);
    return <PillSelector {...args} value={value} onChange={setValue} />;
  },
} satisfies Meta<typeof PillSelector<number>>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Seleccionado: Story = {};
export const SinSeleccion: Story = { args: { value: null } };
export const OpcionDeshabilitada: Story = {
  args: { options: LOTES.map((o) => (o.value === 9 ? { ...o, disabled: true } : o)) },
};
export const Deshabilitado: Story = { args: { disabled: true } };

export const SegmentadoEtapa: Story = {
  render: function Render() {
    const [v, setV] = useState('recria');
    return (
      <SegmentedControl
        accessibilityLabel="Etapa productiva"
        options={[
          { value: 'recria', label: 'Recría' },
          { value: 'engorde', label: 'Engorde a corral' },
          { value: 'cria', label: 'Vaca de cría' },
        ]}
        value={v}
        onChange={setV}
      />
    );
  },
};

export const SegmentadoClima: Story = {
  render: function Render() {
    const [v, setV] = useState('templado');
    return (
      <SegmentedControl
        accessibilityLabel="Ambiente térmico"
        options={[
          { value: 'frio', label: 'Frío' },
          { value: 'templado', label: 'Templado' },
          { value: 'calido', label: 'Cálido' },
        ]}
        value={v}
        onChange={setV}
      />
    );
  },
};
