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

    // Найдем задачу в текущих колонках
    let sourceTask: TaskWithDetails | undefined;
    let sourceColumnIndex = -1;
    let sourceTaskIndex = -1;

    // Найдем задачу и ее текущую позицию
    for (let i = 0; i < board.columns.length; i++) {
      const taskIndex = board.columns[i].tasks.findIndex(t => t.id === taskId);
      if (taskIndex !== -1) {
        sourceTask = board.columns[i].tasks[taskIndex];
        sourceColumnIndex = i;
        sourceTaskIndex = taskIndex;
        break;
      }
    }

    if (!sourceTask) return;

    // Определим новый статус
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

    // Создаем обновленную задачу
    const updatedTask = { ...sourceTask, status: newStatus };

    // Обновляем состояние доски синхронно
    setBoard(prevBoard => {
      const newColumns = [...prevBoard.columns];
      
      // Удаляем задачу из исходной колонки
      newColumns[sourceColumnIndex] = {
        ...newColumns[sourceColumnIndex],
        tasks: newColumns[sourceColumnIndex].tasks.filter(t => t.id !== taskId)
      };
      
      // Находим целевую колонку и добавляем задачу
      const destinationColumnIndex = newColumns.findIndex(col => col.id === destinationColumnId);
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

    // Обновляем задачу в базе данных (асинхронно, после обновления UI)
    db.updateTask(taskId, { status: newStatus }, user.id);
  };

  const addTask = (task: Omit<TaskWithDetails, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!task) return;

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