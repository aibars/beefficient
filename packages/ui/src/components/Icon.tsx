import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { color as themeColor } from '../theme';

// Íconos de trazo del wireframe (24×24, trazo 2, puntas redondeadas).
const PATHS = {
  back: <Path d="M15 18l-6-6 6-6" />,
  menu: <Path d="M4 7h16M4 12h16M4 17h16" />,
  down: <Path d="M6 9l6 6 6-6" />,
  plus: <Path d="M12 5v14M5 12h14" />,
  arrow: <Path d="M5 12h14M13 6l6 6-6 6" />,
  offline: <Path d="M2 2l20 20M8.5 16.4a5 5 0 0 1 7 0M5 12.9a10 10 0 0 1 4.2-2.4M19 12.9a10 10 0 0 0-2-1.5M12 20h.01" />,
  alert: (
    <>
      <Path d="M12 3l10 18H2L12 3z" />
      <Path d="M12 10v4M12 17.5h.01" />
    </>
  ),
  check: <Path d="M5 12.5l4.5 4.5L19 7" />,
  clock: (
    <>
      <Circle cx="12" cy="12" r="9" />
      <Path d="M12 7v5l3 2" />
    </>
  ),
  calendar: (
    <>
      <Rect x="3" y="5" width="18" height="16" rx="3" />
      <Path d="M3 10h18M8 3v4M16 3v4" />
    </>
  ),
  cow: <Path d="M5 9h11a3 3 0 0 1 3 3v2H5zM7 14v5M16 14v5M19 11l2-1M5 9l-2-2" />,
  area: <Path d="M4 18l5-9 4 6 3-4 4 7z" />,
  leaf: (
    <>
      <Path d="M5 19c0-8 5-14 15-14 0 10-6 15-14 15" />
      <Path d="M5 19l7-7" />
    </>
  ),
  list: <Path d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01" />,
  bolt: <Path d="M13 2L3 14h9l-1 8 10-12h-9z" />,
  drop: <Path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z" />,
  bone: (
    <>
      <Circle cx="6" cy="6" r="2.5" />
      <Circle cx="18" cy="18" r="2.5" />
      <Path d="M8 8l8 8" />
    </>
  ),
  trend: <Path d="M3 17l6-6 4 4 8-8M15 7h6v6" />,
  fork: <Path d="M5 2v7a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2V2M8 2v20M19 15V2a4 4 0 0 0-4 4v7a2 2 0 0 0 2 2h2zM19 15v7" />,
  scale: <Path d="M12 4v16M5 8h14M7 8l-3 6h6zM17 8l-3 6h6z" />,
} as const;

export type IconName = keyof typeof PATHS;
export const ICON_NAMES = Object.keys(PATHS) as IconName[];

export interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
}

export function Icon({ name, size = 18, color = themeColor.text }: IconProps) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {PATHS[name]}
    </Svg>
  );
}

export function GoogleLogo({ size = 20 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48" aria-hidden>
      <Path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.6 5.4 2.7 13.3l7.9 6.1C12.5 13.6 17.8 9.5 24 9.5z" />
      <Path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.6 5.9c4.4-4.1 7-10.1 7-17.6z" />
      <Path fill="#FBBC05" d="M10.6 28.6c-.5-1.4-.8-3-.8-4.6s.3-3.2.8-4.6l-7.9-6.1C1 16.6 0 20.2 0 24s1 7.4 2.7 10.7l7.9-6.1z" />
      <Path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.6-5.9c-2.1 1.4-4.9 2.3-8.3 2.3-6.2 0-11.5-4.1-13.4-9.9l-7.9 6.1C6.6 42.6 14.6 48 24 48z" />
    </Svg>
  );
}
