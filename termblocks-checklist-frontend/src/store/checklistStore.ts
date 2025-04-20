import {create}  from 'zustand';

export interface ChecklistItem {
  id: number;
  name: string;
  uploads: Array<any>; // To be refined
}

export interface ChecklistCategory {
  id: number;
  name: string;
  items: ChecklistItem[];
}

export interface Checklist {
  id: number;
  title: string;
  description: string;
  public_id: string;
  categories: ChecklistCategory[];
}

interface ChecklistStore {
  checklists: Checklist[];
  setChecklists: (checklists: Checklist[]) => void;
  selectedChecklist: Checklist | null;
  setSelectedChecklist: (checklist: Checklist | null) => void;
}

export const useChecklistStore = create<ChecklistStore>((set) => ({
  checklists: [],
  setChecklists: (checklists) => set({ checklists }),
  selectedChecklist: null,
  setSelectedChecklist: (checklist) => set({ selectedChecklist: checklist }),
}));
