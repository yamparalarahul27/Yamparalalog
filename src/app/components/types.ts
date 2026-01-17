export interface User {
  id: string;
  name: string;
  role: string;
  pin?: string;
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