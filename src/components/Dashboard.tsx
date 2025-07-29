import React, { useState, useMemo } from 'react';
import { db } from '../lib/database';
import { useAuth } from '../hooks/useAuth';
import { StatsCard } from './StatsCard';
import { TaskDetailsModal } from './TaskDetailsModal';
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  TrendingUp,
  Calendar,
  Users,
  BarChart3,
  Activity,
  Target,
  Award,
  Zap,
  Star,
  ChevronLeft,
  ChevronRight,
  Filter,
  Eye,
  ExternalLink
} from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, BarElement } from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface DashboardProps {
  projects: any[];
  onOpenProject: (projectId: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  projects,
  onOpenProject
}) => {
  const { user } = useAuth();
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [kpiCarouselIndex, setKpiCarouselIndex] = useState(0);
  const [eventsScrollIndex, setEventsScrollIndex] = useState(0);
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');
  const [chartMetric, setChartMetric] = useState<'tasks' | 'efficiency' | 'projects'>('tasks');
  
  // Фильтры для ключевых показателей
  const [filters, setFilters] = useState({
    dateRange: 'week', // week, month, quarter, year
    selectedProjects: [] as string[],
    selectedMembers: [] as string[]
  });

  // Получаем реальные задачи из базы данных
  const allTasks = useMemo(() => {
    if (!user) return [];
    
    // Для демо возвращаем пустой массив, так как реальные задачи нужно загружать асинхронно
    // В реальном приложении здесь должен быть отдельный хук для загрузки всех задач
    return [];
  }, [projects]);

  const highPriorityTasks = allTasks.filter(task => 
    task.priority === 'high' && task.status !== 'done'
  );

  const upcomingDeadlines = allTasks
    .filter(task => task.dueDate && task.status !== 'done')
    .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
    .slice(0, 10);

  // KPI пользователя на основе реальных данных
  const teamMembers = useMemo(() => {
    if (!user) return [];
    
    // Базовые данные пользователя
    const totalProjects = projects.length;
    const activeProjects = projects.filter(p => p.status === 'active').length;
    const completedProjects = projects.filter(p => p.status === 'completed').length;
    const efficiency = totalProjects > 0 ? Math.round((completedProjects / totalProjects) * 100) : 0;
    
    return [{
      id: user.id,
      name: user.email || 'Пользователь',
      avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150',
      role: user.role || 'member',
      tasksCompleted: completedProjects,
      tasksInProgress: activeProjects,
      efficiency,
      weeklyHours: Math.round(activeProjects * 8), // Примерно 8 часов на активный проект
      projects: projects.map(p => p.title)
    }];
  }, [user, projects]);

  // События активности на основе реальных данных
  const recentEvents = useMemo(() => {
    if (!user || teamMembers.length === 0) return [];
    
    // Для демо создаем базовые события на основе проектов
    return projects.slice(0, 5).map((project, index) => ({
      id: `event-${index}`,
      user: teamMembers[0],
      action: 'Обновил проект',
      taskTitle: project.title,
      taskId: project.id,
      projectTitle: project.title,
      projectColor: project.color,
      time: new Date(project.updatedAt).toLocaleString(),
      type: 'update'
    }));
  }, [user, teamMembers, projects]);

  // Данные для графиков
  const chartData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toLocaleDateString('ru-RU', { month: 'short', day: 'numeric' });
    });

    const taskData = {
      labels: last7Days,
      datasets: [
        {
          label: 'Выполненные задачи',
          data: [2, 5, 3, 8, 6, 4, 7],
          borderColor: 'rgb(34, 197, 94)',
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          tension: 0.4,
        },
        {
          label: 'Новые задачи',
          data: [3, 7, 4, 6, 8, 5, 9],
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4,
        }
      ]
    };

    const efficiencyData = {
      labels: last7Days,
      datasets: [
        {
          label: 'Эффективность команды %',
          data: [75, 82, 78, 85, 88, 84, 90],
          borderColor: 'rgb(168, 85, 247)',
          backgroundColor: 'rgba(168, 85, 247, 0.1)',
          tension: 0.4,
        }
      ]
    };

    const projectData = {
      labels: projects.slice(0, 5).map(p => p.title),
      datasets: [
        {
          label: 'Прогресс проектов %',
          data: projects.slice(0, 5).map(p => p.progress),
          backgroundColor: projects.slice(0, 5).map(p => p.color + '80'),
          borderColor: projects.slice(0, 5).map(p => p.color),
          borderWidth: 2,
        }
      ]
    };

    switch (chartMetric) {
      case 'efficiency': return efficiencyData;
      case 'projects': return projectData;
      default: return taskData;
    }
  }, [chartMetric, projects]);

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: chartMetric === 'efficiency' || chartMetric === 'projects' ? 100 : undefined,
      },
    },
  };
  const handleTaskClick = (task: any) => {
    setSelectedTask(task);
    setIsTaskModalOpen(true);
  };

  const handleEventClick = (event: any) => {
    const task = allTasks.find(t => t.id === event.taskId);
    if (task) {
      setSelectedTask(task);
      setIsTaskModalOpen(true);
    }
  };

  const handleProjectNavigation = (projectId: string) => {
    onOpenProject(projectId);
  };

  const nextKpiSlide = () => {
    setKpiCarouselIndex(prev => 
      prev + 3 >= teamMembers.length ? 0 : prev + 3
    );
  };

  const prevKpiSlide = () => {
    setKpiCarouselIndex(prev => 
      prev - 3 < 0 ? Math.max(0, teamMembers.length - 3) : prev - 3
    );
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'create': return '➕';
      case 'update': return '✏️';
      case 'complete': return '✅';
      case 'comment': return '💬';
      case 'start': return '🚀';
      case 'assign': return '👤';
      default: return '📝';
    }
  };

  const totalTasks = allTasks.length;
  const completedTasks = allTasks.filter(t => t.status === 'done').length;
  const inProgressTasks = allTasks.filter(t => t.status === 'inprogress').length;
  const overdueTasks = allTasks.filter(t => 
    t.dueDate && new Date() > t.dueDate && t.status !== 'done'
  ).length;

  return (
    <>
      <div className="p-6">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Аналитика</h2>
          <p className="text-gray-600">Общая аналитика по всем проектам, KPI участников и ключевые показатели</p>
        </div>

        {/* Общая статистика */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Всего задач"
            value={totalTasks}
            icon={TrendingUp}
            color="bg-blue-500"
          />
          <StatsCard
            title="Выполнено"
            value={completedTasks}
            icon={CheckCircle}
            color="bg-green-500"
            trend={{
              value: Math.round((completedTasks / totalTasks) * 100),
              isPositive: true
            }}
          />
          <StatsCard
            title="В работе"
            value={inProgressTasks}
            icon={Clock}
            color="bg-orange-500"
          />
          <StatsCard
            title="Просрочено"
            value={overdueTasks}
            icon={AlertTriangle}
            color="bg-red-500"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Задачи высокого приоритета */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
              Задачи высокого приоритета
            </h3>
            
            <div className="max-h-80 overflow-y-auto space-y-3">
              {highPriorityTasks.map(task => (
                <div 
                  key={task.id} 
                  className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200 hover:bg-red-100 cursor-pointer transition-colors"
                  onClick={() => handleTaskClick(task)}
                >
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{task.title}</h4>
                    <div className="flex items-center space-x-2 mt-1">
                      <span 
                        className="inline-block w-3 h-3 rounded-full"
                        style={{ backgroundColor: task.projectColor }}
                      ></span>
                      <span className="text-sm text-gray-600">{task.projectTitle}</span>
                      <span className="text-sm text-gray-500">• {task.assignee}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleProjectNavigation(task.projectId);
                      }}
                      className="p-1 text-blue-500 hover:text-blue-700 transition-colors"
                      title="Открыть проект"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                      task.status === 'todo' ? 'bg-gray-100 text-gray-800' :
                      task.status === 'inprogress' ? 'bg-blue-100 text-blue-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {task.status === 'todo' ? 'К выполнению' :
                       task.status === 'inprogress' ? 'В работе' : 'Выполнено'}
                    </span>
                  </div>
                </div>
              ))}
              {highPriorityTasks.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>Нет задач высокого приоритета!</p>
                </div>
              )}
            </div>
          </div>

          {/* Приближающиеся дедлайны */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Calendar className="w-5 h-5 text-orange-500 mr-2" />
              Приближающиеся дедлайны
            </h3>
            
            <div className="max-h-80 overflow-y-auto space-y-3">
              {upcomingDeadlines.map(task => {
                const isOverdue = task.dueDate && new Date() > task.dueDate;
                const isDueSoon = task.dueDate && 
                  new Date() < task.dueDate && 
                  task.dueDate.getTime() - Date.now() < 3 * 24 * 60 * 60 * 1000;
                
                return (
                  <div 
                    key={task.id} 
                    className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                      isOverdue ? 'bg-red-50 border-red-200 hover:bg-red-100' :
                      isDueSoon ? 'bg-yellow-50 border-yellow-200 hover:bg-yellow-100' :
                      'bg-gray-50 border-gray-200 hover:bg-gray-100'
                    }`}
                    onClick={() => handleTaskClick(task)}
                  >
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{task.title}</h4>
                      <div className="flex items-center space-x-2 mt-1">
                        <span 
                          className="inline-block w-3 h-3 rounded-full"
                          style={{ backgroundColor: task.projectColor }}
                        ></span>
                        <span className="text-sm text-gray-600">{task.projectTitle}</span>
                        <span className="text-sm text-gray-500">• {task.assignee}</span>
                      </div>
                    </div>
                    <div className="text-right flex items-center space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleProjectNavigation(task.projectId);
                        }}
                        className="p-1 text-blue-500 hover:text-blue-700 transition-colors"
                        title="Открыть проект"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                      <div>
                        <p className={`text-sm font-medium ${
                          isOverdue ? 'text-red-600' :
                          isDueSoon ? 'text-yellow-600' :
                          'text-gray-600'
                        }`}>
                          {task.dueDate.toLocaleDateString()}
                        </p>
                        {isOverdue && (
                          <span className="text-xs text-red-500">Просрочено</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              {upcomingDeadlines.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>Нет приближающихся дедлайнов!</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* KPI участников - карусель */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">KPI участников проекта</h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={prevKpiSlide}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                disabled={kpiCarouselIndex === 0}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={nextKpiSlide}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                disabled={kpiCarouselIndex + 3 >= teamMembers.length}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {teamMembers.slice(kpiCarouselIndex, kpiCarouselIndex + 3).map(member => (
              <div key={member.id} className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <h4 className="font-semibold text-gray-900">{member.name}</h4>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      member.role === 'owner' ? 'bg-purple-100 text-purple-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {member.role === 'owner' ? 'Владелец' : 'Участник'}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Эффективность</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full bg-green-500"
                          style={{ width: `${member.efficiency}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900">{member.efficiency}%</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Выполнено</span>
                      <div className="font-semibold text-green-600">{member.tasksCompleted}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">В работе</span>
                      <div className="font-semibold text-blue-600">{member.tasksInProgress}</div>
                    </div>
                  </div>
                  
                  <div className="text-sm">
                    <span className="text-gray-600">Часов в неделю: </span>
                    <span className="font-semibold text-gray-900">{member.weeklyHours}</span>
                  </div>
                  
                  <div className="text-sm">
                    <span className="text-gray-600">Проекты: </span>
                    <span className="font-medium text-gray-900">{member.projects.join(', ')}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Последние события */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Последние события</h3>
          <div className="bg-white rounded-lg border border-gray-200 max-h-96 overflow-y-auto">
            {recentEvents.map((event, index) => (
              <div 
                key={event.id} 
                className={`flex items-center space-x-4 p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                  index !== recentEvents.length - 1 ? 'border-b border-gray-200' : ''
                }`}
                onClick={() => handleEventClick(event)}
              >
                <img
                  src={event.user.avatar}
                  alt={event.user.name}
                  className="w-10 h-10 rounded-full"
                />
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{getEventIcon(event.type)}</span>
                    <span className="font-medium text-gray-900">{event.user.name}</span>
                    <span className="text-gray-600">{event.action}</span>
                  </div>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="font-medium text-gray-900">"{event.taskTitle}"</span>
                    <span className="text-gray-500">в</span>
                    <span 
                      className="inline-flex items-center space-x-1 text-sm"
                      style={{ color: event.projectColor }}
                    >
                      <span 
                        className="inline-block w-2 h-2 rounded-full"
                        style={{ backgroundColor: event.projectColor }}
                      ></span>
                      <span>{event.projectTitle}</span>
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const task = allTasks.find(t => t.id === event.taskId);
                      if (task) {
                        handleProjectNavigation(task.projectId);
                      }
                    }}
                    className="p-1 text-blue-500 hover:text-blue-700 transition-colors"
                    title="Открыть проект"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                  <span className="text-xs text-gray-500">{event.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Ключевые показатели с фильтрами */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Ключевые показатели</h3>
            <div className="flex items-center space-x-4">
              <select
                value={filters.dateRange}
                onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="week">Неделя</option>
                <option value="month">Месяц</option>
                <option value="quarter">Квартал</option>
                <option value="year">Год</option>
              </select>
              
              <select
                multiple
                value={filters.selectedProjects}
                onChange={(e) => setFilters(prev => ({ 
                  ...prev, 
                  selectedProjects: Array.from(e.target.selectedOptions, option => option.value)
                }))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Все проекты</option>
                {projects.map(project => (
                  <option key={project.id} value={project.id}>{project.title}</option>
                ))}
              </select>
              
              <button className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Filter className="w-4 h-4" />
                <span>Фильтры</span>
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Target className="w-6 h-6 text-blue-600" />
                </div>
                <span className="text-2xl font-bold text-gray-900">
                  {Math.round((completedTasks / totalTasks) * 100)}%
                </span>
              </div>
              <h4 className="font-medium text-gray-900">Общий прогресс</h4>
              <p className="text-sm text-gray-600">По всем проектам</p>
            </div>
            
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Award className="w-6 h-6 text-green-600" />
                </div>
                <span className="text-2xl font-bold text-gray-900">
                  {Math.round(teamMembers.reduce((sum, m) => sum + m.efficiency, 0) / teamMembers.length)}%
                </span>
              </div>
              <h4 className="font-medium text-gray-900">Средняя эффективность</h4>
              <p className="text-sm text-gray-600">По всем участникам</p>
            </div>
            
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <Zap className="w-6 h-6 text-orange-600" />
                </div>
                <span className="text-2xl font-bold text-gray-900">
                  {Math.round(teamMembers.reduce((sum, m) => sum + m.weeklyHours, 0) / teamMembers.length)}
                </span>
              </div>
              <h4 className="font-medium text-gray-900">Часов в неделю</h4>
              <p className="text-sm text-gray-600">Среднее по команде</p>
            </div>
            
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Star className="w-6 h-6 text-purple-600" />
                </div>
                <span className="text-2xl font-bold text-gray-900">4.8</span>
              </div>
              <h4 className="font-medium text-gray-900">Качество работы</h4>
              <p className="text-sm text-gray-600">Средняя оценка задач</p>
            </div>
          </div>
        </div>
        
        {/* Динамические графики */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Динамика показателей</h3>
            <div className="flex items-center space-x-4">
              <select
                value={chartMetric}
                onChange={(e) => setChartMetric(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="tasks">Задачи</option>
                <option value="efficiency">Эффективность</option>
                <option value="projects">Прогресс проектов</option>
              </select>
              
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setChartType('line')}
                  className={`px-3 py-1 rounded-md text-sm transition-colors ${
                    chartType === 'line' 
                      ? 'bg-white text-blue-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Линейный
                </button>
                <button
                  onClick={() => setChartType('bar')}
                  className={`px-3 py-1 rounded-md text-sm transition-colors ${
                    chartType === 'bar' 
                      ? 'bg-white text-blue-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Столбчатый
                </button>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="h-80">
              {chartType === 'line' ? (
                <Line data={chartData} options={chartOptions} />
              ) : (
                <Bar data={chartData} options={chartOptions} />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Task Details Modal */}
      {selectedTask && (
        <TaskDetailsModal
          isOpen={isTaskModalOpen}
          onClose={() => {
            setIsTaskModalOpen(false);
            setSelectedTask(null);
          }}
          task={selectedTask}
          onUpdate={(taskId, updates) => {
            // Логика обновления задачи
            console.log('Updating task:', taskId, updates);
          }}
        />
      )}
    </>
  );
};