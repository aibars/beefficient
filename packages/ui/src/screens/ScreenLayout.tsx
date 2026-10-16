import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { color } from '../theme';

export interface ScreenLayoutProps {
  top?: ReactNode;
  children: ReactNode;
  /** Barra fija abajo (resumen + CTA o pestañas). */
  footer?: ReactNode;
  /** Botón flotante sobre el footer. */
  fab?: ReactNode;
  /** Espacio libre al final del scroll para que el footer no tape contenido. */
  bottomInset?: number;
}

/** Estructura de una pantalla: barra superior, contenido con scroll y barra inferior fija. */
export function ScreenLayout({ top, children, footer, fab, bottomInset = 120 }: ScreenLayoutProps) {
  return (
    <View style={styles.screen}>
      {top}
      <ScrollView style={styles.scroll} contentContainerStyle={[styles.content, { paddingBottom: bottomInset }]}>
        {children}
      </ScrollView>
      {fab ? <View style={[styles.fab, { bottom: footer ? 92 : 22 }]}>{fab}</View> : null}
      {footer ? <View style={styles.footer}>{footer}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: color.bg, overflow: 'hidden' },
  scroll: { flex: 1 },
  content: { paddingTop: 4, paddingHorizontal: 14 },
  footer: { position: 'absolute', left: 0, right: 0, bottom: 0 },
  fab: { position: 'absolute', right: 16 },
});
