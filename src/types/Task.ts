export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'inprogress' | 'inprogress2' | 'done';
  priority: 'low' | 'medium' | 'high';
  category: string;
  createdAt: Date;
  updatedAt: Date;
  assignee?: string;
  dueDate?: Date;
}

export interface Column {
  id: string;
  title: string;
  status: 'todo' | 'inprogress' | 'inprogress2' | 'done';
  tasks: Task[];
}

export interface Board {
  id: string;
  title: string;
  columns: Column[];
}