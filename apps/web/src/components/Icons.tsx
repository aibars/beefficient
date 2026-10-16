import React from 'react';

interface IconProps {
  id: string;
  size?: number;
  color?: string;
}

const iconRegistry: Record<string, (props: IconProps) => JSX.Element> = {
  inicio: (props) => (
    <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M8 30 32 10l24 20"
        fill="none"
        stroke={props.color || '#c67139'}
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14 27v25h36V27L32 13z"
        fill={props.color || '#c67139'}
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

  pastoreo: (props) => (
    <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" {...props}>
      <circle cx="16" cy="24" r="6" fill={props.color || '#c67139'} />
      <circle cx="48" cy="24" r="6" fill={props.color || '#c67139'} />
      <path
        d="M16 30v20h32V30c0-8 8-16 8-16"
        fill={props.color || '#c67139'}
      />
      <ellipse cx="32" cy="52" rx="20" ry="6" fill="#7a8a5e" opacity="0.3" />
    </svg>
  ),

  mercado: (props) => (
    <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" {...props}>
      <circle cx="32" cy="32" r="24" fill={props.color || '#e9b949'} />
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

  precios: (props) => (
    <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect x="6" y="10" width="52" height="40" rx="6" fill={props.color || '#c67139'} opacity="0.2" />
      <path
        d="M12 20h10M12 30h14M12 40h12"
        stroke={props.color || '#c67139'}
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

  valores: (props) => (
    <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect x="8" y="12" width="48" height="40" rx="4" fill="none" stroke={props.color || '#c67139'} strokeWidth="3" />
      <path
        d="M12 24 L52 40 M12 40 L52 24"
        stroke={props.color || '#c67139'}
        strokeWidth="2"
      />
      <circle cx="32" cy="32" r="4" fill={props.color || '#c67139'} />
    </svg>
  ),

  bosteo: (props) => <IconStub id="bosteo" {...props} />,
  stock: (props) => <IconStub id="stock" {...props} />,
  dieta: (props) => <IconStub id="dieta" {...props} />,
  pennstate: (props) => <IconStub id="pennstate" {...props} />,
  archivo: (props) => <IconStub id="archivo" {...props} />,
  compra: (props) => <IconStub id="compra" {...props} />,
  caravanas: (props) => <IconStub id="caravanas" {...props} />,
  monitor: (props) => <IconStub id="monitor" {...props} />,
  planilla: (props) => <IconStub id="planilla" {...props} />,
  planificador: (props) => <IconStub id="planificador" {...props} />,
  internacional: (props) => <IconStub id="internacional" {...props} />,
};

function IconStub({ id, size = 48, color = '#c67139' }: IconProps) {
  return (
    <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" width={size} height={size}>
      <rect width="64" height="64" fill={color} opacity="0.2" />
      <text x="32" y="32" textAnchor="middle" dy="0.3em" fontSize="10" fill={color}>
        {id.slice(0, 3)}
      </text>
    </svg>
  );
}

export function Icon({ id, size = 48, color = '#c67139' }: IconProps) {
  const IconComponent = iconRegistry[id];
  if (!IconComponent) {
    return <IconStub id={id} size={size} color={color} />;
  }
  return <IconComponent id={id} size={size} color={color} />;
}
