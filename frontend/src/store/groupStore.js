import { create } from 'zustand';
import api from '../api/client';

export const useGroupStore = create((set, get) => ({
  currentGroup: null,
  members: [],
  ledger: [],
  isLoading: false,
  error: null,

  fetchGroupDetails: async (groupId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get(`/groups/${groupId}`);
      const { group, members } = response.data.data;
      
      set({ currentGroup: group, members, isLoading: false });
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to fetch group', isLoading: false });
    }
  },

  fetchGroupLedger: async (groupId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get(`/groups/${groupId}/ledger`);
      set({ ledger: response.data.data.ledger, isLoading: false });
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to fetch ledger', isLoading: false });
    }
  },

  addMember: async (memberData) => {
    set({ isLoading: true, error: null });
    try {
      const groupId = get().currentGroup._id;
      const response = await api.post(`/groups/${groupId}/members`, memberData);
      const newMember = response.data.data.member;
      
      set(state => ({ members: [...state.members, newMember], isLoading: false }));
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to add member', isLoading: false });
    }
  },

  toggleMemberStatus: async (memberId) => {
    set({ isLoading: true, error: null });
    try {
      const groupId = get().currentGroup._id;
      const response = await api.patch(`/groups/${groupId}/members/${memberId}/status`);
      const updatedMember = response.data.data.member;
      
      set(state => ({
        members: state.members.map(m => m._id === memberId ? updatedMember : m),
        isLoading: false
      }));
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to toggle status', isLoading: false });
    }
  },

  updateGroupSettings: async (settings) => {
    set({ isLoading: true, error: null });
    try {
      const groupId = get().currentGroup._id;
      const response = await api.patch(`/groups/${groupId}/settings`, settings);
      const updatedGroup = response.data.data.group;
      
      set({ currentGroup: updatedGroup, isLoading: false });
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to update settings', isLoading: false });
      throw error;
    }
  }
}));
