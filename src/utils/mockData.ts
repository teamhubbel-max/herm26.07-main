import { v4 as uuidv4 } from 'uuid';
import { Board } from '../types/Task';

export const createInitialBoard = (): Board => {
  const now = new Date();
  
  return {
    id: uuidv4(),
    title: 'Доска проекта Гермес',
    columns: [
      {
        id: 'todo',
        title: 'К выполнению',
        status: 'todo',
        tasks: [
          {
            id: uuidv4(),
            title: 'Настройка дизайн-системы',
            description: 'Создать комплексную дизайн-систему с цветами, типографикой и стилями компонентов',
            status: 'todo',
            priority: 'high',
            category: 'Дизайн',
            createdAt: now,
            updatedAt: now,
            assignee: 'Команда дизайна',
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
          },
          {
            id: uuidv4(),
            title: 'Аутентификация пользователей',
            description: 'Реализовать систему входа и регистрации пользователей с надлежащими мерами безопасности',
            status: 'todo',
            priority: 'high',
            category: 'Бэкенд',
            createdAt: now,
            updatedAt: now,
            assignee: 'Команда бэкенда'
          },
          {
            id: uuidv4(),
            title: 'Адаптивный дизайн для мобильных',
            description: 'Обеспечить бесперебойную работу приложения на всех размерах устройств',
            status: 'todo',
            priority: 'medium',
            category: 'Фронтенд',
            createdAt: now,
            updatedAt: now
          }
        ]
      },
      {
        id: 'inprogress',
        title: 'В работе',
        status: 'inprogress',
        tasks: [
          {
            id: uuidv4(),
            title: 'API управления задачами',
            description: 'Разработать REST API endpoints для CRUD операций с задачами и проектами',
            status: 'inprogress',
            priority: 'high',
            category: 'Бэкенд',
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
            assignee: 'Команда API',
            dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
          },
          {
            id: uuidv4(),
            title: 'Реализация Drag & Drop',
            description: 'Добавить интуитивную функциональность перетаскивания для управления задачами',
            status: 'inprogress',
            priority: 'medium',
            category: 'Фронтенд',
            createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
            updatedAt: now,
            assignee: 'Команда фронтенда'
          }
        ]
      },
      {
        id: 'done',
        title: 'Выполнено',
        status: 'done',
        tasks: [
          {
            id: uuidv4(),
            title: 'Настройка проекта',
            description: 'Инициализировать проект с правильной структурой папок и зависимостями',
            status: 'done',
            priority: 'high',
            category: 'Настройка',
            createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
            updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
            assignee: 'Команда DevOps'
          },
          {
            id: uuidv4(),
            title: 'Анализ требований',
            description: 'Проанализировать и задокументировать все требования проекта и пользовательские истории',
            status: 'done',
            priority: 'high',
            category: 'Планирование',
            createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
            assignee: 'Команда продукта'
          }
        ]
      }
    ]
  };
};