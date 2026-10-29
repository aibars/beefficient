/** Número finito; lo que la planilla trata como dato presente. */
export function esNumero(v: unknown): v is number {
  return typeof v === 'number' && Number.isFinite(v);
}
