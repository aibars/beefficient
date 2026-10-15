import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { fn } from 'storybook/test';
import { ESTABLECIMIENTO, RODEOS } from './ejemplo';
import { FormuladorScreen } from './FormuladorScreen';

const meta = {
  title: 'Pantallas/Formulador',
  component: FormuladorScreen,
  parameters: { phone: true, layout: 'fullscreen' },
  args: { subtitulo: ESTABLECIMIENTO, rodeos: RODEOS, onMenu: fn(), onSeccion: fn() },
} satisfies Meta<typeof FormuladorScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Requerimientos por animal: recría de 280 kg, ambiente templado. */
export const SinRodeo: Story = {};

/** Toma etapa y peso del rodeo y suma el total para todas las cabezas. */
export const ConRodeo: Story = { args: { inicial: { rodeoId: 'a' } } };

export const RodeoDeRecria: Story = { args: { inicial: { rodeoId: 'e' } } };

export const EngordeEnFrio: Story = { args: { inicial: { etapa: 'engorde', pesoVivo: 380, clima: 'frio' } } };
