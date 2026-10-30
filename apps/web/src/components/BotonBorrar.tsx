'use client';

import { useState, type ReactNode } from 'react';

interface Props {
  /** Texto del botón: «Borrar», «Eliminar». */
  children: ReactNode;
  /** aria-label en reposo (p. ej. «Borrar La Loma»); armado pasa a «Confirmar borrar La Loma». */
  etiqueta?: string;
  className?: string;
  disabled?: boolean;
  onConfirmar: () => void;
}

const primeraMinuscula = (t: string) => t.charAt(0).toLowerCase() + t.slice(1);

/**
 * Borrado en dos pasos: el primer clic cambia el botón a «Confirmar»; el segundo borra.
 * Salir del botón (blur o mouse) lo vuelve al estado inicial.
 */
export function BotonBorrar({ children, etiqueta, className = 'config-link', disabled, onConfirmar }: Props) {
  const [armado, setArmado] = useState(false);
  const desarmar = () => setArmado(false);

  return (
    <button
      type="button"
      className={armado ? `${className} armado` : className}
      aria-label={etiqueta && (armado ? `Confirmar ${primeraMinuscula(etiqueta)}` : etiqueta)}
      disabled={disabled}
      onBlur={desarmar}
      onMouseLeave={desarmar}
      onClick={() => {
        if (!armado) {
          setArmado(true);
          return;
        }
        setArmado(false);
        onConfirmar();
      }}
    >
      {armado ? 'Confirmar' : children}
    </button>
  );
}
