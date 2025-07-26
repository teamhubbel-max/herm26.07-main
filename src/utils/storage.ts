import { Task, Board } from '../types/Task';

const STORAGE_KEY = 'hermes-project-data';

export const saveToStorage = (board: Board): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(board));
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
  }
};

export const loadFromStorage = (): Board | null => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return null;
    
    const board = JSON.parse(data);
    // Convert date strings back to Date objects
    board.columns.forEach((column: any) => {
      column.tasks.forEach((task: any) => {
        task.createdAt = new Date(task.createdAt);
        task.updatedAt = new Date(task.updatedAt);
        if (task.dueDate) task.dueDate = new Date(task.dueDate);
      });
    });
    
    return board;
  } catch (error) {
    console.error('Failed to load from localStorage:', error);
    return null;
  }
};