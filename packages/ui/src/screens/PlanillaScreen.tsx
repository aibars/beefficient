import { StyleSheet, Text, View } from 'react-native';
import {
  agruparPorLote,
  contarPendientes,
  formatearFechaCorta as fd,
  formatearNumero as nf,
  type Lote,
  type Pastoreo,
  type Rodeo,
} from '@beefficient/domain';
import { Card } from '../components/Card';
import { Fab } from '../components/Fab';
import { LoteHeader, PlanillaList, PlanillaRow } from '../components/PlanillaRow';
import { StatusChip } from '../components/SyncStamp';
import { TabBar } from '../components/TabBar';
import { TopBar } from '../components/TopBar';
import { color, colorDeSerie, fontBody, fontSize } from '../theme';
import { ScreenLayout } from './ScreenLayout';
import { TABS, type Seccion } from './tabs';

export interface PlanillaScreenProps {
  subtitulo: string;
  lotes: Lote[];
  rodeos: Rodeo[];
  pastoreos: Pastoreo[];
  /** Fila recién guardada, para resaltarla. */
  resaltadoId?: string;
  avatar?: string;
  onAgregar?: () => void;
  onMenu?: () => void;
  onSeccion?: (s: Seccion) => void;
}

export function PlanillaScreen({ subtitulo, lotes, rodeos, pastoreos, resaltadoId, avatar = 'P', onAgregar, onMenu, onSeccion }: PlanillaScreenProps) {
  const grupos = agruparPorLote(pastoreos, lotes, rodeos);
  const pendientes = contarPendientes(pastoreos);

  return (
    <ScreenLayout
      bottomInset={170}
      top={<TopBar title="Planilla de pastoreo" subtitle={subtitulo} leadingIcon="menu" onLeadingPress={onMenu} avatarInitial={avatar} />}
      fab={<Fab label="Agregar pastoreo" onPress={onAgregar} />}
      footer={<TabBar items={TABS} active="planilla" onChange={onSeccion} />}
    >
      <View style={styles.chip}>
        <StatusChip
          icon={pendientes ? 'clock' : 'check'}
          label={pendientes ? `${pendientes} pendiente${pendientes > 1 ? 's' : ''} de sincronizar` : 'Todo sincronizado'}
        />
      </View>

      {grupos.length === 0 ? (
        <Card>
          <Text style={styles.empty}>Todavía no hay pastoreos cargados.</Text>
        </Card>
      ) : null}

      {grupos.map((g) => (
        <View key={g.lote.id}>
          <LoteHeader
            dotColor={colorDeSerie(lotes.findIndex((l) => l.id === g.lote.id))}
            title={`Lote ${g.lote.id} · ${g.lote.nombre}`}
            meta={`${g.lote.hectareas} ha · ${nf(g.totalRaciones)} rac.`}
          />
          <PlanillaList>
            {g.filas.map((f) => (
              <PlanillaRow
                key={f.pastoreo.id}
                title={f.rodeo.nombre}
                figure={nf(f.raciones)}
                meta={`${f.pastoreo.cabezas} cab. · ${fd(f.pastoreo.entrada)} → ${fd(f.pastoreo.salida)} (${f.dias} d)`}
                status={f.pastoreo.sincronizado ? 'synced' : 'pending'}
                highlighted={f.pastoreo.id === resaltadoId}
              />
            ))}
          </PlanillaList>
        </View>
      ))}
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  chip: { marginHorizontal: 2, marginBottom: 0 },
  empty: { ...fontBody(), fontSize: fontSize.base, color: color.muted, textAlign: 'center' },
});
