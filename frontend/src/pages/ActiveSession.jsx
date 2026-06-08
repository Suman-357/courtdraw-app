import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSessionStore } from '../store/sessionStore';

export default function ActiveSession() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { sessions, recordMatch, closeSession, addRematch, error } = useSessionStore();
  
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isRematchModalOpen, setRematchModalOpen] = useState(false);
  const [rematchTeamA, setRematchTeamA] = useState('');
  const [rematchTeamB, setRematchTeamB] = useState('');

  const session = sessions.find(s => s._id === id);

  useEffect(() => {
    if (session?.status === 'open') {
      const interval = setInterval(() => {
        const start = new Date(session.date).getTime();
        setElapsedTime(Math.floor((Date.now() - start) / 1000));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [session]);

  const formatTime = (seconds) => {
    if (seconds <= 0) return '00:00';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h > 0 ? h + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (!session) return <div className="p-8 text-center text-on-surface-variant animate-pulse">Loading session...</div>;

  const activeMatches = session.matchups?.filter(m => m.status === 'active') || [];
  const pendingMatches = session.matchups?.filter(m => m.status === 'pending') || [];
  const completedMatches = session.matchups?.filter(m => m.status === 'completed') || [];

  const handleRecordWin = async (matchId, teamId) => {
    await recordMatch(session._id, matchId, teamId);
  };

  const handleCloseSession = async () => {
    if(window.confirm("Are you sure you want to end this session? Fines will be calculated.")) {
      await closeSession(session._id);
      navigate(`/admin/session/${session._id}/summary`);
    }
  };

  const getTeam = (teamId) => session.teams.find(t => t.teamId === teamId);

  const handleAddRematch = async () => {
    if (rematchTeamA && rematchTeamB && rematchTeamA !== rematchTeamB) {
      await addRematch(session._id, rematchTeamA, rematchTeamB);
      setRematchModalOpen(false);
      setRematchTeamA('');
      setRematchTeamB('');
    }
  };

  return (
    <div className="space-y-8 relative z-10">
      {/* Live Timer Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 md:mb-8 border-b border-outline-variant pb-4 md:pb-6 gap-3">
        <div>
          <div className="flex items-center gap-2 mb-2">
            {session.status === 'open' ? (
              <>
                <span className="w-3 h-3 rounded-full bg-primary-fixed shadow-[0_0_10px_rgba(210,240,0,0.6)] animate-pulse"></span>
                <span className="font-label-md text-label-md text-primary-fixed tracking-wider uppercase">Live Session</span>
              </>
            ) : (
              <>
                <span className="w-3 h-3 rounded-full bg-error shadow-[0_0_10px_rgba(255,180,171,0.6)]"></span>
                <span className="font-label-md text-label-md text-error tracking-wider uppercase">Closed Session</span>
              </>
            )}
          </div>
          <h2 className="font-display-md text-xl md:text-display-md text-on-surface mb-1">Session Management</h2>
          <p className="font-body-md text-body-md text-on-surface-variant">Round Robin • {session.presentPlayers?.length || 0} Players</p>
        </div>
        {session.status === 'open' && (
          <div className="text-left sm:text-right">
            <p className="font-label-sm text-secondary uppercase tracking-wider mb-1">Elapsed Time</p>
            <div className="font-display-md text-2xl md:text-3xl font-bold text-primary-fixed font-mono">{formatTime(elapsedTime)}</div>
          </div>
        )}
      </div>

      {error && (
        <div className="p-4 mb-8 bg-error-container/20 border border-error/30 text-error rounded-xl font-label-md">
          {error}
        </div>
      )}

      {/* Global Actions Toolbar */}
      {session.status === 'open' && (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 bg-surface-container-highest/60 backdrop-blur-md border border-outline-variant p-4 rounded-xl">
          <div className="flex gap-4">
            <span className="text-on-surface-variant font-label-md text-label-md flex items-center">
              Record wins as matches are completed to cycle the queue.
            </span>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <button onClick={() => setRematchModalOpen(true)} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2 bg-surface-container text-primary border border-outline-variant font-label-md text-label-md rounded-lg hover:border-primary transition-colors">
              <span className="material-symbols-outlined text-[20px]">add</span>
              Add Rematch
            </button>
            <button onClick={handleCloseSession} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2 bg-error-container text-on-error-container font-label-md text-label-md rounded-lg hover:opacity-90 transition-opacity">
              <span className="material-symbols-outlined text-[20px]">stop_circle</span>
              End Session
            </button>
          </div>
        </div>
      )}

      {/* Teams Overview */}
      <div className="mb-8 md:mb-10">
        <h3 className="font-headline-md text-headline-md text-on-surface mb-3 md:mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary-fixed">groups</span>
          Teams
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
          {session.teams.map((team, idx) => (
            <div key={team.teamId} className="bg-surface-container border border-outline-variant rounded-xl p-4 hover:border-primary-fixed transition-colors">
              <div className="flex items-center justify-between mb-3">
                <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider">Team {idx + 1}</span>
                <span className="bg-primary-fixed/10 text-primary-fixed font-bold text-sm px-2 py-0.5 rounded">{team.wins}W</span>
              </div>
              <div className="space-y-1">
                {team.players.map(p => (
                  <div key={p._id} className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-surface-container-high flex items-center justify-center text-[11px] font-bold text-primary-fixed">
                      {p.name.charAt(0)}
                    </div>
                    <span className="font-label-md text-on-surface truncate">{p.name}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Courts Grid */}
      <h3 className="font-headline-md text-headline-md text-on-surface mb-3 md:mb-4">Active Courts</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-12">
        {activeMatches.length === 0 && session.status === 'open' ? (
          <div className="col-span-3 text-center p-12 bg-surface-container rounded-xl border border-outline-variant text-secondary">
            No active matches. All matchups completed!
          </div>
        ) : (
          activeMatches.map((match) => {
            const teamA = getTeam(match.teamA);
            const teamB = getTeam(match.teamB);
            
            return (
              <div key={match.matchId} className="bg-surface-container rounded-xl border border-outline-variant overflow-hidden flex flex-col">
                <div className="p-4 bg-surface-container-highest border-b border-outline-variant flex justify-between items-center">
                  <h3 className="font-headline-md text-headline-md text-on-surface">Court {match.courtNumber}</h3>
                  <span className="px-2 py-1 bg-primary-fixed/20 text-primary-fixed font-label-sm text-label-sm rounded uppercase tracking-wider">In Progress</span>
                </div>
                
                <div className="p-6 flex-1 flex flex-col justify-center gap-6">
                  {/* Team A */}
                  <div className="flex justify-between items-center bg-surface-container-high p-4 rounded-xl border border-transparent hover:border-primary-fixed transition-colors">
                    <div>
                      <div className="font-label-md text-label-md text-on-surface">{teamA.players.map(p => p.name).join(' & ')}</div>
                      <div className="font-label-sm text-label-sm text-secondary">Team A</div>
                    </div>
                    {session.status === 'open' && (
                      <button onClick={() => handleRecordWin(match.matchId, teamA.teamId)} className="px-4 py-2 bg-surface-container text-primary-fixed border border-primary-fixed hover:bg-primary-fixed hover:text-on-primary-fixed rounded-lg text-sm font-bold transition-colors">
                        Mark Winner
                      </button>
                    )}
                  </div>

                  <div className="h-px w-full bg-outline-variant relative">
                    <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-surface-container px-2 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest">VS</span>
                  </div>

                  {/* Team B */}
                  <div className="flex justify-between items-center bg-surface-container-high p-4 rounded-xl border border-transparent hover:border-primary-fixed transition-colors">
                    <div>
                      <div className="font-label-md text-label-md text-on-surface">{teamB.players.map(p => p.name).join(' & ')}</div>
                      <div className="font-label-sm text-label-sm text-secondary">Team B</div>
                    </div>
                    {session.status === 'open' && (
                      <button onClick={() => handleRecordWin(match.matchId, teamB.teamId)} className="px-4 py-2 bg-surface-container text-primary-fixed border border-primary-fixed hover:bg-primary-fixed hover:text-on-primary-fixed rounded-lg text-sm font-bold transition-colors">
                        Mark Winner
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Match Queue */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h3 className="font-headline-md text-headline-md text-on-surface mb-4">Pending Queue ({pendingMatches.length})</h3>
          <div className="bg-surface-container rounded-xl border border-outline-variant overflow-hidden max-h-96 overflow-y-auto custom-scrollbar">
            {pendingMatches.length === 0 ? (
              <div className="p-4 text-center text-secondary">No pending matches.</div>
            ) : (
              <div className="divide-y divide-outline-variant">
                {pendingMatches.map((m, idx) => {
                  const tA = getTeam(m.teamA);
                  const tB = getTeam(m.teamB);
                  return (
                    <div key={m.matchId} className="p-4 flex items-center justify-between hover:bg-surface-container-high transition-colors">
                      <span className="text-secondary w-6 font-bold">{idx + 1}.</span>
                      <div className="flex-1 text-center font-label-md text-on-surface">{tA.players.map(p=>p.name).join(' & ')}</div>
                      <span className="px-3 text-secondary font-bold text-xs uppercase">VS</span>
                      <div className="flex-1 text-center font-label-md text-on-surface">{tB.players.map(p=>p.name).join(' & ')}</div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        <div>
          <h3 className="font-headline-md text-headline-md text-on-surface mb-4">Completed ({completedMatches.length})</h3>
          <div className="bg-surface-container rounded-xl border border-outline-variant overflow-hidden max-h-96 overflow-y-auto custom-scrollbar">
            {completedMatches.length === 0 ? (
              <div className="p-4 text-center text-secondary">No matches completed yet.</div>
            ) : (
              <div className="divide-y divide-outline-variant">
                {completedMatches.map((m) => {
                  const tA = getTeam(m.teamA);
                  const tB = getTeam(m.teamB);
                  const winner = getTeam(m.winnerTeamId);
                  return (
                    <div key={m.matchId} className="p-4 flex flex-col hover:bg-surface-container-high transition-colors">
                      <div className="flex items-center justify-between opacity-50 mb-2">
                        <div className="flex-1 text-center font-label-sm text-on-surface">{tA.players.map(p=>p.name).join(' & ')}</div>
                        <span className="px-3 text-secondary font-bold text-xs uppercase">VS</span>
                        <div className="flex-1 text-center font-label-sm text-on-surface">{tB.players.map(p=>p.name).join(' & ')}</div>
                      </div>
                      <div className="text-center font-label-sm text-primary-fixed bg-primary-fixed/10 py-1 rounded">
                        Winner: {winner?.players.map(p=>p.name).join(' & ')}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Rematch Modal */}
      {isRematchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#1E2022] border border-[#2D3135] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-[#2D3135] flex justify-between items-center">
              <h3 className="font-headline-md text-primary">Add Tie-Breaker Rematch</h3>
              <button onClick={() => setRematchModalOpen(false)} className="text-secondary hover:text-primary">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-primary font-label-md mb-2">Select Team A</label>
                <select 
                  value={rematchTeamA} 
                  onChange={e => setRematchTeamA(e.target.value)}
                  className="w-full bg-[#101416] border border-[#2D3135] focus:border-primary-fixed text-primary h-12 rounded-lg px-4 outline-none font-body-md"
                >
                  <option value="">-- Choose Team --</option>
                  {session.teams.map(t => (
                    <option key={t.teamId} value={t.teamId}>{t.players.map(p=>p.name).join(' & ')} ({t.wins} wins)</option>
                  ))}
                </select>
              </div>
              <div className="text-center text-secondary font-bold text-sm uppercase">VS</div>
              <div>
                <label className="block text-primary font-label-md mb-2">Select Team B</label>
                <select 
                  value={rematchTeamB} 
                  onChange={e => setRematchTeamB(e.target.value)}
                  className="w-full bg-[#101416] border border-[#2D3135] focus:border-primary-fixed text-primary h-12 rounded-lg px-4 outline-none font-body-md"
                >
                  <option value="">-- Choose Team --</option>
                  {session.teams.map(t => (
                    <option key={t.teamId} value={t.teamId} disabled={t.teamId === rematchTeamA}>{t.players.map(p=>p.name).join(' & ')} ({t.wins} wins)</option>
                  ))}
                </select>
              </div>
              <div className="pt-4 flex gap-3">
                <button onClick={() => setRematchModalOpen(false)} className="flex-1 py-3 bg-surface-container text-primary border border-outline-variant rounded-lg font-bold">Cancel</button>
                <button 
                  onClick={handleAddRematch}
                  disabled={!rematchTeamA || !rematchTeamB || rematchTeamA === rematchTeamB}
                  className="flex-1 py-3 bg-primary-fixed text-on-primary-fixed hover:bg-primary-fixed-dim rounded-lg font-bold disabled:opacity-50"
                >
                  Add Match
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
