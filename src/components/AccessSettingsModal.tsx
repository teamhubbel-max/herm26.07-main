import React, { useState } from 'react';
import { X, Shield, Crown, Eye, User, Trash2 } from 'lucide-react';

interface User {
  id: string;
  name: string;
  avatar: string;
  role: 'owner' | 'member' | 'observer';
}

interface AccessSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: User[];
  onUpdateAccess: (userId: string, role: 'owner' | 'member' | 'observer') => void;
}

export const AccessSettingsModal: React.FC<AccessSettingsModalProps> = ({
  isOpen,
  onClose,
  users,
  onUpdateAccess
}) => {
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner': return <Crown className="w-4 h-4" />;
      case 'member': return <User className="w-4 h-4" />;
      case 'observer': return <Eye className="w-4 h-4" />;
      default: return <User className="w-4 h-4" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'member': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'observer': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'owner': return 'Владелец';
      case 'member': return 'Участник';
      case 'observer': return 'Наблюдатель';
      default: return role;
    }
  };

  const handleRoleChange = (userId: string, newRole: 'owner' | 'member' | 'observer') => {
    onUpdateAccess(userId, newRole);
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleBulkAction = (action: string) => {
    selectedUsers.forEach(userId => {
      if (action === 'remove') {
        // Логика удаления пользователей
        console.log('Removing user:', userId);
      } else if (action === 'member') {
        onUpdateAccess(userId, 'member');
      } else if (action === 'observer') {
        onUpdateAccess(userId, 'observer');
      }
    });
    setSelectedUsers([]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
            <Shield className="w-5 h-5" />
            <span>Настройки доступа</span>
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {/* Bulk Actions */}
          {selectedUsers.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-blue-800">
                  Выбрано пользователей: {selectedUsers.length}
                </span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleBulkAction('member')}
                    className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                  >
                    Сделать участниками
                  </button>
                  <button
                    onClick={() => handleBulkAction('observer')}
                    className="px-3 py-1 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
                  >
                    Сделать наблюдателями
                  </button>
                  <button
                    onClick={() => handleBulkAction('remove')}
                    className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
                  >
                    Удалить
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Users List */}
          <div className="space-y-3">
            {users.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user.id)}
                    onChange={() => toggleUserSelection(user.id)}
                    className="rounded"
                  />
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <h3 className="font-medium text-gray-900">{user.name}</h3>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border ${getRoleColor(user.role)}`}>
                        {getRoleIcon(user.role)}
                        <span>{getRoleLabel(user.role)}</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleChange(user.id, e.target.value as any)}
                    className="px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    disabled={user.role === 'owner'} // Владелец не может изменить свою роль
                  >
                    <option value="owner">Владелец</option>
                    <option value="member">Участник</option>
                    <option value="observer">Наблюдатель</option>
                  </select>
                  
                  {user.role !== 'owner' && (
                    <button
                      onClick={() => console.log('Remove user:', user.id)}
                      className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Role Descriptions */}
          <div className="mt-6 bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Описание ролей</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <Crown className="w-4 h-4 text-purple-600" />
                <span><strong>Владелец:</strong> Полный доступ к проекту, управление участниками</span>
              </div>
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-blue-600" />
                <span><strong>Участник:</strong> Создание и редактирование задач, комментарии</span>
              </div>
              <div className="flex items-center space-x-2">
                <Eye className="w-4 h-4 text-gray-600" />
                <span><strong>Наблюдатель:</strong> Только просмотр проекта и задач</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Закрыть
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};