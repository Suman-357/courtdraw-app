import { useState, useEffect } from 'react';
import { useGroupStore } from '../store/groupStore';
import { useAuthStore } from '../store/authStore';

export default function GroupSettings() {
  const { currentGroup, fetchGroupDetails, updateGroupSettings, error } = useGroupStore();
  const { user } = useAuthStore();
  
  const [penaltyAmount, setPenaltyAmount] = useState(5);
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (user?.groupId && !currentGroup) {
      fetchGroupDetails(user.groupId);
    }
  }, [user, currentGroup, fetchGroupDetails]);

  useEffect(() => {
    if (currentGroup) {
      setPenaltyAmount(currentGroup.defaultPenaltyAmount || 5);
    }
  }, [currentGroup]);

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMsg('');
    try {
      await updateGroupSettings({ defaultPenaltyAmount: Number(penaltyAmount) });
      setSuccessMsg('Settings saved successfully.');
    } catch (err) {
      // Error handled by store
    } finally {
      setIsSaving(false);
    }
  };

  if (!currentGroup) return <div className="p-8 text-center animate-pulse">Loading settings...</div>;

  return (
    <div className="pt-8 pb-12 w-full relative z-10 max-w-2xl mx-auto">
      <div className="mb-8">
        <h2 className="font-headline-lg text-headline-lg text-primary mb-2">Group Settings</h2>
        <p className="font-body-md text-body-md text-secondary">Manage rules and configurations for {currentGroup.name}.</p>
      </div>

      {error && (
        <div className="p-4 mb-8 bg-error-container/20 border border-error/30 text-error rounded-xl font-label-md">
          {error}
        </div>
      )}

      {successMsg && (
        <div className="p-4 mb-8 bg-primary-fixed/20 border border-primary-fixed/30 text-primary-fixed rounded-xl font-label-md">
          {successMsg}
        </div>
      )}

      <div className="bg-[#1E2022] border border-[#2D3135] rounded-xl overflow-hidden">
        <div className="p-6 border-b border-[#2D3135] bg-[#1A1C1E]">
          <h3 className="font-headline-md text-headline-md text-primary flex items-center gap-2">
            <span className="material-symbols-outlined text-primary-fixed">payments</span>
            Penalty Configuration
          </h3>
          <p className="text-secondary font-label-sm mt-1">
            This fixed amount will be applied as a penalty to EACH TEAM with the lowest wins at the end of a session. It will be split automatically among the players of that team.
          </p>
        </div>
        
        <form onSubmit={handleSave} className="p-6">
          <div className="space-y-4 mb-8">
            <label className="block text-primary font-label-md">Default Penalty Amount (₹ per team)</label>
            <div className="relative max-w-xs">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-bold">₹</span>
              <input 
                type="number" 
                min="0"
                step="0.01"
                value={penaltyAmount}
                onChange={e => setPenaltyAmount(e.target.value)}
                className="w-full bg-[#101416] border border-[#2D3135] focus:border-primary-fixed text-primary h-12 rounded-lg pl-10 pr-4 outline-none transition-colors font-body-lg"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-[#2D3135]">
            <button 
              type="submit" 
              disabled={isSaving}
              className="bg-primary-fixed text-on-primary-fixed hover:bg-primary-fixed-dim transition-colors px-6 py-3 rounded-lg font-label-md font-bold flex items-center gap-2 disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
