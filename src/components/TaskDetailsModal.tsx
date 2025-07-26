import React, { useState } from 'react';
import { useEffect } from 'react';
import { 
  X, 
  Calendar, 
  User, 
  Tag, 
  Clock, 
  MessageSquare, 
  Paperclip,
  Edit,
  Trash2,
  Save
} from 'lucide-react';
import { Task } from '../types/Task';

interface TaskDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task;
  onUpdate: (taskId: string, updates: Partial<Task>) => void;
  onAddComment?: (taskId: string, content: string) => void;
  getTaskComments?: (taskId: string) => any[];
}

export const TaskDetailsModal: React.FC<TaskDetailsModalProps> = ({
  isOpen,
  onClose,
  task,
  onUpdate,
  onAddComment,
  getTaskComments
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    title: task.title,
    description: task.description,
    priority: task.priority,
    category: task.category,
    assignee: task.assignee || '',
    dueDate: task.dueDate ? task.dueDate.toISOString().split('T')[0] : ''
  });
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState<any[]>([]);

  React.useEffect(() => {
    if (getTaskComments && task) {
      const loadComments = async () => {
        if (typeof getTaskComments === 'function') {
          const taskComments = await getTaskComments(task.id);
          setComments(taskComments || []);
        }
      };
      loadComments();
    }
  }, [task, getTaskComments]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'todo': return 'bg-gray-100 text-gray-800';
      case 'inprogress': return 'bg-blue-100 text-blue-800';
      case 'done': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'todo': return 'К выполнению';
      case 'inprogress': return 'В работе';
      case 'done': return 'Выполнено';
      default: return status;
    }
  };

  const handleSave = () => {
    onUpdate(task.id, {
      title: editData.title,
      description: editData.description,
      priority: editData.priority,
      category: editData.category,
      assignee: editData.assignee || undefined,
      dueDate: editData.dueDate ? new Date(editData.dueDate) : undefined
    });
    setIsEditing(false);
  };

  const handleAddComment = () => {
    if (comment.trim()) {
      if (onAddComment) {
        const addCommentAsync = async () => {
          await onAddComment(task.id, comment.trim());
          if (getTaskComments) {
            const taskComments = await getTaskComments(task.id);
            setComments(taskComments || []);
          }
        };
        addCommentAsync();
        }
      setComment('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <h2 className="text-xl font-semibold text-gray-900">
              {isEditing ? 'Редактирование задачи' : 'Детали задачи'}
            </h2>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(task.status)}`}>
              {getStatusLabel(task.status)}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <Edit className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Название</label>
            {isEditing ? (
              <input
                type="text"
                value={editData.title}
                onChange={(e) => setEditData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Описание</label>
            {isEditing ? (
              <textarea
                value={editData.description}
                onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            ) : (
              <p className="text-gray-700">{task.description}</p>
            )}
          </div>

          {/* Task Info Grid */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="w-4 h-4 inline mr-1" />
                Исполнитель
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={editData.assignee}
                  onChange={(e) => setEditData(prev => ({ ...prev, assignee: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-gray-900">{task.assignee || 'Не назначен'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Срок выполнения
              </label>
              {isEditing ? (
                <input
                  type="date"
                  value={editData.dueDate}
                  onChange={(e) => setEditData(prev => ({ ...prev, dueDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-gray-900">
                  {task.dueDate ? task.dueDate.toLocaleDateString() : 'Не установлен'}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Приоритет</label>
              {isEditing ? (
                <select
                  value={editData.priority}
                  onChange={(e) => setEditData(prev => ({ ...prev, priority: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="low">Низкий</option>
                  <option value="medium">Средний</option>
                  <option value="high">Высокий</option>
                </select>
              ) : (
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getPriorityColor(task.priority)}`}>
                  {getPriorityLabel(task.priority)}
                </span>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Tag className="w-4 h-4 inline mr-1" />
                Категория
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={editData.category}
                  onChange={(e) => setEditData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200">
                  {task.category}
                </span>
              )}
            </div>
          </div>

          {/* Timestamps */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4" />
                <span>Создано: {task.createdAt.toLocaleString()}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4" />
                <span>Обновлено: {task.updatedAt.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Comments Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              <MessageSquare className="w-4 h-4 inline mr-1" />
              Комментарии
            </label>
            
            {/* Add Comment */}
            <div className="flex space-x-3 mb-4">
              <img
                src="https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150"
                alt="Текущий пользователь"
                className="w-8 h-8 rounded-full"
              />
              <div className="flex-1">
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Добавить комментарий..."
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
                <button
                  onClick={handleAddComment}
                  disabled={!comment.trim()}
                  className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Добавить комментарий
                </button>
              </div>
            </div>

            {/* Comments List */}
            <div className="space-y-3">
              {comments.map(comment => (
                <div key={comment.id} className="flex space-x-3 p-3 bg-gray-50 rounded-lg">
                  <img
                    src="https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150"
                    alt="Пользователь"
                    className="w-8 h-8 rounded-full"
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-gray-900">Пользователь</span>
                      <span className="text-xs text-gray-500">
                        {new Date(comment.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-gray-700 text-sm">{comment.content}</p>
                  </div>
                </div>
              ))}
              
              {comments.length === 0 && (
                <div className="text-center py-4 text-gray-500">
                  <MessageSquare className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">Пока нет комментариев</p>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            {isEditing ? (
              <>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Отмена
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Сохранить</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Закрыть
                </button>
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2"
                >
                  <Edit className="w-4 h-4" />
                  <span>Редактировать</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};