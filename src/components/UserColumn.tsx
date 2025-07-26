import React from 'react';
import { Droppable } from 'react-beautiful-dnd';
import { Plus } from 'lucide-react';
import { TaskCard } from './TaskCard';

interface User {
  id: string;
  name: string;
  avatar: string;
  tasks: any[];
}

interface UserColumnProps {
  user: User;
  onAddTask: () => void;
}

export const UserColumn: React.FC<UserColumnProps> = ({ user, onAddTask }) => {
  const getStatusCounts = () => {
    const todo = user.tasks.filter(task => task.status === 'todo').length;
    const inprogress = user.tasks.filter(task => task.status === 'inprogress').length;
    const done = user.tasks.filter(task => task.status === 'done').length;
    return { todo, inprogress, done };
  };

  const { todo, inprogress, done } = getStatusCounts();

  return (
    <div className="bg-white rounded-lg border border-gray-200 min-h-96">
      {/* User Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3 mb-3">
          <img
            src={user.avatar}
            alt={user.name}
            className="w-8 h-8 rounded-full"
          />
          <div className="flex-1">
            <h3 className="font-medium text-gray-900 text-sm">{user.name}</h3>
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <span className="bg-gray-100 px-2 py-1 rounded-full">{todo} холодильник</span>
              <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full">{inprogress} сделать</span>
              <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full">{done} выполнено</span>
            </div>
          </div>
        </div>
        
        <button
          onClick={onAddTask}
          className="w-full flex items-center justify-center space-x-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 py-2 rounded-lg transition-colors duration-200 border border-dashed border-blue-300 hover:border-blue-400"
        >
          <Plus className="w-4 h-4" />
          <span className="text-sm">Добавить задачу</span>
        </button>
      </div>

      {/* Tasks */}
      <Droppable droppableId={user.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`p-4 min-h-64 transition-colors duration-200 ${
              snapshot.isDraggingOver ? 'bg-blue-50' : ''
            }`}
          >
            {user.tasks.map((task, index) => (
              <div key={task.id} className="mb-3">
                <TaskCard
                  task={task}
                  index={index}
                  onUpdate={() => {}}
                  onDelete={() => {}}
                />
              </div>
            ))}
            {provided.placeholder}
            
            {user.tasks.length === 0 && !snapshot.isDraggingOver && (
              <div className="text-center text-gray-400 py-8">
                <div className="text-4xl mb-2">📝</div>
                <p className="text-sm">Нет задач</p>
              </div>
            )}
          </div>
        )}
      </Droppable>
    </div>
  );
};