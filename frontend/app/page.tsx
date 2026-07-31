export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-xl flex flex-col gap-2">
          <h3 className="text-slate-400 font-medium text-sm">Eventos Próximos</h3>
          <p className="text-3xl font-bold">12</p>
        </div>
        <div className="glass-panel p-6 rounded-xl flex flex-col gap-2">
          <h3 className="text-slate-400 font-medium text-sm">Actividades Científicas</h3>
          <p className="text-3xl font-bold">8</p>
        </div>
        <div className="glass-panel p-6 rounded-xl flex flex-col gap-2">
          <h3 className="text-slate-400 font-medium text-sm">Conflictos Detectados</h3>
          <p className="text-3xl font-bold text-amber-500">2</p>
        </div>
      </div>

      {/* Upcoming Events */}
      <div className="glass-panel p-6 rounded-xl">
        <h3 className="text-xl font-semibold mb-4">Próximos Eventos Científicos</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--border)] text-slate-400 text-sm">
                <th className="pb-3 font-medium">Fecha</th>
                <th className="pb-3 font-medium">Título</th>
                <th className="pb-3 font-medium">Carrera</th>
                <th className="pb-3 font-medium">Tipo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              <tr>
                <td className="py-4">15 Oct 2025</td>
                <td className="py-4 font-medium text-white">Feria Científica Medicina</td>
                <td className="py-4">Medicina</td>
                <td className="py-4"><span className="bg-primary/20 text-primary px-2 py-1 rounded text-xs">Feria</span></td>
              </tr>
              <tr>
                <td className="py-4">22 Oct 2025</td>
                <td className="py-4 font-medium text-white">Congreso Odontología</td>
                <td className="py-4">Odontología</td>
                <td className="py-4"><span className="bg-purple-500/20 text-purple-400 px-2 py-1 rounded text-xs">Congreso</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
