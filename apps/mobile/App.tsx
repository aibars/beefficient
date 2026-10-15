import { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, StyleSheet } from 'react-native';
import { useFonts } from 'expo-font';
import { Caprasimo_400Regular } from '@expo-google-fonts/caprasimo';
import {
  Figtree_400Regular,
  Figtree_500Medium,
  Figtree_600SemiBold,
  Figtree_700Bold,
} from '@expo-google-fonts/figtree';
import { ESTABLECIMIENTO_EJEMPLO, LOTES, PASTOREOS, RODEOS, type Pastoreo } from '@beefficient/domain';
import { FormuladorScreen, NuevoPastoreoScreen, PlanillaScreen, color } from '@beefficient/ui';

// Por ahora la app recorre las pantallas del wireframe con DATOS DE EJEMPLO.
// Navegación, auth, SQLite y sync llegan con sus issues (BFC-M1, ADR 0007).
const SUBTITULO = `${ESTABLECIMIENTO_EJEMPLO.nombre} · Campaña ${ESTABLECIMIENTO_EJEMPLO.campana}`;

type Pantalla = 'planilla' | 'nuevo' | 'formulador';

export default function App() {
  // Los nombres tienen que coincidir con los que arma fontBody/fontHeading en @beefficient/ui.
  const [fontsLoaded] = useFonts({
    Caprasimo_400Regular,
    Figtree_400Regular,
    Figtree_500Medium,
    Figtree_600SemiBold,
    Figtree_700Bold,
  });
  const [pantalla, setPantalla] = useState<Pantalla>('planilla');
  const [pastoreos, setPastoreos] = useState<Pastoreo[]>(PASTOREOS);
  const [resaltado, setResaltado] = useState<string>();

  if (!fontsLoaded) return null;

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar style="dark" />
      {pantalla === 'nuevo' ? (
        <NuevoPastoreoScreen
          subtitulo={SUBTITULO}
          lotes={LOTES}
          rodeos={RODEOS}
          pastoreos={pastoreos}
          sinConexion
          onVolver={() => setPantalla('planilla')}
          onGuardar={(p) => {
            const id = `local-${Date.now()}`;
            setPastoreos([...pastoreos, { ...p, id, sincronizado: false }]);
            setResaltado(id);
            setPantalla('planilla');
          }}
        />
      ) : pantalla === 'formulador' ? (
        <FormuladorScreen subtitulo={ESTABLECIMIENTO_EJEMPLO.nombre} rodeos={RODEOS} onSeccion={setPantalla} />
      ) : (
        <PlanillaScreen
          subtitulo={SUBTITULO}
          lotes={LOTES}
          rodeos={RODEOS}
          pastoreos={pastoreos}
          resaltadoId={resaltado}
          onAgregar={() => setPantalla('nuevo')}
          onSeccion={setPantalla}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: color.bg },
});
