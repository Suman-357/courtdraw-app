import { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSessionStore } from '../store/sessionStore';

export default function SessionSummary() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { sessions } = useSessionStore();
  
  const session = sessions.find(s => s._id === id);

  if (!session) return <div className="p-8 text-center text-on-surface-variant animate-pulse">Loading session summary...</div>;

  const sortedTeams = [...session.teams].sort((a, b) => b.wins - a.wins);

  return (
    <div className="space-y-6 md:space-y-8 relative z-10 pb-24 md:pb-32">
      <div className="mb-6 md:mb-10 flex flex-col items-center justify-center text-center space-y-3 md:space-y-4 py-8 md:py-12 border border-outline-variant bg-surface-container rounded-xl relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary-fixed via-surface-container to-surface-container"></div>
        <span className="material-symbols-outlined text-primary-fixed relative z-10" style={{ fontVariationSettings: "'FILL' 1", fontSize: '48px' }}>emoji_events</span>
        <div className="relative z-10 px-4">
          <h2 className="font-display-md text-2xl md:text-display-md text-primary-fixed tracking-tight uppercase">Session Complete</h2>
          <p className="font-body-lg text-sm md:text-body-lg text-secondary mt-2">Review final standings and generated fines.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-gutter">
        {/* Left Column: Leaderboard */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-headline-md text-headline-md text-on-surface">Final Standings</h3>
          </div>
          <div className="bg-surface-container border border-outline-variant rounded-xl overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-outline-variant bg-surface-container-highest">
                  <th className="py-4 px-6 font-label-sm text-label-sm text-secondary uppercase tracking-wider w-16 text-center">Rank</th>
                  <th className="py-4 px-6 font-label-sm text-label-sm text-secondary uppercase tracking-wider">Team / Players</th>
                  <th className="py-4 px-6 font-label-sm text-label-sm text-secondary uppercase tracking-wider text-right">Wins</th>
                  <th className="py-4 px-6 font-label-sm text-label-sm text-secondary uppercase tracking-wider text-center">Badges</th>
                </tr>
              </thead>
              <tbody className="font-body-md text-body-md divide-y divide-outline-variant">
                {sortedTeams.map((team, idx) => (
                  <tr key={team.teamId} className={`hover:bg-surface-container-high transition-colors ${idx === 0 ? 'bg-[#1a2016]' : ''} ${idx === sortedTeams.length - 1 ? 'opacity-70' : ''}`}>
                    <td className={`py-4 px-6 text-center ${idx === 0 ? 'font-headline-sm text-primary-fixed' : 'text-secondary'}`}>{idx + 1}</td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-on-surface">{team.players.map(p => p.name).join(' & ')}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right font-semibold text-on-surface">{team.wins}</td>
                    <td className="py-4 px-6 text-center">
                      {idx === 0 && (
                        <span className="inline-flex items-center gap-1 bg-primary-fixed/10 text-primary-fixed border border-primary-fixed/20 px-2 py-1 rounded font-label-sm text-[10px] uppercase">
                          <span className="material-symbols-outlined text-[14px]">star</span> MVP
                        </span>
                      )}
                      {idx === sortedTeams.length - 1 && sortedTeams.length > 1 && (
                        <span className="inline-flex items-center gap-1 bg-error/10 text-error border border-error/20 px-2 py-1 rounded font-label-sm text-[10px] uppercase">
                          Spoon
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Fines List */}
        <div className="lg:col-span-4 space-y-6">
          <h3 className="font-headline-md text-headline-md text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-error">receipt_long</span> Fine List
          </h3>
          <div className="bg-surface-container border border-outline-variant rounded-xl p-6 flex flex-col gap-4">
            <div className="pb-4 border-b border-outline-variant flex justify-between items-end">
              <div>
                <p className="font-label-sm text-label-sm text-secondary uppercase">Total Fines</p>
                <p className="font-display-md text-3xl font-bold text-on-surface mt-1">₹{session.fines.reduce((sum, f) => sum + f.amount, 0).toFixed(2)}</p>
              </div>
              <span className="text-secondary font-label-sm text-label-sm">{session.fines.length} Infractions</span>
            </div>
            
            <div className="space-y-4 pt-2">
              {session.fines.length === 0 ? (
                <p className="text-secondary text-sm">No fines recorded.</p>
              ) : (
                session.fines.map(f => (
                  <div key={f.teamId} className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="mt-1 text-error">
                        <span className="material-symbols-outlined text-xl">trending_down</span>
                      </div>
                      <div>
                        <p className="font-label-md text-label-md text-on-surface">{f.players.map(p => p.name).join(' & ')}</p>
                        <p className="font-label-sm text-label-sm text-secondary">Last Place Penalty</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="font-headline-sm text-lg font-bold text-error">₹{f.amount.toFixed(2)}</span>
                      <span className="text-[10px] text-error/80 uppercase tracking-wider">
                        (₹{(f.amount / f.players.length).toFixed(2)} per player)
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 md:left-[280px] bg-surface-container border-t border-outline-variant p-3 md:p-4 z-40 flex justify-center md:justify-end gap-4 shadow-[0_-4px_20px_rgba(0,0,0,0.5)]">
        <Link to="/admin/dashboard" className="bg-primary-fixed text-on-primary-fixed font-label-md text-label-md font-bold px-8 py-3 rounded-lg flex items-center gap-2 hover:bg-primary-fixed-dim transition-colors shadow-[0_0_15px_rgba(210,240,0,0.2)]">
          <span className="material-symbols-outlined">dashboard</span>
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}
