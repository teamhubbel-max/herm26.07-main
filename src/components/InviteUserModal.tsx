import React, { useState } from 'react';
import { X, Mail, UserPlus, Copy, Check, Send } from 'lucide-react';
import { db } from '../lib/database';
import { useAuth } from '../hooks/useAuth';

interface InviteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: any;
}

export const InviteUserModal: React.FC<InviteUserModalProps> = ({
  isOpen,
  onClose,
  project
}) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    role: 'member',
    message: 'Приглашаю вас присоединиться к нашему проекту!'
  });
  const [inviteLink, setInviteLink] = useState('');
  const [linkCopied, setLinkCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const roles = [
    { value: 'member', label: 'Участник', description: 'Может создавать и редактировать задачи' },
    { value: 'observer', label: 'Наблюдатель', description: 'Может только просматривать проект' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email.trim() || !user || !project) return;

    setLoading(true);
    try {
      // Создаем приглашение
      const invitation = db.createProjectInvitation({
        project_id: project.id,
        inviter_id: user.id,
        invitee_email: formData.email.trim(),
        role: formData.role as 'member' | 'observer',
        status: 'pending',
        message: formData.message
      }, user.id);

      // Генерируем ссылку приглашения
      const link = `${window.location.origin}/invite/${invitation.id}`;
      setInviteLink(link);
      
      // Симулируем отправку уведомления в Telegram
      const settings = db.getUserSettings(user.id);
      if (settings?.telegram.connected) {
        console.log(`Отправка в Telegram @${settings.telegram.username}:`, {
          message: `Вы пригласили ${formData.email} в проект "${project.title}"`,
          link
        });
      }

      alert(`Приглашение отправлено на ${formData.email}!`);
      
      // Сброс формы
      setFormData({
        email: '',
        role: 'member',
        message: 'Приглашаю вас присоединиться к нашему проекту!'
      });
    } catch (error) {
      console.error('Error creating invitation:', error);
      alert('Ошибка при создании приглашения');
    } finally {
      setLoading(false);
    }
  };

  const copyInviteLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
            <UserPlus className="w-5 h-5" />
            <span>Пригласить участника</span>
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Project Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-900">Проект: {project?.title}</h3>
            <p className="text-sm text-blue-700 mt-1">{project?.description}</p>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Mail className="w-4 h-4 inline mr-1" />
              Email адрес
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="user@example.com"
              required
            />
          </div>

          {/* Role Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Роль в проекте</label>
            <div className="space-y-3">
              {roles.map((role) => (
                <label key={role.value} className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="role"
                    value={role.value}
                    checked={formData.role === role.value}
                    onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{role.label}</div>
                    <div className="text-sm text-gray-500">{role.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Personal Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Персональное сообщение
            </label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Добавьте персональное сообщение к приглашению..."
            />
          </div>

          {/* Invite Link */}
          {inviteLink && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-green-800 mb-2">Ссылка приглашения создана!</h3>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={inviteLink}
                  readOnly
                  className="flex-1 px-3 py-2 bg-white border border-green-300 rounded-lg text-sm"
                />
                <button
                  type="button"
                  onClick={copyInviteLink}
                  className="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center space-x-1"
                >
                  {linkCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span className="text-sm">{linkCopied ? 'Скопировано' : 'Копировать'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors flex items-center space-x-2"
            >
              <Send className="w-4 h-4" />
              <span>{loading ? 'Отправка...' : 'Отправить приглашение'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};