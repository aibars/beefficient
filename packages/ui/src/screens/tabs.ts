import type { TabItem } from '../components/TabBar';

export type Seccion = 'planilla' | 'formulador';

export const TABS: TabItem<Seccion>[] = [
  { key: 'planilla', label: 'Planilla', icon: 'list' },
  { key: 'formulador', label: 'Formulador', icon: 'fork' },
];
