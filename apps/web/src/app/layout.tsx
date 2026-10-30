import type { Metadata } from 'next';
import { RoleProvider } from '@/context/RoleContext';
import { Nav } from '@/components/Nav';
import '@/styles/globals.css';
import '@/styles/components.css';
import '@/styles/planilla.css';

export const metadata: Metadata = {
  title: 'Beefficient',
  description: 'Inteligencia ganadera para productores y técnicos',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        <RoleProvider>
          <Nav />
          <main className="container">{children}</main>
        </RoleProvider>
      </body>
    </html>
  );
}
