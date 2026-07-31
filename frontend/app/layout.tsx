import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { Calendar, FileUp, Home, Activity, FileBarChart, LogOut } from "lucide-react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Agenda Científica UNITEPC",
  description: "Sistema de gestión de agenda científica fusionada",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${inter.className} min-h-screen flex flex-col md:flex-row bg-[#0f172a] text-slate-100`}>
        {/* Sidebar */}
        <aside className="w-full md:w-64 glass-panel md:min-h-screen p-4 flex flex-col gap-6 sticky top-0 z-10 md:border-r border-b md:border-b-0 border-[var(--border)]">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded bg-primary flex items-center justify-center font-bold text-white">U</div>
            <h1 className="text-xl font-bold tracking-tight">UNITEPC</h1>
          </div>
          
          <nav className="flex-1 flex flex-col gap-2">
            <Link href="/" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors">
              <Home className="w-5 h-5 text-slate-400" />
              <span>Dashboard</span>
            </Link>
            <Link href="/calendario" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors">
              <Calendar className="w-5 h-5 text-slate-400" />
              <span>Calendario</span>
            </Link>
            <Link href="/actividades" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors">
              <Activity className="w-5 h-5 text-slate-400" />
              <span>Actividades</span>
            </Link>
            <Link href="/importar" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors">
              <FileUp className="w-5 h-5 text-slate-400" />
              <span>Importar</span>
            </Link>
            <Link href="/reportes" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors">
              <FileBarChart className="w-5 h-5 text-slate-400" />
              <span>Reportes</span>
            </Link>
          </nav>

          <div className="mt-auto px-3 py-2 flex items-center gap-3 text-slate-400 hover:text-white cursor-pointer transition-colors">
            <LogOut className="w-5 h-5" />
            <span>Cerrar Sesión</span>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 md:p-8 max-w-[1600px] mx-auto w-full">
          <header className="flex justify-between items-center mb-8 glass-panel p-4 rounded-xl">
            <h2 className="text-2xl font-semibold">Agenda Científica</h2>
            <div className="flex gap-4">
              <select className="bg-[#1e293b] border border-[var(--border)] rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                <option value="">Todas las Carreras</option>
                <option value="medicina">Medicina</option>
                <option value="odontologia">Odontología</option>
              </select>
              <select className="bg-[#1e293b] border border-[var(--border)] rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                <option value="2025">Gestión 2025</option>
              </select>
            </div>
          </header>
          {children}
        </main>
      </body>
    </html>
  );
}
