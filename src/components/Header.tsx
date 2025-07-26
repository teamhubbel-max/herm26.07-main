import React, { useState } from 'react';
import { Search, Plus, Settings, MoreHorizontal, Calendar, User, Tag, Bell } from 'lucide-react';
import { AddTaskModal } from './AddTaskModal';
import { Task } from '../types/Task';
import { useAuth } from '../hooks/useAuth';
import { InvitationsPanel } from './InvitationsPanel';
import { db } from '../lib/database';

interface HeaderProps {
  onAddTask: (task: any) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  allTasks?: Task[];
  onTaskSelect?: (task: Task) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onAddTask,
  searchTerm,
  onSearchChange,
  allTasks = [],
  onTaskSelect
}) => {
  const { user, profile, signOut } = useAuth();
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showInvitations, setShowInvitations] = useState(false);
  const [invitationsCount, setInvitationsCount] = useState(0);

  // Подсчитываем количество приглашений
  React.useEffect(() => {
    if (user) {
      const invitations = db.getProjectInvitations(user.id);
      const pendingCount = invitations.filter(inv => 
        inv.invitee_email === user.email && inv.status === 'pending'
      ).length;
      setInvitationsCount(pendingCount);
    }
  }, [user]);

  // Фильтруем задачи по поисковому запросу
  const filteredTasks = allTasks.filter(task => 
    searchTerm.length > 0 && (
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (task.assignee && task.assignee.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  ).slice(0, 5); // Показываем максимум 5 результатов

  const handleSearchChange = (value: string) => {
    onSearchChange(value);
    setShowSearchDropdown(value.length >= 2); // Показываем после 2 символов
  };

  const handleTaskSelect = (task: Task) => {
    setShowSearchDropdown(false);
    onSearchChange('');
    if (onTaskSelect) {
      onTaskSelect(task);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
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

  const handleSignOut = async () => {
    await signOut();
    setShowUserMenu(false);
  };

  return (
    <>
      <header className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-sm">H</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Гермес</h1>
                <p className="text-xs text-gray-500">Система управления проектами</p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Поиск задач..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                onFocus={() => setShowSearchDropdown(searchTerm.length >= 2)}
                onBlur={() => setTimeout(() => setShowSearchDropdown(false), 200)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
              />
              
              {/* Search Dropdown */}
              {showSearchDropdown && searchTerm.length >= 2 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
                  <div className="p-2">
                    <div className="text-xs text-gray-500 mb-2 px-2">
                      Найдено задач: {filteredTasks.length}
                    </div>
                    {filteredTasks.length > 0 ? filteredTasks.map((task) => (
                      <button
                        key={task.id}
                        onClick={() => handleTaskSelect(task)}
                        className="w-full text-left p-3 hover:bg-gray-50 rounded-lg transition-colors duration-200 border-b border-gray-100 last:border-b-0"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-gray-900 text-sm leading-tight">
                            {task.title}
                          </h4>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                            {getStatusLabel(task.status)}
                          </span>
                        </div>
                        
                        {task.description && (
                          <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                            {task.description}
                          </p>
                        )}
                        
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center space-x-1">
                              <Tag className="w-3 h-3" />
                              <span>{task.category}</span>
                            </div>
                            {task.assignee && (
                              <div className="flex items-center space-x-1">
                                <User className="w-3 h-3" />
                                <span>{task.assignee}</span>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`font-medium ${getPriorityColor(task.priority)}`}>
                              {task.priority === 'high' ? 'Высокий' : 
                               task.priority === 'medium' ? 'Средний' : 'Низкий'}
                            </span>
                            {task.dueDate && (
                              <div className="flex items-center space-x-1">
                                <Calendar className="w-3 h-3" />
                                <span>{task.dueDate.toLocaleDateString()}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </button>
                    )) : (
                      <div className="p-4 text-center text-gray-500">
                        <span className="text-sm">Задачи не найдены</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl flex items-center space-x-2 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Добавить задачу</span>
            </button>
            
            <div className="flex items-center space-x-2">
              {/* Invitations Bell */}
              <div className="relative">
                <button
                  onClick={() => setShowInvitations(true)}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200 relative"
                >
                  <Bell className="w-5 h-5" />
                  {invitationsCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {invitationsCount}
                    </span>
                  )}
                </button>
              </div>

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium text-sm">
                      {profile?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <span className="hidden sm:inline text-sm font-medium">
                    {profile?.full_name || user?.email}
                  </span>
                </button>
                
                {showUserMenu && (
                  <div className="absolute right-0 top-12 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                    <div className="p-3 border-b border-gray-200">
                      <p className="text-sm font-medium text-gray-900">
                        {profile?.full_name || 'Пользователь'}
                      </p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                    <button
                      onClick={handleSignOut}
                      className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      Выйти
                    </button>
                  </div>
                )}
              </div>
              
              <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200">
                <Settings className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <AddTaskModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={onAddTask}
      />

      <InvitationsPanel
        isOpen={showInvitations}
        onClose={() => setShowInvitations(false)}
      />
    </>
  );
};