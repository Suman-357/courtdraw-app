import { useEffect, useState } from 'react';

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState({ totalGroups: 0, totalUsers: 0, totalSessions: 0 });
  const [groups, setGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // SuperAdmin groups will be fetched from real backend later
  }, []);

  if (isLoading) return <div className="p-8 text-center text-on-surface-variant animate-pulse">Loading dashboard data...</div>;

  return (
    <div className="space-y-8 relative z-10">
      <header className="mb-10 flex justify-between items-end">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="px-3 py-1 bg-surface-container-high rounded-full border border-outline-variant font-label-sm text-label-sm text-primary-fixed tracking-wider uppercase">System</span>
          </div>
          <h2 className="font-display-md text-display-md font-bold text-primary">Platform Overview</h2>
        </div>
      </header>

      {/* KPI Bento Grid */}
      <div className="grid grid-cols-12 gap-gutter mb-10">
        <div className="col-span-12 md:col-span-4 bg-[#1E2022] border border-[#2D3135] rounded-xl p-6 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <h3 className="font-headline-md text-headline-md font-semibold text-primary">Total Groups</h3>
            <span className="material-symbols-outlined text-on-surface-variant">dashboard</span>
          </div>
          <div>
            <span className="text-display-md font-display-md font-bold text-primary-fixed">{stats.totalGroups}</span>
          </div>
        </div>

        <div className="col-span-12 md:col-span-4 bg-[#1E2022] border border-[#2D3135] rounded-xl p-6 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <h3 className="font-headline-md text-headline-md font-semibold text-primary">Total Users</h3>
            <span className="material-symbols-outlined text-on-surface-variant">group</span>
          </div>
          <div>
            <span className="text-display-md font-display-md font-bold text-primary">{stats.totalUsers}</span>
          </div>
        </div>

        <div className="col-span-12 md:col-span-4 bg-[#1E2022] border border-[#2D3135] rounded-xl p-6 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <h3 className="font-headline-md text-headline-md font-semibold text-primary">Total Sessions</h3>
            <span className="material-symbols-outlined text-on-surface-variant">sports_tennis</span>
          </div>
          <div>
            <span className="text-display-md font-display-md font-bold text-primary">{stats.totalSessions}</span>
          </div>
        </div>
      </div>

      <section className="bg-[#1E2022] border border-[#2D3135] rounded-xl overflow-hidden">
        <div className="p-6 border-b border-[#2D3135] bg-[#1E2022] sticky top-0 z-20">
          <h3 className="font-headline-md text-headline-md font-bold text-primary">Registered Groups</h3>
        </div>
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-[#1A1C1E] border-b border-[#2D3135]">
                <th className="py-4 px-6 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">Group Name</th>
                <th className="py-4 px-6 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">Code</th>
                <th className="py-4 px-6 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2D3135] text-body-md font-body-md text-primary">
              {groups.map(g => (
                <tr key={g.id} className="hover:bg-[#2D3135] transition-colors">
                  <td className="py-4 px-6 font-semibold">{g.name}</td>
                  <td className="py-4 px-6">
                    <span className="px-2 py-1 bg-surface-container-highest rounded border border-outline-variant text-label-sm font-label-sm text-primary-fixed font-mono">{g.code}</span>
                  </td>
                  <td className="py-4 px-6 text-on-surface-variant">{new Date(g.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
