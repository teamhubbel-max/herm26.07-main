import React, { useState } from 'react';
import { X, Download, Calendar, FileText, BarChart3, Users } from 'lucide-react';

interface User {
  id: string;
  name: string;
  avatar: string;
  role: 'owner' | 'member' | 'observer';
  tasks: {
    todo: any[];
    inprogress: any[];
    done: any[];
  };
}

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: any;
  users: User[];
}

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  project,
  users
}) => {
  const [reportType, setReportType] = useState('summary');
  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0]
  });
  const [selectedUsers, setSelectedUsers] = useState<string[]>(users.map(u => u.id));
  const [format, setFormat] = useState('pdf');

  const reportTypes = [
    {
      id: 'summary',
      title: 'Сводный отчёт',
      description: 'Общая статистика по проекту и участникам',
      icon: BarChart3
    },
    {
      id: 'detailed',
      title: 'Детальный отчёт',
      description: 'Подробная информация по всем задачам',
      icon: FileText
    },
    {
      id: 'user',
      title: 'Отчёт по участникам',
      description: 'Статистика работы каждого участника',
      icon: Users
    },
    {
      id: 'timeline',
      title: 'Временная шкала',
      description: 'Хронология выполнения задач',
      icon: Calendar
    }
  ];

  const formats = [
    { value: 'pdf', label: 'PDF документ' },
    { value: 'excel', label: 'Excel таблица' },
    { value: 'csv', label: 'CSV файл' }
  ];

  const toggleUser = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleGenerateReport = () => {
    const reportData = {
      type: reportType,
      dateRange,
      users: selectedUsers,
      format,
      project: project?.title || 'Проект'
    };

    console.log('Generating report:', reportData);
    
    // Имитация генерации отчёта
    const fileName = `${project?.title || 'project'}_report_${new Date().toISOString().split('T')[0]}.${format}`;
    
    // Создаем blob с демо-данными
    const content = `Отчёт по проекту: ${project?.title || 'Проект'}
Период: ${dateRange.from} - ${dateRange.to}
Тип отчёта: ${reportTypes.find(t => t.id === reportType)?.title}
Участники: ${selectedUsers.length} из ${users.length}

Статистика:
- Всего задач: ${users.reduce((sum, user) => sum + user.tasks.todo.length + user.tasks.inprogress.length + user.tasks.done.length, 0)}
- Выполнено: ${users.reduce((sum, user) => sum + user.tasks.done.length, 0)}
- В работе: ${users.reduce((sum, user) => sum + user.tasks.inprogress.length, 0)}
- К выполнению: ${users.reduce((sum, user) => sum + user.tasks.todo.length, 0)}`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
            <Download className="w-5 h-5" />
            <span>Выгрузка отчёта</span>
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Report Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Тип отчёта</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {reportTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setReportType(type.id)}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    reportType === type.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-3 mb-2">
                    <type.icon className="w-5 h-5 text-blue-600" />
                    <span className="font-medium text-gray-900">{type.title}</span>
                  </div>
                  <p className="text-sm text-gray-600">{type.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Период отчёта</label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">С</label>
                <input
                  type="date"
                  value={dateRange.from}
                  onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">По</label>
                <input
                  type="date"
                  value={dateRange.to}
                  onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* User Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Участники ({selectedUsers.length} из {users.length})
            </label>
            <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg">
              <div className="p-3 border-b border-gray-200 bg-gray-50">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedUsers.length === users.length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedUsers(users.map(u => u.id));
                      } else {
                        setSelectedUsers([]);
                      }
                    }}
                    className="rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">Выбрать всех</span>
                </label>
              </div>
              {users.map((user) => (
                <div key={user.id} className="p-3 border-b border-gray-100 last:border-b-0">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={() => toggleUser(user.id)}
                      className="rounded"
                    />
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-8 h-8 rounded-full"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{user.name}</div>
                      <div className="text-xs text-gray-500">
                        {user.tasks.todo.length + user.tasks.inprogress.length + user.tasks.done.length} задач
                      </div>
                    </div>
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Format Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Формат файла</label>
            <div className="flex space-x-3">
              {formats.map((fmt) => (
                <button
                  key={fmt.value}
                  onClick={() => setFormat(fmt.value)}
                  className={`px-4 py-2 rounded-lg border transition-colors ${
                    format === fmt.value
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {fmt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-2">Предварительный просмотр</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p>Проект: {project?.title || 'Проект'}</p>
              <p>Тип: {reportTypes.find(t => t.id === reportType)?.title}</p>
              <p>Период: {dateRange.from} - {dateRange.to}</p>
              <p>Участники: {selectedUsers.length} из {users.length}</p>
              <p>Формат: {formats.find(f => f.value === format)?.label}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Отмена
            </button>
            <button
              onClick={handleGenerateReport}
              disabled={selectedUsers.length === 0}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Сгенерировать отчёт</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};