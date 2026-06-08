import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useGroupStore } from '../store/groupStore';
import { useSessionStore } from '../store/sessionStore';

export default function AdminDashboard() {
  const { user } = useAuthStore();
  const { currentGroup, members, fetchGroupDetails, addMember, toggleMemberStatus, isLoading: groupLoading } = useGroupStore();
  const { sessions, fetchSessions, createSession } = useSessionStore();
  const navigate = useNavigate();

  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [newMember, setNewMember] = useState({ name: '', username: '', password: 'password' });

  useEffect(() => {
    if (user?.groupId) {
      fetchGroupDetails(user.groupId);
      fetchSessions(user.groupId);
    }
  }, [user]);

  const handleAddMember = async (e) => {
    e.preventDefault();
    await addMember(newMember);
    setIsAddMemberOpen(false);
    setNewMember({ name: '', username: '', password: 'password' });
  };

  const togglePlayerSelection = (id) => {
    // Moved to SessionSetup.jsx
  };

  if (groupLoading) return <div className="p-8 text-center text-on-surface-variant animate-pulse">Loading group data...</div>;

  const activePlayersCount = members.filter(m => m.isActive).length;
  
  const totalFines = sessions.reduce((total, s) => {
    return total + (s.fines?.reduce((sum, fine) => sum + fine.amount, 0) || 0);
  }, 0);

  return (
    <>
      <header className="mb-6 md:mb-10 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <span className="px-3 py-1 bg-surface-container-high rounded-full border border-outline-variant font-label-sm text-label-sm text-primary-fixed tracking-wider uppercase">Code: {currentGroup?.code}</span>
          </div>
          <h2 className="font-display-md text-2xl md:text-display-md font-bold text-primary">{currentGroup?.name}</h2>
        </div>
        <button onClick={() => navigate('/admin/session/new')} className="w-full sm:w-auto bg-primary-fixed text-on-primary-fixed hover:bg-primary-fixed-dim transition-colors px-6 md:px-8 py-3 rounded-lg font-label-md text-label-md font-bold flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(210,240,0,0.2)]">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
          Start New Session
        </button>
      </header>

      {/* KPI Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 md:gap-gutter mb-6 md:mb-10">
        <div className="sm:col-span-2 lg:col-span-5 bg-[#1E2022] border border-[#2D3135] rounded-xl p-5 md:p-6 relative overflow-hidden group">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-primary-fixed opacity-5 blur-[80px] rounded-full group-hover:opacity-10 transition-opacity"></div>
          <div className="flex justify-between items-start mb-6 relative z-10">
            <h3 className="font-headline-md text-headline-md font-semibold text-primary">Session History</h3>
            <span className="material-symbols-outlined text-primary-fixed">event</span>
          </div>
          <div className="relative z-10">
            <div className="text-display-md font-display-md font-bold text-primary-fixed mb-1">{sessions.length}</div>
            <div className="text-body-lg font-body-lg text-on-surface-variant mb-6">Total Sessions Played</div>
          </div>
        </div>

        {/* Active Players (Spans 4) */}
        <div className="col-span-12 md:col-span-6 lg:col-span-4 bg-[#1E2022] border border-[#2D3135] rounded-xl p-6 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <h3 className="font-headline-md text-headline-md font-semibold text-primary">Active Players</h3>
            <span className="material-symbols-outlined text-on-surface-variant">groups</span>
          </div>
          <div>
            <div className="flex items-baseline gap-3">
              <span className="text-display-md font-display-md font-bold text-primary">{activePlayersCount}</span>
            </div>
            <div className="w-full bg-[#101416] h-2 rounded-full mt-4 overflow-hidden">
              <div className="bg-primary-fixed h-full rounded-full" style={{ width: `${(activePlayersCount / Math.max(members.length, 1)) * 100}%`}}></div>
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-label-sm font-label-sm text-on-surface-variant">Total Roster: {members.length}</span>
            </div>
          </div>
        </div>

        {/* Total Fines (Spans 3) */}
        <div className="col-span-12 md:col-span-6 lg:col-span-3 bg-[#1E2022] border border-[#2D3135] rounded-xl p-6 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <h3 className="font-headline-md text-headline-md font-semibold text-primary">Fines Collected</h3>
            <span className="material-symbols-outlined text-error">payments</span>
          </div>
          <div>
            <div className="text-display-md font-display-md font-bold text-error">₹{totalFines}</div>
            <div className="text-label-sm font-label-sm text-on-surface-variant mt-2">Across all sessions</div>
          </div>
        </div>
      </div>

      {/* Team Roster Section */}
      <section className="bg-[#1E2022] border border-[#2D3135] rounded-xl overflow-hidden">
        <div className="p-6 border-b border-[#2D3135] flex justify-between items-center bg-[#1E2022] sticky top-0 z-20">
          <div>
            <h3 className="font-headline-md text-headline-md font-bold text-primary">Team Roster</h3>
            <p className="text-label-sm font-label-sm text-on-surface-variant mt-1">Manage players and handle status.</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setIsAddMemberOpen(true)} className="bg-transparent text-[#94979A] hover:text-primary transition-colors px-4 py-2 rounded font-label-sm text-label-sm font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">person_add</span> Add Player
            </button>
          </div>
        </div>
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-[#1A1C1E] border-b border-[#2D3135]">
                <th className="py-4 px-6 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">Player</th>
                <th className="py-4 px-6 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">Username</th>
                <th className="py-4 px-6 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">Status</th>
                <th className="py-4 px-6 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2D3135] text-body-md font-body-md text-primary">
              {members.map(m => (
                <tr key={m._id} className="hover:bg-[#2D3135] transition-colors group">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-surface-container-high border border-[#2D3135] flex items-center justify-center font-bold text-primary-fixed">
                        {m.name.charAt(0)}
                      </div>
                      <div className="font-semibold">{m.name}</div>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-on-surface-variant">{m.username}</td>
                  <td className="py-4 px-6">
                    {m.isActive ? 
                      <span className="px-2 py-1 bg-surface-container-highest rounded border border-outline-variant text-label-sm font-label-sm text-primary-fixed">Active</span>
                      : 
                      <span className="px-2 py-1 bg-surface-container-highest rounded border border-outline-variant text-label-sm font-label-sm text-error">Inactive</span>
                    }
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button onClick={() => toggleMemberStatus(m._id)} className="text-on-surface-variant hover:text-primary-fixed transition-colors p-1" title="Toggle Status">
                      <span className="material-symbols-outlined">{m.isActive ? 'block' : 'check_circle'}</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Session History Section */}
      <section className="bg-[#1E2022] border border-[#2D3135] rounded-xl overflow-hidden mt-10">
        <div className="p-6 border-b border-[#2D3135] flex justify-between items-center bg-[#1E2022] sticky top-0 z-20">
          <div>
            <h3 className="font-headline-md text-headline-md font-bold text-primary">Session History</h3>
            <p className="text-label-sm font-label-sm text-on-surface-variant mt-1">Review past and active sessions.</p>
          </div>
        </div>
        <div className="divide-y divide-[#2D3135]">
          {sessions.length === 0 ? (
            <div className="p-8 text-center text-on-surface-variant">No sessions played yet.</div>
          ) : (
            sessions.map(s => (
              <div key={s._id} onClick={() => navigate(s.status === 'open' ? `/admin/session/${s._id}` : `/admin/session/${s._id}/summary`)} className="p-6 flex items-center justify-between hover:bg-[#2D3135] transition-colors group cursor-pointer">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-bold text-primary">{new Date(s.date).toLocaleDateString()}</span>
                    {s.status === 'open' ? (
                      <span className="px-2 py-0.5 bg-primary-fixed/20 text-primary-fixed text-xs uppercase tracking-wider rounded font-bold">Live</span>
                    ) : (
                      <span className="px-2 py-0.5 bg-surface-container-highest border border-outline-variant text-on-surface-variant text-xs uppercase tracking-wider rounded font-bold">Closed</span>
                    )}
                  </div>
                  <div className="text-label-sm text-on-surface-variant">{s.presentPlayers.length} Players • {s.courtCount} Courts</div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right hidden sm:block">
                    <div className="text-error font-bold">₹{s.fines?.reduce((sum, f) => sum + f.amount, 0) || 0}</div>
                    <div className="text-[10px] text-on-surface-variant uppercase tracking-wider">Fines</div>
                  </div>
                  <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors">chevron_right</span>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Modals */}
      {isAddMemberOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#1E2022] border border-[#2D3135] text-primary max-w-md w-full relative z-10 rounded-2xl shadow-2xl p-6">
            <h3 className="text-2xl font-bold mb-6 font-headline-md">Add New Member</h3>
            <form onSubmit={handleAddMember} className="space-y-5">
              <div className="space-y-2">
                <label className="text-on-surface-variant block text-label-sm font-medium">Full Name</label>
                <input required value={newMember.name} onChange={e => setNewMember({...newMember, name: e.target.value})} className="bg-[#101416] border border-[#2D3135] focus:border-primary-fixed text-primary h-11 w-full rounded-lg px-3 outline-none transition-colors" placeholder="e.g. John Doe" />
              </div>
              <div className="space-y-2">
                <label className="text-on-surface-variant block text-label-sm font-medium">Username</label>
                <input required value={newMember.username} onChange={e => setNewMember({...newMember, username: e.target.value})} className="bg-[#101416] border border-[#2D3135] focus:border-primary-fixed text-primary h-11 w-full rounded-lg px-3 outline-none transition-colors" placeholder="johndoe" />
              </div>
              <div className="flex gap-3 mt-6">
                <button type="button" onClick={() => setIsAddMemberOpen(false)} className="flex-1 px-4 py-2 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-primary transition-colors font-label-md font-bold">Cancel</button>
                <button type="submit" className="flex-1 bg-primary-fixed text-on-primary-fixed hover:bg-primary-fixed-dim h-11 rounded-lg font-label-md font-bold">Create Member</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
