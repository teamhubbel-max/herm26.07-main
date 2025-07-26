// Заглушка для совместимости с существующим кодом
// В данной версии используется локальная авторизация
export const isSupabaseConfigured = true;
export const supabase = null;

// Типы для совместимости
export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: string;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  color: string;
  status: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
  last_activity: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  category: string;
  project_id: string;
  assignee_id: string | null;
  created_by: string;
  due_date: string | null;
  created_at: string;
  updated_at: string;
}