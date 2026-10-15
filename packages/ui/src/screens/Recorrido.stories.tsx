import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { useState } from 'react';
import type { Pastoreo } from '@beefficient/domain';
import { ESTABLECIMIENTO, LOTES, PASTOREOS, RODEOS, SUBTITULO } from './ejemplo';
import { FormuladorScreen } from './FormuladorScreen';
import { LoginScreen } from './LoginScreen';
import { NuevoPastoreoScreen } from './NuevoPastoreoScreen';
import { PlanillaScreen } from './PlanillaScreen';

type Pantalla = 'login' | 'planilla' | 'nuevo' | 'formulador';

/** Recorrido navegable como el wireframe: login → planilla → nuevo pastoreo → planilla, y formulador. */
function Recorrido() {
  const [pantalla, setPantalla] = useState<Pantalla>('login');
  const [pastoreos, setPastoreos] = useState<Pastoreo[]>(PASTOREOS);
  const [resaltado, setResaltado] = useState<string>();
  const irA = (s: 'planilla' | 'formulador') => setPantalla(s);

  switch (pantalla) {
    case 'login':
      return (
        <LoginScreen
          emailInicial="productor@laesperanza.com.ar"
          passwordInicial="campo2026"
          onIngresar={() => setPantalla('planilla')}
          onGoogle={() => setPantalla('planilla')}
        />
      );
    case 'nuevo':
      return (
        <NuevoPastoreoScreen
          subtitulo={SUBTITULO}
          lotes={LOTES}
          rodeos={RODEOS}
          pastoreos={pastoreos}
          sinConexion
          inicial={{ loteId: 7, rodeoId: 'a', entrada: '2026-04-01', salida: '2026-04-15' }}
          onVolver={() => setPantalla('planilla')}
          onGuardar={(p) => {
            const id = `nuevo-${pastoreos.length}`;
            setPastoreos([...pastoreos, { ...p, id, sincronizado: false }]);
            setResaltado(id);
            setPantalla('planilla');
          }}
        />
      );
    case 'formulador':
      return <FormuladorScreen subtitulo={ESTABLECIMIENTO} rodeos={RODEOS} onSeccion={irA} />;
    default:
      return (
        <PlanillaScreen
          subtitulo={SUBTITULO}
          lotes={LOTES}
          rodeos={RODEOS}
          pastoreos={pastoreos}
          resaltadoId={resaltado}
          onAgregar={() => setPantalla('nuevo')}
          onSeccion={irA}
        />
      );
  }
}

const meta = {
  title: 'Pantallas/Recorrido',
  component: Recorrido,
  parameters: { phone: true, layout: 'fullscreen' },
  tags: ['!autodocs'],
} satisfies Meta<typeof Recorrido>;

export default meta;

export const Completo: StoryObj<typeof meta> = {};
