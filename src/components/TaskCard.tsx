import React, { useState } from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { 
  Calendar, 
  User, 
  Tag, 
  MoreHorizontal, 
  Edit, 
  Trash2,
  Clock,
  AlertCircle
} from 'lucide-react';
import { Task } from '../types/Task';
import { TaskDetailsModal } from './TaskDetailsModal';

interface TaskCardProps {
  task: Task;
  index: number;
  onUpdate: (taskId: string, updates: Partial<Task>) => void;
  onDelete: (taskId: string) => void;
  compact?: boolean;
  onAddComment?: (taskId: string, content: string) => void;
  getTaskComments?: (taskId: string) => Promise<any[]>;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  index,
  onUpdate,
  onDelete,
  compact = false,
  onAddComment,
  getTaskComments
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <AlertCircle className="w-3 h-3" />;
      case 'medium': return <Clock className="w-3 h-3" />;
      case 'low': return <Clock className="w-3 h-3" />;
      default: return null;
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high': return 'Высокий';
      case 'medium': return 'Средний';
      case 'low': return 'Низкий';
      default: return priority;
    }
  };

  const getStickyNoteColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-gradient-to-br from-red-200 to-red-300 border-red-400';
      case 'medium': return 'bg-gradient-to-br from-yellow-200 to-yellow-300 border-yellow-400';
      case 'low': return 'bg-gradient-to-br from-green-200 to-green-300 border-green-400';
      default: return 'bg-gradient-to-br from-blue-200 to-blue-300 border-blue-400';
    }
  };
  const isOverdue = task.dueDate && new Date() > task.dueDate;
  const isDueSoon = task.dueDate && 
    new Date() < task.dueDate && 
    task.dueDate.getTime() - Date.now() < 3 * 24 * 60 * 60 * 1000; // 3 days

  if (compact) {
    return (
      <Draggable draggableId={task.id} index={index}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            className={`${getStickyNoteColor(task.priority)} rounded-lg border-2 p-3 shadow-lg hover:shadow-xl transition-all duration-200 transform ${
              snapshot.isDragging ? 'shadow-2xl rotate-3 scale-105' : 'hover:-rotate-1'
            }`}
            style={{
              position: snapshot.isDragging ? 'fixed' : 'relative',
              zIndex: snapshot.isDragging ? 9999 : 'auto',
              ...provided.draggableProps.style,
            }}
          >
            {/* Sticky note pin */}
            <div className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full shadow-md border-2 border-white"></div>
            
            <h3 className="font-medium text-gray-900 text-sm mb-2 leading-tight">
              {task.title}
            </h3>
            
            <div className="flex items-center justify-between">
              <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium bg-white bg-opacity-70 border ${getPriorityColor(task.priority)}`}>
                {getPriorityIcon(task.priority)}
                <span>{getPriorityLabel(task.priority)}</span>
              </span>
              
              {task.dueDate && (
                <div className={`flex items-center space-x-1 text-xs ${
                  isOverdue ? 'text-red-600' : isDueSoon ? 'text-yellow-600' : 'text-gray-500'
                }`}>
                  <Calendar className="w-3 h-3" />
                  <span>{task.dueDate.toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </Draggable>
    );
  }

  return (
    <>
      <Draggable draggableId={task.id} index={index}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            className={`${getStickyNoteColor(task.priority)} rounded-lg border-2 p-4 mb-3 shadow-lg hover:shadow-xl transition-all duration-200 transform ${
              snapshot.isDragging ? 'shadow-2xl rotate-6 scale-110 z-50' : 'hover:-rotate-1'
            }`}
            style={{
              position: 'relative',
              ...provided.draggableProps.style,
              ...(snapshot.isDragging && {
                position: 'fixed',
                zIndex: 9999,
                pointerEvents: 'none'
              })
            }}
          >
            {/* Sticky note pin */}
            <div className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full shadow-md border-2 border-white"></div>
            
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-medium text-gray-900 flex-1 mr-2 leading-tight">
                {task.title}
              </h3>
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors duration-200"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>
                
                {showMenu && (
                  <div className="absolute right-0 top-6 w-32 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                    <button
                      onClick={() => {
                        setIsTaskModalOpen(true);
                        setShowMenu(false);
                      }}
                      className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                    >
                      <Edit className="w-3 h-3" />
                      <span>Редактировать</span>
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm('Вы уверены, что хотите удалить эту задачу?')) {
                          onDelete(task.id);
                        }
                        setShowMenu(false);
                      }}
                      className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Удалить</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {task.description && (
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {task.description}
              </p>
            )}

            <div className="flex flex-wrap gap-2 mb-3">
              <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium bg-white bg-opacity-70 border ${getPriorityColor(task.priority)}`}>
                {getPriorityIcon(task.priority)}
                <span>{getPriorityLabel(task.priority)}</span>
              </span>
              
              <span className="inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium bg-white bg-opacity-70 text-blue-800 border border-blue-200">
                <Tag className="w-3 h-3" />
                <span>{task.category}</span>
              </span>
            </div>

            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center space-x-3">
                {task.assignee && (
                  <div className="flex items-center space-x-1">
                    <User className="w-3 h-3" />
                    <span>{task.assignee}</span>
                  </div>
                )}
                
                {task.dueDate && (
                  <div className={`flex items-center space-x-1 ${
                    isOverdue ? 'text-red-600' : isDueSoon ? 'text-yellow-600' : ''
                  }`}>
                    <Calendar className="w-3 h-3" />
                    <span>{task.dueDate.toLocaleDateString()}</span>
                  </div>
                )}
              </div>
              
              <div className="text-right">
                <div>Обновлено {task.updatedAt.toLocaleDateString()}</div>
              </div>
            </div>
          </div>
        )}
      </Draggable>

      <TaskDetailsModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        task={task}
        onUpdate={onUpdate}
        onAddComment={onAddComment}
        getTaskComments={getTaskComments}
      />
    </>
  );
};