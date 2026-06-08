import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useGroupStore } from '../store/groupStore';
import { useSessionStore } from '../store/sessionStore';

export default function SessionSetup() {
  const { user } = useAuthStore();
  const { currentGroup, members, fetchGroupDetails, addMember, isLoading: groupLoading } = useGroupStore();
  const { createSession, error } = useSessionStore();
  const navigate = useNavigate();

  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [courtCount, setCourtCount] = useState(3);
  const [matchType, setMatchType] = useState('Doubles');
  const [showGuestForm, setShowGuestForm] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [addingGuest, setAddingGuest] = useState(false);
  const [teamMode, setTeamMode] = useState('auto'); // 'auto' | 'manual'
  const [manualTeams, setManualTeams] = useState([[], []]); // Start with 2 empty teams
  const [activeTeamIdx, setActiveTeamIdx] = useState(0); // Which team slot is currently receiving players

  useEffect(() => {
    if (user?.groupId) {
      fetchGroupDetails(user.groupId);
    }
  }, [user]);

  const togglePlayerSelection = (id) => {
    setSelectedPlayers(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);
  };

  const handleStartSession = async () => {
    if (teamMode === 'manual') {
      const validTeams = manualTeams.filter(t => t.length >= 1);
      if (validTeams.length < 2) {
        alert('You need at least 2 teams with players!');
        return;
      }
      try {
        const teams = validTeams.map(t => ({ players: t }));
        const sessionId = await createSession(user.groupId, null, courtCount, teams);
        navigate(`/admin/session/${sessionId}`);
      } catch (e) {
        alert(e.message);
      }
    } else {
      if (selectedPlayers.length < 4) {
        alert('Please select at least 4 players!');
        return;
      }
      try {
        const sessionId = await createSession(user.groupId, selectedPlayers, courtCount);
        navigate(`/admin/session/${sessionId}`);
      } catch (e) {
        alert(e.message);
      }
    }
  };

  const allAssignedPlayers = manualTeams.flat();

  const toggleManualPlayer = (playerId) => {
    // If already assigned to a team, remove them
    const existingTeamIdx = manualTeams.findIndex(t => t.includes(playerId));
    if (existingTeamIdx !== -1) {
      setManualTeams(prev => prev.map((t, i) => i === existingTeamIdx ? t.filter(p => p !== playerId) : t));
      return;
    }
    // Add to the active team
    setManualTeams(prev => prev.map((t, i) => i === activeTeamIdx ? [...t, playerId] : t));
  };

  const addNewTeamSlot = () => {
    setManualTeams(prev => [...prev, []]);
    setActiveTeamIdx(manualTeams.length);
  };

  const removeTeamSlot = (idx) => {
    if (manualTeams.length <= 2) return;
    setManualTeams(prev => prev.filter((_, i) => i !== idx));
    if (activeTeamIdx >= manualTeams.length - 1) setActiveTeamIdx(0);
  };

  const handleAddGuest = async () => {
    if (!guestName.trim()) return;
    setAddingGuest(true);
    try {
      const username = `guest_${guestName.trim().toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`;
      await addMember({ name: guestName.trim(), username, password: 'guest123', isGuest: true });
      // Auto-select the newly added guest
      const updatedMembers = useGroupStore.getState().members;
      const newGuest = updatedMembers.find(m => m.username === username);
      if (newGuest) {
        setSelectedPlayers(prev => [...prev, newGuest._id]);
      }
      setGuestName('');
      setShowGuestForm(false);
    } catch (e) {
      alert('Failed to add guest');
    } finally {
      setAddingGuest(false);
    }
  };

  if (groupLoading) return <div className="p-8 text-center text-on-surface-variant animate-pulse">Loading roster...</div>;

  const activeMembers = members.filter(m => m.isActive && m.role !== 'admin');

  return (
    <div className="pt-4 md:pt-8 pb-12 w-full relative z-10">
      {/* Header Section */}
      <div className="mb-6 md:mb-8 flex justify-between items-end">
        <div>
          <h2 className="font-headline-lg text-xl md:text-headline-lg text-primary mb-1 md:mb-2">Configure Session</h2>
          <p className="font-body-md text-body-md text-secondary text-sm md:text-base">Select players and set parameters.</p>
        </div>
        <div className="text-right">
          <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider block mb-1">Selected</span>
          <span className="font-display-md text-2xl md:text-display-md text-primary-fixed leading-none">{teamMode === 'manual' ? allAssignedPlayers.length : selectedPlayers.length}</span>
        </div>
      </div>

      {error && (
        <div className="p-4 mb-8 bg-error-container/20 border border-error/30 text-error rounded-xl font-label-md">
          {error}
        </div>
      )}

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 md:gap-gutter">
        
        {/* Player Selection Canvas */}
        <div className="xl:col-span-8 bg-[#1E2022]/70 backdrop-blur-md border border-outline-variant rounded-xl p-4 md:p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-headline-md text-headline-md text-primary">Roster</h3>
            <div className="flex gap-2">
              <button onClick={() => setSelectedPlayers(activeMembers.map(m => m._id))} className="font-label-sm text-label-sm text-secondary hover:text-primary transition-colors px-3 py-1 bg-surface-container rounded">Select All</button>
              <button onClick={() => setSelectedPlayers([])} className="font-label-sm text-label-sm text-secondary hover:text-primary transition-colors px-3 py-1 bg-surface-container rounded">Clear</button>
            </div>
          </div>

          {/* Filter Tags */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            <span className="px-3 py-1 rounded-full bg-primary-fixed text-on-primary-fixed font-label-sm text-label-sm cursor-pointer whitespace-nowrap">All Regulars</span>
            <span className="px-3 py-1 rounded-full bg-surface-container border border-outline-variant text-secondary hover:text-primary transition-colors font-label-sm text-label-sm cursor-pointer whitespace-nowrap">Advanced (A)</span>
            <span className="px-3 py-1 rounded-full bg-surface-container border border-outline-variant text-secondary hover:text-primary transition-colors font-label-sm text-label-sm cursor-pointer whitespace-nowrap">Guests</span>
          </div>

          {/* Player Grid */}
          <div className="grid grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
            {activeMembers.map(m => {
              const isSelected = teamMode === 'auto' ? selectedPlayers.includes(m._id) : allAssignedPlayers.includes(m._id);
              const assignedTeamIdx = teamMode === 'manual' ? manualTeams.findIndex(t => t.includes(m._id)) : -1;
              const teamColors = ['text-primary-fixed', 'text-error', 'text-amber-400', 'text-cyan-400', 'text-purple-400', 'text-green-400'];
              
              return (
                <div 
                  key={m._id} 
                  onClick={() => teamMode === 'auto' ? togglePlayerSelection(m._id) : toggleManualPlayer(m._id)} 
                  className={`bg-surface-container border rounded-xl p-4 cursor-pointer transition-colors relative ${isSelected ? 'border-primary-fixed bg-primary-fixed/5' : 'border-outline-variant hover:border-primary-fixed'}`}
                >
                  <div className={`absolute top-2 right-2 transition-all duration-200 ${isSelected ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}>
                    {teamMode === 'manual' && assignedTeamIdx !== -1 ? (
                      <span className={`font-bold text-[11px] ${teamColors[assignedTeamIdx % teamColors.length]} bg-surface-container-high px-1.5 py-0.5 rounded`}>T{assignedTeamIdx + 1}</span>
                    ) : (
                      <span className="material-symbols-outlined text-primary-fixed" style={{ fontSize: '18px', fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    )}
                  </div>
                  <div className="w-12 h-12 rounded-full bg-surface-container-high mx-auto mb-3 overflow-hidden flex items-center justify-center text-secondary font-headline-md font-bold text-primary-fixed">
                    {m.name.charAt(0)}
                  </div>
                  <div className="text-center">
                    <h4 className="font-label-md text-label-md text-primary truncate">{m.name}</h4>
                    <span className={`font-label-sm text-label-sm ${m.isGuest ? 'text-amber-400' : 'text-secondary'}`}>{m.isGuest ? 'Guest' : 'Member'}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add Guest Action */}
          {showGuestForm ? (
            <div className="mt-6 border border-dashed border-primary-fixed/50 p-4 rounded-xl bg-primary-fixed/5">
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  placeholder="Guest name..."
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddGuest()}
                  autoFocus
                  className="flex-1 bg-[#101416] border border-[#2D3135] focus:border-primary-fixed text-primary h-10 rounded-lg px-4 outline-none font-body-md"
                />
                <button
                  onClick={handleAddGuest}
                  disabled={!guestName.trim() || addingGuest}
                  className="px-4 h-10 bg-primary-fixed text-on-primary-fixed rounded-lg font-label-md font-bold disabled:opacity-50 transition-colors"
                >
                  {addingGuest ? '...' : 'Add'}
                </button>
                <button
                  onClick={() => { setShowGuestForm(false); setGuestName(''); }}
                  className="h-10 w-10 flex items-center justify-center text-secondary hover:text-primary rounded-lg transition-colors"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            </div>
          ) : (
            <button onClick={() => setShowGuestForm(true)} className="mt-6 w-full border border-dashed border-outline-variant text-secondary hover:text-primary hover:border-primary-fixed p-4 rounded-xl flex items-center justify-center gap-2 transition-colors">
              <span className="material-symbols-outlined">person_add</span>
              <span className="font-label-md text-label-md">Add Guest Player</span>
            </button>
          )}
        </div>

        {/* Parameters & Actions */}
        <div className="xl:col-span-4 flex flex-col gap-4 md:gap-6">
          
          {/* Court Configuration */}
          <div className="bg-[#1E2022]/70 backdrop-blur-md border border-outline-variant rounded-xl p-6">
            <h3 className="font-headline-md text-headline-md text-primary mb-6">Court Config</h3>
            
            <div className="mb-6">
              <label className="font-label-sm text-label-sm text-secondary uppercase tracking-wider block mb-3">Number of Courts</label>
              <div className="flex items-center justify-between bg-surface-container border border-outline-variant rounded p-2">
                <button onClick={() => setCourtCount(Math.max(1, courtCount - 1))} className="w-10 h-10 rounded bg-surface hover:bg-surface-container-high text-primary flex items-center justify-center transition-colors">
                  <span className="material-symbols-outlined">remove</span>
                </button>
                <span className="font-headline-lg text-headline-lg text-primary">{courtCount}</span>
                <button onClick={() => setCourtCount(courtCount + 1)} className="w-10 h-10 rounded bg-surface hover:bg-surface-container-high text-primary flex items-center justify-center transition-colors">
                  <span className="material-symbols-outlined">add</span>
                </button>
              </div>
            </div>

            <div>
              <label className="font-label-sm text-label-sm text-secondary uppercase tracking-wider block mb-3">Match Type</label>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => setMatchType('Doubles')} className={`font-label-md text-label-md py-2 rounded transition-colors ${matchType === 'Doubles' ? 'bg-primary-fixed text-on-primary-fixed' : 'bg-surface-container border border-outline-variant text-secondary hover:text-primary'}`}>Doubles</button>
                <button onClick={() => setMatchType('Singles')} className={`font-label-md text-label-md py-2 rounded transition-colors ${matchType === 'Singles' ? 'bg-primary-fixed text-on-primary-fixed' : 'bg-surface-container border border-outline-variant text-secondary hover:text-primary'}`}>Singles</button>
              </div>
            </div>
          </div>

          {/* Team Mode & Generation */}
          <div className="bg-[#1E2022]/70 backdrop-blur-md border border-outline-variant rounded-xl p-6 flex-1 flex flex-col">
            <h3 className="font-headline-md text-headline-md text-primary mb-4">Team Formation</h3>
            
            <div className="mb-6">
              <label className="font-label-sm text-label-sm text-secondary uppercase tracking-wider block mb-3">Mode</label>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => setTeamMode('auto')} className={`font-label-md text-label-md py-2 rounded transition-colors ${teamMode === 'auto' ? 'bg-primary-fixed text-on-primary-fixed' : 'bg-surface-container border border-outline-variant text-secondary hover:text-primary'}`}>Auto Shuffle</button>
                <button onClick={() => setTeamMode('manual')} className={`font-label-md text-label-md py-2 rounded transition-colors ${teamMode === 'manual' ? 'bg-primary-fixed text-on-primary-fixed' : 'bg-surface-container border border-outline-variant text-secondary hover:text-primary'}`}>Manual Teams</button>
              </div>
            </div>

            {teamMode === 'manual' && (
              <div className="space-y-3 mb-6 flex-1 overflow-y-auto custom-scrollbar">
                {manualTeams.map((team, idx) => {
                  const isActive = activeTeamIdx === idx;
                  return (
                    <div 
                      key={idx} 
                      onClick={() => setActiveTeamIdx(idx)}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${isActive ? 'border-primary-fixed bg-primary-fixed/10' : 'border-outline-variant bg-surface-container hover:border-primary-fixed/50'}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className={`font-label-sm text-label-sm uppercase tracking-wider ${isActive ? 'text-primary-fixed' : 'text-secondary'}`}>Team {idx + 1}</span>
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] text-secondary">{team.length} players</span>
                          {manualTeams.length > 2 && (
                            <button onClick={(e) => { e.stopPropagation(); removeTeamSlot(idx); }} className="text-error hover:text-error/80 ml-1">
                              <span className="material-symbols-outlined text-[16px]">close</span>
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {team.length === 0 ? (
                          <span className="text-[11px] text-secondary italic">{isActive ? 'Click players to add →' : 'Empty'}</span>
                        ) : (
                          team.map(pId => {
                            const player = activeMembers.find(m => m._id === pId);
                            return player ? (
                              <span key={pId} className="bg-surface-container-high text-on-surface text-[11px] px-2 py-0.5 rounded-full">{player.name}</span>
                            ) : null;
                          })
                        )}
                      </div>
                    </div>
                  );
                })}
                <button onClick={addNewTeamSlot} className="w-full py-2 border border-dashed border-outline-variant text-secondary hover:text-primary hover:border-primary-fixed rounded-lg text-sm flex items-center justify-center gap-1 transition-colors">
                  <span className="material-symbols-outlined text-[16px]">add</span> Add Team
                </button>
              </div>
            )}

            {teamMode === 'auto' && (
              <p className="text-secondary font-label-sm mb-6 flex-1">Players will be randomly shuffled into balanced teams.</p>
            )}

            {/* Primary CTA */}
            <button onClick={handleStartSession} className="w-full bg-primary-fixed text-on-primary-fixed font-headline-md text-headline-md py-4 rounded-lg hover:shadow-[0_0_15px_rgba(210,240,0,0.3)] transition-all transform hover:-translate-y-0.5 mt-auto flex items-center justify-center gap-2">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
              {teamMode === 'manual' ? 'Start with Manual Teams' : 'Generate Fair Matchups'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
