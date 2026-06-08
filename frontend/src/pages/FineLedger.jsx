import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useGroupStore } from '../store/groupStore';
import { useSessionStore } from '../store/sessionStore';

export default function FineLedger() {
  const { user } = useAuthStore();
  const { members, fetchGroupLedger, isLoading, error } = useGroupStore();
  const { sessions, fetchSessions } = useSessionStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('fines-desc');
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [selectedMemberId, setSelectedMemberId] = useState(null);

  useEffect(() => {
    if (user?.groupId) {
      fetchGroupLedger(user.groupId);
      if (sessions.length === 0) fetchSessions(user.groupId);
    }
  }, [user]);

  if (isLoading && sessions.length === 0) return <div className="p-8 text-center text-on-surface-variant animate-pulse">Loading fine ledger...</div>;

  const availableMonths = [...new Set(sessions.filter(s => s.status === 'closed').map(s => {
    const d = new Date(s.date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  }))].sort().reverse();

  const computedLedger = members.map(member => {
    let sessionsPlayed = 0;
    let totalWins = 0;
    let finesPaid = 0;

    const memberSessions = sessions.filter(s => 
      s.status === 'closed' && 
      s.presentPlayers.some(p => (p._id || p) === member._id)
    );

    const filteredMemberSessions = selectedMonth === 'all' 
      ? memberSessions 
      : memberSessions.filter(s => {
          const d = new Date(s.date);
          return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}` === selectedMonth;
        });

    filteredMemberSessions.forEach(session => {
      sessionsPlayed++;
      const team = session.teams.find(t => t.players.some(p => (p._id || p) === member._id));
      if (team) {
        totalWins += team.wins;
        const fine = session.fines.find(f => f.teamId === team.teamId);
        if (fine) {
          finesPaid += (fine.amount / fine.players.length);
        }
      }
    });

    return {
      _id: member._id,
      userId: member,
      sessionsPlayed,
      totalWins,
      finesPaid
    };
  }).filter(stat => selectedMonth === 'all' || stat.sessionsPlayed > 0);

  const filteredLedger = computedLedger
    .filter(stat => stat.userId?.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'fines-desc') return b.finesPaid - a.finesPaid;
      if (sortBy === 'fines-asc') return a.finesPaid - b.finesPaid;
      if (sortBy === 'wins-desc') return b.totalWins - a.totalWins;
      if (sortBy === 'sessions-desc') return b.sessionsPlayed - a.sessionsPlayed;
      return 0;
    });

  const renderMemberModal = () => {
    if (!selectedMemberId) return null;
    const memberStat = computedLedger.find(s => s.userId._id === selectedMemberId);
    if (!memberStat) return null;

    // Filter sessions where this member played
    const memberSessions = sessions.filter(s => 
      s.status === 'closed' && 
      s.presentPlayers.some(p => (p?._id || p) === selectedMemberId) &&
      (selectedMonth === 'all' || (() => {
        const d = new Date(s.date);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}` === selectedMonth;
      })())
    ).sort((a, b) => new Date(b.date) - new Date(a.date));

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
        <div className="bg-[#1E2022] border border-[#2D3135] rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
          <div className="p-6 border-b border-[#2D3135] flex justify-between items-center bg-surface-container-highest">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center text-primary-fixed font-headline-md font-bold">
                {memberStat.userId.name.charAt(0)}
              </div>
              <div>
                <h3 className="font-headline-md text-primary">{memberStat.userId.name}'s History</h3>
                <p className="text-sm text-secondary">{selectedMonth === 'all' ? 'Lifetime' : 'Monthly'} Fines: ₹{memberStat.finesPaid.toFixed(2)}</p>
              </div>
            </div>
            <button onClick={() => setSelectedMemberId(null)} className="text-secondary hover:text-primary transition-colors">
              <span className="material-symbols-outlined text-3xl">close</span>
            </button>
          </div>
          
          <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-surface">
            {memberSessions.length === 0 ? (
              <div className="text-center text-secondary py-8">No closed sessions found for this member.</div>
            ) : (
              <div className="space-y-4">
                {memberSessions.map(session => {
                  const team = session.teams.find(t => t.players.some(p => p._id === selectedMemberId));
                  if (!team) return null;
                  
                  const partners = team.players.filter(p => p._id !== selectedMemberId);
                  const fine = session.fines.find(f => f.teamId === team.teamId);
                  const fineAmount = fine ? (fine.amount / fine.players.length) : 0;
                  
                  return (
                    <div key={session._id} className="bg-surface-container border border-outline-variant rounded-xl p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-primary-fixed transition-colors">
                      <div>
                        <div className="text-xs text-secondary mb-1">{new Date(session.date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</div>
                        <div className="font-label-md text-on-surface">
                          Partner(s): <span className="text-primary-fixed">{partners.map(p => p.name).join(' & ') || 'None (Singles)'}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-6">
                        <div className="text-center">
                          <div className="text-[10px] text-secondary uppercase tracking-wider">Team Wins</div>
                          <div className="font-bold text-on-surface-variant text-lg">{team.wins}</div>
                        </div>
                        
                        <div className="text-right min-w-[80px]">
                          <div className="text-[10px] text-secondary uppercase tracking-wider">Fine</div>
                          <div className={`font-bold text-lg ${fineAmount > 0 ? 'text-error' : 'text-primary-fixed'}`}>
                            {fineAmount > 0 ? `₹${fineAmount.toFixed(2)}` : '—'}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="pt-4 md:pt-8 pb-12 w-full relative z-10">
      <div className="mb-6 md:mb-8">
        <h2 className="font-headline-lg text-xl md:text-headline-lg text-primary mb-1 md:mb-2">Member Fines Ledger</h2>
        <p className="font-body-md text-body-md text-secondary text-sm md:text-base">Track accumulated fines across sessions.</p>
      </div>

      {error && (
        <div className="p-4 mb-8 bg-error-container/20 border border-error/30 text-error rounded-xl font-label-md">
          {error}
        </div>
      )}

      {/* Filters Toolbar */}
      <div className="flex flex-col md:flex-row gap-3 md:gap-4 mb-6 bg-surface-container-highest/60 backdrop-blur-md border border-outline-variant p-3 md:p-4 rounded-xl">
        <div className="flex-1 relative">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-secondary">search</span>
          <input 
            type="text" 
            placeholder="Search members..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#101416] border border-[#2D3135] focus:border-primary-fixed text-primary h-10 md:h-12 rounded-lg pl-12 pr-4 outline-none font-body-md text-sm md:text-base"
          />
        </div>
        <div className="flex gap-3 w-full md:w-auto">
        <div className="flex-1 md:w-48">
          <select 
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="w-full bg-[#101416] border border-[#2D3135] focus:border-primary-fixed text-primary h-10 md:h-12 rounded-lg px-3 md:px-4 outline-none font-body-md text-sm md:text-base"
          >
            <option value="all">All Time</option>
            {availableMonths.map(m => {
              const [y, mo] = m.split('-');
              const date = new Date(y, mo - 1);
              return <option key={m} value={m}>{date.toLocaleString('default', { month: 'long', year: 'numeric' })}</option>
            })}
          </select>
        </div>
        <div className="flex-1 md:w-48">
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full bg-[#101416] border border-[#2D3135] focus:border-primary-fixed text-primary h-10 md:h-12 rounded-lg px-3 md:px-4 outline-none font-body-md text-sm md:text-base"
          >
            <option value="fines-desc">Highest Fines</option>
            <option value="fines-asc">Lowest Fines</option>
            <option value="wins-desc">Most Wins</option>
            <option value="sessions-desc">Most Sessions</option>
          </select>
        </div>
        </div>
      </div>

      {/* Mobile card view */}
      <div className="md:hidden space-y-3">
        {filteredLedger.map((stat) => (
          <div 
            key={stat._id}
            onClick={() => setSelectedMemberId(stat.userId._id)}
            className="bg-surface-container border border-outline-variant rounded-xl p-4 cursor-pointer active:bg-surface-container-high transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-primary-fixed font-bold">
                  {stat.userId?.name?.charAt(0)}
                </div>
                <div>
                  <span className="font-semibold text-on-surface block">{stat.userId?.name}</span>
                  <span className="text-xs text-secondary">{stat.sessionsPlayed} sessions • {stat.totalWins} wins</span>
                </div>
              </div>
              <span className={`font-bold text-lg ${stat.finesPaid > 0 ? 'text-error' : 'text-primary-fixed'}`}>
                ₹{stat.finesPaid.toFixed(0)}
              </span>
            </div>
          </div>
        ))}
        {filteredLedger.length === 0 && (
          <div className="py-8 text-center text-secondary">
            {searchQuery ? 'No members match your search.' : 'No stats or fines recorded yet.'}
          </div>
        )}
      </div>

      {/* Desktop table view */}
      <div className="hidden md:block bg-surface-container border border-outline-variant rounded-xl overflow-hidden shadow-lg">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-outline-variant bg-surface-container-highest">
              <th className="py-4 px-6 font-label-sm text-label-sm text-secondary uppercase tracking-wider">Member</th>
              <th className="py-4 px-6 font-label-sm text-label-sm text-secondary uppercase tracking-wider text-center">Sessions Played</th>
              <th className="py-4 px-6 font-label-sm text-label-sm text-secondary uppercase tracking-wider text-center">Total Wins</th>
              <th className="py-4 px-6 font-label-sm text-label-sm text-secondary uppercase tracking-wider text-right">Fines Accrued</th>
            </tr>
          </thead>
          <tbody className="font-body-md text-body-md divide-y divide-outline-variant">
            {filteredLedger.map((stat) => {
              return (
                <tr 
                  key={stat._id} 
                  onClick={() => setSelectedMemberId(stat.userId._id)}
                  className="hover:bg-surface-container-high transition-colors cursor-pointer group"
                >
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-surface-container-high overflow-hidden flex items-center justify-center text-secondary font-headline-sm font-bold group-hover:text-primary-fixed transition-colors">
                        {stat.userId?.name?.charAt(0)}
                      </div>
                      <div>
                        <span className="font-semibold text-on-surface block group-hover:text-primary transition-colors">{stat.userId?.name}</span>
                        {!stat.userId?.isActive && <span className="text-[10px] uppercase text-error tracking-wider">Inactive</span>}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-center text-on-surface-variant font-bold">{stat.sessionsPlayed}</td>
                  <td className="py-4 px-6 text-center text-on-surface-variant">
                    <span className="text-secondary">{stat.totalWins}</span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <span className={`font-headline-sm text-lg font-bold ${stat.finesPaid > 0 ? 'text-error' : 'text-primary-fixed'}`}>
                      ₹{stat.finesPaid.toFixed(2)}
                    </span>
                  </td>
                </tr>
              );
            })}
            
            {filteredLedger.length === 0 && (
              <tr>
                <td colSpan="4" className="py-8 text-center text-secondary">
                  {searchQuery ? 'No members match your search.' : 'No stats or fines recorded yet.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {renderMemberModal()}
    </div>
  );
}
