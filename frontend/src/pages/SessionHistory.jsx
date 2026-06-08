import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSessionStore } from '../store/sessionStore';
import { useAuthStore } from '../store/authStore';

export default function SessionHistory() {
  const { sessions, fetchSessions, isLoading } = useSessionStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [filterMonth, setFilterMonth] = useState('all');

  useEffect(() => {
    if (user?.groupId) {
      fetchSessions(user.groupId);
    }
  }, [user]);

  // Generate list of available months from sessions
  const availableMonths = [...new Set(sessions.map(s => {
    const d = new Date(s.date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  }))].sort().reverse(); // Newest first

  const filteredSessions = sessions.filter(s => {
    if (filterMonth === 'all') return true;
    const d = new Date(s.date);
    const monthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    return monthStr === filterMonth;
  });

  const getMonthName = (monthStr) => {
    const [year, month] = monthStr.split('-');
    const date = new Date(year, parseInt(month) - 1, 1);
    return date.toLocaleString('default', { month: 'long', year: 'numeric' });
  };

  return (
    <div className="pt-4 md:pt-8 pb-12 w-full relative z-10">
      <div className="mb-6 md:mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="font-headline-lg text-xl md:text-headline-lg text-primary mb-1 md:mb-2">Session History</h2>
          <p className="font-body-md text-body-md text-secondary text-sm md:text-base">Browse and filter past playing sessions.</p>
        </div>
        
        <div className="flex items-center gap-3 bg-[#1E2022] p-2 rounded-xl border border-[#2D3135] w-full md:w-auto">
          <span className="material-symbols-outlined text-secondary ml-2">filter_list</span>
          <select 
            value={filterMonth} 
            onChange={e => setFilterMonth(e.target.value)}
            className="bg-transparent text-primary outline-none cursor-pointer font-label-md px-2"
          >
            <option value="all">All Time</option>
            {availableMonths.map(m => (
              <option key={m} value={m}>{getMonthName(m)}</option>
            ))}
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="p-8 text-center text-on-surface-variant animate-pulse">Loading history...</div>
      ) : (
        <div className="bg-[#1E2022] border border-[#2D3135] rounded-xl overflow-hidden">
          <div className="divide-y divide-[#2D3135]">
            {filteredSessions.length === 0 ? (
              <div className="p-12 text-center text-secondary">
                <span className="material-symbols-outlined text-5xl mb-3 opacity-50">event_busy</span>
                <p>No sessions found for this filter.</p>
              </div>
            ) : (
              filteredSessions.map(s => (
                <div 
                  key={s._id} 
                  onClick={() => navigate(s.status === 'open' ? `/admin/session/${s._id}` : `/admin/session/${s._id}/summary`)} 
                  className="p-4 md:p-6 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-[#2D3135] transition-colors group cursor-pointer gap-4"
                >
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-headline-sm text-primary font-bold">
                        {new Date(s.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                      </span>
                      {s.status === 'open' ? (
                        <span className="px-2 py-0.5 bg-primary-fixed/20 text-primary-fixed text-xs uppercase tracking-wider rounded font-bold">Live</span>
                      ) : (
                        <span className="px-2 py-0.5 bg-surface-container-highest border border-outline-variant text-secondary text-xs uppercase tracking-wider rounded font-bold">Closed</span>
                      )}
                    </div>
                    <div className="text-label-md text-secondary">
                      {new Date(s.date).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })} • {s.presentPlayers.length} Players • {s.courtCount} Courts
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-8 w-full sm:w-auto pt-2 sm:pt-0 border-t border-[#2D3135] sm:border-0">
                    <div className="text-left sm:text-right">
                      <div className="text-error font-headline-sm font-bold">
                        ₹{s.fines?.reduce((sum, f) => sum + f.amount, 0).toFixed(2) || '0.00'}
                      </div>
                      <div className="text-[10px] text-secondary uppercase tracking-wider">Total Fines</div>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center group-hover:bg-primary-fixed group-hover:text-on-primary-fixed transition-colors">
                      <span className="material-symbols-outlined">arrow_forward</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
