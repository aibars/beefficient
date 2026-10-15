import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  buscarSuperposicion,
  calcularPastoreo,
  formatearFechaCorta,
  formatearNumero as nf,
  type Lote,
  type Pastoreo,
  type Rodeo,
} from '@beefficient/domain';
import { BottomBar } from '../components/BottomBar';
import { Card, FieldLabel, Meta, SectionTitle } from '../components/Card';
import { DateField } from '../components/DateField';
import { Notice } from '../components/Notice';
import { PillSelector } from '../components/PillSelector';
import { ResultTile, TileGrid } from '../components/ResultTile';
import { Select } from '../components/Select';
import { Slider } from '../components/Slider';
import { StatusChip } from '../components/SyncStamp';
import { TopBar } from '../components/TopBar';
import { colorDeSerie } from '../theme';
import { ScreenLayout } from './ScreenLayout';

export type NuevoPastoreo = Omit<Pastoreo, 'id' | 'sincronizado'>;

export interface NuevoPastoreoScreenProps {
  /** "La Esperanza · Campaña 26/27". */
  subtitulo: string;
  lotes: Lote[];
  rodeos: Rodeo[];
  /** Pastoreos ya cargados, para avisar si el rodeo sigue en otro lote. */
  pastoreos: Pastoreo[];
  inicial?: Partial<NuevoPastoreo>;
  sinConexion?: boolean;
  avatar?: string;
  onGuardar?: (p: NuevoPastoreo) => void;
  onVolver?: () => void;
}

export function NuevoPastoreoScreen({
  subtitulo,
  lotes,
  rodeos,
  pastoreos,
  inicial,
  sinConexion,
  avatar = 'P',
  onGuardar,
  onVolver,
}: NuevoPastoreoScreenProps) {
  const rodeoInicial = rodeos.find((r) => r.id === inicial?.rodeoId) ?? rodeos[0]!;
  const [loteId, setLoteId] = useState(inicial?.loteId ?? lotes[0]!.id);
  const [rodeoId, setRodeoId] = useState(rodeoInicial.id);
  const [cabezas, setCabezas] = useState(inicial?.cabezas ?? rodeoInicial.cabezas);
  const [entrada, setEntrada] = useState(inicial?.entrada ?? '');
  const [salida, setSalida] = useState(inicial?.salida ?? '');

  const lote = lotes.find((l) => l.id === loteId)!;
  const rodeo = rodeos.find((r) => r.id === rodeoId)!;
  const calculo = calcularPastoreo({ lote, rodeo, cabezas, entrada, salida });
  const ocupado = buscarSuperposicion(pastoreos, { rodeoId, loteId, entrada });
  const loteOcupado = ocupado && lotes.find((l) => l.id === ocupado.loteId);

  const opcionesLote = useMemo(
    () =>
      lotes.map((l, i) => ({
        value: l.id,
        label: `Lote ${l.id} · ${l.nombre}`,
        sublabel: `${l.hectareas} ha`,
        dotColor: colorDeSerie(i),
      })),
    [lotes],
  );

  const elegirRodeo = (id: string) => {
    const r = rodeos.find((x) => x.id === id)!;
    setRodeoId(id);
    setCabezas(r.cabezas);
  };

  const c = calculo.valido ? calculo : null;

  return (
    <ScreenLayout
      top={<TopBar title="Nuevo pastoreo" subtitle={subtitulo} leadingLabel="Volver a la planilla" onLeadingPress={onVolver} avatarInitial={avatar} />}
      footer={
        <BottomBar
          summary={c ? `${nf(c.raciones)} raciones` : 'Revisá las fechas'}
          detail={c ? `Lote ${lote.id} · ${nf(c.carga, 2)} EV/ha · ${c.dias} días` : `Lote ${lote.id}`}
          actionLabel="Guardar"
          actionDisabled={!c}
          onAction={() => onGuardar?.({ loteId, rodeoId, cabezas, entrada, salida })}
        />
      }
    >
      {sinConexion ? (
        <View style={styles.chip}>
          <StatusChip icon="offline" label="Sin conexión" />
        </View>
      ) : null}

      <Card title="Datos del pastoreo">
        <FieldLabel label="Lote" />
        <PillSelector accessibilityLabel="Lote" options={opcionesLote} value={loteId} onChange={setLoteId} />

        <FieldLabel label="Rodeo" />
        <Select label="Rodeo" options={rodeos.map((r) => ({ value: r.id, label: r.nombre }))} value={rodeoId} onChange={elegirRodeo} />
        <Meta>{`${rodeo.categoria} · ${rodeo.pesoVivo} kg de peso vivo promedio`}</Meta>

        <Slider
          label="Cabezas"
          value={cabezas}
          min={1}
          max={rodeo.cabezas}
          onChange={setCabezas}
          formatValue={(v) => `${v} cab.`}
          maxLabel={`${rodeo.cabezas} en el rodeo`}
        />
        {ocupado && loteOcupado ? (
          <View style={styles.notice}>
            <Notice
              tone="warning"
              message={`${rodeo.nombre} sigue en el Lote ${loteOcupado.id} · ${loteOcupado.nombre} hasta el ${formatearFechaCorta(ocupado.salida)}.`}
              action={{ label: `Entrar el ${formatearFechaCorta(ocupado.salida)}`, onPress: () => setEntrada(ocupado.salida) }}
            />
          </View>
        ) : null}

        <FieldLabel label="Fechas" />
        <View style={styles.dates}>
          <DateField label="Entrada" value={entrada} onChange={setEntrada} invalid={!c} />
          <DateField label="Salida" value={salida} onChange={setSalida} invalid={!c} />
        </View>
        {!c ? (
          <View style={styles.notice}>
            <Notice tone="error" message="La salida tiene que ser posterior a la entrada. Corregí las fechas para ver el cálculo." />
          </View>
        ) : null}
      </Card>

      <SectionTitle>{`Resultado · Lote ${lote.id}`}</SectionTitle>
      <TileGrid>
        <ResultTile
          variant="lead"
          label="Raciones"
          value={c ? nf(c.raciones) : ''}
          detail={c ? `${nf(c.racionesPorHa, 1)} raciones/ha · ${lote.hectareas} ha` : undefined}
          empty={!c}
        />
        <ResultTile icon="calendar" label="Días de pastoreo" value={c ? nf(c.dias) : ''} empty={!c} />
        <ResultTile icon="cow" label="EV totales" value={c ? nf(c.evTotales, 1) : ''} detail={c ? `${nf(c.evPorCabeza, 2)} EV/cab.` : undefined} empty={!c} />
        <ResultTile icon="area" label="Carga" value={c ? nf(c.carga, 2) : ''} unit="EV/ha" empty={!c} />
        <ResultTile
          icon="leaf"
          label="Consumo de MS"
          value={c ? nf(c.consumoMS) : ''}
          unit="kg/día"
          detail={`${nf(rodeo.pctPesoVivoMS, 1)}% del peso vivo`}
          empty={!c}
        />
        <ResultTile
          wide
          icon="scale"
          label="Oferta necesaria"
          value={c ? nf(c.ofertaMS) : ''}
          unit="kg MS/día"
          detail={c ? `${nf(c.ofertaPeriodo)} kg MS en el período` : undefined}
          empty={!c}
        />
      </TileGrid>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  chip: { marginBottom: 12, marginHorizontal: 2 },
  notice: { marginTop: 14 },
  dates: { flexDirection: 'row', gap: 10 },
});
