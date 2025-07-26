import { useState, useEffect } from 'react';
import { supabase, Task } from '../lib/supabase';
import { useAuth } from './useAuth';

interface BoardColumn {
  id: string;
  title: string;
  status: 'todo' | 'inprogress' | 'inprogress2' | 'done';
  tasks: TaskWithDetails[];
}

interface Board {
  id: string;
  title: string;
  columns: BoardColumn[];
}

interface TaskWithDetails extends Task {
  createdAt: Date;
  updatedAt: Date;
  dueDate?: Date;
  assignee?: string;
}

export const useBoard = (projectId?: string) => {
  const { user, profile } = useAuth();
  const [board, setBoard] = useState<Board>({
    id: projectId || 'default',
    title: 'Доска задач',
    columns: [
      { id: 'todo', title: 'К выполнению', status: 'todo', tasks: [] },
      { id: 'inprogress', title: 'В работе', status: 'inprogress', tasks: [] },
      { id: 'inprogress2', title: 'В работе 2', status: 'inprogress2', tasks: [] },
      { id: 'done', title: 'Выполнено', status: 'done', tasks: [] }
    ]
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user && projectId) {
      loadTasks();
    }
  }, [user, projectId]);

  const loadTasks = async () => {
    if (!user || !projectId) return;

    try {
      setLoading(true);
      setError(null);

      const { data: tasks, error: tasksError } = await supabase
        .from('tasks')
        .select(`
          *,
          assignee:profiles!tasks_assignee_id_fkey (
            full_name
          )
        `)
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (tasksError) throw tasksError;

      const tasksWithDates: TaskWithDetails[] = (tasks || []).map(task => ({
        ...task,
        createdAt: new Date(task.created_at),
        updatedAt: new Date(task.updated_at),
        dueDate: task.due_date ? new Date(task.due_date) : undefined,
        assignee: task.assignee?.full_name || undefined
      }));

      setBoard(prev => ({
        ...prev,
        columns: prev.columns.map(column => ({
          ...column,
          tasks: tasksWithDates.filter(task => task.status === column.status)
        }))
      }));
    } catch (err) {
      console.error('Error loading tasks:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const moveTask = async (taskId: string, destinationColumnId: string, destinationIndex: number) => {
    if (!user) return;

    // Find the task in current board state
    let sourceTask: TaskWithDetails | undefined;
    let sourceColumnIndex = -1;

    for (let i = 0; i < board.columns.length; i++) {
      const taskIndex = board.columns[i].tasks.findIndex(t => t.id === taskId);
      if (taskIndex !== -1) {
        sourceTask = board.columns[i].tasks[taskIndex];
        sourceColumnIndex = i;
        break;
      }
    }

    if (!sourceTask) return;

    // Determine new status based on destination column
    let newStatus: Task['status'];
    if (destinationColumnId.includes('todo')) newStatus = 'todo';
    else if (destinationColumnId.includes('inprogress2')) newStatus = 'inprogress2';
    else if (destinationColumnId.includes('inprogress')) newStatus = 'inprogress';
    else if (destinationColumnId.includes('done')) newStatus = 'done';
    else newStatus = 'todo';

    // Create updated task
    const updatedTask = { ...sourceTask, status: newStatus };

    // Optimistically update the board state
    setBoard(prevBoard => {
      const newColumns = [...prevBoard.columns];
      
      // Remove task from source column
      if (sourceColumnIndex !== -1) {
        newColumns[sourceColumnIndex] = {
          ...newColumns[sourceColumnIndex],
          tasks: newColumns[sourceColumnIndex].tasks.filter(t => t.id !== taskId)
        };
      }
      
      // Find destination column and add task
      const destinationColumnIndex = newColumns.findIndex(col => 
        destinationColumnId.includes(col.id) || destinationColumnId.endsWith(col.id)
      );
      
      if (destinationColumnIndex !== -1) {
        const destinationTasks = [...newColumns[destinationColumnIndex].tasks];
        destinationTasks.splice(destinationIndex, 0, updatedTask);
        
        newColumns[destinationColumnIndex] = {
          ...newColumns[destinationColumnIndex],
          tasks: destinationTasks
        };
      }
      
      return {
        ...prevBoard,
        columns: newColumns
      };
    });

    // Update in database
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ status: newStatus })
        .eq('id', taskId);

      if (error) throw error;
    } catch (err) {
      console.error('Error updating task status:', err);
      // Revert optimistic update
      await loadTasks();
    }
  };

  const addTask = async (task: Omit<TaskWithDetails, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!user || !projectId) return;

    try {
      // Check for assignee if provided
      let assigneeId = null;
      if (task.assignee) {
        const { data: assigneeProfile } = await supabase
          .from('profiles')
          .select('id')
          .eq('full_name', task.assignee)
          .single();
        
        assigneeId = assigneeProfile?.id || null;
      }

      const { data: newTask, error } = await supabase
        .from('tasks')
        .insert({
          title: task.title,
          description: task.description,
          status: task.status,
          priority: task.priority,
          category: task.category,
          project_id: projectId,
          assignee_id: assigneeId,
          created_by: user.id,
          due_date: task.dueDate?.toISOString()
        })
        .select(`
          *,
          assignee:profiles!tasks_assignee_id_fkey (
            full_name
          )
        `)
        .single();

      if (error) throw error;

      if (newTask) {
        const taskWithDetails: TaskWithDetails = {
          ...newTask,
          createdAt: new Date(newTask.created_at),
          updatedAt: new Date(newTask.updated_at),
          dueDate: newTask.due_date ? new Date(newTask.due_date) : undefined,
          assignee: newTask.assignee?.full_name || undefined
        };

        // Add to board state
        setBoard(prev => ({
          ...prev,
          columns: prev.columns.map(column => 
            column.status === task.status 
              ? { ...column, tasks: [taskWithDetails, ...column.tasks] }
              : column
          )
        }));
      }
    } catch (err) {
      console.error('Error creating task:', err);
      setError(err instanceof Error ? err.message : 'Error creating task');
    }
  };

  const updateTask = async (taskId: string, updates: Partial<TaskWithDetails>) => {
    if (!user) return;

    try {
      let assigneeId = undefined;
      if (updates.assignee !== undefined) {
        if (updates.assignee) {
          const { data: assigneeProfile } = await supabase
            .from('profiles')
            .select('id')
            .eq('full_name', updates.assignee)
            .single();
          
          assigneeId = assigneeProfile?.id || null;
        } else {
          assigneeId = null;
        }
      }

      const dbUpdates: any = {};
      if (updates.title !== undefined) dbUpdates.title = updates.title;
      if (updates.description !== undefined) dbUpdates.description = updates.description;
      if (updates.status !== undefined) dbUpdates.status = updates.status;
      if (updates.priority !== undefined) dbUpdates.priority = updates.priority;
      if (updates.category !== undefined) dbUpdates.category = updates.category;
      if (assigneeId !== undefined) dbUpdates.assignee_id = assigneeId;
      if (updates.dueDate !== undefined) dbUpdates.due_date = updates.dueDate?.toISOString() || null;

      const { data: updatedTask, error } = await supabase
        .from('tasks')
        .update(dbUpdates)
        .eq('id', taskId)
        .select(`
          *,
          assignee:profiles!tasks_assignee_id_fkey (
            full_name
          )
        `)
        .single();

      if (error) throw error;

      if (updatedTask) {
        const taskWithDetails: TaskWithDetails = {
          ...updatedTask,
          createdAt: new Date(updatedTask.created_at),
          updatedAt: new Date(updatedTask.updated_at),
          dueDate: updatedTask.due_date ? new Date(updatedTask.due_date) : undefined,
          assignee: updatedTask.assignee?.full_name || undefined
        };

        // Update board state
        setBoard(prev => ({
          ...prev,
          columns: prev.columns.map(column => ({
            ...column,
            tasks: column.tasks.map(task => 
              task.id === taskId ? taskWithDetails : task
            )
          }))
        }));
      }
    } catch (err) {
      console.error('Error updating task:', err);
      setError(err instanceof Error ? err.message : 'Error updating task');
    }
  };

  const deleteTask = async (taskId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;

      // Remove from board state
      setBoard(prev => ({
        ...prev,
        columns: prev.columns.map(column => ({
          ...column,
          tasks: column.tasks.filter(task => task.id !== taskId)
        }))
      }));
    } catch (err) {
      console.error('Error deleting task:', err);
      setError(err instanceof Error ? err.message : 'Error deleting task');
    }
  };

  const addComment = async (taskId: string, content: string) => {
    if (!user) return;

    try {
      const { data: comment, error } = await supabase
        .from('task_comments')
        .insert({
          task_id: taskId,
          user_id: user.id,
          content
        })
        .select()
        .single();

      if (error) throw error;

      return comment;
    } catch (err) {
      console.error('Error adding comment:', err);
      return null;
    }
  };

  const getTaskComments = async (taskId: string) => {
    try {
      const { data: comments, error } = await supabase
        .from('task_comments')
        .select(`
          *,
          profile:profiles (
            full_name,
            avatar_url
          )
        `)
        .eq('task_id', taskId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      return comments || [];
    } catch (err) {
      console.error('Error getting task comments:', err);
      return [];
    }
  };

  return {
    board,
    loading,
    error,
    moveTask,
    addTask,
    updateTask,
    deleteTask,
    addComment,
    getTaskComments,
    refetch: loadTasks
  };
};