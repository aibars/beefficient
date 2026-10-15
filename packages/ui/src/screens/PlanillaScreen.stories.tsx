import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { fn } from 'storybook/test';
import { LOTES, PASTOREO_PENDIENTE, PASTOREOS, RODEOS, SUBTITULO } from './ejemplo';
import { PlanillaScreen } from './PlanillaScreen';

const meta = {
  title: 'Pantallas/Planilla',
  component: PlanillaScreen,
  parameters: { phone: true, layout: 'fullscreen' },
  args: {
    subtitulo: SUBTITULO,
    lotes: LOTES,
    rodeos: RODEOS,
    pastoreos: PASTOREOS,
    onAgregar: fn(),
    onMenu: fn(),
    onSeccion: fn(),
  },
} satisfies Meta<typeof PlanillaScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

export const TodoSincronizado: Story = {};

/** Fila recién guardada sin señal: resaltada y marcada como pendiente. */
export const FilaPendiente: Story = {
  args: { pastoreos: [...PASTOREOS, PASTOREO_PENDIENTE], resaltadoId: PASTOREO_PENDIENTE.id },
};

export const VariasPendientes: Story = {
  args: {
    pastoreos: [
      ...PASTOREOS.map((p, i) => (i < 2 ? { ...p, sincronizado: false } : p)),
      PASTOREO_PENDIENTE,
    ],
  },
};

export const Vacia: Story = { args: { pastoreos: [] } };
