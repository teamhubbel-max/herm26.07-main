import React, { useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { X, Calendar, User, Tag, AlertCircle, Paperclip, Clock, Target } from 'lucide-react';
import { Task } from '../types/Task';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  defaultStatus?: 'todo' | 'inprogress' | 'done';
  users?: any[];
  selectedUserId?: string;
}

export const AddTaskModal: React.FC<AddTaskModalProps> = ({
  isOpen,
  onClose,
  onAdd,
  defaultStatus = 'todo',
  users = [],
  selectedUserId = ''
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignee: '',
    deadline: '',
    attachments: [] as File[],
    status: defaultStatus,
    priority: 'medium' as 'low' | 'medium' | 'high',
    category: '',
  });

  const [selectedAssignee, setSelectedAssignee] = useState(selectedUserId);
  
  // Список доступных исполнителей
  const availableAssignees = users.length > 0 ? users : [
    { id: '1', name: 'Александр Похомов', avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150' },
    { id: '2', name: 'Артем Богданский', avatar: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=150' },
    { id: '3', name: 'Lolita', avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150' },
    { id: '4', name: 'Poul Anderson', avatar: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=150' },
    { id: '5', name: 'Юрий', avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150' },
    { id: '6', name: 'михаил', avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150' }
  ];

  // Конфигурация редактора
  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'align': [] }],
      ['link', 'image'],
      ['clean']
    ],
  };

  const quillFormats = [
    'header', 'bold', 'italic', 'underline', 'strike',
    'color', 'background', 'list', 'bullet', 'align',
    'link', 'image'
  ];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setFormData(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...files]
    }));
  };

  const removeFile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) return;

    const task = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      status: formData.status,
      priority: formData.priority,
      category: formData.category.trim() || 'General',
      assignee: selectedAssignee || undefined,
      dueDate: formData.deadline ? new Date(formData.deadline) : undefined
    };

    onAdd(task);
    
    // Reset form
    setFormData({
      title: '',
      description: '',
      assignee: '',
      deadline: '',
      attachments: [],
      status: defaultStatus,
      priority: 'medium',
      category: '',
    });
    setSelectedAssignee('');
    
    onClose();
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="relative bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">Создать задачу</h2>
              <p className="text-blue-100 text-sm mt-1">Добавьте новую задачу в проект</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8 overflow-y-auto max-h-[calc(95vh-120px)]">
          {/* Task Title */}
          <div className="space-y-3">
            <label className="flex items-center text-sm font-semibold text-gray-800">
              <Target className="w-4 h-4 mr-2 text-blue-600" />
              Название задачи
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
              placeholder="Опишите задачу кратко и понятно..."
              required
            />
          </div>

          {/* Assignee Dropdown */}
          <div className="space-y-4">
            <label className="flex items-center text-sm font-semibold text-gray-800">
              <User className="w-4 h-4 mr-2 text-blue-600" />
              Исполнитель
            </label>
            <select
              value={selectedAssignee}
              onChange={(e) => setSelectedAssignee(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900"
            >
              <option value="">Выберите исполнителя</option>
              {availableAssignees.map((assignee) => (
                <option key={assignee.id} value={assignee.name}>
                  {assignee.name}
                </option>
              ))}
            </select>
          </div>

          {/* Description with Rich Text Editor */}
          <div className="space-y-3">
            <label className="flex items-center text-sm font-semibold text-gray-800">
              Детали задачи
            </label>
            <div className="border-2 border-gray-200 rounded-xl overflow-hidden bg-white">
              <ReactQuill
                theme="snow"
                value={formData.description}
                onChange={(content) => handleChange('description', content)}
                modules={quillModules}
                formats={quillFormats}
                style={{ minHeight: '200px' }}
                placeholder="Подробное описание задачи, требования, критерии выполнения..."
              />
            </div>
          </div>

          {/* Task Details Block: Deadline, Category, Priority */}
          <div className="bg-gray-50 rounded-xl p-6 space-y-4">
            <h3 className="text-sm font-semibold text-gray-800 mb-4">Параметры задачи</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Deadline */}
              <div className="space-y-2">
                <label className="flex items-center text-sm font-medium text-gray-700">
                  <Calendar className="w-4 h-4 mr-2 text-blue-600" />
                  Срок выполнения
                </label>
                <input
                  type="datetime-local"
                  value={formData.deadline}
                  onChange={(e) => handleChange('deadline', e.target.value)}
                  className="w-full px-3 py-2 bg-white border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900"
                />
              </div>

              {/* Category */}
              <div className="space-y-2">
                <label className="flex items-center text-sm font-medium text-gray-700">
                  <Tag className="w-4 h-4 mr-2 text-blue-600" />
                  Категория
                </label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => handleChange('category', e.target.value)}
                  className="w-full px-3 py-2 bg-white border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
                  placeholder="Фронтенд, Бэкенд..."
                />
              </div>

              {/* Priority */}
              <div className="space-y-2">
                <label className="flex items-center text-sm font-medium text-gray-700">
                  <AlertCircle className="w-4 h-4 mr-2 text-blue-600" />
                  Приоритет
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => handleChange('priority', e.target.value)}
                  className="w-full px-3 py-2 bg-white border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900"
                >
                  <option value="low">Низкий</option>
                  <option value="medium">Средний</option>
                  <option value="high">Высокий</option>
                </select>
              </div>
            </div>
          </div>

          {/* File Attachments */}
          <div className="space-y-3">
            <label className="flex items-center text-sm font-semibold text-gray-800">
              <Paperclip className="w-4 h-4 mr-2 text-blue-600" />
              Прикрепить файлы
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-400 hover:bg-blue-50/50 transition-all duration-200">
              <input
                type="file"
                multiple
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer flex flex-col items-center space-y-2"
              >
                <Paperclip className="w-8 h-8 text-gray-400" />
                <span className="text-blue-600 font-medium hover:text-blue-700">
                  Выбрать файлы
                </span>
                <span className="text-xs text-gray-500">или перетащите файлы сюда</span>
              </label>
            </div>
            
            {/* Attached Files List */}
            {formData.attachments.length > 0 && (
              <div className="space-y-2">
                {formData.attachments.map((file, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 px-4 py-3 rounded-lg">
                    <span className="text-sm text-gray-700 font-medium">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="text-red-500 hover:text-red-700 p-1 rounded-md hover:bg-red-50 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Status Selection */}
          <div className="space-y-4">
            <label className="flex items-center text-sm font-semibold text-gray-800">
              Статус задачи
            </label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: 'todo', label: 'Холодильник', icon: '❄️' },
                { value: 'inprogress', label: 'Сделать', icon: '📋' },
                { value: 'inprogress2', label: 'В работе', icon: '⚡' },
                { value: 'done', label: 'Выполнено', icon: '✅' }
              ].map((status) => (
                <button
                  key={status.value}
                  type="button"
                  onClick={() => handleChange('status', status.value)}
                  className={`flex items-center space-x-2 px-4 py-3 rounded-xl border-2 transition-all duration-200 ${
                    formData.status === status.value
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                  }`}
                >
                  <span className="text-lg">{status.icon}</span>
                  <span className="font-medium text-gray-900">{status.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-all duration-200"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl flex items-center space-x-2"
            >
              <span>Добавить задачу</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};