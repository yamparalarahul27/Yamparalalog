export interface User {
  id: string;
  name: string;
  role: string;
  pin?: string;
  requiresPin?: boolean; // Whether this user needs PIN authentication
  accessibleTabs?: string[]; // Which tabs this user can access: "wiki", "logs", "resources"
}

export interface Comment {
  id: string;
  text: string;
  author: string;
  authorId: string;
  date: string;
}

export interface DesignLog {
  id: string;
  title: string;
  description: string;
  date: string;
  category?: string;
  linkedLogIds?: string[];
  imageUrl?: string;
  userId: string;
  comments?: Comment[];
  deleted?: boolean;
  deletedAt?: string;
}