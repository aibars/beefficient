import { calcularCampana, type Campana, type PastoreoCampana } from '@beefficient/domain';
import {
  NOMBRES_MES,
  TEXTO_AVISO,
  avisosDeFila,
  calcularBorrador,
  etiquetaMesCorto,
  resultadosEn,
} from './vista';

const past = (p: Partial<PastoreoCampana> & { id: string }): PastoreoCampana => ({
  loteId: 'l1',
  rodeoId: 'r1',
  cabezas: 100,
  entrada: '2026-12-10',
  salida: '2027-02-05',
  categoriaTabla1Id: null,
  evManual: 1,
  ...p,
});

const campana = (pastoreos: PastoreoCampana[]): Campana => ({
  anio: 2026,
  mesServicio: 11,
  eficienciaCosecha: 50,
  lotes: [
    { id: 'l1', nombre: 'Lote 1', hectareas: 50 },
    { id: 'l2', nombre: 'Lote 2', hectareas: 30 },
  ],
  rodeos: [
    {
      id: 'r1',
      nombre: 'Rodeo 1',
      categoria: 'Vaca',
      pesoVivo: 400,
      ganancia: Array(12).fill(null),
      inicioServicio: null,
      duracionServicio: 90,
      destete: null,
      usaCocimano: false,
    },
  ],
  pastoreos,
});

describe('vista', () => {
  it('NOMBRES_MES tiene los 12 meses', () => {
    expect(NOMBRES_MES).toHaveLength(12);
    expect(NOMBRES_MES[0]).toBe('enero');
    expect(NOMBRES_MES[11]).toBe('diciembre');
  });

  it('etiquetaMesCorto', () => {
    expect(etiquetaMesCorto('2026-12-01')).toBe('dic 26');
    expect(etiquetaMesCorto('2027-01-01')).toBe('ene 27');
  });

  it('resultadosEn elige la unidad', () => {
    const calc = calcularCampana(campana([past({ id: 'p1' })]));
    expect(resultadosEn(calc, 'EV')).toBe(calc.ev);
    expect(resultadosEn(calc, 'MS')).toBe(calc.ms);
  });

  it('un pastoreo a fin de año abarca tres meses y las raciones por mes suman el total', () => {
    const calc = calcularCampana(campana([past({ id: 'p1' })]));
    const r = resultadosEn(calc, 'EV');
    expect(r.porMes.map((m) => m.mes)).toEqual(['2026-12-01', '2027-01-01', '2027-02-01']);
    const suma = r.porMes.reduce((a, m) => a + m.raciones, 0);
    expect(suma).toBeCloseTo(r.racionesTotales, 6);
  });

  it('un pastoreo con solo loteId no lanza y no avisa', () => {
    const p = past({ id: 'p1', rodeoId: null, cabezas: null, entrada: null, salida: null, evManual: null });
    const calc = calcularCampana(campana([p]));
    expect(calc.filas[0]!.dias).toBeNull();
    expect(avisosDeFila(calc.filas[0]!, p, [p])).toEqual([]);
  });

  it('calcularBorrador reemplaza la fila por id o agrega una nueva', () => {
    const base = campana([past({ id: 'p1' })]);
    const original = calcularCampana(base).filas[0]!;
    const mas = calcularBorrador(base, past({ id: 'p1', cabezas: 200 }));
    expect(mas.ev.raciones!).toBeGreaterThan(original.ev.raciones!);
    const nueva = calcularBorrador(base, past({ id: 'nuevo', cabezas: 10 }));
    expect(nueva.pastoreoId).toBe('nuevo');
  });

  it('avisosDeFila marca fechas y superpuesto', () => {
    const a = past({ id: 'a', entrada: '2026-12-10', salida: '2026-12-10' });
    const filaA = calcularCampana(campana([a])).filas[0]!;
    expect(avisosDeFila(filaA, a, [a])).toContain('fechas');

    const x = past({ id: 'x', loteId: 'l1' });
    const y = past({ id: 'y', loteId: 'l2' });
    const calc = calcularCampana(campana([x, y]));
    expect(avisosDeFila(calc.filas[0]!, x, [x, y])).toContain('superpuesto');
  });

  it('TEXTO_AVISO tiene el copy', () => {
    expect(TEXTO_AVISO.fechas).toBe('La salida no es posterior a la entrada');
  });
});
