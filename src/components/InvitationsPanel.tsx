import React, { useState, useEffect } from 'react';
import { Bell, Check, X, Mail, Calendar, User } from 'lucide-react';
import { db } from '../lib/database';
import { useAuth } from '../hooks/useAuth';

interface InvitationsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InvitationsPanel: React.FC<InvitationsPanelProps> = ({
  isOpen,
  onClose
}) => {
  const { user } = useAuth();
  const [invitations, setInvitations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && isOpen) {
      loadInvitations();
    }
  }, [user, isOpen]);

  const loadInvitations = () => {
    if (!user) return;

    // Загружаем приглашения для текущего пользователя
    const userInvitations = db.getProjectInvitations(user.id);
    const pendingInvitations = userInvitations.filter(inv => 
      inv.invitee_email === user.email && inv.status === 'pending'
    );

    setInvitations(pendingInvitations);
  };

  const handleInvitationResponse = async (invitationId: string, response: 'accepted' | 'rejected') => {
    if (!user) return;

    setLoading(true);
    try {
      // Обновляем статус приглашения
      db.updateProjectInvitation(invitationId, { status: response }, user.id);

      if (response === 'accepted') {
        // Если принято, добавляем пользователя в проект
        const invitation = invitations.find(inv => inv.id === invitationId);
        if (invitation) {
          db.createProjectMember({
            project_id: invitation.project_id,
            user_id: user.id,
            role: invitation.role
          }, user.id);
        }
      }

      // Отправляем уведомление в Telegram (если подключен)
      const settings = db.getUserSettings(user.id);
      if (settings?.telegram.connected) {
        const invitation = invitations.find(inv => inv.id === invitationId);
        console.log(`Отправка в Telegram @${settings.telegram.username}:`, {
          message: `Вы ${response === 'accepted' ? 'приняли' : 'отклонили'} приглашение в проект`
        });
      }

      loadInvitations();
      alert(`Приглашение ${response === 'accepted' ? 'принято' : 'отклонено'}!`);
    } catch (error) {
      console.error('Error responding to invitation:', error);
      alert('Ошибка при обработке приглашения');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
            <Bell className="w-5 h-5" />
            <span>Приглашения ({invitations.length})</span>
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {invitations.length === 0 ? (
            <div className="text-center py-8">
              <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Нет приглашений</h3>
              <p className="text-gray-500">У вас пока нет новых приглашений в проекты</p>
            </div>
          ) : (
            <div className="space-y-4">
              {invitations.map((invitation) => (
                <div key={invitation.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-medium text-gray-900">Приглашение в проект</h3>
                      <div className="flex items-center space-x-2 mt-1 text-sm text-gray-600">
                        <User className="w-4 h-4" />
                        <span>Роль: {invitation.role === 'member' ? 'Участник' : 'Наблюдатель'}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1 text-xs text-gray-500">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(invitation.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {invitation.message && (
                    <div className="bg-gray-50 rounded-lg p-3 mb-3">
                      <p className="text-sm text-gray-700">{invitation.message}</p>
                    </div>
                  )}

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleInvitationResponse(invitation.id, 'accepted')}
                      disabled={loading}
                      className="flex-1 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 disabled:opacity-50 transition-colors flex items-center justify-center space-x-1"
                    >
                      <Check className="w-4 h-4" />
                      <span>Принять</span>
                    </button>
                    <button
                      onClick={() => handleInvitationResponse(invitation.id, 'rejected')}
                      disabled={loading}
                      className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 disabled:opacity-50 transition-colors flex items-center justify-center space-x-1"
                    >
                      <X className="w-4 h-4" />
                      <span>Отклонить</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};