import { useState, useEffect } from 'react';
import { supabase, Task, TaskComment, Profile } from '../lib/supabase';
import { useAuth } from './useAuth';

export interface TaskWithDetails extends Task {
  assignee?: Profile;
  created_by_profile: Profile;
  comments: (TaskComment & { profile: Profile })[];
}

export const useSupabaseTasks = (projectId?: string) => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<TaskWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user && projectId) {
      loadTasks();
      
      // Подписываемся на изменения в реальном времени
      const subscription = supabase
        .channel(`tasks-${projectId}`)
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'tasks',
            filter: `project_id=eq.${projectId}`
          }, 
          () => {
            loadTasks();
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    } else {
      setTasks([]);
      setLoading(false);
    }
  }, [user, projectId]);

  const loadTasks = async () => {
    if (!projectId) return;

    try {
      setLoading(true);
      setError(null);

      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select(`
          *,
          assignee:profiles!tasks_assignee_id_fkey (
            id,
            email,
            full_name,
            avatar_url
          ),
          created_by_profile:profiles!tasks_created_by_fkey (
            id,
            email,
            full_name,
            avatar_url
          ),
          task_comments (
            *,
            profile:profiles (
              id,
              email,
              full_name,
              avatar_url
            )
          )
        `)
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (tasksError) throw tasksError;

      setTasks(tasksData || []);
    } catch (err) {
      console.error('Error loading tasks:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const createTask = async (taskData: {
    title: string;
    description?: string;
    status?: string;
    priority?: string;
    category?: string;
    assignee_id?: string;
    due_date?: string;
  }) => {
    if (!user || !projectId) throw new Error('User not authenticated or no project');

    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          ...taskData,
          project_id: projectId,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      await loadTasks();
      return data;
    } catch (err) {
      console.error('Error creating task:', err);
      throw err;
    }
  };

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', taskId)
        .select()
        .single();

      if (error) throw error;

      // Обновляем локальное состояние
      setTasks(prev => prev.map(t => 
        t.id === taskId ? { ...t, ...data } : t
      ));

      return data;
    } catch (err) {
      console.error('Error updating task:', err);
      throw err;
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;

      setTasks(prev => prev.filter(t => t.id !== taskId));
    } catch (err) {
      console.error('Error deleting task:', err);
      throw err;
    }
  };

  const addComment = async (taskId: string, content: string) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { data, error } = await supabase
        .from('task_comments')
        .insert({
          task_id: taskId,
          user_id: user.id,
          content,
        })
        .select()
        .single();

      if (error) throw error;

      await loadTasks();
      return data;
    } catch (err) {
      console.error('Error adding comment:', err);
      throw err;
    }
  };

  const moveTask = async (taskId: string, newStatus: string, assigneeId?: string) => {
    try {
      const updates: Partial<Task> = { status: newStatus };
      if (assigneeId) {
        updates.assignee_id = assigneeId;
      }

      await updateTask(taskId, updates);
    } catch (err) {
      console.error('Error moving task:', err);
      throw err;
    }
  };

  return {
    tasks,
    loading,
    error,
    createTask,
    updateTask,
    deleteTask,
    addComment,
    moveTask,
    refetch: loadTasks,
  };
};