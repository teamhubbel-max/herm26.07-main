/**
 * ==========================================================================
 * ЛОКАЛЬНАЯ БАЗА ДАННЫХ TEAMHUB
 * ==========================================================================
 * 
 * Эта система управляет всеми данными приложения в localStorage браузера.
 * Все данные хранятся локально, без отправки на внешние серверы.
 * 
 * ПРИНЦИПЫ АРХИТЕКТУРЫ:
 * - Каждая таблица имеет четкую структуру и назначение
 * - Все данные изолированы по пользователям  
 * - UUID используется для всех идентификаторов
 * - Автоматические timestamp для created_at/updated_at
 * - Каскадное удаление связанных данных
 * - Подробное логирование всех операций
 * 
 * ХРАНЕНИЕ ДАННЫХ:
 * localStorage ключи имеют формат: 'teamhub_{таблица}_{userId}'
 * Глобальные данные (пользователи, шаблоны): 'teamhub_{таблица}'
 */

// ==========================================================================
// СХЕМА БАЗЫ ДАННЫХ - ТИПЫ И ИНТЕРФЕЙСЫ
// ==========================================================================

/**
 * ПОЛЬЗОВАТЕЛЬ (USERS)
 * 
 * Основная сущность системы - зарегистрированный пользователь.
 * Каждый пользователь имеет уникальный email и может создавать проекты.
 * 
 * СВЯЗИ:
 * - projects (1:many) - пользователь может создать много проектов
 * - project_members (1:many) - пользователь может участвовать в проектах
 * - tasks (1:many) - пользователь может создавать и выполнять задачи
 * - task_comments (1:many) - пользователь может комментировать задачи
 * - documents (1:many) - пользователь может создавать документы
 * - activity_logs (1:many) - все действия пользователя логируются
 */
export interface User {
  id: string;                    // UUID пользователя (первичный ключ)
  email: string;                 // Email для входа (UNIQUE, обязательное)
  full_name: string;            // Отображаемое имя пользователя
  avatar_url?: string;          // Ссылка на аватар (опционально)
  role: 'owner' | 'admin' | 'member'; // Глобальная роль в системе
  created_at: string;           // ISO дата регистрации
  updated_at: string;           // ISO дата последнего обновления профиля
}

/**
 * ПРОЕКТ (PROJECTS)
 * 
 * Контейнер для задач, участников и документов.
 * Каждый проект имеет владельца и может включать других участников.
 * 
 * СВЯЗИ:
 * - owner_id -> users.id (many:1) - каждый проект принадлежит пользователю
 * - project_members (1:many) - проект может иметь много участников
 * - tasks (1:many) - проект содержит задачи
 * - documents (1:many) - проект может иметь документы
 * - activity_logs (1:many) - все действия в проекте логируются
 */
export interface Project {
  id: string;                   // UUID проекта (первичный ключ)
  title: string;                // Название проекта (обязательное)
  description: string;          // Описание проекта
  color: string;                // Цвет проекта в HEX формате (#3B82F6)
  status: 'active' | 'completed' | 'paused' | 'archived'; // Статус проекта
  owner_id: string;             // ID владельца (foreign key -> users.id)
  created_at: string;           // ISO дата создания
  updated_at: string;           // ISO дата последнего обновления
  last_activity: string;        // ISO дата последней активности в проекте
}

/**
 * УЧАСТНИК ПРОЕКТА (PROJECT_MEMBERS)
 * 
 * Связывает пользователей с проектами и определяет их роли.
 * Каждая запись представляет участие пользователя в конкретном проекте.
 * 
 * СВЯЗИ:
 * - project_id -> projects.id (many:1) - принадлежность к проекту
 * - user_id -> users.id (many:1) - конкретный пользователь
 * 
 * ОГРАНИЧЕНИЯ:
 * - UNIQUE(project_id, user_id) - пользователь не может быть добавлен дважды
 */
export interface ProjectMember {
  id: string;                   // UUID записи (первичный ключ)
  project_id: string;           // ID проекта (foreign key -> projects.id)
  user_id: string;              // ID пользователя (foreign key -> users.id)
  role: 'owner' | 'member' | 'observer'; // Роль в проекте
  joined_at: string;            // ISO дата присоединения к проекту
}

/**
 * ЗАДАЧА (TASKS)
 * 
 * Основная единица работы в проекте. Каждая задача имеет статус,
 * приоритет, исполнителя и может содержать комментарии.
 * 
 * СВЯЗИ:
 * - project_id -> projects.id (many:1) - задача принадлежит проекту
 * - assignee_id -> users.id (many:1) - исполнитель задачи (может быть NULL)
 * - created_by -> users.id (many:1) - создатель задачи
 * - task_comments (1:many) - задача может иметь комментарии
 * 
 * СТАТУСЫ:
 * - todo: К выполнению (холодильник)
 * - inprogress: В работе (сделать)  
 * - inprogress2: В работе 2 (дополнительная колонка)
 * - done: Выполнено
 */
export interface Task {
  id: string;                   // UUID задачи (первичный ключ)
  title: string;                // Название задачи (обязательное)
  description: string;          // Подробное описание задачи
  status: 'todo' | 'inprogress' | 'inprogress2' | 'done'; // Текущий статус
  priority: 'low' | 'medium' | 'high'; // Приоритет выполнения
  category: string;             // Категория (Фронтенд, Бэкенд, Дизайн и т.д.)
  project_id: string;           // ID проекта (foreign key -> projects.id)
  assignee_id?: string;         // ID исполнителя (foreign key -> users.id, может быть NULL)
  created_by: string;           // ID создателя (foreign key -> users.id)
  due_date?: string;            // ISO дата дедлайна (опционально)
  created_at: string;           // ISO дата создания
  updated_at: string;           // ISO дата последнего обновления
}

/**
 * КОММЕНТАРИЙ К ЗАДАЧЕ (TASK_COMMENTS)
 * 
 * Обсуждения, заметки и обновления по конкретной задаче.
 * Позволяет команде общаться в контексте задачи.
 * 
 * СВЯЗИ:
 * - task_id -> tasks.id (many:1) - комментарий относится к задаче
 * - user_id -> users.id (many:1) - автор комментария
 */
export interface TaskComment {
  id: string;                   // UUID комментария (первичный ключ)
  task_id: string;              // ID задачи (foreign key -> tasks.id)
  user_id: string;              // ID автора (foreign key -> users.id)
  content: string;              // Текст комментария (обязательное)
  created_at: string;           // ISO дата создания
  updated_at: string;           // ISO дата последнего редактирования
}

/**
 * ДОКУМЕНТ (DOCUMENTS)
 * 
 * Файлы и документы, связанные с проектом.
 * Могут создаваться на основе шаблонов с подстановкой переменных.
 * 
 * СВЯЗИ:
 * - template_id -> document_templates.id (many:1) - используемый шаблон
 * - project_id -> projects.id (many:1) - проект документа
 * - created_by -> users.id (many:1) - создатель документа
 * 
 * СТАТУСЫ:
 * - draft: Черновик (в работе)
 * - completed: Готов к отправке
 * - sent: Отправлен клиенту/контрагенту
 */
export interface Document {
  id: string;                   // UUID документа (первичный ключ)
  title: string;                // Название документа (обязательное)
  description: string;          // Описание документа
  template_id?: string;         // ID шаблона (foreign key -> document_templates.id)
  project_id: string;           // ID проекта (foreign key -> projects.id)
  created_by: string;           // ID создателя (foreign key -> users.id)
  status: 'draft' | 'completed' | 'sent'; // Статус документа
  counterparty?: any;           // JSON данные контрагента (название, ИНН, адрес и т.д.)
  template_fields?: any;        // JSON значения полей шаблона
  file_url?: string;            // Ссылка на сгенерированный файл (опционально)
  created_at: string;           // ISO дата создания
  updated_at: string;           // ISO дата последнего обновления
}

/**
 * ШАБЛОН ДОКУМЕНТА (DOCUMENT_TEMPLATES)
 * 
 * Заготовки для создания типовых документов (договоры, ТЗ, отчеты).
 * Содержат HTML разметку с переменными для подстановки.
 * 
 * СВЯЗИ:
 * - created_by -> users.id (many:1) - создатель шаблона (для пользовательских)
 * - documents (1:many) - шаблон может использоваться в документах
 * 
 * ТИПЫ:
 * - Системные (is_custom = false) - предустановленные шаблоны
 * - Пользовательские (is_custom = true) - созданные пользователями
 */
export interface DocumentTemplate {
  id: string;                   // UUID шаблона (первичный ключ)
  title: string;                // Название шаблона (обязательное)
  description: string;          // Описание назначения шаблона
  category: string;             // Категория (Договоры, Отчеты, ТЗ и т.д.)
  content: string;              // HTML содержимое с переменными {{variable}}
  fields: any[];                // JSON массив полей для заполнения
  is_custom: boolean;           // true - пользовательский, false - системный
  created_by?: string;          // ID создателя (foreign key -> users.id, только для пользовательских)
  created_at: string;           // ISO дата создания
  updated_at: string;           // ISO дата последнего обновления
}

/**
 * ЛОГ АКТИВНОСТИ (ACTIVITY_LOGS)
 * 
 * История всех действий в проектах для аудита и отчетности.
 * Позволяет отслеживать кто, что и когда делал в системе.
 * 
 * СВЯЗИ:
 * - project_id -> projects.id (many:1) - проект где произошло действие
 * - user_id -> users.id (many:1) - пользователь который выполнил действие
 * - entity_id - ID объекта над которым выполнено действие
 * 
 * ДЕЙСТВИЯ (ACTION):
 * - create: Создание объекта
 * - update: Обновление объекта  
 * - delete: Удаление объекта
 * - comment: Добавление комментария
 * 
 * ТИПЫ ОБЪЕКТОВ (ENTITY_TYPE):
 * - project: Действия с проектами
 * - task: Действия с задачами
 * - document: Действия с документами
 * - member: Действия с участниками
 */
export interface ActivityLog {
  id: string;                   // UUID записи (первичный ключ)
  project_id: string;           // ID проекта (foreign key -> projects.id)
  user_id: string;              // ID пользователя (foreign key -> users.id)
  action: string;               // Тип действия (create, update, delete, comment)
  entity_type: string;          // Тип объекта (task, project, document, member)
  entity_id: string;            // ID объекта над которым выполнено действие
  details: any;                 // JSON детали действия (что именно изменилось)
  created_at: string;           // ISO дата и время действия
}

/**
 * НАСТРОЙКИ ПОЛЬЗОВАТЕЛЯ (USER_SETTINGS)
 * 
 * Персональные настройки и предпочтения каждого пользователя.
 * Сохраняются локально и применяются при входе.
 * 
 * СВЯЗИ:
 * - user_id -> users.id (1:1) - каждый пользователь имеет одни настройки
 */
export interface UserSettings {
  id: string;                   // UUID настроек (первичный ключ)
  user_id: string;              // ID пользователя (foreign key -> users.id, UNIQUE)
  notifications: {              // Настройки уведомлений
    taskUpdates: boolean;        // Уведомления об обновлении задач
    deadlineReminders: boolean;  // Напоминания о дедлайнах
    teamActivity: boolean;       // Активность команды
    emailNotifications: boolean; // Дублирование на email
  };
  appearance: {                 // Настройки внешнего вида
    theme: 'light' | 'dark' | 'system'; // Тема оформления
    language: string;            // Код языка (ru, en, es, fr)
    compactView: boolean;        // Компактный режим интерфейса
  };
  created_at: string;           // ISO дата создания настроек
  updated_at: string;           // ISO дата последнего обновления
}

// ==========================================================================
// КЛАСС УПРАВЛЕНИЯ ЛОКАЛЬНОЙ БАЗОЙ ДАННЫХ
// ==========================================================================

/**
 * ЛОКАЛЬНАЯ БАЗА ДАННЫХ
 * 
 * Единый класс для управления всеми данными в localStorage.
 * Предоставляет CRUD операции для всех сущностей с:
 * - Автоматической генерацией ID и timestamp
 * - Подробным логированием операций
 * - Обработкой ошибок без падения системы
 * - Каскадным удалением связанных данных
 * - Валидацией входных данных
 */
class LocalDatabase {
  
  // --------------------------------------------------------------------------
  // ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ (UTILITIES)
  // --------------------------------------------------------------------------
  
  /**
   * Генерирует ключ для localStorage
   * 
   * @param table - название таблицы
   * @param userId - ID пользователя (опционально, для пользовательских данных)
   * @returns строка ключа вида 'teamhub_table_userId' или 'teamhub_table'
   */
  private getKey(table: string, userId?: string): string {
    return userId ? `teamhub_${table}_${userId}` : `teamhub_${table}`;
  }

  /**
   * Загружает данные из localStorage с обработкой ошибок
   * 
   * @param table - название таблицы
   * @param userId - ID пользователя (опционально)
   * @returns массив данных или пустой массив при ошибке
   */
  private getData<T>(table: string, userId?: string): T[] {
    try {
      const key = this.getKey(table, userId);
      const data = localStorage.getItem(key);
      const result = data ? JSON.parse(data) : [];
      console.log(`📖 DB READ: Загружено из ${table}:`, result.length, 'записей');
      return result;
    } catch (error) {
      console.error(`❌ DB ERROR: Ошибка загрузки ${table}:`, error);
      return [];
    }
  }

  /**
   * Сохраняет данные в localStorage с обработкой ошибок
   * 
   * @param table - название таблицы
   * @param data - массив данных для сохранения
   * @param userId - ID пользователя (опционально)
   */
  private setData<T>(table: string, data: T[], userId?: string): void {
    try {
      const key = this.getKey(table, userId);
      localStorage.setItem(key, JSON.stringify(data));
      console.log(`💾 DB WRITE: Сохранено в ${table}:`, data.length, 'записей');
    } catch (error) {
      console.error(`❌ DB ERROR: Ошибка сохранения ${table}:`, error);
    }
  }

  /**
   * Генерирует текущую дату в ISO формате
   * 
   * @returns строка даты в формате ISO
   */
  private now(): string {
    return new Date().toISOString();
  }

  /**
   * Генерирует уникальный UUID v4
   * 
   * @returns строка UUID
   */
  private generateId(): string {
    return crypto.randomUUID();
  }

  // --------------------------------------------------------------------------
  // УПРАВЛЕНИЕ ПОЛЬЗОВАТЕЛЯМИ (USERS CRUD)
  // --------------------------------------------------------------------------

  /**
   * Получить всех зарегистрированных пользователей
   * 
   * Используется для:
   * - Проверки существования email при регистрации
   * - Поиска пользователей для добавления в проекты
   * - Административных функций
   * 
   * @returns массив всех пользователей
   */
  getUsers(): User[] {
    return this.getData<User>('users');
  }

  /**
   * Создать нового пользователя в системе
   * 
   * Автоматически генерирует:
   * - Уникальный UUID
   * - Текущую дату создания и обновления
   * 
   * @param userData - данные пользователя без служебных полей
   * @returns созданный пользователь с сгенерированными полями
   */
  createUser(userData: Omit<User, 'id' | 'created_at' | 'updated_at'>): User {
    const users = this.getUsers();
    const now = this.now();
    
    // Проверяем уникальность email
    const existingUser = users.find(u => u.email === userData.email);
    if (existingUser) {
      console.warn('⚠️ DB WARNING: Пользователь с таким email уже существует:', userData.email);
      throw new Error('Пользователь с таким email уже зарегистрирован');
    }
    
    const newUser: User = {
      ...userData,
      id: this.generateId(),
      created_at: now,
      updated_at: now
    };
    
    users.push(newUser);
    this.setData('users', users);
    
    console.log('👤 DB CREATE: Создан пользователь:', newUser.email);
    return newUser;
  }

  /**
   * Найти пользователя по email адресу
   * 
   * Используется для:
   * - Авторизации пользователя
   * - Проверки существования при регистрации
   * - Поиска для добавления в проекты
   * 
   * @param email - email адрес для поиска
   * @returns пользователь или undefined если не найден
   */
  getUserByEmail(email: string): User | undefined {
    const user = this.getUsers().find(u => u.email === email);
    console.log('🔍 DB SEARCH: Поиск пользователя по email:', email, user ? '✅ найден' : '❌ не найден');
    return user;
  }

  /**
   * Обновить данные пользователя
   * 
   * Автоматически обновляет поле updated_at.
   * Используется для изменения профиля, настроек и т.д.
   * 
   * @param userId - ID пользователя для обновления
   * @param updates - объект с полями для обновления
   * @returns обновленный пользователь или null если не найден
   */
  updateUser(userId: string, updates: Partial<User>): User | null {
    const users = this.getUsers();
    const index = users.findIndex(u => u.id === userId);
    
    if (index === -1) {
      console.warn('⚠️ DB WARNING: Пользователь для обновления не найден:', userId);
      return null;
    }

    users[index] = { 
      ...users[index], 
      ...updates, 
      updated_at: this.now() 
    };
    
    this.setData('users', users);
    console.log('👤 DB UPDATE: Обновлен пользователь:', userId);
    return users[index];
  }

  // --------------------------------------------------------------------------
  // УПРАВЛЕНИЕ ПРОЕКТАМИ (PROJECTS CRUD)
  // --------------------------------------------------------------------------

  /**
   * Получить все проекты пользователя
   * 
   * Возвращает проекты где пользователь является:
   * - Владельцем (owner_id)
   * - Участником (через project_members)
   * 
   * @param userId - ID пользователя
   * @returns массив проектов пользователя
   */
  getProjects(userId: string): Project[] {
    console.log('📁 DB READ: Загрузка проектов для пользователя:', userId);
    return this.getData<Project>('projects', userId);
  }

  /**
   * Создать новый проект
   * 
   * Автоматически:
   * - Генерирует UUID и timestamp
   * - Добавляет создателя как владельца в project_members
   * - Логирует действие в activity_logs
   * 
   * @param projectData - данные проекта без служебных полей
   * @param userId - ID создателя проекта
   * @returns созданный проект
   */
  createProject(projectData: Omit<Project, 'id' | 'created_at' | 'updated_at' | 'last_activity'>, userId: string): Project {
    const projects = this.getProjects(userId);
    const now = this.now();
    
    const newProject: Project = {
      ...projectData,
      id: this.generateId(),
      created_at: now,
      updated_at: now,
      last_activity: now
    };
    
    projects.push(newProject);
    this.setData('projects', projects, userId);

    // Автоматически добавляем создателя как владельца проекта
    this.createProjectMember({
      project_id: newProject.id,
      user_id: userId,
      role: 'owner'
    }, userId);

    // Логируем создание проекта
    this.logActivity(newProject.id, userId, 'create', 'project', newProject.id, { 
      title: newProject.title 
    });
    
    console.log('📁 DB CREATE: Создан проект:', newProject.title);
    return newProject;
  }

  /**
   * Обновить данные проекта
   * 
   * Обновляет поля updated_at и last_activity.
   * Логирует изменения в activity_logs.
   * 
   * @param projectId - ID проекта для обновления
   * @param updates - объект с полями для обновления
   * @param userId - ID пользователя, выполняющего обновление
   * @returns обновленный проект или null если не найден
   */
  updateProject(projectId: string, updates: Partial<Project>, userId: string): Project | null {
    const projects = this.getProjects(userId);
    const index = projects.findIndex(p => p.id === projectId);
    
    if (index === -1) {
      console.warn('⚠️ DB WARNING: Проект для обновления не найден:', projectId);
      return null;
    }

    const now = this.now();
    projects[index] = { 
      ...projects[index], 
      ...updates, 
      updated_at: now,
      last_activity: now
    };
    
    this.setData('projects', projects, userId);
    this.logActivity(projectId, userId, 'update', 'project', projectId, updates);
    
    console.log('📁 DB UPDATE: Обновлен проект:', projectId);
    return projects[index];
  }

  /**
   * Удалить проект и все связанные данные
   * 
   * Каскадно удаляет:
   * - Всех участников проекта (project_members)
   * - Все задачи проекта (tasks)
   * - Все комментарии к задачам (task_comments)
   * - Все документы проекта (documents)
   * - Все логи активности (activity_logs)
   * 
   * @param projectId - ID проекта для удаления
   * @param userId - ID пользователя, выполняющего удаление
   * @returns true если удален, false если не найден
   */
  deleteProject(projectId: string, userId: string): boolean {
    const projects = this.getProjects(userId);
    const filteredProjects = projects.filter(p => p.id !== projectId);
    
    if (filteredProjects.length === projects.length) {
      console.warn('⚠️ DB WARNING: Проект для удаления не найден:', projectId);
      return false;
    }

    this.setData('projects', filteredProjects, userId);
    
    // Каскадное удаление всех связанных данных
    this.deleteProjectMembers(projectId, userId);
    this.deleteProjectTasks(projectId, userId);
    this.deleteProjectDocuments(projectId, userId);
    this.deleteProjectActivityLogs(projectId, userId);
    
    console.log('🗑️ DB DELETE: Удален проект и все связанные данные:', projectId);
    return true;
  }

  // --------------------------------------------------------------------------
  // УПРАВЛЕНИЕ УЧАСТНИКАМИ ПРОЕКТОВ (PROJECT_MEMBERS CRUD)
  // --------------------------------------------------------------------------

  /**
   * Получить всех участников проектов пользователя
   * 
   * @param userId - ID пользователя
   * @returns массив записей об участии в проектах
   */
  getProjectMembers(userId: string): ProjectMember[] {
    return this.getData<ProjectMember>('project_members', userId);
  }

  /**
   * Добавить участника в проект
   * 
   * Автоматически генерирует ID и дату присоединения.
   * Проверяет, что пользователь еще не является участником.
   * 
   * @param memberData - данные участника без служебных полей
   * @param userId - ID пользователя, выполняющего добавление
   * @returns созданная запись участника
   */
  createProjectMember(memberData: Omit<ProjectMember, 'id' | 'joined_at'>, userId: string): ProjectMember {
    const members = this.getProjectMembers(userId);
    
    // Проверяем, что пользователь еще не является участником проекта
    const existingMember = members.find(m => 
      m.project_id === memberData.project_id && m.user_id === memberData.user_id
    );
    
    if (existingMember) {
      console.warn('⚠️ DB WARNING: Пользователь уже является участником проекта');
      return existingMember;
    }
    
    const newMember: ProjectMember = {
      ...memberData,
      id: this.generateId(),
      joined_at: this.now()
    };
    
    members.push(newMember);
    this.setData('project_members', members, userId);
    
    console.log('👥 DB CREATE: Добавлен участник в проект:', memberData.project_id);
    return newMember;
  }

  /**
   * Удалить всех участников конкретного проекта
   * 
   * Используется при каскадном удалении проекта.
   * 
   * @param projectId - ID проекта
   * @param userId - ID пользователя
   */
  deleteProjectMembers(projectId: string, userId: string): void {
    const members = this.getProjectMembers(userId);
    const filteredMembers = members.filter(m => m.project_id !== projectId);
    this.setData('project_members', filteredMembers, userId);
    console.log('👥 DB DELETE: Удалены участники проекта:', projectId);
  }

  // --------------------------------------------------------------------------
  // УПРАВЛЕНИЕ ЗАДАЧАМИ (TASKS CRUD)
  // --------------------------------------------------------------------------

  /**
   * Получить все задачи пользователя
   * 
   * Включает задачи где пользователь является:
   * - Создателем (created_by)
   * - Исполнителем (assignee_id)
   * - Участником проекта
   * 
   * @param userId - ID пользователя
   * @returns массив всех задач пользователя
   */
  getTasks(userId: string): Task[] {
    console.log('📋 DB READ: Загрузка задач для пользователя:', userId);
    return this.getData<Task>('tasks', userId);
  }

  /**
   * Получить задачи конкретного проекта
   * 
   * Фильтрует все задачи пользователя по project_id.
   * 
   * @param projectId - ID проекта
   * @param userId - ID пользователя
   * @returns массив задач проекта
   */
  getTasksByProject(projectId: string, userId: string): Task[] {
    const tasks = this.getTasks(userId).filter(t => t.project_id === projectId);
    console.log('📋 DB FILTER: Задачи проекта', projectId, ':', tasks.length);
    return tasks;
  }

  /**
   * Создать новую задачу
   * 
   * Автоматически:
   * - Генерирует UUID и timestamp
   * - Логирует создание в activity_logs
   * - Устанавливает статус по умолчанию
   * 
   * @param taskData - данные задачи без служебных полей
   * @param userId - ID создателя задачи
   * @returns созданная задача
   */
  createTask(taskData: Omit<Task, 'id' | 'created_at' | 'updated_at'>, userId: string): Task {
    const tasks = this.getTasks(userId);
    const now = this.now();
    
    const newTask: Task = {
      ...taskData,
      id: this.generateId(),
      created_at: now,
      updated_at: now
    };
    
    tasks.push(newTask);
    this.setData('tasks', tasks, userId);
    
    // Логируем создание задачи
    this.logActivity(taskData.project_id, userId, 'create', 'task', newTask.id, { 
      title: newTask.title,
      status: newTask.status,
      priority: newTask.priority
    });
    
    console.log('📋 DB CREATE: Создана задача:', newTask.title);
    return newTask;
  }

  /**
   * Обновить задачу
   * 
   * Обновляет поле updated_at и логирует изменения.
   * Отслеживает изменения статуса для аналитики.
   * 
   * @param taskId - ID задачи для обновления
   * @param updates - объект с полями для обновления
   * @param userId - ID пользователя, выполняющего обновление
   * @returns обновленная задача или null если не найдена
   */
  updateTask(taskId: string, updates: Partial<Task>, userId: string): Task | null {
    const tasks = this.getTasks(userId);
    const index = tasks.findIndex(t => t.id === taskId);
    
    if (index === -1) {
      console.warn('⚠️ DB WARNING: Задача для обновления не найдена:', taskId);
      return null;
    }

    const oldTask = { ...tasks[index] };
    tasks[index] = { 
      ...tasks[index], 
      ...updates, 
      updated_at: this.now() 
    };
    
    this.setData('tasks', tasks, userId);
    
    // Логируем изменения с деталями что именно изменилось
    const changes: any = {};
    Object.keys(updates).forEach(key => {
      if (oldTask[key as keyof Task] !== updates[key as keyof Task]) {
        changes[key] = {
          from: oldTask[key as keyof Task],
          to: updates[key as keyof Task]
        };
      }
    });
    
    this.logActivity(tasks[index].project_id, userId, 'update', 'task', taskId, changes);
    
    console.log('📋 DB UPDATE: Обновлена задача:', taskId, 'изменения:', Object.keys(changes));
    return tasks[index];
  }

  /**
   * Удалить задачу и все связанные комментарии
   * 
   * Каскадно удаляет все комментарии к задаче.
   * 
   * @param taskId - ID задачи для удаления
   * @param userId - ID пользователя, выполняющего удаление
   * @returns true если удалена, false если не найдена
   */
  deleteTask(taskId: string, userId: string): boolean {
    const tasks = this.getTasks(userId);
    const task = tasks.find(t => t.id === taskId);
    
    if (!task) {
      console.warn('⚠️ DB WARNING: Задача для удаления не найдена:', taskId);
      return false;
    }

    const filteredTasks = tasks.filter(t => t.id !== taskId);
    this.setData('tasks', filteredTasks, userId);
    
    // Каскадное удаление комментариев к задаче
    this.deleteTaskComments(taskId, userId);
    
    // Логируем удаление
    this.logActivity(task.project_id, userId, 'delete', 'task', taskId, { 
      title: task.title 
    });
    
    console.log('🗑️ DB DELETE: Удалена задача:', taskId);
    return true;
  }

  /**
   * Удалить все задачи конкретного проекта
   * 
   * Используется при каскадном удалении проекта.
   * Также удаляет все комментарии к задачам.
   * 
   * @param projectId - ID проекта
   * @param userId - ID пользователя
   */
  deleteProjectTasks(projectId: string, userId: string): void {
    const tasks = this.getTasks(userId);
    const projectTasks = tasks.filter(t => t.project_id === projectId);
    
    // Удаляем комментарии ко всем задачам проекта
    projectTasks.forEach(task => {
      this.deleteTaskComments(task.id, userId);
    });
    
    const filteredTasks = tasks.filter(t => t.project_id !== projectId);
    this.setData('tasks', filteredTasks, userId);
    console.log('📋 DB DELETE: Удалены задачи проекта:', projectId, 'количество:', projectTasks.length);
  }

  // --------------------------------------------------------------------------
  // УПРАВЛЕНИЕ КОММЕНТАРИЯМИ (TASK_COMMENTS CRUD)
  // --------------------------------------------------------------------------

  /**
   * Получить все комментарии пользователя
   * 
   * @param userId - ID пользователя
   * @returns массив комментариев пользователя
   */
  getTaskComments(userId: string): TaskComment[] {
    return this.getData<TaskComment>('task_comments', userId);
  }

  /**
   * Получить комментарии конкретной задачи
   * 
   * @param taskId - ID задачи
   * @param userId - ID пользователя
   * @returns массив комментариев к задаче, отсортированный по дате
   */
  getCommentsByTask(taskId: string, userId: string): TaskComment[] {
    const comments = this.getTaskComments(userId)
      .filter(c => c.task_id === taskId)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    
    console.log('💬 DB FILTER: Комментарии к задаче', taskId, ':', comments.length);
    return comments;
  }

  /**
   * Создать комментарий к задаче
   * 
   * Автоматически генерирует ID и timestamp.
   * Логирует действие в activity_logs.
   * 
   * @param commentData - данные комментария без служебных полей
   * @param userId - ID автора комментария
   * @returns созданный комментарий
   */
  createTaskComment(commentData: Omit<TaskComment, 'id' | 'created_at' | 'updated_at'>, userId: string): TaskComment {
    const comments = this.getTaskComments(userId);
    const now = this.now();
    
    const newComment: TaskComment = {
      ...commentData,
      id: this.generateId(),
      created_at: now,
      updated_at: now
    };
    
    comments.push(newComment);
    this.setData('task_comments', comments, userId);
    
    // Находим задачу для логирования в правильный проект
    const task = this.getTasks(userId).find(t => t.id === commentData.task_id);
    if (task) {
      this.logActivity(task.project_id, userId, 'comment', 'task', commentData.task_id, { 
        content: commentData.content,
        comment_id: newComment.id
      });
    }
    
    console.log('💬 DB CREATE: Создан комментарий к задаче:', commentData.task_id);
    return newComment;
  }

  /**
   * Удалить все комментарии конкретной задачи
   * 
   * Используется при каскадном удалении задачи.
   * 
   * @param taskId - ID задачи
   * @param userId - ID пользователя
   */
  deleteTaskComments(taskId: string, userId: string): void {
    const comments = this.getTaskComments(userId);
    const taskComments = comments.filter(c => c.task_id === taskId);
    const filteredComments = comments.filter(c => c.task_id !== taskId);
    
    this.setData('task_comments', filteredComments, userId);
    console.log('💬 DB DELETE: Удалены комментарии задачи:', taskId, 'количество:', taskComments.length);
  }

  // --------------------------------------------------------------------------
  // УПРАВЛЕНИЕ ДОКУМЕНТАМИ (DOCUMENTS CRUD)
  // --------------------------------------------------------------------------

  /**
   * Получить все документы пользователя
   * 
   * @param userId - ID пользователя
   * @returns массив документов пользователя
   */
  getDocuments(userId: string): Document[] {
    console.log('📄 DB READ: Загрузка документов для пользователя:', userId);
    return this.getData<Document>('documents', userId);
  }

  /**
   * Создать новый документ
   * 
   * Автоматически генерирует ID и timestamp.
   * Логирует создание в activity_logs.
   * 
   * @param documentData - данные документа без служебных полей
   * @param userId - ID создателя документа
   * @returns созданный документ
   */
  createDocument(documentData: Omit<Document, 'id' | 'created_at' | 'updated_at'>, userId: string): Document {
    const documents = this.getDocuments(userId);
    const now = this.now();
    
    const newDocument: Document = {
      ...documentData,
      id: this.generateId(),
      created_at: now,
      updated_at: now
    };
    
    documents.push(newDocument);
    this.setData('documents', documents, userId);
    
    this.logActivity(documentData.project_id, userId, 'create', 'document', newDocument.id, { 
      title: newDocument.title,
      template_id: newDocument.template_id
    });
    
    console.log('📄 DB CREATE: Создан документ:', newDocument.title);
    return newDocument;
  }

  /**
   * Обновить документ
   * 
   * Обновляет поле updated_at и логирует изменения.
   * 
   * @param documentId - ID документа для обновления
   * @param updates - объект с полями для обновления
   * @param userId - ID пользователя, выполняющего обновление
   * @returns обновленный документ или null если не найден
   */
  updateDocument(documentId: string, updates: Partial<Document>, userId: string): Document | null {
    const documents = this.getDocuments(userId);
    const index = documents.findIndex(d => d.id === documentId);
    
    if (index === -1) {
      console.warn('⚠️ DB WARNING: Документ для обновления не найден:', documentId);
      return null;
    }

    documents[index] = { 
      ...documents[index], 
      ...updates, 
      updated_at: this.now() 
    };
    
    this.setData('documents', documents, userId);
    this.logActivity(documents[index].project_id, userId, 'update', 'document', documentId, updates);
    
    console.log('📄 DB UPDATE: Обновлен документ:', documentId);
    return documents[index];
  }

  /**
   * Удалить документ
   * 
   * @param documentId - ID документа для удаления
   * @param userId - ID пользователя, выполняющего удаление
   * @returns true если удален, false если не найден
   */
  deleteDocument(documentId: string, userId: string): boolean {
    const documents = this.getDocuments(userId);
    const document = documents.find(d => d.id === documentId);
    
    if (!document) {
      console.warn('⚠️ DB WARNING: Документ для удаления не найден:', documentId);
      return false;
    }

    const filteredDocuments = documents.filter(d => d.id !== documentId);
    this.setData('documents', filteredDocuments, userId);
    
    this.logActivity(document.project_id, userId, 'delete', 'document', documentId, { 
      title: document.title 
    });
    
    console.log('🗑️ DB DELETE: Удален документ:', documentId);
    return true;
  }

  /**
   * Удалить все документы конкретного проекта
   * 
   * Используется при каскадном удалении проекта.
   * 
   * @param projectId - ID проекта
   * @param userId - ID пользователя
   */
  deleteProjectDocuments(projectId: string, userId: string): void {
    const documents = this.getDocuments(userId);
    const projectDocuments = documents.filter(d => d.project_id === projectId);
    const filteredDocuments = documents.filter(d => d.project_id !== projectId);
    
    this.setData('documents', filteredDocuments, userId);
    console.log('📄 DB DELETE: Удалены документы проекта:', projectId, 'количество:', projectDocuments.length);
  }

  // --------------------------------------------------------------------------
  // УПРАВЛЕНИЕ ШАБЛОНАМИ ДОКУМЕНТОВ (DOCUMENT_TEMPLATES CRUD)
  // --------------------------------------------------------------------------

  /**
   * Получить все шаблоны документов
   * 
   * Возвращает как системные, так и пользовательские шаблоны.
   * Шаблоны хранятся глобально (без привязки к пользователю).
   * 
   * @returns массив всех шаблонов
   */
  getDocumentTemplates(): DocumentTemplate[] {
    const templates = this.getData<DocumentTemplate>('document_templates');
    console.log('📋 DB READ: Загружено шаблонов документов:', templates.length);
    return templates;
  }

  /**
   * Создать новый шаблон документа
   * 
   * Может создавать как системные, так и пользовательские шаблоны.
   * Автоматически генерирует ID и timestamp.
   * 
   * @param templateData - данные шаблона без служебных полей
   * @returns созданный шаблон
   */
  createDocumentTemplate(templateData: Omit<DocumentTemplate, 'id' | 'created_at' | 'updated_at'>): DocumentTemplate {
    const templates = this.getDocumentTemplates();
    const now = this.now();
    
    const newTemplate: DocumentTemplate = {
      ...templateData,
      id: this.generateId(),
      created_at: now,
      updated_at: now
    };
    
    templates.push(newTemplate);
    this.setData('document_templates', templates);
    
    console.log('📋 DB CREATE: Создан шаблон документа:', newTemplate.title);
    return newTemplate;
  }

  // --------------------------------------------------------------------------
  // УПРАВЛЕНИЕ НАСТРОЙКАМИ ПОЛЬЗОВАТЕЛЯ (USER_SETTINGS CRUD)
  // --------------------------------------------------------------------------

  /**
   * Получить настройки пользователя
   * 
   * @param userId - ID пользователя
   * @returns настройки пользователя или null если не созданы
   */
  getUserSettings(userId: string): UserSettings | null {
    const settings = this.getData<UserSettings>('user_settings', userId);
    const userSettings = settings.length > 0 ? settings[0] : null;
    console.log('⚙️ DB READ: Настройки пользователя:', userId, userSettings ? '✅ найдены' : '❌ не найдены');
    return userSettings;
  }

  /**
   * Создать настройки пользователя по умолчанию
   * 
   * Создает базовые настройки если они еще не существуют.
   * Вызывается автоматически при первом входе пользователя.
   * 
   * @param userId - ID пользователя
   * @returns созданные настройки
   */
  createUserSettings(userId: string): UserSettings {
    const existing = this.getUserSettings(userId);
    if (existing) {
      console.log('⚙️ DB INFO: Настройки пользователя уже существуют:', userId);
      return existing;
    }

    const newSettings: UserSettings = {
      id: this.generateId(),
      user_id: userId,
      notifications: {
        taskUpdates: true,         // Включены по умолчанию
        deadlineReminders: true,   // Включены по умолчанию
        teamActivity: false,       // Выключены чтобы не спамить
        emailNotifications: true   // Включены если есть email
      },
      appearance: {
        theme: 'light',            // Светлая тема по умолчанию
        language: 'ru',           // Русский язык
        compactView: false        // Обычный вид
      },
      created_at: this.now(),
      updated_at: this.now()
    };

    this.setData('user_settings', [newSettings], userId);
    console.log('⚙️ DB CREATE: Созданы настройки пользователя:', userId);
    return newSettings;
  }

  /**
   * Обновить настройки пользователя
   * 
   * Если настройки не существуют, создает их автоматически.
   * 
   * @param userId - ID пользователя
   * @param updates - объект с настройками для обновления
   * @returns обновленные настройки
   */
  updateUserSettings(userId: string, updates: Partial<UserSettings>): UserSettings | null {
    const settings = this.getUserSettings(userId) || this.createUserSettings(userId);
    
    const updatedSettings = { 
      ...settings, 
      ...updates, 
      updated_at: this.now() 
    };
    
    this.setData('user_settings', [updatedSettings], userId);
    console.log('⚙️ DB UPDATE: Обновлены настройки пользователя:', userId);
    return updatedSettings;
  }

  // --------------------------------------------------------------------------
  // ЛОГИРОВАНИЕ АКТИВНОСТИ (ACTIVITY_LOGS)
  // --------------------------------------------------------------------------

  /**
   * Получить логи активности пользователя
   * 
   * @param userId - ID пользователя
   * @returns массив логов активности
   */
  getActivityLogs(userId: string): ActivityLog[] {
    return this.getData<ActivityLog>('activity_logs', userId);
  }

  /**
   * Записать действие в лог активности
   * 
   * Все важные действия в системе автоматически логируются:
   * - Создание/обновление/удаление проектов, задач, документов
   * - Добавление комментариев
   * - Изменение участников проектов
   * 
   * @param projectId - ID проекта где произошло действие
   * @param userId - ID пользователя который выполнил действие
   * @param action - тип действия (create, update, delete, comment)
   * @param entityType - тип объекта (project, task, document, member)
   * @param entityId - ID объекта над которым выполнено действие
   * @param details - детали действия (что именно изменилось)
   */
  logActivity(
    projectId: string, 
    userId: string, 
    action: string, 
    entityType: string, 
    entityId: string, 
    details: any
  ): void {
    const logs = this.getActivityLogs(userId);
    
    const newLog: ActivityLog = {
      id: this.generateId(),
      project_id: projectId,
      user_id: userId,
      action,
      entity_type: entityType,
      entity_id: entityId,
      details,
      created_at: this.now()
    };
    
    logs.push(newLog);
    this.setData('activity_logs', logs, userId);
    
    console.log(`📊 DB LOG: ${action} ${entityType}`, details);
  }

  /**
   * Удалить все логи активности конкретного проекта
   * 
   * Используется при каскадном удалении проекта.
   * 
   * @param projectId - ID проекта
   * @param userId - ID пользователя
   */
  deleteProjectActivityLogs(projectId: string, userId: string): void {
    const logs = this.getActivityLogs(userId);
    const projectLogs = logs.filter(l => l.project_id === projectId);
    const filteredLogs = logs.filter(l => l.project_id !== projectId);
    
    this.setData('activity_logs', filteredLogs, userId);
    console.log('📊 DB DELETE: Удалены логи проекта:', projectId, 'количество:', projectLogs.length);
  }

  // --------------------------------------------------------------------------
  // ИНИЦИАЛИЗАЦИЯ И УПРАВЛЕНИЕ СИСТЕМОЙ
  // --------------------------------------------------------------------------

  /**
   * Инициализировать базовые шаблоны документов
   * 
   * Создает стандартные шаблоны при первом запуске:
   * - Договор на разработку ПО
   * - Техническое задание
   * - Акт выполненных работ
   * - Счет на оплату
   * 
   * Вызывается автоматически при загрузке системы.
   */
  initializeDefaultTemplates(): void {
    const existing = this.getDocumentTemplates();
    if (existing.length > 0) {
      console.log('📋 DB INFO: Шаблоны уже инициализированы, количество:', existing.length);
      return;
    }

    console.log('📋 DB INIT: Создание базовых шаблонов документов...');

    const defaultTemplates = [
      {
        title: 'Договор на разработку',
        description: 'Стандартный договор на разработку программного обеспечения',
        category: 'Договоры',
        content: `ДОГОВОР НА РАЗРАБОТКУ ПРОГРАММНОГО ОБЕСПЕЧЕНИЯ

№ {{contractNumber}} от {{contractDate}}

Заказчик: {{counterparty.name}}
ИНН: {{counterparty.inn}}
Адрес: {{counterparty.address}}

Предмет договора: Разработка программного обеспечения
Стоимость: {{projectCost}} рублей
Срок выполнения: до {{deadline}}

1. ПРЕДМЕТ ДОГОВОРА
Исполнитель обязуется разработать программное обеспечение согласно техническому заданию.

2. СТОИМОСТЬ И ПОРЯДОК РАСЧЕТОВ
Общая стоимость работ составляет {{projectCost}} рублей.

3. СРОКИ ВЫПОЛНЕНИЯ
Срок выполнения работ: до {{deadline}}.`,
        fields: [
          { id: '1', name: 'contractNumber', label: 'Номер договора', type: 'text', required: true },
          { id: '2', name: 'contractDate', label: 'Дата договора', type: 'date', required: true },
          { id: '3', name: 'projectCost', label: 'Стоимость проекта', type: 'number', required: true },
          { id: '4', name: 'deadline', label: 'Срок выполнения', type: 'date', required: true }
        ],
        is_custom: false
      },
      {
        title: 'Техническое задание',
        description: 'Шаблон технического задания на разработку',
        category: 'Техническая документация',
        content: `ТЕХНИЧЕСКОЕ ЗАДАНИЕ

Проект: {{projectName}}
Заказчик: {{counterparty.name}}
Дата: {{currentDate}}

1. ОПИСАНИЕ ПРОЕКТА
{{projectDescription}}

2. ТЕХНИЧЕСКИЕ ТРЕБОВАНИЯ
Технологический стек: {{techStack}}
Платформа: {{platform}}

3. ФУНКЦИОНАЛЬНЫЕ ТРЕБОВАНИЯ
{{functionalRequirements}}

4. ДИЗАЙН И ПОЛЬЗОВАТЕЛЬСКИЙ ИНТЕРФЕЙС
{{designRequirements}}

5. СРОКИ И ЭТАПЫ РАЗРАБОТКИ
{{timeline}}`,
        fields: [
          { id: '1', name: 'projectName', label: 'Название проекта', type: 'text', required: true },
          { id: '2', name: 'projectDescription', label: 'Описание проекта', type: 'textarea', required: true },
          { id: '3', name: 'techStack', label: 'Технологический стек', type: 'select', required: true, options: ['React + Node.js', 'Vue + Laravel', 'Angular + .NET', 'Flutter + Firebase'] },
          { id: '4', name: 'platform', label: 'Платформа', type: 'select', required: true, options: ['Web', 'Mobile', 'Desktop', 'Веб + Мобильное'] },
          { id: '5', name: 'functionalRequirements', label: 'Функциональные требования', type: 'textarea', required: true },
          { id: '6', name: 'designRequirements', label: 'Требования к дизайну', type: 'textarea', required: false },
          { id: '7', name: 'timeline', label: 'Временные рамки', type: 'textarea', required: true }
        ],
        is_custom: false
      },
      {
        title: 'Акт выполненных работ',
        description: 'Акт приемки выполненных работ',
        category: 'Отчетность',
        content: `АКТ ВЫПОЛНЕННЫХ РАБОТ

№ {{actNumber}} от {{currentDate}}

Исполнитель: {{ourCompany}}
Заказчик: {{counterparty.name}}

Период выполнения работ: {{workPeriod}}

ВЫПОЛНЕННЫЕ РАБОТЫ:
{{workDescription}}

РЕЗУЛЬТАТЫ:
{{results}}

Общая стоимость выполненных работ: {{amount}} рублей

Работы выполнены в полном объеме и в срок.
Заказчик претензий к качеству и объему работ не имеет.

Исполнитель: ________________
Заказчик: ________________`,
        fields: [
          { id: '1', name: 'actNumber', label: 'Номер акта', type: 'text', required: true },
          { id: '2', name: 'ourCompany', label: 'Наша компания', type: 'text', required: true },
          { id: '3', name: 'workPeriod', label: 'Период выполнения работ', type: 'text', required: true, placeholder: 'например: январь 2024' },
          { id: '4', name: 'workDescription', label: 'Описание выполненных работ', type: 'textarea', required: true },
          { id: '5', name: 'results', label: 'Результаты работ', type: 'textarea', required: true },
          { id: '6', name: 'amount', label: 'Сумма', type: 'number', required: true }
        ],
        is_custom: false
      },
      {
        title: 'Счет на оплату',
        description: 'Счет для выставления заказчику',
        category: 'Финансы',
        content: `СЧЕТ НА ОПЛАТУ

№ {{invoiceNumber}} от {{currentDate}}

Плательщик: {{counterparty.name}}
ИНН: {{counterparty.inn}}
Адрес: {{counterparty.address}}

Получатель: {{ourCompany}}
ИНН: {{ourInn}}
Банк: {{bankName}}
Расчетный счет: {{bankAccount}}

НАИМЕНОВАНИЕ РАБОТ/УСЛУГ:
{{serviceDescription}}

К оплате: {{amount}} рублей
НДС: {{vatAmount}} рублей ({{vatRate}}%)
Итого к оплате: {{totalAmount}} рублей

Срок оплаты: {{paymentTerms}} дней с даты выставления счета

Назначение платежа: {{paymentPurpose}}`,
        fields: [
          { id: '1', name: 'invoiceNumber', label: 'Номер счета', type: 'text', required: true },
          { id: '2', name: 'ourCompany', label: 'Наша компания', type: 'text', required: true },
          { id: '3', name: 'ourInn', label: 'Наш ИНН', type: 'text', required: true },
          { id: '4', name: 'bankName', label: 'Банк', type: 'text', required: true },
          { id: '5', name: 'bankAccount', label: 'Расчетный счет', type: 'text', required: true },
          { id: '6', name: 'serviceDescription', label: 'Описание услуг', type: 'textarea', required: true },
          { id: '7', name: 'amount', label: 'Сумма без НДС', type: 'number', required: true },
          { id: '8', name: 'vatRate', label: 'Ставка НДС (%)', type: 'number', required: true, defaultValue: '20' },
          { id: '9', name: 'vatAmount', label: 'Сумма НДС', type: 'number', required: true },
          { id: '10', name: 'totalAmount', label: 'Итого к оплате', type: 'number', required: true },
          { id: '11', name: 'paymentTerms', label: 'Срок оплаты (дней)', type: 'number', required: true, defaultValue: '10' },
          { id: '12', name: 'paymentPurpose', label: 'Назначение платежа', type: 'text', required: true }
        ],
        is_custom: false
      }
    ];

    // Создаем каждый шаблон
    defaultTemplates.forEach(template => {
      this.createDocumentTemplate(template);
    });
    
    console.log('📋 DB INIT: Инициализированы базовые шаблоны документов:', defaultTemplates.length);
  }

  /**
   * Полная очистка всех данных пользователя
   * 
   * Удаляет ВСЕ данные пользователя из localStorage:
   * - Проекты и участие в проектах
   * - Задачи и комментарии
   * - Документы
   * - Логи активности
   * - Настройки пользователя
   * 
   * Используется при выходе из системы или удалении аккаунта.
   * 
   * @param userId - ID пользователя для очистки данных
   */
  clearUserData(userId: string): void {
    console.log('🧹 DB CLEAR: Начало очистки данных пользователя:', userId);
    
    const tables = [
      'projects',        // Проекты пользователя
      'project_members', // Участие в проектах
      'tasks',          // Задачи
      'task_comments',  // Комментарии к задачам
      'documents',      // Документы
      'activity_logs',  // Логи активности
      'user_settings'   // Настройки пользователя
    ];
    
    let clearedTables = 0;
    tables.forEach(table => {
      const key = this.getKey(table, userId);
      const existed = localStorage.getItem(key) !== null;
      localStorage.removeItem(key);
      if (existed) {
        clearedTables++;
        console.log(`🧹 DB CLEAR: Очищена таблица ${table}`);
      }
    });
    
    console.log('🧹 DB CLEAR: Завершена очистка данных пользователя:', userId, 'очищено таблиц:', clearedTables);
  }

  /**
   * Экспорт всех данных пользователя для резервного копирования
   * 
   * Создает полный дамп всех данных пользователя в JSON формате.
   * Может использоваться для:
   * - Резервного копирования
   * - Миграции между устройствами
   * - Отладки и анализа данных
   * 
   * @param userId - ID пользователя
   * @returns объект со всеми данными пользователя
   */
  exportAllUserData(userId: string): any {
    console.log('📦 DB EXPORT: Начало экспорта данных пользователя:', userId);
    
    const data = {
      // Основные данные
      projects: this.getProjects(userId),
      tasks: this.getTasks(userId),
      documents: this.getDocuments(userId),
      
      // Связанные данные
      projectMembers: this.getProjectMembers(userId),
      taskComments: this.getTaskComments(userId),
      activityLogs: this.getActivityLogs(userId),
      
      // Настройки
      userSettings: this.getUserSettings(userId),
      
      // Метаданные экспорта
      exportDate: this.now(),
      exportVersion: '1.0.0',
      userId: userId
    };
    
    const totalRecords = Object.values(data)
      .filter(Array.isArray)
      .reduce((sum: number, arr: any[]) => sum + arr.length, 0);
    
    console.log('📦 DB EXPORT: Экспорт завершен для пользователя:', userId, 'всего записей:', totalRecords);
    return data;
  }

  /**
   * Импорт данных пользователя из резервной копии
   * 
   * Восстанавливает все данные пользователя из экспортированного JSON.
   * ВНИМАНИЕ: Перезаписывает существующие данные!
   * 
   * @param data - объект с данными для импорта
   * @param userId - ID пользователя
   * @returns количество импортированных записей
   */
  importUserData(data: any, userId: string): number {
    console.log('📥 DB IMPORT: Начало импорта данных для пользователя:', userId);
    
    let importedRecords = 0;
    
    // Импортируем каждую таблицу
    if (data.projects && Array.isArray(data.projects)) {
      this.setData('projects', data.projects, userId);
      importedRecords += data.projects.length;
      console.log('📥 DB IMPORT: Импортированы проекты:', data.projects.length);
    }
    
    if (data.tasks && Array.isArray(data.tasks)) {
      this.setData('tasks', data.tasks, userId);
      importedRecords += data.tasks.length;
      console.log('📥 DB IMPORT: Импортированы задачи:', data.tasks.length);
    }
    
    if (data.documents && Array.isArray(data.documents)) {
      this.setData('documents', data.documents, userId);
      importedRecords += data.documents.length;
      console.log('📥 DB IMPORT: Импортированы документы:', data.documents.length);
    }
    
    if (data.projectMembers && Array.isArray(data.projectMembers)) {
      this.setData('project_members', data.projectMembers, userId);
      importedRecords += data.projectMembers.length;
      console.log('📥 DB IMPORT: Импортированы участники проектов:', data.projectMembers.length);
    }
    
    if (data.taskComments && Array.isArray(data.taskComments)) {
      this.setData('task_comments', data.taskComments, userId);
      importedRecords += data.taskComments.length;
      console.log('📥 DB IMPORT: Импортированы комментарии:', data.taskComments.length);
    }
    
    if (data.activityLogs && Array.isArray(data.activityLogs)) {
      this.setData('activity_logs', data.activityLogs, userId);
      importedRecords += data.activityLogs.length;
      console.log('📥 DB IMPORT: Импортированы логи активности:', data.activityLogs.length);
    }
    
    if (data.userSettings) {
      this.setData('user_settings', [data.userSettings], userId);
      importedRecords += 1;
      console.log('📥 DB IMPORT: Импортированы настройки пользователя');
    }
    
    console.log('📥 DB IMPORT: Импорт завершен для пользователя:', userId, 'всего записей:', importedRecords);
    return importedRecords;
  }

  /**
   * Получение статистики базы данных
   * 
   * Возвращает информацию о размере и состоянии базы данных.
   * Полезно для отладки и мониторинга.
   * 
   * @param userId - ID пользователя (опционально, для статистики пользователя)
   * @returns объект со статистикой
   */
  getDatabaseStats(userId?: string): any {
    if (userId) {
      // Статистика конкретного пользователя
      const stats = {
        userId,
        projects: this.getProjects(userId).length,
        tasks: this.getTasks(userId).length,
        documents: this.getDocuments(userId).length,
        taskComments: this.getTaskComments(userId).length,
        activityLogs: this.getActivityLogs(userId).length,
        hasSettings: !!this.getUserSettings(userId)
      };
      
      console.log('📊 DB STATS: Статистика пользователя:', userId, stats);
      return stats;
    } else {
      // Глобальная статистика
      const stats = {
        totalUsers: this.getUsers().length,
        totalTemplates: this.getDocumentTemplates().length,
        storageKeys: Object.keys(localStorage).filter(key => key.startsWith('teamhub_')).length
      };
      
      console.log('📊 DB STATS: Глобальная статистика:', stats);
      return stats;
    }
  }
}

// ==========================================================================
// ЭКСПОРТ И ИНИЦИАЛИЗАЦИЯ БАЗЫ ДАННЫХ
// ==========================================================================

/**
 * Единственный экземпляр локальной базы данных
 * 
 * Используется во всем приложении как единая точка доступа к данным.
 * Автоматически инициализирует базовые шаблоны при первом запуске.
 */
export const db = new LocalDatabase();

/**
 * Автоматическая инициализация базовых данных
 * 
 * При первой загрузке приложения создаются:
 * - Базовые шаблоны документов
 * - Структура таблиц
 * 
 * Вызывается один раз при импорте модуля.
 */
db.initializeDefaultTemplates();

console.log('🚀 TEAMHUB DATABASE: Локальная база данных инициализирована и готова к работе');
console.log('📊 Доступные методы:', Object.getOwnPropertyNames(LocalDatabase.prototype).filter(name => name !== 'constructor'));