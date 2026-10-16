import React from 'react';

interface IconProps {
  id: string;
  size?: number;
  color?: string;
}

const iconRegistry: Record<string, (size: number, color: string) => JSX.Element> = {
  inicio: (size, color) => (
    <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" width={size} height={size}>
      <path
        d="M8 30 32 10l24 20"
        fill="none"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14 27v25h36V27L32 13z"
        fill={color}
      />
      <rect x="27" y="36" width="10" height="16" rx="2" fill="#f5ead8" />
      <rect x="17" y="32" width="7" height="7" rx="1.5" fill="#f5ead8" />
      <rect x="40" y="32" width="7" height="7" rx="1.5" fill="#f5ead8" />
      <path
        d="M6 54h52"
        stroke="#7a8a5e"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  ),

  pastoreo: (size, color) => (
    <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" width={size} height={size}>
      <circle cx="16" cy="24" r="6" fill={color} />
      <circle cx="48" cy="24" r="6" fill={color} />
      <path
        d="M16 30v20h32V30c0-8 8-16 8-16"
        fill={color}
      />
      <ellipse cx="32" cy="52" rx="20" ry="6" fill="#7a8a5e" opacity="0.3" />
    </svg>
  ),

  mercado: (size, color) => (
    <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" width={size} height={size}>
      <circle cx="32" cy="32" r="24" fill={color} />
      <path
        d="M39 23.5c-1.6-2.2-4.2-3.3-7-3.3-4.1 0-7 2.2-7 5.4 0 7.4 14.5 4.1 14.5 11.6 0 3.4-3.2 5.8-7.6 5.8-3.2 0-6-1.3-7.6-3.7"
        fill="none"
        stroke="#201e1d"
        strokeWidth="3.6"
        strokeLinecap="round"
      />
      <path
        d="M32 15v6M32 43v6"
        stroke="#201e1d"
        strokeWidth="3.6"
        strokeLinecap="round"
      />
    </svg>
  ),

  precios: (size, color) => (
    <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" width={size} height={size}>
      <rect x="6" y="10" width="52" height="40" rx="6" fill={color} opacity="0.2" />
      <path
        d="M12 20h10M12 30h14M12 40h12"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M36 25l5-6 5 6z"
        fill="#7fbf6a"
      />
      <path
        d="M36 35l5 6 5-6z"
        fill="#b64a3a"
      />
    </svg>
  ),

  valores: (size, color) => (
    <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" width={size} height={size}>
      <rect x="8" y="12" width="48" height="40" rx="4" fill="none" stroke={color} strokeWidth="3" />
      <path
        d="M12 24 L52 40 M12 40 L52 24"
        stroke={color}
        strokeWidth="2"
      />
      <circle cx="32" cy="32" r="4" fill={color} />
    </svg>
  ),

  bosteo: (size, color) => makeStub('bos', size, color),
  stock: (size, color) => makeStub('sto', size, color),
  dieta: (size, color) => makeStub('die', size, color),
  pennstate: (size, color) => makeStub('pen', size, color),
  archivo: (size, color) => makeStub('arc', size, color),
  compra: (size, color) => makeStub('com', size, color),
  caravanas: (size, color) => makeStub('car', size, color),
  monitor: (size, color) => makeStub('mon', size, color),
  planilla: (size, color) => makeStub('pla', size, color),
  planificador: (size, color) => makeStub('pln', size, color),
  internacional: (size, color) => makeStub('int', size, color),
};

function makeStub(label: string, size: number, color: string): JSX.Element {
  return (
    <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" width={size} height={size}>
      <rect width="64" height="64" fill={color} opacity="0.2" />
      <text x="32" y="32" textAnchor="middle" dy="0.3em" fontSize="10" fill={color}>
        {label}
      </text>
    </svg>
  );
}

export function Icon({ id, size = 48, color = '#c67139' }: IconProps) {
  const builder = iconRegistry[id];
  if (!builder) {
    return makeStub(id.slice(0, 3), size, color);
  }
  return builder(size, color);
}
