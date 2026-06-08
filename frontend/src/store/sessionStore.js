import { create } from 'zustand';
import api from '../api/client';

export const useSessionStore = create((set) => ({
  sessions: [],
  activeSession: null,
  isLoading: false,
  error: null,

  fetchSessions: async (groupId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get(`/sessions?groupId=${groupId}`);
      set({ sessions: response.data.data.sessions, isLoading: false });
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to fetch sessions', isLoading: false });
    }
  },

  createSession: async (groupId, presentPlayers, courtCount = 3, manualTeams = null) => {
    set({ isLoading: true, error: null });
    try {
      const payload = { groupId, courtCount };
      if (manualTeams) {
        payload.manualTeams = manualTeams;
        payload.presentPlayers = manualTeams.flatMap(t => t.players);
      } else {
        payload.presentPlayers = presentPlayers;
      }
      const response = await api.post('/sessions', payload);
      
      const newSession = response.data.data.session;
      
      set(state => ({ 
        sessions: [newSession, ...state.sessions], 
        activeSession: newSession, 
        isLoading: false 
      }));
      return newSession._id;
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to create session', isLoading: false });
      throw error;
    }
  },

  recordMatch: async (sessionId, matchId, winnerTeamId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.patch(`/sessions/${sessionId}/matches/${matchId}`, { winnerTeamId });
      const updatedSession = response.data.data.session;
      
      set(state => ({ 
        activeSession: updatedSession,
        sessions: state.sessions.map(s => s._id === sessionId ? updatedSession : s),
        isLoading: false 
      }));
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to record match', isLoading: false });
    }
  },

  addRematch: async (sessionId, teamA, teamB) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post(`/sessions/${sessionId}/rematch`, { teamA, teamB });
      const updatedSession = response.data.data.session;
      
      set(state => ({
        activeSession: updatedSession,
        sessions: state.sessions.map(s => s._id === sessionId ? updatedSession : s),
        isLoading: false
      }));
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to add rematch', isLoading: false });
    }
  },

  closeSession: async (sessionId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.patch(`/sessions/${sessionId}/close`);
      const closedSession = response.data.data.session;
      
      set(state => ({
        activeSession: null,
        sessions: state.sessions.map(s => s._id === sessionId ? closedSession : s),
        isLoading: false
      }));
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to close session', isLoading: false });
    }
  }
}));
