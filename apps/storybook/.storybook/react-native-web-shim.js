// react-native → react-native-web, más un TurboModuleRegistry vacío.
// react-native-svg importa los specs de sus módulos nativos (fabric/*) desde
// react-native; en web no existen y el optimizador de Vite falla sin este export.
export * from 'react-native-web';
export const TurboModuleRegistry = { get: () => null, getEnforcing: () => null };
