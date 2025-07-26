import { v4 as uuidv4 } from 'uuid';
import { Project } from '../types/Project';

export const createMockProjects = (): Project[] => {
  const now = new Date();
  
  return [
    {
      id: uuidv4(),
      title: 'Система управления проектами Гермес',
      description: 'Разработка современной системы управления проектами с Kanban досками',
      status: 'active',
      role: 'owner',
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      lastActivity: new Date(Date.now() - 30 * 60 * 1000),
      tasksCount: 24,
      completedTasks: 18,
      membersCount: 5,
      color: '#3B82F6',
      hasNotifications: true,
      progress: 75,
      owner: {
        name: 'Алексей Петров',
        avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150'
      },
      members: [
        { id: '1', name: 'Мария Иванова', avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150' },
        { id: '2', name: 'Дмитрий Сидоров', avatar: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=150' },
        { id: '3', name: 'Елена Козлова', avatar: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=150' }
      ]
    },
    {
      id: uuidv4(),
      title: 'Мобильное приложение для доставки',
      description: 'Разработка iOS и Android приложения для службы доставки еды',
      status: 'active',
      role: 'member',
      createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
      lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000),
      tasksCount: 32,
      completedTasks: 20,
      membersCount: 8,
      color: '#10B981',
      hasNotifications: false,
      progress: 62,
      owner: {
        name: 'Сергей Волков',
        avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150'
      },
      members: [
        { id: '4', name: 'Анна Морозова', avatar: 'https://images.pexels.com/photos/762020/pexels-photo-762020.jpeg?auto=compress&cs=tinysrgb&w=150' },
        { id: '5', name: 'Игорь Новиков', avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150' }
      ]
    },
    {
      id: uuidv4(),
      title: 'Редизайн корпоративного сайта',
      description: 'Обновление дизайна и функциональности корпоративного веб-сайта',
      status: 'completed',
      role: 'member',
      createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      lastActivity: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      tasksCount: 16,
      completedTasks: 16,
      membersCount: 4,
      color: '#8B5CF6',
      hasNotifications: false,
      progress: 100,
      owner: {
        name: 'Ольга Смирнова',
        avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150'
      },
      members: [
        { id: '6', name: 'Максим Федоров', avatar: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=150' }
      ]
    },
    {
      id: uuidv4(),
      title: 'Система аналитики продаж',
      description: 'Разработка dashboard для анализа продаж и метрик бизнеса',
      status: 'paused',
      role: 'observer',
      createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      lastActivity: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      tasksCount: 28,
      completedTasks: 12,
      membersCount: 6,
      color: '#F59E0B',
      hasNotifications: false,
      progress: 43,
      owner: {
        name: 'Виктор Лебедев',
        avatar: 'https://images.pexels.com/photos/1212984/pexels-photo-1212984.jpeg?auto=compress&cs=tinysrgb&w=150'
      },
      members: [
        { id: '7', name: 'Татьяна Орлова', avatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=150' },
        { id: '8', name: 'Андрей Соколов', avatar: 'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=150' }
      ]
    },
    {
      id: uuidv4(),
      title: 'Интеграция с CRM системой',
      description: 'Интеграция существующих систем с новой CRM платформой',
      status: 'active',
      role: 'member',
      createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      lastActivity: new Date(Date.now() - 6 * 60 * 60 * 1000),
      tasksCount: 19,
      completedTasks: 8,
      membersCount: 3,
      color: '#EF4444',
      hasNotifications: true,
      progress: 42,
      owner: {
        name: 'Наталья Кузнецова',
        avatar: 'https://images.pexels.com/photos/1181424/pexels-photo-1181424.jpeg?auto=compress&cs=tinysrgb&w=150'
      },
      members: [
        { id: '9', name: 'Роман Попов', avatar: 'https://images.pexels.com/photos/1043473/pexels-photo-1043473.jpeg?auto=compress&cs=tinysrgb&w=150' }
      ]
    },
    {
      id: uuidv4(),
      title: 'Автоматизация тестирования',
      description: 'Внедрение автоматизированного тестирования для всех продуктов',
      status: 'archived',
      role: 'member',
      createdAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      lastActivity: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      tasksCount: 22,
      completedTasks: 15,
      membersCount: 4,
      color: '#6B7280',
      hasNotifications: false,
      progress: 68,
      owner: {
        name: 'Павел Михайлов',
        avatar: 'https://images.pexels.com/photos/1043472/pexels-photo-1043472.jpeg?auto=compress&cs=tinysrgb&w=150'
      },
      members: [
        { id: '10', name: 'Светлана Белова', avatar: 'https://images.pexels.com/photos/1181690/pexels-photo-1181690.jpeg?auto=compress&cs=tinysrgb&w=150' }
      ]
    }
  ];
};