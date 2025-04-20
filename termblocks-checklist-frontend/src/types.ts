export interface ChecklistItem {
  name: string;
}

export interface ChecklistCategory {
  name: string;
  items: ChecklistItem[];
}

export interface Checklist {
  id: number;
  title: string;
  description: string;
  public_id: string;
  is_public: boolean;
  categories: ChecklistCategory[];
}
