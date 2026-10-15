import { useState } from 'react';
import {
  CLIMA,
  FORM_BASE,
  calcularRequerimientos,
  etapaDeCategoria,
  formatearNumero as nf,
  racionSugerida,
  totalRodeo,
  type Clima,
  type Etapa,
  type Rodeo,
} from '@beefficient/domain';
import { Card, FieldLabel, Meta, SectionTitle } from '../components/Card';
import { SegmentedControl } from '../components/PillSelector';
import { RationMix } from '../components/RationMix';
import { ResultTile, TileGrid } from '../components/ResultTile';
import { Select } from '../components/Select';
import { Slider } from '../components/Slider';
import { TabBar } from '../components/TabBar';
import { TopBar } from '../components/TopBar';
import { color } from '../theme';
import { ScreenLayout } from './ScreenLayout';
import { TABS, type Seccion } from './tabs';

const SIN_RODEO = '';

const COLOR_INGREDIENTE: Record<string, string> = {
  'Forraje / pastura': color.olive.base,
  'Forraje / heno': color.olive.base,
  'Silaje de maíz': color.olive[400],
  'Grano de maíz': color.accent.base,
  'Núcleo proteico': color.accent[400],
};

export interface FormuladorScreenProps {
  subtitulo: string;
  rodeos: Rodeo[];
  inicial?: { rodeoId?: string; etapa?: Etapa; pesoVivo?: number; clima?: Clima };
  avatar?: string;
  onMenu?: () => void;
  onSeccion?: (s: Seccion) => void;
}

export function FormuladorScreen({ subtitulo, rodeos, inicial, avatar = 'P', onMenu, onSeccion }: FormuladorScreenProps) {
  const rodeoInicial = rodeos.find((r) => r.id === inicial?.rodeoId);
  const [rodeoId, setRodeoId] = useState(rodeoInicial?.id ?? SIN_RODEO);
  const [etapa, setEtapa] = useState<Etapa>(inicial?.etapa ?? (rodeoInicial ? etapaDeCategoria(rodeoInicial.categoria) : 'recria'));
  const [pesoVivo, setPesoVivo] = useState(inicial?.pesoVivo ?? rodeoInicial?.pesoVivo ?? 280);
  const [clima, setClima] = useState<Clima>(inicial?.clima ?? 'templado');

  const rodeo = rodeos.find((r) => r.id === rodeoId);
  const base = FORM_BASE[etapa];
  const req = calcularRequerimientos({ etapa, pesoVivo, clima });
  const total = rodeo ? totalRodeo(req, rodeo.cabezas) : null;
  const racion = racionSugerida(etapa, req.consumoMS).map((i) => ({ ...i, color: COLOR_INGREDIENTE[i.ingrediente] ?? color.neutral[500] }));

  const elegirRodeo = (id: string) => {
    setRodeoId(id);
    const r = rodeos.find((x) => x.id === id);
    if (r) {
      setEtapa(etapaDeCategoria(r.categoria));
      setPesoVivo(r.pesoVivo);
    }
  };

  return (
    <ScreenLayout
      bottomInset={110}
      top={<TopBar title="Formulador de dietas" subtitle={subtitulo} leadingIcon="menu" onLeadingPress={onMenu} avatarInitial={avatar} />}
      footer={<TabBar items={TABS} active="formulador" onChange={onSeccion} />}
    >
      <Card title="Parámetros del animal">
        <FieldLabel label="Rodeo" />
        <Select
          label="Rodeo"
          options={[{ value: SIN_RODEO, label: 'Sin rodeo' }, ...rodeos.map((r) => ({ value: r.id, label: r.nombre }))]}
          value={rodeoId}
          onChange={elegirRodeo}
        />
        {rodeo ? <Meta>{`${rodeo.categoria} · ${rodeo.cabezas} cabezas · ${rodeo.pesoVivo} kg de peso vivo promedio`}</Meta> : null}

        <FieldLabel label="Etapa productiva" />
        <SegmentedControl
          accessibilityLabel="Etapa productiva"
          options={(Object.keys(FORM_BASE) as Etapa[]).map((k) => ({ value: k, label: FORM_BASE[k].label }))}
          value={etapa}
          onChange={setEtapa}
        />

        <Slider
          label="Peso vivo"
          value={pesoVivo}
          min={150}
          max={650}
          step={5}
          onChange={setPesoVivo}
          formatValue={(v) => `${v} kg`}
          minLabel="150 kg"
          maxLabel="650 kg"
        />

        <FieldLabel label="Ambiente térmico" />
        <SegmentedControl
          accessibilityLabel="Ambiente térmico"
          options={(Object.keys(CLIMA) as Clima[]).map((k) => ({ value: k, label: CLIMA[k].label }))}
          value={clima}
          onChange={setClima}
        />
      </Card>

      <SectionTitle>{`Requerimientos diarios · ${base.label}`}</SectionTitle>
      <TileGrid>
        {rodeo && total ? (
          <ResultTile
            variant="herd"
            label={`Para todo el rodeo · ${rodeo.cabezas} cabezas`}
            value={nf(total.consumoMS)}
            unit="kg MS/día"
            detail={`${nf(total.energia)} Mcal EM · ${nf(total.proteina)} kg PB por día`}
          />
        ) : null}
        <ResultTile icon="fork" label="Consumo de MS" value={nf(req.consumoMS, 1)} unit="kg MS/día" detail={`${nf(base.msPct, 1)}% del peso vivo`} />
        <ResultTile icon="bolt" label="Energía metabolizable" value={nf(req.energia, 1)} unit="Mcal/día" detail={`${nf(base.em, 2)} Mcal/kg MS`} />
        <ResultTile icon="drop" label="Proteína bruta" value={nf(req.proteina, 2)} unit="kg PB/día" detail={`${nf(base.pb, 1)}% de la MS`} />
        <ResultTile icon="bone" label="Calcio" value={nf(req.calcio)} unit="g/día" detail={`${nf(base.ca, 2)}% de la MS`} />
        <ResultTile icon="bone" label="Fósforo" value={nf(req.fosforo)} unit="g/día" detail={`${nf(base.p, 2)}% de la MS`} />
        <ResultTile icon="trend" label="GDP objetivo" value={nf(req.gdp, 3)} unit="kg/día" detail="ganancia diaria de peso" />
      </TileGrid>

      <SectionTitle>Ración sugerida</SectionTitle>
      <Card style={{ paddingTop: 8, paddingBottom: 10 }}>
        <RationMix items={racion} />
      </Card>
    </ScreenLayout>
  );
}
