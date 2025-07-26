import React from 'react';
import { Droppable } from 'react-beautiful-dnd';
import { Plus } from 'lucide-react';
import { Task } from '../types/Task';
import { TaskCard } from './TaskCard';

interface User {
  id: string;
  name: string;
  avatar: string;
  role: 'owner' | 'member' | 'observer';
  tasks: {
    todo: Task[];
    inprogress: Task[];
    done: Task[];
  };
}

interface Column {
  id: string;
  title: string;
  color: string;
}

interface UserRowProps {
  user: User;
  columns: Column[];
  onTaskClick: (task: Task) => void;
  onAddTask: () => void;
  isLastRow: boolean;
}

export const UserRow: React.FC<UserRowProps> = ({ 
  user, 
  columns, 
  onTaskClick, 
  onAddTask,
  isLastRow 
}) => {
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'member': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'observer': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case 'owner': return 'Владелец';
      case 'member': return 'Участник';
      case 'observer': return 'Наблюдатель';
      default: return role;
    }
  };

  const getTasksForColumn = (columnId: string): Task[] => {
    switch (columnId) {
      case 'todo': return user.tasks.todo;
      case 'inprogress': return user.tasks.inprogress;
      case 'inprogress2': return user.tasks.inprogress2;
      case 'done': return user.tasks.done;
      default: return [];
    }
  };

  return (
    <div className={`grid min-h-32 ${!isLastRow ? 'border-b border-gray-200' : ''}`} style={{ gridTemplateColumns: '80px 1fr 1fr 1fr 1fr' }}>
      {/* User Info Column */}
      <div className="p-2 bg-gray-50 border-r border-gray-200 flex flex-col justify-center">
        <div className="flex items-center justify-center">
          <div className="relative group">
            <img
              src={user.avatar}
              alt={user.name}
              className="w-10 h-10 rounded-full cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all duration-200"
            />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            </div>
            
            {/* Tooltip */}
            <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
              <div className="font-medium">{user.name}</div>
              <div className="text-xs text-gray-300">{getRoleText(user.role)}</div>
              <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-900 rotate-45"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Task Columns */}
      {columns.map((column) => {
        const tasks = getTasksForColumn(column.id);
        return (
          <Droppable key={`${user.id}-${column.id}`} droppableId={`${user.id}-${column.id}`}>
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`p-3 border-r border-gray-200 last:border-r-0 min-h-32 transition-all duration-200 relative ${
                  snapshot.isDraggingOver ? 'bg-blue-50 border-blue-300' : ''
                }`}
                style={{ minHeight: '128px' }}
              >
                <div className="space-y-2">
                  {tasks.map((task, index) => (
                    <div
                      key={task.id}
                      onClick={() => onTaskClick(task)}
                      className="cursor-pointer"
                    >
                      <TaskCard
                        task={task}
                        index={index}
                        onUpdate={() => {}}
                        onDelete={() => {}}
                        compact={true}
                      />
                    </div>
                  ))}
                  {provided.placeholder}
                </div>
                
                {snapshot.isDraggingOver && (
                  <div className="absolute inset-2 flex items-center justify-center bg-blue-100 border-2 border-dashed border-blue-400 rounded-lg z-10">
                    <div className="text-center text-blue-600">
                      <div className="text-3xl mb-2">📥</div>
                      <p className="text-sm font-medium">Отпустите здесь</p>
                    </div>
                  </div>
                )}
                
                {tasks.length === 0 && !snapshot.isDraggingOver && (
                  <div className="py-8 text-center text-gray-400">
                    <div className="text-2xl mb-2">📋</div>
                    <p className="text-xs">Пусто</p>
                  </div>
                )}
              </div>
            )}
          </Droppable>
        );
      })}
    </div>
  );
};