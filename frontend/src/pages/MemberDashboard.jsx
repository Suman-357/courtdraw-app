import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';

export default function MemberDashboard() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({ sessionsPlayed: 0, totalWins: 0, totalLosses: 0, finesPaid: 0, pairings: [] });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Stats will be fetched from real backend later
  }, [user]);

  if (isLoading) return <div className="p-8 text-center text-on-surface-variant animate-pulse">Loading your stats...</div>;

  const totalMatches = stats.totalWins + stats.totalLosses;
  const winRate = totalMatches > 0 
    ? Math.round((stats.totalWins / totalMatches) * 100) 
    : 0;

  // SVG parameters for donut chart
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (winRate / 100) * circumference;

  return (
    <div className="space-y-8 relative z-10">
      {/* Player Header */}
      <div className="flex flex-col md:flex-row items-center md:items-end justify-between mb-8 gap-4 text-center md:text-left">
        <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
          <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-primary-fixed bg-surface-container-high flex items-center justify-center font-bold text-display-md text-primary-fixed">
            {user.name.charAt(0)}
          </div>
          <div>
            <h2 className="font-display-lg text-4xl md:text-display-lg text-primary leading-tight">{user.name}</h2>
            <p className="font-body-lg text-body-lg text-secondary">{user.username} • {user.role}</p>
          </div>
        </div>
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-gutter">
        {/* Win Rate Gauge */}
        <div className="col-span-12 md:col-span-5 bg-[#1E2022] border border-[#2D3135] rounded-xl p-8 flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute top-4 left-4">
            <h3 className="font-label-sm text-label-sm text-secondary uppercase tracking-wider">Overall Win Rate</h3>
          </div>
          <div className="relative w-64 h-64 flex items-center justify-center mt-4">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" fill="transparent" r="40" stroke="#2D3135" strokeWidth="8"></circle>
              {totalMatches > 0 && (
                <circle cx="50" cy="50" fill="transparent" r="40" stroke="#d2f000" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" strokeWidth="8"></circle>
              )}
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="font-display-lg text-display-lg text-primary-fixed leading-none">{winRate}<span className="text-headline-md">%</span></span>
              <span className="font-body-md text-body-md text-secondary mt-1">{totalMatches} Matches</span>
            </div>
          </div>
          <div className="flex gap-6 mt-6 w-full justify-center">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary-fixed"></div>
              <span className="font-label-md text-label-md text-primary">{stats.totalWins} Wins</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-surface-container-highest"></div>
              <span className="font-label-md text-label-md text-secondary">{stats.totalLosses} Losses</span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="col-span-12 md:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-gutter">
          <div className="bg-[#1E2022] border border-[#2D3135] rounded-xl p-6 flex flex-col justify-between">
            <h3 className="font-label-sm text-label-sm text-secondary uppercase tracking-wider flex items-center gap-2">
              <span className="material-symbols-outlined text-base">payments</span> Total Fines
            </h3>
            <div className="mt-4">
              <span className="font-display-md text-display-md text-error">{stats.finesPaid}</span>
            </div>
          </div>
          
          <div className="bg-[#1E2022] border border-[#2D3135] rounded-xl p-6 flex flex-col justify-between">
            <h3 className="font-label-sm text-label-sm text-secondary uppercase tracking-wider flex items-center gap-2">
              <span className="material-symbols-outlined text-base">history</span> Sessions Played
            </h3>
            <div className="mt-4">
              <span className="font-display-md text-display-md text-primary">{stats.sessionsPlayed}</span>
            </div>
          </div>
          
          <div className="bg-[#1E2022] border border-[#2D3135] rounded-xl p-6 flex flex-col justify-between sm:col-span-2">
            <h3 className="font-label-sm text-label-sm text-secondary uppercase tracking-wider flex items-center gap-2">
              <span className="material-symbols-outlined text-base">group</span> Top Partners
            </h3>
            <div className="mt-4 flex flex-col gap-2">
              {stats.pairings.length > 0 ? stats.pairings.map((p, i) => (
                <div key={i} className="flex justify-between items-center bg-[#101416] p-3 rounded-lg border border-[#2D3135]">
                  <span className="font-label-md text-primary">{p.partnerName}</span>
                  <div className="flex items-center gap-4 text-secondary">
                    <span>{p.timesPaired} Paired</span>
                    <span className="text-primary-fixed font-bold">{p.wins} Wins</span>
                  </div>
                </div>
              )) : (
                <p className="text-on-surface-variant text-sm">No pairing data available yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
