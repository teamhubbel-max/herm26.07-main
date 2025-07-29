import React from 'react';
import { 
  LayoutDashboard, 
  BarChart3, 
  Settings, 
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  FolderOpen,
  FileText,
  ArrowLeft,
  TrendingUp
} from 'lucide-react';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  activeView: 'projects' | 'documents' | 'analytics' | 'marketing';
  onViewChange: (view: 'projects' | 'documents' | 'analytics' | 'marketing') => void;
  onSettingsClick: () => void;
  showBackButton?: boolean;
  onBackClick?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  onToggle,
  activeView,
  onViewChange,
  onSettingsClick,
  showBackButton = false,
  onBackClick
}) => {
  const menuItems = [
    { id: 'projects', icon: FolderOpen, label: 'Проекты' },
    { id: 'documents', icon: FileText, label: 'Документы' },
    { id: 'analytics', icon: LayoutDashboard, label: 'Аналитика' },
    { id: 'marketing', icon: TrendingUp, label: 'Маркетинг' },
  ];

  const bottomItems = [
    { id: 'settings', icon: Settings, label: 'Настройки', onClick: onSettingsClick },
    { id: 'help', icon: HelpCircle, label: 'Помощь' }
  ];

  return (
    <div className={`bg-white border-r border-gray-200 transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-64'
    } ${isCollapsed ? 'md:relative' : 'md:relative'} absolute md:relative z-30 h-full`}>
      <div className="flex flex-col h-full">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {!isCollapsed && (
              <div className="flex items-center space-x-2 flex-1">
                {showBackButton && onBackClick ? (
                  <button
                    onClick={onBackClick}
                    className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                ) : (
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">H</span>
                  </div>
                )}
                <div className="flex-1">
                  <span className="font-semibold text-gray-900">
                    {showBackButton ? 'Проект' : 'Гермес'}
                  </span>
                </div>
              </div>
            )}
            <button
              onClick={onToggle}
              className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              {isCollapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        <nav className="flex-1 p-4">
          <div className="space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id as any)}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors duration-200 ${
                  activeView === item.id
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!isCollapsed && <span className="font-medium">{item.label}</span>}
              </button>
            ))}
          </div>
        </nav>

        <div className="p-4 border-t border-gray-200">
          <div className="space-y-2">
            {bottomItems.map((item) => (
              <button
                key={item.id}
                onClick={item.onClick || (() => {})}
                className="w-full flex items-center space-x-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!isCollapsed && <span>{item.label}</span>}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};