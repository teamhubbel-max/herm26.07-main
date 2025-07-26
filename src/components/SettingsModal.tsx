import React, { useState, useEffect } from 'react';
import { X, User, Bell, Palette, Database, Shield, Save, Building, Phone, MapPin, Mail, MessageCircle, Link } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { db } from '../lib/database';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose
}) => {
  const { user, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    full_name: '',
    email: '',
    role: 'member',
    organization_name: '',
    organization_inn: '',
    organization_address: '',
    organization_phone: '',
    organization_email: '',
    organization_director: ''
  });

  const [notifications, setNotifications] = useState({
    taskUpdates: true,
    deadlineReminders: true,
    teamActivity: false,
    emailNotifications: true
  });

  const [appearance, setAppearance] = useState({
    theme: 'light',
    language: 'ru',
    compactView: false
  });

  const [telegram, setTelegram] = useState({
    username: '',
    connected: false
  });

  // Загружаем настройки пользователя
  useEffect(() => {
    if (user) {
      const userSettings = db.getUserSettings(user.id) || db.createUserSettings(user.id);
      setNotifications(userSettings.notifications);
      setAppearance(userSettings.appearance);
      setTelegram(userSettings.telegram);
    }
  }, [user]);

  const handleTelegramConnect = () => {
    if (telegram.username && !telegram.connected) {
      setTelegram(prev => ({ ...prev, connected: true }));
    }
  };

  useEffect(() => {
    if (user) {
      setProfileData({
        full_name: user.full_name || '',
        email: user.email || '',
        role: user.role || 'member',
        organization_name: user.organization_name || '',
        organization_inn: user.organization_inn || '',
        organization_address: user.organization_address || '',
        organization_phone: user.organization_phone || '',
        organization_email: user.organization_email || '',
        organization_director: user.organization_director || ''
      });
    }
  }, [user]);

  if (!isOpen) return null;

  const tabs = [
    { id: 'profile', label: 'Профиль', icon: User },
    { id: 'organization', label: 'Организация', icon: Building },
    { id: 'notifications', label: 'Уведомления', icon: Bell },
    { id: 'appearance', label: 'Внешний вид', icon: Palette },
    { id: 'data', label: 'Данные', icon: Database },
    { id: 'security', label: 'Безопасность', icon: Shield }
  ];

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      await updateProfile(profileData);
      
      // Сохраняем настройки пользователя
      if (user) {
        db.updateUserSettings(user.id, {
          notifications,
          appearance,
          telegram
        });
        
        // Применяем тему
        applyTheme(appearance.theme);
        
        // Применяем язык (базовая реализация)
        document.documentElement.lang = appearance.language;
      }
      
      // Показать уведомление об успешном сохранении
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyTheme = (theme: string) => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'light') {
      root.classList.remove('dark');
    } else { // system
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.toggle('dark', isDark);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Отображаемое имя
              </label>
              <input
                type="text"
                value={profileData.full_name}
                onChange={(e) => setProfileData(prev => ({ ...prev, full_name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Введите ваше имя"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Электронная почта
              </label>
              <input
                type="email"
                value={profileData.email}
                onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Роль
              </label>
              <select 
                value={profileData.role}
                onChange={(e) => setProfileData(prev => ({ ...prev, role: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="member">Менеджер проекта</option>
                <option value="admin">Руководитель команды</option>
                <option value="owner">Владелец</option>
                <option value="developer">Разработчик</option>
                <option value="designer">Дизайнер</option>
              </select>
            </div>
          </div>
        );

      case 'organization':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Building className="w-4 h-4 inline mr-1" />
                Название организации
              </label>
              <input
                type="text"
                value={profileData.organization_name}
                onChange={(e) => setProfileData(prev => ({ ...prev, organization_name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="ООО 'Название'"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ИНН</label>
                <input
                  type="text"
                  value={profileData.organization_inn}
                  onChange={(e) => setProfileData(prev => ({ ...prev, organization_inn: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="1234567890"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Phone className="w-4 h-4 inline mr-1" />
                  Телефон
                </label>
                <input
                  type="text"
                  value={profileData.organization_phone}
                  onChange={(e) => setProfileData(prev => ({ ...prev, organization_phone: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="+7 (495) 123-45-67"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="w-4 h-4 inline mr-1" />
                Адрес
              </label>
              <input
                type="text"
                value={profileData.organization_address}
                onChange={(e) => setProfileData(prev => ({ ...prev, organization_address: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="г. Москва, ул. Примерная, д. 1"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail className="w-4 h-4 inline mr-1" />
                  Email организации
                </label>
                <input
                  type="email"
                  value={profileData.organization_email}
                  onChange={(e) => setProfileData(prev => ({ ...prev, organization_email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="info@company.ru"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Руководитель</label>
                <input
                  type="text"
                  value={profileData.organization_director}
                  onChange={(e) => setProfileData(prev => ({ ...prev, organization_director: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Иванов Иван Иванович"
                />
              </div>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900">Обновления задач</h3>
                <p className="text-sm text-gray-500">Получать уведомления при обновлении задач</p>
              </div>
              <input 
                type="checkbox" 
                checked={notifications.taskUpdates}
                onChange={(e) => setNotifications(prev => ({ ...prev, taskUpdates: e.target.checked }))}
                className="rounded" 
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900">Напоминания о сроках</h3>
                <p className="text-sm text-gray-500">Получать напоминания о приближающихся дедлайнах</p>
              </div>
              <input 
                type="checkbox" 
                checked={notifications.deadlineReminders}
                onChange={(e) => setNotifications(prev => ({ ...prev, deadlineReminders: e.target.checked }))}
                className="rounded" 
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900">Активность команды</h3>
                <p className="text-sm text-gray-500">Следить за активностью участников команды</p>
              </div>
              <input 
                type="checkbox" 
                checked={notifications.teamActivity}
                onChange={(e) => setNotifications(prev => ({ ...prev, teamActivity: e.target.checked }))}
                className="rounded" 
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900">Email уведомления</h3>
                <p className="text-sm text-gray-500">Отправлять дублирующие уведомления на почту</p>
              </div>
              <input 
                type="checkbox" 
                checked={notifications.emailNotifications}
                onChange={(e) => setNotifications(prev => ({ ...prev, emailNotifications: e.target.checked }))}
                className="rounded" 
              />
            </div>
          </div>
        );

      case 'appearance':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Тема
              </label>
              <select 
                value={appearance.theme}
                onChange={(e) => setAppearance(prev => ({ ...prev, theme: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="light">Светлая</option>
                <option value="dark">Тёмная</option>
                <option value="system">Системная</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Язык
              </label>
              <select 
                value={appearance.language}
                onChange={(e) => setAppearance(prev => ({ ...prev, language: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="ru">Русский</option>
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
              </select>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900">Компактный вид</h3>
                <p className="text-sm text-gray-500">Показывать больше контента в меньшем пространстве</p>
              </div>
              <input 
                type="checkbox" 
                checked={appearance.compactView}
                onChange={(e) => setAppearance(prev => ({ ...prev, compactView: e.target.checked }))}
                className="rounded" 
              />
            </div>
          </div>
        );

      case 'data':
        return (
          <div className="space-y-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-yellow-800 mb-2">Хранение данных</h3>
              <p className="text-sm text-yellow-700">
                Ваши данные хранятся локально в браузере. Регулярно экспортируйте данные для предотвращения потери.
              </p>
            </div>
            <div className="space-y-3">
              <button 
                onClick={handleExportData}
                className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors duration-200"
              >
                Экспорт данных
              </button>
              <button 
                onClick={handleImportData}
                className="w-full bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors duration-200"
              >
                Импорт данных
              </button>
              <button 
                onClick={handleClearData}
                className="w-full bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors duration-200"
              >
                Очистить все данные
              </button>
              <input
                type="file"
                id="import-file"
                accept=".json"
                style={{ display: 'none' }}
                onChange={handleFileImport}
              />
            </div>
          </div>
        );

      case 'security':
        return (
          <div className="space-y-6">
            {/* Telegram Integration */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-4 flex items-center">
                <MessageCircle className="w-4 h-4 mr-2" />
                Интеграция с Telegram
              </h3>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <h4 className="text-sm font-medium text-blue-800 mb-2">Подключение Telegram</h4>
                <p className="text-sm text-blue-700 mb-3">
                  Получайте уведомления о задачах и приглашениях прямо в Telegram
                </p>
                
                <div className="flex items-center space-x-3">
                  <input
                    type="text"
                    value={telegram.username}
                    onChange={(e) => setTelegram(prev => ({ ...prev, username: e.target.value }))}
                    placeholder="Введите @username"
                    className="flex-1 px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                  <button
                    onClick={handleTelegramConnect}
                    disabled={telegram.connected}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      telegram.connected
                        ? 'bg-green-100 text-green-800 cursor-not-allowed'
                        : 'bg-blue-500 text-white hover:bg-blue-600'
                    }`}
                  >
                    {telegram.connected ? '✓ Подключено' : 'Подключить'}
                  </button>
                </div>
                
                {telegram.connected && (
                  <div className="mt-3 flex items-center space-x-2 text-sm text-green-700">
                    <Link className="w-4 h-4" />
                    <span>Подключен: @{telegram.username}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-green-800 mb-2">Статус безопасности</h3>
              <p className="text-sm text-green-700">
                Ваши данные защищены и хранятся локально на вашем устройстве.
              </p>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900">Автосохранение</h3>
                <p className="text-sm text-gray-500">Автоматически сохранять изменения</p>
              </div>
              <input type="checkbox" defaultChecked className="rounded" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900">Шифрование данных</h3>
                <p className="text-sm text-gray-500">Шифровать сохранённые данные (скоро)</p>
              </div>
              <input type="checkbox" disabled className="rounded opacity-50" />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const handleExportData = () => {
    if (!user) return;

    const exportData = {
      projects: db.getProjects(user.id),
      tasks: db.getTasks(user.id),
      documents: db.getDocuments(user.id),
      settings: db.getUserSettings(user.id),
      exportDate: new Date().toISOString()
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `hermes-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
  };

  const handleImportData = () => {
    const fileInput = document.getElementById('import-file') as HTMLInputElement;
    fileInput?.click();
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importData = JSON.parse(e.target?.result as string);
        
        // Импортируем данные
        if (importData.projects) {
          importData.projects.forEach((project: any) => {
            db.createProject(project, user.id);
          });
        }
        
        if (importData.tasks) {
          importData.tasks.forEach((task: any) => {
            db.createTask(task, user.id);
          });
        }
        
        if (importData.documents) {
          importData.documents.forEach((document: any) => {
            db.createDocument(document, user.id);
          });
        }
        
        if (importData.settings) {
          db.updateUserSettings(user.id, importData.settings);
        }
        
        alert('Данные успешно импортированы!');
        window.location.reload(); // Перезагружаем страницу для обновления данных
      } catch (error) {
        console.error('Error importing data:', error);
        alert('Ошибка при импорте данных');
      }
    };
    
    reader.readAsText(file);
    event.target.value = ''; // Сбрасываем значение для повторного импорта
  };

  const handleClearData = () => {
    if (!user) return;
    
    const confirmed = window.confirm('Вы уверены, что хотите удалить все данные? Это действие нельзя отменить.');
    if (confirmed) {
      db.clearUserData(user.id);
      alert('Данные очищены!');
      window.location.reload();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Настройки</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex">
          {/* Sidebar */}
          <div className="w-64 bg-gray-50 border-r border-gray-200">
            <nav className="p-4 space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors duration-200 ${
                    activeTab === tab.id
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 p-6">
            <div className="max-w-2xl">
              {renderTabContent()}
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
          >
            Отмена
          </button>
          <button
            onClick={handleSaveProfile}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors duration-200 flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? 'Сохранение...' : 'Сохранить изменения'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};