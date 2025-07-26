import React from 'react';
import { Droppable } from 'react-beautiful-dnd';
import { Plus } from 'lucide-react';
import { Column as ColumnType, Task } from '../types/Task';
import { TaskCard } from './TaskCard';

interface ColumnProps {
  column: ColumnType;
  onUpdate: (taskId: string, updates: Partial<Task>) => void;
  onDelete: (taskId: string) => void;
  onAddTask: (status: 'todo' | 'inprogress' | 'done') => void;
}

export const Column: React.FC<ColumnProps> = ({
  column,
  onUpdate,
  onDelete,
  onAddTask
}) => {
  const getColumnColor = (status: string) => {
    switch (status) {
      case 'todo': return 'border-t-gray-400';
      case 'inprogress': return 'border-t-blue-500';
      case 'done': return 'border-t-green-500';
      default: return 'border-t-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'todo': return '📋';
      case 'inprogress': return '⚡';
      case 'done': return '✅';
      default: return '📋';
    }
  };

  return (
    <div className={`bg-gray-50 rounded-lg border-t-4 ${getColumnColor(column.status)} min-h-96`}>
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <span className="text-lg">{getStatusIcon(column.status)}</span>
            <h2 className="font-semibold text-gray-900">{column.title}</h2>
            <span className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full">
              {column.tasks.length}
            </span>
          </div>
        </div>
        
        <button
          onClick={() => onAddTask(column.status)}
          className="w-full flex items-center justify-center space-x-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 py-3 rounded-lg transition-colors duration-200 border border-dashed border-blue-300 hover:border-blue-400"
        >
          <Plus className="w-4 h-4" />
          <span className="text-sm">Добавить задачу</span>
        </button>
      </div>

      <Droppable droppableId={column.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`p-4 min-h-64 transition-colors duration-200 relative ${
              snapshot.isDraggingOver ? 'bg-blue-50' : ''
            }`}
            style={{
              position: 'relative',
              zIndex: snapshot.isDraggingOver ? 1 : 0
            }}
          >
            {column.tasks.map((task, index) => (
              <TaskCard
                key={task.id}
                task={task}
                index={index}
                onUpdate={onUpdate}
                onDelete={onDelete}
              />
            ))}
            {provided.placeholder}
            
            {column.tasks.length === 0 && !snapshot.isDraggingOver && (
              <div className="text-center text-gray-400 py-8">
                <div className="text-4xl mb-2">
                  {column.status === 'todo' ? '📝' : column.status === 'inprogress' ? '🚀' : '🎉'}
                </div>
                <p className="text-sm">
                  {column.status === 'todo' 
                    ? 'Нет задач к выполнению'
                    : column.status === 'inprogress' 
                    ? 'Нет задач в работе'
                    : 'Нет выполненных задач'
                  }
                </p>
                <button
                  onClick={() => onAddTask(column.status)}
                  className="mt-3 text-blue-500 hover:text-blue-700 text-sm font-medium"
                >
                  Создать первую задачу
                </button>
              </div>
            )}
          </div>
        )}
      </Droppable>
    </div>
  );
};