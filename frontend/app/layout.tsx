import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";

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
      <body className="font-sans min-h-screen flex flex-col md:flex-row text-slate-100 antialiased">
        <Sidebar />
        <main className="flex-1 p-6 md:p-8 max-w-[1400px] mx-auto w-full">
          {children}
        </main>
      </body>
    </html>
  );
}
