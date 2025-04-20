export interface ChecklistItem {
  name: string;
}

export interface ChecklistCategory {
  name: string;
  items: ChecklistItem[];
}

export interface User {
  id: string;
  username: string;
  username_hash: string;
}

export interface Checklist {
  id: string;
  title: string;
  description: string;
  categories: ChecklistCategory[];
  public_id?: string;
  owner_id: string;
  is_public: boolean;
}

export interface UserChecklist {
  user_id: string;
  checklist_id: string;
}
