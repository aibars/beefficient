// Copia literal del Engine de docs/fuentes/planila de pastoreo 18.9.26.html (workspace), 2026-10-29. Solo para tests de fidelidad. No editar.
const Engine = (() => {
  'use strict';
  const MESES = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  const MES3 = ['ene','feb','mar','abr','may','jun','jul','ago','sept','oct','nov','dic'];
  const ESTADOS = ['Parto','Parto','Parto','Servicio','Servicio','Servicio','Destete','Gestación','Gestación','Gestación','Gestación','Gestación'];
  const CAT_RODEO = ['Vaca','Vaquillona 1er servicio','Vaquillona 2do servicio','Vaquillona de reposición','Toro','Ternero/a recría','Novillito','Novillo'];
  const CAT_REPRO = ['Vaca','Vaquillona 1er servicio','Vaquillona 2do servicio'];
  const DUR_SERV = [60, 75, 90, 105, 120];
  const SANIDADES = ['Destete','Aftosa','Brucelosis','Carbunclo','IBR-DVB','Otra'];
  const _ = null;
  // Tabla 1 (Corcimano et al., 1975). EV por mes del ciclo; null = no aplica.
  const BASE = [
    ['Vacas de cría',[1.043,1.064,1.16,1.214,1.34,1.394,1.46,0.8,0.82,0.852,0.922,0.99]],
    ['Vacas CUT',[1.052,1.067,1.178,1.232,1.358,1.412,1.466,0.8,0.824,0.86,0.936,1.006]],
    ['Vaca 2º servicio',[1.3,1.35,0.9,0.9,1,1,1,0.9,0.9,0.95,0.95,1]],
    ['Vaq 1º Serv. 2 a 3 años',[0.74,0.76,0.78,0.81,0.83,0.85,0.89,0.99,1,1.05,1.1,1.15]],
    ['Vaq Repos. 1 a 2 años',[0.63,0.64,0.65,0.66,0.67,0.68,0.69,0.7,0.71,0.71,0.72,0.75]],
    ['Terneras Vc',[_,_,_,_,_,_,_,0.58,0.6,0.61,0.62,0.63]],
    ['Terneros Vc',[_,_,_,_,_,_,_,0.6,0.61,0.62,0.63,0.65]],
    ['Terneras Vq',[_,0.52,0.53,0.54,0.554,0.56,0.57,0.58,0.6,0.61,0.62,0.63]],
    ['Terneros Vq',[_,0.54,0.55,0.56,0.57,0.59,0.6,0.6,0.61,0.62,0.63,0.64]],
    ['Toros',[1.3,1.3,1.3,1.3,1.3,1.3,1.3,1.3,1.3,1.3,1.3,1.3]],
    ['Toritos 2 a 3 años',[1.04,1.08,1.12,1.16,1.2,1.2,1.2,1.2,1.2,1.2,1.2,1.1]],
    ['Toritos 1 a 2 años',[0.65,0.68,0.71,0.75,0.78,0.81,0.84,0.87,0.9,0.94,0.97,1]],
    ['Vacas de invernada',[1,1,1,1,1,1,1,1,1,1,1,1]],
    ['Vaq 2 a 3 de invernada',[1,1,1,1,1,1,1,1,1,1,1,1]],
    ['Vaq 1 a 2 de invernada',[0.63,0.64,0.65,0.66,0.66,0.67,0.68,0.69,0.7,0.7,0.72,0.75]],
    ['Nov 1 a 2',[0.65,0.66,0.67,0.68,0.68,0.69,0.7,0.71,0.72,0.73,0.75,0.77]],
  ];
  const BASE_FIJAS = BASE.length; // filas 1-16 no editables; 17-20 libres
  // Grupo de consumo de MS que corresponde a cada categoría de la Tabla 1 ('vaca' se resuelve por mes del ciclo)
  const MS_DE_CAT = {
    'vacas de cría': 'vaca', 'vacas cut': 'vaca', 'vaca 2º servicio': 'vaca', 'vacas de invernada': 'vaca',
    'vaq 1º serv. 2 a 3 años': 'vaq2', 'vaq 2 a 3 de invernada': 'vaq2', 'vaq repos. 1 a 2 años': 'vaq1', 'vaq 1 a 2 de invernada': 'vaq1',
    'terneras vc': 'tern', 'terneros vc': 'tern', 'terneras vq': 'tern', 'terneros vq': 'tern',
    'toros': 'toro', 'toritos 2 a 3 años': 'toro', 'toritos 1 a 2 años': 'novt', 'nov 1 a 2': 'novt',
  };
  // Grupo de consumo de MS de cada categoría de rodeo (para filas sin categoría de Tabla 1)
  const MS_DE_RODEO = { 'vaca': 'vaca', 'vaquillona 1er servicio': 'vaq2', 'vaquillona 2do servicio': 'vaca', 'vaquillona de reposición': 'vaq1', 'toro': 'toro', 'ternero/a recría': 'tern', 'novillito': 'novt', 'novillo': 'nov' };

  /* ---- EV para vacas y vaquillonas de cría (Cocimano, Lange y Menvielle, 1975; tabla de Bavera 2006) ---- */
  const CORC_COLS = ['Lactancia 1º y 2º mes','Lactancia 3º y 4º mes','Lactancia 5º y 6º mes','Lactancia 7º y 8º mes','Vaca seca y vaquillona','Gestación 6º mes','Gestación 7º mes','Gestación 8º mes','Gestación 9º mes'];
  const CORC_COLS_CORTO = ['Lact. 1-2','Lact. 3-4','Lact. 5-6','Lact. 7-8','Seca / vaq.','Gest. 6º','Gest. 7º','Gest. 8º','Gest. 9º'];
  const CORC_GAN = [-200, -100, 0, 250, 500, 750];
  const CORC_PESOS = [300, 350, 400, 450, 500, 550];
  // CORC[peso][índice de ganancia][columna]
  const CORC = {
    300: [[0.88,1.06,1.24,1.30,0.61,0.65,0.69,0.79,0.85],[0.90,1.08,1.26,1.32,0.63,0.67,0.71,0.81,0.87],[0.93,1.11,1.29,1.35,0.66,0.70,0.74,0.84,0.90],[1.03,1.21,1.39,1.45,0.76,0.80,0.84,0.94,1.00],[1.15,1.33,1.51,1.57,0.88,0.92,0.96,1.06,1.12],[1.29,1.47,1.65,1.71,1.02,1.06,1.10,1.20,1.26]],
    350: [[0.91,1.09,1.27,1.33,0.64,0.68,0.72,0.82,0.88],[0.93,1.11,1.29,1.35,0.66,0.70,0.74,0.84,0.90],[0.96,1.14,1.32,1.38,0.69,0.73,0.77,0.87,0.93],[1.08,1.26,1.44,1.50,0.81,0.85,0.89,0.99,1.05],[1.21,1.39,1.57,1.63,0.94,0.98,1.02,1.12,1.18],[1.36,1.54,1.72,1.78,1.09,1.13,1.17,1.27,1.33]],
    400: [[0.94,1.12,1.30,1.36,0.67,0.71,0.75,0.85,0.91],[0.97,1.15,1.33,1.39,0.70,0.74,0.78,0.88,0.94],[1.00,1.18,1.36,1.42,0.73,0.77,0.81,0.91,0.97],[1.13,1.31,1.49,1.55,0.86,0.90,0.94,1.04,1.10],[1.28,1.46,1.64,1.70,1.01,1.05,1.09,1.19,1.25],[1.45,1.63,1.81,1.87,1.18,1.22,1.26,1.36,1.42]],
    450: [[1.00,1.18,1.36,1.42,0.73,0.77,0.81,0.91,0.97],[1.03,1.21,1.39,1.45,0.76,0.80,0.84,0.94,1.00],[1.07,1.25,1.43,1.49,0.80,0.84,0.88,0.98,1.04],[1.21,1.39,1.57,1.63,0.94,0.98,1.02,1.12,1.18],[1.37,1.55,1.73,1.79,1.10,1.14,1.18,1.28,1.34],[1.55,1.73,1.91,1.87,1.28,1.32,1.36,1.46,1.52]],
    500: [[1.05,1.23,1.40,1.47,0.78,0.82,0.84,0.96,1.01],[1.09,1.27,1.44,1.51,0.82,0.86,0.88,1.00,1.06],[1.13,1.31,1.48,1.55,0.86,0.90,0.92,1.04,1.10],[1.29,1.47,1.64,1.71,1.02,1.06,1.08,1.20,1.26],[1.47,1.64,1.81,1.88,1.19,1.23,1.26,1.38,1.44],[1.67,1.84,2.01,2.07,1.38,1.42,1.45,1.58,1.64]],
    550: [[1.13,1.30,1.47,1.55,0.86,0.90,0.92,1.04,1.09],[1.17,1.35,1.52,1.59,0.90,0.94,0.96,1.08,1.13],[1.22,1.39,1.56,1.63,0.94,0.98,1.00,1.12,1.18],[1.39,1.56,1.73,1.80,1.11,1.15,1.18,1.30,1.36],[1.58,1.76,1.93,1.99,1.30,1.34,1.37,1.49,1.55],[1.80,1.98,2.15,2.21,1.52,1.56,1.59,1.71,1.77]],
  };
  // EV para vaquillonas livianas (misma fuente). Continúa en la columna "Vacas secas y vaquillonas" desde 300 kg.
  const CORC_VAQ_GAN = [-200, -100, 0, 250, 500, 750, 1000, 1250];
  const CORC_VAQ_PESOS = [150, 200, 250];
  const CORC_VAQ = { 150: [0.46,0.48,0.50,0.56,0.63,0.71,0.80,0.90], 200: [0.50,0.52,0.54,0.62,0.71,0.80,0.91,1.03], 250: [0.56,0.58,0.60,0.69,0.80,0.91,1.04,1.18] };

  /* ---- consumo de MS: %PV por grupo (referencia orientativa, BCNRM 2016, pastura de buena calidad) ---- */
  const PVMS_DEF = [
    { k: 'lact', n: 'Vaca lactando (incluye ternero al pie)', pv: 450, pct: 2.7 },
    { k: 'seca', n: 'Vaca seca', pv: 450, pct: 2.0 },
    { k: 'gest', n: 'Vaca en gestación avanzada (6º a 9º mes)', pv: 450, pct: 2.2 },
    { k: 'vaq2', n: 'Vaquillona 1er servicio (2 a 3 años)', pv: 350, pct: 2.5 },
    { k: 'vaq1', n: 'Vaquillona de reposición (1 a 2 años)', pv: 250, pct: 2.6 },
    { k: 'toro', n: 'Toro', pv: 700, pct: 1.8 },
    { k: 'tern', n: 'Ternero/a de recría', pv: 200, pct: 2.8 },
    { k: 'novt', n: 'Novillito', pv: 300, pct: 2.6 },
    { k: 'nov', n: 'Novillo', pv: 400, pct: 2.4 },
  ];
  const PVMS_KEYS = PVMS_DEF.map(p => p.k);
  // supuestos editables
  const SUP_DEF = { gest: 283, fracServ: 0.4, margen: 50, mcalEV: 18.54, fracVaca: 0.45, mcalKg: 12, kgCC9: 35, kgCC5: 70, diasMes: 30.4375 };
  const SUP_TXT = {
    gest: 'Duración de la gestación (días)', fracServ: 'Momento medio de concepción dentro del servicio (fracción de la duración)',
    margen: 'Margen de extrapolación de peso fuera de la tabla (kg)', mcalEV: 'Energía metabolizable de 1 EV (Mcal EM por día)', fracVaca: 'Fracción del ahorro de EV por destete que corresponde a la vaca (el resto es forraje que comía el ternero)',
    mcalKg: 'Mcal EM necesarias por kg de peso vivo de reserva', kgCC9: 'kg de peso vivo por punto de condición corporal (escala 1 a 9)',
    kgCC5: 'kg de peso vivo por punto de condición corporal (escala 1 a 5)', diasMes: 'Días por mes para contar meses de lactancia y gestación',
  };
  const DAY = 86400000;
  const coll = new Intl.Collator('es', { sensitivity: 'base' });

  const isNum = v => typeof v === 'number' && isFinite(v);
  const key = s => String(s == null ? '' : s).toLocaleLowerCase('es');
  const str = v => (v == null ? '' : String(v));
  const numOrNull = v => (isNum(v) ? v : null);

  function dayOf(iso) {
    if (!iso) return null;
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
    return m ? Date.UTC(+m[1], +m[2] - 1, +m[3]) / DAY : null;
  }
  function isoOf(d) {
    const t = new Date(d * DAY);
    return t.getUTCFullYear() + '-' + String(t.getUTCMonth() + 1).padStart(2, '0') + '-' + String(t.getUTCDate()).padStart(2, '0');
  }
  function ymd(d) { const t = new Date(d * DAY); return { y: t.getUTCFullYear(), m: t.getUTCMonth() + 1, d: t.getUTCDate() }; }
  function mStart(d) { const p = ymd(d); return Date.UTC(p.y, p.m - 1, 1) / DAY; }
  function addM(ms, n) { const p = ymd(ms); return Date.UTC(p.y, p.m - 1 + n, 1) / DAY; }
  const mesLargo = ms => { const p = ymd(ms); return MESES[p.m - 1] + ' ' + p.y; };
  const mesCorto = ms => { const p = ymd(ms); return MES3[p.m - 1] + '-' + String(p.y).slice(2); };
  const diasDelMes = (y, m) => (Date.UTC(y, m, 1) - Date.UTC(y, m - 1, 1)) / DAY;

  // Columna MES de la Planilla
  function mesLabel(A, H) {
    const a = ymd(A);
    if (H == null) return MESES[a.m - 1] + ' ' + a.y;
    const h = ymd(H - 1);
    if (a.y === h.y && a.m === h.m) return MESES[a.m - 1] + ' ' + a.y;
    return MES3[a.m - 1] + ' a ' + MES3[h.m - 1] + ' ' + h.y;
  }

  // Mes del ciclo para un mes calendario: MOD(mes - servicio + 3; 12) + 1
  const cicloDe = (mesCal, mesServ) => ((((mesCal - mesServ + 3) % 12) + 12) % 12) + 1;

  function plantillaBase() {
    const rows = BASE.map(([n, ev]) => ({ n, ev: ev.slice(), aj: Array(12).fill(null), ms: '' }));
    while (rows.length < 20) rows.push({ n: '', ev: Array(12).fill(null), aj: Array(12).fill(null), ms: '' });
    return rows;
  }

  /* ---------- normalización de la campaña (compatible hacia atrás) ---------- */
  function normBase(b) {
    const out = [];
    for (let i = 0; i < 20; i++) {
      const r = (b && b[i]) || {};
      const ev = [], aj = [];
      for (let c = 0; c < 12; c++) { ev.push(numOrNull(r.ev && r.ev[c])); aj.push(numOrNull(r.aj && r.aj[c])); }
      out.push({ n: str(r.n), ev, aj, ms: PVMS_KEYS.includes(r.ms) ? r.ms : '' });
    }
    return out;
  }
  function normRodeo(r) {
    r = r || {};
    const gan = Array(12).fill(null);
    if (Array.isArray(r.gan)) for (let i = 0; i < 12; i++) gan[i] = numOrNull(r.gan[i]);
    const dur = Number(r.dur);
    return {
      n: str(r.n), c: str(r.c), pv: numOrNull(r.pv), gan,
      srv: /^\d{4}-\d{2}-\d{2}$/.test(str(r.srv)) ? r.srv : '',
      dur: DUR_SERV.includes(dur) ? dur : 90,
      dest: /^\d{4}-\d{2}-\d{2}$/.test(str(r.dest)) ? r.dest : '',
      corc: r.corc !== false,
      esc: Number(r.esc) === 9 ? 9 : 5,
    };
  }
  function normPvms(p) {
    return PVMS_DEF.map(d => {
      const x = (p && p.find && p.find(q => q && q.k === d.k)) || {};
      return { k: d.k, n: d.n, pv: isNum(x.pv) ? x.pv : d.pv, pct: isNum(x.pct) ? x.pct : d.pct };
    });
  }
  function normSup(s) {
    const o = {};
    Object.keys(SUP_DEF).forEach(k => { o[k] = (s && isNum(s[k])) ? s[k] : SUP_DEF[k]; });
    return o;
  }
  const fechaOk = v => (/^\d{4}-\d{2}-\d{2}$/.test(str(v)) ? v : '');
  function normCamp(d, anio) {
    d = d || {};
    const ms = Math.round(Number(d.mesServicio));
    const ef = Number(d.efic);
    const lluvia = Array(12).fill(null);
    if (Array.isArray(d.lluvia)) for (let i = 0; i < 12; i++) lluvia[i] = numOrNull(d.lluvia[i]);
    const cnt = (a, n) => { const o = Array(n).fill(0); if (Array.isArray(a)) for (let i = 0; i < n; i++) o[i] = isNum(a[i]) ? Math.max(0, Math.round(a[i])) : 0; return o; };
    return {
      anio: Number(d.anio || anio),
      mesServicio: ms >= 1 && ms <= 12 ? ms : 1,
      unidad: d.unidad === 'MS' ? 'MS' : 'EV',
      efic: ef > 0 && ef <= 100 ? ef : 50,
      lotes: (d.lotes || []).map(l => ({ n: str(l.n), h: numOrNull(l.h) })),
      rodeos: (d.rodeos || []).map(normRodeo),
      base: d.base ? normBase(d.base) : plantillaBase(),
      movs: (d.movs || []).map(m => ({ e: fechaOk(m.e), l: str(m.l), r: str(m.r), c: numOrNull(m.c), k: str(m.k), s: fechaOk(m.s), ev: numOrNull(m.ev) })),
      pvms: normPvms(d.pvms),
      sup: normSup(d.sup),
      lluvia,
      movRodeo: (d.movRodeo || []).map(x => ({ r: str(x.r), f: fechaOk(x.f), t: ['entrada', 'salida', 'muerte'].includes(x.t) ? x.t : 'entrada', c: numOrNull(x.c), obs: str(x.obs) })),
      repro: (d.repro || []).map(x => ({ r: str(x.r), ent: numOrNull(x.ent), tac: numOrNull(x.tac), pre: numOrNull(x.pre), par: numOrNull(x.par), des: numOrNull(x.des) })),
      eventos: (d.eventos || []).map(x => ({ r: str(x.r), f: fechaOk(x.f), tipo: SANIDADES.includes(x.tipo) ? x.tipo : 'Otra', prod: str(x.prod), obs: str(x.obs) })),
      pesadas: (d.pesadas || []).map(x => ({ r: str(x.r), f: fechaOk(x.f), pv: numOrNull(x.pv), c: numOrNull(x.c), sd: numOrNull(x.sd) })),
      obs: (d.obs || []).map(x => { const tipo = x.tipo === 'heces' ? 'heces' : 'cc'; const esc = tipo === 'heces' ? 5 : (Number(x.esc) === 9 ? 9 : 5); return { r: str(x.r), f: fechaOk(x.f), tipo, esc, cnt: cnt(x.cnt, esc) }; }),
      mapa: (d.mapa && Array.isArray(d.mapa.pot)) ? { src: str(d.mapa.src), pot: d.mapa.pot.map(p => ({ n: str(p.n), h: numOrNull(p.h), pts: Array.isArray(p.pts) ? p.pts : [] })) } : { src: '', pot: [] },
      actualizado: str(d.actualizado),
    };
  }

  /* ---------- Corcimano: interpolación ---------- */
  function interp1(xs, ys, x) {
    if (x <= xs[0]) return ys[0];
    const n = xs.length;
    if (x >= xs[n - 1]) return ys[n - 1];
    let i = 0; while (x > xs[i + 1]) i++;
    return ys[i] + (ys[i + 1] - ys[i]) * (x - xs[i]) / (xs[i + 1] - xs[i]);
  }
  // EV de la tabla para un peso, una ganancia diaria (g/día) y una columna (0..8). Devuelve { ev, warn: [] }
  function evCorc(pv, g, col, sup) {
    sup = sup || SUP_DEF;
    const warn = [];
    let gg = isNum(g) ? g : 0;
    if (gg < CORC_GAN[0]) { gg = CORC_GAN[0]; warn.push('gan'); }
    if (gg > CORC_GAN[CORC_GAN.length - 1]) { gg = CORC_GAN[CORC_GAN.length - 1]; warn.push('gan'); }
    const pesos = col === 4 ? CORC_VAQ_PESOS.concat(CORC_PESOS) : CORC_PESOS;
    const evAt = p => interp1(CORC_GAN, p < 300 ? CORC_VAQ[p].slice(0, 6) : CORC[p].map(r => r[col]), gg);
    const min = pesos[0], max = pesos[pesos.length - 1];
    let pp = pv;
    if (pv < min) { if (pv < min - sup.margen) { pp = min - sup.margen; warn.push('fuera'); } else warn.push('extrap'); }
    else if (pv > max) { if (pv > max + sup.margen) { pp = max + sup.margen; warn.push('fuera'); } else warn.push('extrap'); }
    let i = 0; while (i < pesos.length - 2 && pp > pesos[i + 1]) i++;
    const p0 = pesos[i], p1 = pesos[i + 1];
    const e0 = evAt(p0), e1 = evAt(p1);
    return { ev: e0 + (e1 - e0) * (pp - p0) / (p1 - p0), warn, pesoUsado: pp, gan: gg };
  }

  /* ---------- estado fisiológico por fechas ---------- */
  const tipoHembra = c => { c = key(c); return (c === 'vaca' || c === 'vaquillona 2do servicio') ? 'vaca' : c === 'vaquillona 1er servicio' ? 'vaq2' : c === 'vaquillona de reposición' ? 'vaq1' : null; };
  // Parámetros de la vaca promedio del rodeo
  function paramsRodeo(rodeo, camp) {
    const tipo = tipoHembra(rodeo.c);
    if (!tipo) return null;
    const sup = camp.sup || SUP_DEF;
    const S = dayOf(rodeo.srv) != null ? dayOf(rodeo.srv) : Date.UTC(camp.anio, camp.mesServicio - 1, 1) / DAY;
    const D = DUR_SERV.includes(rodeo.dur) ? rodeo.dur : 90;
    const C = S + Math.round(sup.fracServ * D);   // concepción media
    const P = C + sup.gest;                        // parto de la vaca promedio (del servicio de esta campaña)
    const sm = ymd(S);
    const Wdef = Date.UTC(sm.y, sm.m - 1 + 4, 1) / DAY; // fin del mes 7 del ciclo (mes de servicio + 3)
    const W = dayOf(rodeo.dest) != null ? dayOf(rodeo.dest) : Wdef;
    return { tipo, S, D, C, P, W, Wdef, sup };
  }
  // Estado en el día T; W permite evaluar otra fecha de destete
  function estadoEn(pr, T, W) {
    if (W == null) W = pr.W;
    const per = 365, dm = pr.sup.diasMes;
    if (pr.tipo === 'vaq1') return { st: 'vaq', col: 4, lm: 0, gm: 0 };
    if (pr.tipo === 'vaq2' && T < pr.C) return { st: 'vaq', col: 4, lm: 0, gm: 0 };
    const Pk = pr.P + per * Math.floor((T - pr.P) / per);   // último parto de la vaca promedio (≤ T)
    let lact = false, lm = 0;
    if (pr.tipo === 'vaca' || T >= pr.P) {
      let Wk = W + per * Math.floor((Pk - W) / per);
      while (Wk <= Pk) Wk += per;                            // destete del ciclo que empezó en Pk
      lm = Math.floor((T - Pk) / dm) + 1;
      lact = T < Wk;
    }
    if (lact) return { st: 'lact', col: Math.min(3, Math.ceil(lm / 2) - 1), lm, gm: 0 };
    const Ck = pr.C + per * Math.floor((T - pr.C) / per);   // última concepción (≤ T)
    const gm = Math.floor((T - Ck) / dm) + 1;
    if (gm >= 6) return { st: 'gest', col: 4 + Math.min(gm, 9) - 5, lm: 0, gm };
    return { st: pr.tipo === 'vaq2' ? 'vaq' : 'seca', col: 4, lm: 0, gm };
  }
  const usaCorc = (rodeo, camp) => !!rodeo && rodeo.corc !== false && isNum(rodeo.pv) && !!tipoHembra(rodeo.c);
  // EV de un rodeo en un mes calendario (evaluado al día 15)
  function evMes(rodeo, camp, y, m, W) {
    const pr = paramsRodeo(rodeo, camp);
    if (!pr || !isNum(rodeo.pv)) return null;
    const T = Date.UTC(y, m - 1, 15) / DAY;
    const e = estadoEn(pr, T, W);
    const g = (rodeo.gan && isNum(rodeo.gan[m - 1])) ? rodeo.gan[m - 1] : 0;
    const r = evCorc(rodeo.pv, g, e.col, camp.sup);
    const msKey = e.st === 'lact' ? 'lact' : e.st === 'gest' ? 'gest' : e.st === 'seca' ? 'seca' : (pr.tipo === 'vaq1' ? 'vaq1' : 'vaq2');
    return { ev: r.ev, warn: r.warn, st: e.st, col: e.col, lm: e.lm, gm: e.gm, g, msKey, pesoUsado: r.pesoUsado };
  }
  // Los 12 meses del año de la campaña
  function evAnio(rodeo, camp, W) {
    const out = [];
    for (let m = 1; m <= 12; m++) out.push(evMes(rodeo, camp, camp.anio, m, W));
    return out;
  }
  // Efecto del destete anticipado o tardío respecto del destete por defecto (mes 7 del ciclo)
  function efectoDestete(rodeo, camp) {
    const pr = paramsRodeo(rodeo, camp);
    if (!pr || !isNum(rodeo.pv) || !rodeo.dest) return null;
    const act = evAnio(rodeo, camp), def = evAnio(rodeo, camp, pr.Wdef);
    let dEVd = 0;
    const meses = [];
    for (let m = 1; m <= 12; m++) {
      const d = diasDelMes(camp.anio, m);
      const a = act[m - 1].ev, b = def[m - 1].ev;
      dEVd += (a - b) * d;
      meses.push({ m, act: a, def: b, stAct: act[m - 1].st, stDef: def[m - 1].st, dias: d });
    }
    const sup = camp.sup;
    const kg = -dEVd * sup.mcalEV * sup.fracVaca / sup.mcalKg;   // EV de menos = reserva de más
    const kgPunto = rodeo.esc === 9 ? sup.kgCC9 : sup.kgCC5;
    let dias = (pr.W - pr.Wdef) % 365; if (dias > 182) dias -= 365; if (dias <= -183) dias += 365;  // corrimiento dentro del mismo ciclo
    return { dias, W: pr.W, Wdef: pr.Wdef, dEVd, kg, cc: kg / kgPunto, meses };
  }

  // Tabla 3: EV vigente por mes calendario
  function vigente(camp) {
    const ms = camp.mesServicio;
    const ciclo = [], estado = [];
    for (let c = 1; c <= 12; c++) { const k = cicloDe(c, ms); ciclo.push(k); estado.push(ESTADOS[k - 1]); }
    const names = [], grid = [], fromAj = [];
    (camp.base || []).forEach(b => {
      names.push(b.n || '');
      const row = [], fa = [];
      for (let c = 0; c < 12; c++) {
        const aj = b.aj ? b.aj[c] : null;
        if (isNum(aj)) { row.push(aj); fa.push(true); }
        else { const v = b.ev[ciclo[c] - 1]; row.push(isNum(v) ? v : null); fa.push(false); }
      }
      grid.push(row); fromAj.push(fa);
    });
    return { ciclo, estado, names, grid, fromAj };
  }

  function contexto(camp) {
    const vig = vigente(camp);
    const has = new Map();
    let supTotal = 0;
    (camp.lotes || []).forEach(l => {
      const h = isNum(l.h) ? l.h : 0;
      supTotal += h;
      if (l.n && !has.has(key(l.n))) has.set(key(l.n), h);
    });
    const catIdx = new Map();
    vig.names.forEach((n, i) => { if (n && !catIdx.has(key(n))) catIdx.set(key(n), i); });
    const rodeoCat = new Map(), rodeos = new Map();
    (camp.rodeos || []).forEach(r => { if (r.n && !rodeos.has(key(r.n))) { rodeos.set(key(r.n), r); rodeoCat.set(key(r.n), r.c || ''); } });
    const pvms = new Map();
    (camp.pvms || PVMS_DEF).forEach(p => pvms.set(p.k, p));
    const lotIdx = new Map();
    (camp.lotes || []).forEach(l => { if (l.n && !lotIdx.has(key(l.n))) lotIdx.set(key(l.n), lotIdx.size); });
    return { camp, vig, has, supTotal, catIdx, rodeoCat, rodeos, pvms, lotIdx, efic: camp.efic || 50, sup: camp.sup || SUP_DEF };
  }

  // Grupo de MS para una categoría de Tabla 1 en un mes calendario
  function msKeyCat(k, mesCal, ctx) {
    const idx = ctx.catIdx.get(key(k));
    if (idx == null) return '';
    const b = ctx.camp.base[idx];
    let g = idx < BASE_FIJAS ? (MS_DE_CAT[key(b.n)] || 'vaca') : (b.ms || 'vaca');
    if (g === 'vaca') { const c = cicloDe(mesCal, ctx.camp.mesServicio); g = c <= 7 ? 'lact' : c <= 9 ? 'seca' : 'gest'; }
    return g;
  }

  // Una fila de la Planilla de Pastoreo (columnas B, D, I a N, más consumo de MS)
  function calcRow(r, ctx) {
    const A = dayOf(r.e), H = dayOf(r.s);
    const C = r.l || '';
    const o = { A, H };
    o.B = A == null ? '' : mesLabel(A, H);
    o.D = C === '' ? '' : (ctx.has.has(key(C)) ? ctx.has.get(key(C)) : '');
    o.F = isNum(r.c) ? r.c : '';
    o.evAuto = ''; o.ms = ''; o.src = ''; o.warn = [];
    const rod = ctx.rodeos.get(key(r.r));
    const corc = usaCorc(rod, ctx.camp);
    const idx = r.k ? ctx.catIdx.get(key(r.k)) : null;
    const evCat = idx != null ? ctx.vig.grid[idx] : null;
    if (A != null && (corc || evCat)) {
      const n = H == null ? 0 : H - A;
      let sEv = 0, cEv = 0, sMs = 0, cMs = 0, d = A;
      const end = n <= 0 ? A + 1 : A + n;
      const seen = new Set();
      while (d < end) {
        const p = ymd(d);
        const next = Math.min(end, Date.UTC(p.y, p.m, 1) / DAY);
        const dd = next - d;
        let ev = null, mk = '';
        if (corc) {
          const e = evMes(rod, ctx.camp, p.y, p.m);
          ev = e.ev; mk = e.msKey;
          e.warn.forEach(w => seen.add(w));
        } else {
          ev = evCat[p.m - 1];
          mk = msKeyCat(r.k, p.m, ctx);
        }
        if (ev != null) { sEv += ev * dd; cEv += dd; }
        if (mk && ctx.pvms.has(mk)) {
          const pm = ctx.pvms.get(mk);
          const pv = rod && isNum(rod.pv) ? rod.pv : pm.pv;
          sMs += pv * pm.pct / 100 * dd; cMs += dd;
        }
        d = next;
      }
      o.evAuto = cEv ? sEv / cEv : '';
      o.ms = cMs ? sMs / cMs : '';
      o.src = corc ? 'corc' : 'tabla';
      o.warn = [...seen];
    }
    o.manual = isNum(r.ev);
    const I = o.manual ? r.ev : o.evAuto;
    o.I = I;
    const F = o.F, D = o.D;
    o.J = (F === '' || I === '') ? '' : F * I;
    o.K = (A == null || H == null) ? '' : H - A;
    o.L = (F === '' || I === '' || o.K === '') ? '' : F * I * o.K;
    o.M = (o.L === '' || D === '' || D === 0) ? '' : o.L / D;
    o.N = (I === '' || D === '' || F === '' || D === 0) ? '' : (I * F) / D;
    // unidad kgMS: consumo (ms = kgMS/cabeza/día)
    const ms = o.ms;
    o.J2 = (F === '' || ms === '') ? '' : F * ms;
    o.L2 = (F === '' || ms === '' || o.K === '') ? '' : F * ms * o.K;
    o.M2 = (o.L2 === '' || D === '' || D === 0) ? '' : o.L2 / D;
    o.N2 = (ms === '' || D === '' || F === '' || D === 0) ? '' : (ms * F) / D;
    o.O2 = o.L2 === '' ? '' : o.L2 / (ctx.efic / 100);     // kgMS ofertados (oferta = consumo / eficiencia)
    return o;
  }

  // Hoja Resultados-Tablas completa, en la unidad u ('EV' o 'MS')
  function resultados(camp, calc, ctx, u) {
    const MS = u === 'MS';
    const R = { ok: false, u: MS ? 'MS' : 'EV', months: [], cargaMensual: [], lotes: [], rodeos: [], diasAnio: 365, supTotal: ctx.supTotal, efic: ctx.efic, racMes: [], oferMes: [], lluvia: [], cargaAnual: 0, racTotal: 0 };
    const recs = calc.map((x, i) => {
      const m = camp.movs[i];
      const lot = m.l || '';
      const ok = x.A != null && x.H != null && x.H > x.A && lot !== '';
      const J = MS ? x.J2 : x.J, L = MS ? x.L2 : x.L, Mh = MS ? x.M2 : x.M;
      return { ok, ent: x.A, sal: x.H, lot, lk: key(lot), rod: m.r || '',
        evt: isNum(J) ? J : 0, cab: isNum(x.F) ? x.F : 0,
        rac: isNum(L) ? L : 0, rh: isNum(Mh) ? Mh : 0, racNum: isNum(L) };
    });
    const ents = recs.filter(r => r.ent != null && r.lot !== '').map(r => r.ent);
    if (ents.length) {
      const y = ymd(Math.min(...ents)).y;
      R.diasAnio = (Date.UTC(y + 1, 0, 1) - Date.UTC(y, 0, 1)) / DAY;
    }
    const okr = recs.filter(r => r.ok);
    if (!okr.length) return R;
    R.ok = true;
    let mn = Infinity, mx = -Infinity;
    okr.forEach(r => { if (r.ent < mn) mn = r.ent; if (r.sal > mx) mx = r.sal; });
    const months = [];
    for (let ms = mStart(mn), mL = mStart(mx - 1); ms <= mL; ms = addM(ms, 1)) months.push(ms);
    const mE = months.map(ms => addM(ms, 1));
    R.months = months;
    okr.forEach(r => { r.dias = months.map((ms, k) => Math.max(Math.min(r.sal, mE[k]) - Math.max(r.ent, ms), 0)); });

    R.cargaMensual = months.map((ms, k) => {
      let evd = 0;
      okr.forEach(r => { evd += r.dias[k] * r.evt; });
      const ev = evd / (mE[k] - ms);
      return { ms, ev, carga: ctx.supTotal ? ev / ctx.supTotal : '' };
    });
    R.racMes = months.map((_, k) => okr.reduce((s, r) => s + r.evt * r.dias[k], 0));
    R.oferMes = R.racMes.map(v => v / (ctx.efic / 100));
    R.lluvia = months.map(ms => { const p = ymd(ms); return (p.y === camp.anio && camp.lluvia && isNum(camp.lluvia[p.m - 1])) ? camp.lluvia[p.m - 1] : null; });
    R.racTotal = okr.reduce((s, r) => s + r.rac, 0);
    R.cargaAnual = ctx.supTotal ? okr.reduce((s, r) => s + r.evt * (r.sal - r.ent), 0) / (ctx.supTotal * R.diasAnio) : 0;

    const lotMap = new Map();
    okr.forEach(r => { if (!lotMap.has(r.lk)) lotMap.set(r.lk, r.lot); });
    const ul = [...lotMap.entries()].sort((a, b) => coll.compare(a[1], b[1]));
    R.lotes = ul.map(([lk, name]) => {
      const mine = okr.filter(r => r.lk === lk);
      const cov = new Uint8Array(mx - mn);
      mine.forEach(r => { for (let d = r.ent; d < r.sal; d++) cov[d - mn] = 1; });
      const diasMes = months.map((ms, k) => {
        let c = 0;
        for (let d = Math.max(ms, mn), b = Math.min(mE[k], mx); d < b; d++) c += cov[d - mn];
        return c;
      });
      const dias = diasMes.reduce((s, v) => s + v, 0);
      const evDias = mine.reduce((s, r) => s + r.evt * (r.sal - r.ent), 0);
      const has = ctx.has.has(lk) ? ctx.has.get(lk) : 0;
      const q = evDias / (has * dias);
      const carga = isFinite(q) ? q : 0;
      const racHa = mine.reduce((s, r) => s + r.rh, 0);
      const rac = mine.reduce((s, r) => s + r.rac, 0);
      const racMes = months.map((_, k) => mine.reduce((s, r) => s + r.evt * r.dias[k], 0));
      const cnt = recs.filter(r => r.lk === lk && r.racNum).length;
      return { lote: name, lk, has, ci: ctx.lotIdx.has(lk) ? ctx.lotIdx.get(lk) : -1, diasMes, dias, carga, racHa, rac, racMes, cnt,
        ofer: rac / (ctx.efic / 100), oferHa: racHa / (ctx.efic / 100), oferMes: racMes.map(v => v / (ctx.efic / 100)),
        racProm: cnt ? rac / cnt : 0, racHaProm: cnt ? racHa / cnt : 0,
        libres: R.diasAnio - dias, io: dias / R.diasAnio };
    });

    const rodMap = new Map();
    okr.forEach(r => { r.rodn = r.rod || '(sin rodeo)'; r.rk = key(r.rodn); if (!rodMap.has(r.rk)) rodMap.set(r.rk, r.rodn); });
    const uc = [...rodMap.entries()].sort((a, b) => coll.compare(a[1], b[1]));
    R.rodeos = uc.map(([rk, name]) => ({
      rodeo: name,
      cat: ctx.rodeoCat.has(rk) ? ctx.rodeoCat.get(rk) : '(sin rodeo)',
      cab: months.map(ms => okr.reduce((s, r) => s + (r.rk === rk && r.ent <= ms && ms < r.sal ? r.cab : 0), 0)),
    }));
    return R;
  }

  /* ---------- rodeos: stock, reproducción, pesadas, observaciones ---------- */
  function stockRodeos(camp) {
    const out = new Map();
    const get = n => { const k = key(n); if (!out.has(k)) out.set(k, { rodeo: n, ent: 0, sal: 0, mue: 0, movs: [] }); return out.get(k); };
    (camp.rodeos || []).forEach(r => { if (r.n) get(r.n); });
    (camp.movRodeo || []).forEach(m => {
      if (!m.r || !isNum(m.c)) return;
      const s = get(m.r);
      s[m.t === 'entrada' ? 'ent' : m.t === 'salida' ? 'sal' : 'mue'] += m.c;
      s.movs.push(m);
    });
    out.forEach(s => { s.stock = s.ent - s.sal - s.mue; s.mort = s.ent ? s.mue / s.ent : null; });
    return out;
  }
  const pct = (a, b) => (isNum(a) && isNum(b) && b > 0) ? a / b : null;
  function reproRodeo(x) {
    return {
      prenez: pct(x.pre, x.tac),
      perdPP: (isNum(x.pre) && isNum(x.par) && x.pre > 0) ? (x.pre - x.par) / x.pre : null,
      perdPD: (isNum(x.par) && isNum(x.des) && x.par > 0) ? (x.par - x.des) / x.par : null,
      destete: pct(x.des, x.ent),
      perdPreDes: (isNum(x.pre) && isNum(x.des) && x.pre > 0) ? (x.pre - x.des) / x.pre : null,
    };
  }
  const esRepro = c => CAT_REPRO.some(x => key(x) === key(c));
  // Estadística de una sesión o de un mes (conteos por valor de la escala 1..esc)
  function statsObs(cnt) {
    let n = 0, s = 0;
    cnt.forEach((c, i) => { n += c; s += c * (i + 1); });
    if (!n) return { n: 0, mean: null, sd: null };
    const mean = s / n;
    let v = 0;
    cnt.forEach((c, i) => { v += c * (i + 1 - mean) ** 2; });
    return { n, mean, sd: Math.sqrt(v / n) };
  }
  // Observaciones de un rodeo agrupadas por mes (suma de conteos = ponderación por cabezas)
  function obsMensual(camp, rodeo, tipo) {
    const rk = key(rodeo);
    const ses = (camp.obs || []).filter(o => key(o.r) === rk && o.tipo === tipo && o.f);
    if (!ses.length) return { esc: 5, meses: [], total: statsObs([]) };
    const esc = tipo === 'heces' ? 5 : ses[0].esc;
    const byM = new Map();
    ses.forEach(o => {
      const k = o.f.slice(0, 7);
      if (!byM.has(k)) byM.set(k, { mes: k, cnt: Array(esc).fill(0), sesiones: 0 });
      const g = byM.get(k);
      for (let i = 0; i < esc; i++) g.cnt[i] += o.cnt[i] || 0;
      g.sesiones++;
    });
    const meses = [...byM.values()].sort((a, b) => a.mes < b.mes ? -1 : 1).map(g => Object.assign(g, statsObs(g.cnt), { pct: g.cnt.map(c => { const n = g.cnt.reduce((s, v) => s + v, 0); return n ? c / n : 0; }) }));
    const tot = Array(esc).fill(0);
    ses.forEach(o => { for (let i = 0; i < esc; i++) tot[i] += o.cnt[i] || 0; });
    return { esc, meses, total: statsObs(tot), sesiones: ses.length };
  }
  function ultimaPesada(camp, rodeo) {
    const rk = key(rodeo);
    const ps = (camp.pesadas || []).filter(p => key(p.r) === rk && p.f && isNum(p.pv)).sort((a, b) => a.f < b.f ? -1 : 1);
    return ps.length ? ps[ps.length - 1] : null;
  }

  function duplicados(nombres) {
    const cnt = new Map();
    nombres.forEach(n => { if (n) cnt.set(key(n), (cnt.get(key(n)) || 0) + 1); });
    const out = [], seen = new Set();
    nombres.forEach(n => { if (n && cnt.get(key(n)) > 1 && !seen.has(key(n))) { seen.add(key(n)); out.push(n); } });
    return { lista: out, esDup: n => !!n && cnt.get(key(n)) > 1 };
  }

  function calcular(camp) {
    const ctx = contexto(camp);
    const calc = camp.movs.map(r => calcRow(r, ctx));
    const res = resultados(camp, calc, ctx, 'EV');
    const resMS = resultados(camp, calc, ctx, 'MS');
    return { ctx, calc, res, resMS, resU: camp.unidad === 'MS' ? resMS : res };
  }

  // Resumen de una campaña para la comparación entre años
  function resumen(camp) {
    camp = normCamp(camp, camp.anio);
    const { ctx, res, resMS } = calcular(camp);
    const lotes = {};
    res.lotes.forEach((l, i) => { lotes[l.lote] = { racHa: l.racHa, rac: l.rac, carga: l.carga, msHa: resMS.lotes[i].racHa, ms: resMS.lotes[i].rac, cargaMS: resMS.lotes[i].carga, dias: l.dias }; });
    const rodeos = {};
    const tot = { ent: 0, tac: 0, pre: 0, par: 0, des: 0 };
    let ccS = 0, ccN = 0, heS = 0, heN = 0, pvS = 0, pvN = 0;
    const stock = stockRodeos(camp);
    (camp.rodeos || []).forEach(r => {
      if (!r.n) return;
      const rp = (camp.repro || []).find(x => key(x.r) === key(r.n));
      const cc = obsMensual(camp, r.n, 'cc'), he = obsMensual(camp, r.n, 'heces');
      const up = ultimaPesada(camp, r.n);
      const pv = up ? up.pv : r.pv;
      const st = stock.get(key(r.n));
      const cab = st && st.stock > 0 ? st.stock : 1;
      rodeos[r.n] = Object.assign({ cat: r.c, pv, esc: r.esc, cc: cc.total.mean, ccEsc: r.esc, heces: he.total.mean, stock: st ? st.stock : null, mort: st ? st.mort : null, repro: esRepro(r.c) }, rp ? reproRodeo(rp) : {});
      if (rp && esRepro(r.c)) ['ent', 'tac', 'pre', 'par', 'des'].forEach(k => { if (isNum(rp[k])) tot[k] += rp[k]; });
      if (cc.total.mean != null) { const f = r.esc === 9 ? 5 / 9 : 1; ccS += cc.total.mean * f * cc.total.n; ccN += cc.total.n; }
      if (he.total.mean != null) { heS += he.total.mean * he.total.n; heN += he.total.n; }
      if (isNum(pv)) { pvS += pv * cab; pvN += cab; }
    });
    const campo = Object.assign({}, reproRodeo(tot), tot,
      { cc: ccN ? ccS / ccN : null, heces: heN ? heS / heN : null, pv: pvN ? pvS / pvN : null });
    return { anio: camp.anio, supTotal: ctx.supTotal, cargaEV: res.cargaAnual, cargaMS: resMS.cargaAnual, racTotal: res.racTotal, msTotal: resMS.racTotal, campo, lotes, rodeos };
  }

  /* ---------- geometría del mapa (KML) ---------- */
  // Área de un anillo lon/lat en hectáreas (fórmula esférica, R = 6.378.137 m)
  function areaAnillo(pts) {
    if (!pts || pts.length < 3) return 0;
    const R = 6378137, rad = Math.PI / 180;
    let s = 0;
    for (let i = 0; i < pts.length; i++) {
      const [x1, y1] = pts[i], [x2, y2] = pts[(i + 1) % pts.length];
      s += (x2 - x1) * rad * (2 + Math.sin(y1 * rad) + Math.sin(y2 * rad));
    }
    return Math.abs(s * R * R / 2) / 10000;
  }

  return { MESES, MES3, ESTADOS, CAT_RODEO, CAT_REPRO, DUR_SERV, SANIDADES, BASE_FIJAS, MS_DE_CAT, MS_DE_RODEO,
    CORC, CORC_COLS, CORC_COLS_CORTO, CORC_GAN, CORC_PESOS, CORC_VAQ, CORC_VAQ_GAN, CORC_VAQ_PESOS, PVMS_DEF, PVMS_KEYS, SUP_DEF, SUP_TXT,
    isNum, key, dayOf, isoOf, ymd, mStart, addM, mesLargo, mesCorto, diasDelMes, cicloDe, plantillaBase, normCamp, normRodeo,
    interp1, evCorc, tipoHembra, paramsRodeo, estadoEn, usaCorc, evMes, evAnio, efectoDestete,
    vigente, contexto, msKeyCat, calcRow, resultados, stockRodeos, reproRodeo, esRepro, statsObs, obsMensual, ultimaPesada,
    duplicados, calcular, resumen, areaAnillo, coll };
})();
if (typeof module !== 'undefined') module.exports = Engine;
