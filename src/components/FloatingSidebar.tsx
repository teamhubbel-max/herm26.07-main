import React, { useState } from 'react';
import { 
  Plus, 
  UserPlus, 
  Shield, 
  Download, 
  Settings,
  Users
} from 'lucide-react';

interface FloatingSidebarProps {
  onAddTask: () => void;
  onInviteUser: () => void;
  onAccessSettings: () => void;
  onGenerateReport: () => void;
}

export const FloatingSidebar: React.FC<FloatingSidebarProps> = ({
  onAddTask,
  onInviteUser,
  onAccessSettings,
  onGenerateReport
}) => {
  const menuItems = [
    {
      icon: Plus,
      label: 'Добавить задачу',
      onClick: onAddTask,
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      icon: UserPlus,
      label: 'Пригласить участника',
      onClick: onInviteUser,
      color: 'bg-gray-500 hover:bg-gray-600'
    },
    {
      icon: Shield,
      label: 'Настройки доступа',
      onClick: onAccessSettings,
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      icon: Download,
      label: 'Выгрузка отчёта',
      onClick: onGenerateReport,
      color: 'bg-orange-500 hover:bg-orange-600'
    }
  ];

  return (
    <div className="fixed right-6 bottom-6 z-50">
      <div className="bg-white rounded-full shadow-2xl border border-gray-200 p-2">
        <div className="flex items-center space-x-2">
          {menuItems.map((item, index) => (
            <button
              key={index}
              onClick={item.onClick}
              className={`w-12 h-12 flex items-center justify-center rounded-full text-white transition-all duration-200 transform hover:scale-110 ${item.color} shadow-lg`}
              title={item.label}
            >
              <item.icon className="w-5 h-5" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};