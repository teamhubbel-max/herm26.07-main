import { useState, useEffect } from 'react';
import { Board, Task } from '../types/Task';
import { db } from '../lib/database';
import { useAuth } from './useAuth';

interface TaskWithDetails extends Task {
  createdAt: Date;
  updatedAt: Date;
  dueDate?: Date;
}

export const useBoard = (projectId?: string) => {
  const { user } = useAuth();
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

  useEffect(() => {
    if (user && projectId) {
      loadTasks();
    }
  }, [user, projectId]);

  const loadTasks = () => {
    if (!user || !projectId) return;

    const dbTasks = db.getTasksByProject(projectId, user.id);
    const tasksWithDates: TaskWithDetails[] = dbTasks.map(task => ({
      ...task,
      createdAt: new Date(task.created_at),
      updatedAt: new Date(task.updated_at),
      dueDate: task.due_date ? new Date(task.due_date) : undefined
    }));

    setBoard(prev => ({
      ...prev,
      columns: prev.columns.map(column => ({
        ...column,
        tasks: tasksWithDates.filter(task => task.status === column.status)
      }))
    }));
  };

  const moveTask = (taskId: string, destinationColumnId: string, destinationIndex: number) => {
    if (!user) return;

    // Найдем задачу и определим новый статус
    const task = allTasks.find(t => t.id === taskId);
    if (!task) return;

    let newStatus: Task['status'];
    switch (destinationColumnId) {
      case 'todo':
        newStatus = 'todo';
        break;
      case 'inprogress':
        newStatus = 'inprogress';
        break;
      case 'inprogress2':
        newStatus = 'inprogress2';
        break;
      case 'done':
        newStatus = 'done';
        break;
      default:
        newStatus = 'todo';
    }
    
    // Обновляем задачу в базе данных
    db.updateTask(taskId, { status: newStatus }, user.id);
    
    // Перезагружаем все задачи
    loadTasks();
  };

  const addTask = (task: Omit<TaskWithDetails, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!user || !projectId) return;

    const newTask = db.createTask({
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      category: task.category,
      project_id: projectId,
      assignee_id: task.assignee,
      created_by: user.id,
      due_date: task.dueDate?.toISOString()
    }, user.id);

    if (newTask) {
      loadTasks(); // Перезагружаем задачи
    }
  };

  const updateTask = (taskId: string, updates: Partial<TaskWithDetails>) => {
    if (!user) return;

    const dbUpdates: Partial<Task> = {
      title: updates.title,
      description: updates.description,
      status: updates.status,
      priority: updates.priority,
      category: updates.category,
      assignee_id: updates.assignee,
      due_date: updates.dueDate?.toISOString()
    };

    const updated = db.updateTask(taskId, dbUpdates, user.id);
    if (updated) {
      loadTasks(); // Перезагружаем задачи
    }
  };

  const deleteTask = (taskId: string) => {
    if (!user) return;

    const deleted = db.deleteTask(taskId, user.id);
    if (deleted) {
      loadTasks(); // Перезагружаем задачи
    }
  };

  const addComment = (taskId: string, content: string) => {
    if (!user) return;

    const comment = db.createTaskComment({
      task_id: taskId,
      user_id: user.id,
      content
    }, user.id);

    return comment;
  };

  const getTaskComments = (taskId: string) => {
    if (!user) return [];
    return db.getCommentsByTask(taskId, user.id);
  };

  return {
    board,
    moveTask,
    addTask,
    updateTask,
    deleteTask,
    addComment,
    getTaskComments,
    refetch: loadTasks
  };
};