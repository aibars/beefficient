import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { fn } from 'storybook/test';
import { LOTES, PASTOREOS, RODEOS, SUBTITULO } from './ejemplo';
import { NuevoPastoreoScreen } from './NuevoPastoreoScreen';

const meta = {
  title: 'Pantallas/Nuevo pastoreo',
  component: NuevoPastoreoScreen,
  parameters: { phone: true, layout: 'fullscreen' },
  args: {
    subtitulo: SUBTITULO,
    lotes: LOTES,
    rodeos: RODEOS,
    pastoreos: PASTOREOS,
    sinConexion: true,
    inicial: { loteId: 7, rodeoId: 'e', entrada: '2026-04-01', salida: '2026-04-15' },
    onGuardar: fn(),
    onVolver: fn(),
  },
} satisfies Meta<typeof NuevoPastoreoScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Lote 7, Novillos recría, del 1/4 al 15/4. */
export const Default: Story = {};

/** Vacas preñadas A todavía está en el Lote 4 hasta el 3/4: aviso con corrección en un toque. */
export const RodeoSigueEnOtroLote: Story = {
  args: { inicial: { loteId: 7, rodeoId: 'a', entrada: '2026-04-01', salida: '2026-04-15' } },
};

export const FechasInvalidas: Story = {
  args: { inicial: { loteId: 7, rodeoId: 'e', entrada: '2026-04-15', salida: '2026-04-01' } },
};

export const SinFechas: Story = { args: { inicial: { loteId: 7, rodeoId: 'e' } } };

export const ConSenal: Story = { args: { sinConexion: false } };

export const PocasCabezas: Story = {
  args: { inicial: { loteId: 9, rodeoId: 'd', cabezas: 40, entrada: '2026-04-10', salida: '2026-04-20' } },
};
