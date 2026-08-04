import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'MEDSY 5.0 — Gestão Médica Inteligente',
  description: 'Sistema completo de gestão médica, agendamentos, pacientes e equipe com Node.js e PostgreSQL / Supabase.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="antialiased selection:bg-sky-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
