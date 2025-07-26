/**
 * ЛОКАЛЬНАЯ БАЗА ДАННЫХ ДЛЯ TEAMHUB
 * 
 * Эта система управляет всеми данными приложения в localStorage браузера.
 * Каждая таблица имеет четкую структуру и назначение.
 * 
 * АРХИТЕКТУРА:
 * - Все данные хранятся в localStorage с префиксом 'teamhub_'
 * - Каждый пользователь имеет изолированные данные
 * - UUID используется для всех ID
 * - Автоматические timestamps для created_at/updated_at
 */

// ============================================================================
// ТИПЫ ДАННЫХ (СХЕМА БАЗЫ ДАННЫХ)
// ============================================================================

/**
 * ПОЛЬЗОВАТЕЛЬ
 * Основная сущность - человек, работающий в системе
 */
export interface User {
  id: string;                    // UUID пользователя
  email: string;                 // Email для входа (уникальный)
  full_name: string;            // Отображаемое имя
  avatar_url?: string;          // Ссылка на аватар (опционально)
  role: 'owner' | 'admin' | 'member'; // Глобальная роль в системе
  created_at: string;           // Дата регистрации (ISO string)
  updated_at: string;           // Дата последнего обновления
}

/**
 * ПРОЕКТ
 * Контейнер для задач и участников
 */
export interface Project {
  id: string;                   // UUID проекта
  title: string;                // Название проекта
  description: string;          // Описание проекта
  color: string;                // Цвет проекта (hex код)
  status: 'active' | 'completed' | 'paused' | 'archived'; // Статус проекта
  owner_id: string;             // ID владельца проекта
  created_at: string;           // Дата создания
  updated_at: string;           // Дата обновления
  last_activity: string;        // Дата последней активности
}

/**
 * УЧАСТНИК ПРОЕКТА
 * Связь между пользователем и проектом с ролью
 */
export interface ProjectMember {
  id: string;                   // UUID записи
  project_id: string;           // ID проекта
  user_id: string;              // ID пользователя
  role: 'owner' | 'member' | 'observer'; // Роль в проекте
  joined_at: string;            // Дата присоединения
}

/**
 * ЗАДАЧА
 * Основная единица работы в проекте
 */
export interface Task {
  id: string;                   // UUID задачи
  title: string;                // Название задачи
  description: string;          // Подробное описание
  status: 'todo' | 'inprogress' | 'inprogress2' | 'done'; // Статус выполнения
  priority: 'low' | 'medium' | 'high'; // Приоритет
  category: string;             // Категория (Фронтенд, Бэкенд, и т.д.)
  project_id: string;           // ID проекта
  assignee_id?: string;         // ID исполнителя (опционально)
  created_by: string;           // ID создателя
  due_date?: string;            // Дедлайн (ISO string, опционально)
  created_at: string;           // Дата создания
  updated_at: string;           // Дата обновления
}

/**
 * КОММЕНТАРИЙ К ЗАДАЧЕ
 * Обсуждение и заметки по задаче
 */
export interface TaskComment {
  id: string;                   // UUID комментария
  task_id: string;              // ID задачи
  user_id: string;              // ID автора комментария
  content: string;              // Текст комментария
  created_at: string;           // Дата создания
  updated_at: string;           // Дата обновления
}

/**
 * ДОКУМЕНТ
 * Файлы и документы проекта
 */
export interface Document {
  id: string;                   // UUID документа
  title: string;                // Название документа
  description: string;          // Описание документа
  template_id?: string;         // ID шаблона (опционально)
  project_id: string;           // ID проекта
  created_by: string;           // ID создателя
  status: 'draft' | 'completed' | 'sent'; // Статус документа
  counterparty?: any;           // Данные контрагента (JSON)
  template_fields?: any;        // Поля шаблона (JSON)
  file_url?: string;            // Ссылка на файл (опционально)
  created_at: string;           // Дата создания
  updated_at: string;           // Дата обновления
}

/**
 * ШАБЛОН ДОКУМЕНТА
 * Заготовки для создания документов
 */
export interface DocumentTemplate {
  id: string;                   // UUID шаблона
  title: string;                // Название шаблона
  description: string;          // Описание шаблона
  category: string;             // Категория (Договоры, Отчеты, и т.д.)
  content: string;              // HTML содержимое шаблона
  fields: any[];                // Динамические поля (JSON массив)
  is_custom: boolean;           // Пользовательский или системный
  created_by?: string;          // ID создателя (для пользовательских)
  created_at: string;           // Дата создания
  updated_at: string;           // Дата обновления
}

/**
 * ЛОГ АКТИВНОСТИ
 * История действий в проекте
 */
export interface ActivityLog {
  id: string;                   // UUID записи
  project_id: string;           // ID проекта
  user_id: string;              // ID пользователя
  action: string;               // Действие (create, update, delete, comment)
  entity_type: string;          // Тип сущности (task, project, document)
  entity_id: string;            // ID сущности
  details: any;                 // Детали действия (JSON)
  created_at: string;           // Дата действия
}

/**
 * НАСТРОЙКИ ПОЛЬЗОВАТЕЛЯ
 * Персональные настройки и предпочтения
 */
export interface UserSettings {
  id: string;                   // UUID настроек
  user_id: string;              // ID пользователя
  notifications: {              // Настройки уведомлений
    taskUpdates: boolean;
    deadlineReminders: boolean;
    teamActivity: boolean;
    emailNotifications: boolean;
  };
  appearance: {                 // Настройки внешнего вида
    theme: 'light' | 'dark' | 'system';
    language: string;
    compactView: boolean;
  };
  created_at: string;           // Дата создания
  updated_at: string;           // Дата обновления
}

// ============================================================================
// КЛАСС УПРАВЛЕНИЯ БАЗОЙ ДАННЫХ
// ============================================================================

/**
 * ЛОКАЛЬНАЯ БАЗА ДАННЫХ
 * 
 * Управляет всеми операциями с данными в localStorage.
 * Каждый метод четко документирован и имеет единую логику.
 */
class LocalDatabase {
  
  // --------------------------------------------------------------------------
  // ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ
  // --------------------------------------------------------------------------
  
  /**
   * Генерирует ключ для localStorage
   * Формат: teamhub_{таблица}_{userId}
   */
  private getKey(table: string, userId?: string): string {
    return userId ? `teamhub_${table}_${userId}` : `teamhub_${table}`;
  }

  /**
   * Загружает данные из localStorage
   * Возвращает пустой массив при ошибке
   */
  private getData<T>(table: string, userId?: string): T[] {
    try {
      const key = this.getKey(table, userId);
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error(`❌ Ошибка загрузки ${table}:`, error);
      return [];
    }
  }

  /**
   * Сохраняет данные в localStorage
   * Логирует ошибки без прерывания работы
   */
  private setData<T>(table: string, data: T[], userId?: string): void {
    try {
      const key = this.getKey(table, userId);
      localStorage.setItem(key, JSON.stringify(data));
      console.log(`✅ Сохранено в ${table}:`, data.length, 'записей');
    } catch (error) {
      console.error(`❌ Ошибка сохранения ${table}:`, error);
    }
  }

  /**
   * Генерирует текущую дату в ISO формате
   */
  private now(): string {
    return new Date().toISOString();
  }

  /**
   * Генерирует уникальный UUID
   */
  private generateId(): string {
    return crypto.randomUUID();
  }

  // --------------------------------------------------------------------------
  // УПРАВЛЕНИЕ ПОЛЬЗОВАТЕЛЯМИ
  // --------------------------------------------------------------------------

  /**
   * Получить всех пользователей
   */
  getUsers(): User[] {
    return this.getData<User>('users');
  }

  /**
   * Создать нового пользователя
   */
  createUser(userData: Omit<User, 'id' | 'created_at' | 'updated_at'>): User {
    const users = this.getUsers();
    const now = this.now();
    
    const newUser: User = {
      ...userData,
      id: this.generateId(),
      created_at: now,
      updated_at: now
    };
    
    users.push(newUser);
    this.setData('users', users);
    
    console.log('👤 Создан пользователь:', newUser.email);
    return newUser;
  }

  /**
   * Найти пользователя по email
   */
  getUserByEmail(email: string): User | undefined {
    return this.getUsers().find(u => u.email === email);
  }

  /**
   * Обновить данные пользователя
   */
  updateUser(userId: string, updates: Partial<User>): User | null {
    const users = this.getUsers();
    const index = users.findIndex(u => u.id === userId);
    
    if (index === -1) {
      console.warn('⚠️ Пользователь не найден:', userId);
      return null;
    }

    users[index] = { 
      ...users[index], 
      ...updates, 
      updated_at: this.now() 
    };
    
    this.setData('users', users);
    console.log('👤 Обновлен пользователь:', userId);
    return users[index];
  }

  // --------------------------------------------------------------------------
  // УПРАВЛЕНИЕ ПРОЕКТАМИ
  // --------------------------------------------------------------------------

  /**
   * Получить проекты пользователя
   */
  getProjects(userId: string): Project[] {
    return this.getData<Project>('projects', userId);
  }

  /**
   * Создать новый проект
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

    // Автоматически добавляем создателя как владельца
    this.createProjectMember({
      project_id: newProject.id,
      user_id: userId,
      role: 'owner'
    }, userId);

    this.logActivity(newProject.id, userId, 'create', 'project', newProject.id, { 
      title: newProject.title 
    });
    
    console.log('📁 Создан проект:', newProject.title);
    return newProject;
  }

  /**
   * Обновить проект
   */
  updateProject(projectId: string, updates: Partial<Project>, userId: string): Project | null {
    const projects = this.getProjects(userId);
    const index = projects.findIndex(p => p.id === projectId);
    
    if (index === -1) {
      console.warn('⚠️ Проект не найден:', projectId);
      return null;
    }

    projects[index] = { 
      ...projects[index], 
      ...updates, 
      updated_at: this.now(),
      last_activity: this.now()
    };
    
    this.setData('projects', projects, userId);
    this.logActivity(projectId, userId, 'update', 'project', projectId, updates);
    
    console.log('📁 Обновлен проект:', projectId);
    return projects[index];
  }

  /**
   * Удалить проект и все связанные данные
   */
  deleteProject(projectId: string, userId: string): boolean {
    const projects = this.getProjects(userId);
    const filteredProjects = projects.filter(p => p.id !== projectId);
    
    if (filteredProjects.length === projects.length) {
      console.warn('⚠️ Проект для удаления не найден:', projectId);
      return false;
    }

    this.setData('projects', filteredProjects, userId);
    
    // Удаляем связанные данные
    this.deleteProjectMembers(projectId, userId);
    this.deleteProjectTasks(projectId, userId);
    this.deleteProjectDocuments(projectId, userId);
    
    console.log('🗑️ Удален проект:', projectId);
    return true;
  }

  // --------------------------------------------------------------------------
  // УПРАВЛЕНИЕ УЧАСТНИКАМИ ПРОЕКТОВ
  // --------------------------------------------------------------------------

  /**
   * Получить участников проектов пользователя
   */
  getProjectMembers(userId: string): ProjectMember[] {
    return this.getData<ProjectMember>('project_members', userId);
  }

  /**
   * Добавить участника в проект
   */
  createProjectMember(memberData: Omit<ProjectMember, 'id' | 'joined_at'>, userId: string): ProjectMember {
    const members = this.getProjectMembers(userId);
    
    const newMember: ProjectMember = {
      ...memberData,
      id: this.generateId(),
      joined_at: this.now()
    };
    
    members.push(newMember);
    this.setData('project_members', members, userId);
    
    console.log('👥 Добавлен участник в проект:', memberData.project_id);
    return newMember;
  }

  /**
   * Удалить всех участников проекта
   */
  deleteProjectMembers(projectId: string, userId: string): void {
    const members = this.getProjectMembers(userId);
    const filteredMembers = members.filter(m => m.project_id !== projectId);
    this.setData('project_members', filteredMembers, userId);
    console.log('👥 Удалены участники проекта:', projectId);
  }

  // --------------------------------------------------------------------------
  // УПРАВЛЕНИЕ ЗАДАЧАМИ
  // --------------------------------------------------------------------------

  /**
   * Получить все задачи пользователя
   */
  getTasks(userId: string): Task[] {
    return this.getData<Task>('tasks', userId);
  }

  /**
   * Получить задачи конкретного проекта
   */
  getTasksByProject(projectId: string, userId: string): Task[] {
    return this.getTasks(userId).filter(t => t.project_id === projectId);
  }

  /**
   * Создать новую задачу
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
    
    this.logActivity(taskData.project_id, userId, 'create', 'task', newTask.id, { 
      title: newTask.title 
    });
    
    console.log('📋 Создана задача:', newTask.title);
    return newTask;
  }

  /**
   * Обновить задачу
   */
  updateTask(taskId: string, updates: Partial<Task>, userId: string): Task | null {
    const tasks = this.getTasks(userId);
    const index = tasks.findIndex(t => t.id === taskId);
    
    if (index === -1) {
      console.warn('⚠️ Задача не найдена:', taskId);
      return null;
    }

    tasks[index] = { 
      ...tasks[index], 
      ...updates, 
      updated_at: this.now() 
    };
    
    this.setData('tasks', tasks, userId);
    this.logActivity(tasks[index].project_id, userId, 'update', 'task', taskId, updates);
    
    console.log('📋 Обновлена задача:', taskId);
    return tasks[index];
  }

  /**
   * Удалить задачу
   */
  deleteTask(taskId: string, userId: string): boolean {
    const tasks = this.getTasks(userId);
    const task = tasks.find(t => t.id === taskId);
    
    if (!task) {
      console.warn('⚠️ Задача для удаления не найдена:', taskId);
      return false;
    }

    const filteredTasks = tasks.filter(t => t.id !== taskId);
    this.setData('tasks', filteredTasks, userId);
    
    this.deleteTaskComments(taskId, userId);
    this.logActivity(task.project_id, userId, 'delete', 'task', taskId, { 
      title: task.title 
    });
    
    console.log('🗑️ Удалена задача:', taskId);
    return true;
  }

  /**
   * Удалить все задачи проекта
   */
  deleteProjectTasks(projectId: string, userId: string): void {
    const tasks = this.getTasks(userId);
    const filteredTasks = tasks.filter(t => t.project_id !== projectId);
    this.setData('tasks', filteredTasks, userId);
    console.log('📋 Удалены задачи проекта:', projectId);
  }

  // --------------------------------------------------------------------------
  // УПРАВЛЕНИЕ КОММЕНТАРИЯМИ
  // --------------------------------------------------------------------------

  /**
   * Получить все комментарии пользователя
   */
  getTaskComments(userId: string): TaskComment[] {
    return this.getData<TaskComment>('task_comments', userId);
  }

  /**
   * Получить комментарии конкретной задачи
   */
  getCommentsByTask(taskId: string, userId: string): TaskComment[] {
    return this.getTaskComments(userId).filter(c => c.task_id === taskId);
  }

  /**
   * Создать комментарий к задаче
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
    
    // Логируем активность
    const task = this.getTasks(userId).find(t => t.id === commentData.task_id);
    if (task) {
      this.logActivity(task.project_id, userId, 'comment', 'task', commentData.task_id, { 
        content: commentData.content 
      });
    }
    
    console.log('💬 Создан комментарий к задаче:', commentData.task_id);
    return newComment;
  }

  /**
   * Удалить все комментарии задачи
   */
  deleteTaskComments(taskId: string, userId: string): void {
    const comments = this.getTaskComments(userId);
    const filteredComments = comments.filter(c => c.task_id !== taskId);
    this.setData('task_comments', filteredComments, userId);
    console.log('💬 Удалены комментарии задачи:', taskId);
  }

  // --------------------------------------------------------------------------
  // УПРАВЛЕНИЕ ДОКУМЕНТАМИ
  // --------------------------------------------------------------------------

  /**
   * Получить документы пользователя
   */
  getDocuments(userId: string): Document[] {
    return this.getData<Document>('documents', userId);
  }

  /**
   * Создать новый документ
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
      title: newDocument.title 
    });
    
    console.log('📄 Создан документ:', newDocument.title);
    return newDocument;
  }

  /**
   * Обновить документ
   */
  updateDocument(documentId: string, updates: Partial<Document>, userId: string): Document | null {
    const documents = this.getDocuments(userId);
    const index = documents.findIndex(d => d.id === documentId);
    
    if (index === -1) {
      console.warn('⚠️ Документ не найден:', documentId);
      return null;
    }

    documents[index] = { 
      ...documents[index], 
      ...updates, 
      updated_at: this.now() 
    };
    
    this.setData('documents', documents, userId);
    this.logActivity(documents[index].project_id, userId, 'update', 'document', documentId, updates);
    
    console.log('📄 Обновлен документ:', documentId);
    return documents[index];
  }

  /**
   * Удалить документ
   */
  deleteDocument(documentId: string, userId: string): boolean {
    const documents = this.getDocuments(userId);
    const document = documents.find(d => d.id === documentId);
    
    if (!document) {
      console.warn('⚠️ Документ для удаления не найден:', documentId);
      return false;
    }

    const filteredDocuments = documents.filter(d => d.id !== documentId);
    this.setData('documents', filteredDocuments, userId);
    
    this.logActivity(document.project_id, userId, 'delete', 'document', documentId, { 
      title: document.title 
    });
    
    console.log('🗑️ Удален документ:', documentId);
    return true;
  }

  /**
   * Удалить все документы проекта
   */
  deleteProjectDocuments(projectId: string, userId: string): void {
    const documents = this.getDocuments(userId);
    const filteredDocuments = documents.filter(d => d.project_id !== projectId);
    this.setData('documents', filteredDocuments, userId);
    console.log('📄 Удалены документы проекта:', projectId);
  }

  // --------------------------------------------------------------------------
  // УПРАВЛЕНИЕ ШАБЛОНАМИ ДОКУМЕНТОВ
  // --------------------------------------------------------------------------

  /**
   * Получить все шаблоны документов (глобальные)
   */
  getDocumentTemplates(): DocumentTemplate[] {
    return this.getData<DocumentTemplate>('document_templates');
  }

  /**
   * Создать новый шаблон документа
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
    
    console.log('📋 Создан шаблон документа:', newTemplate.title);
    return newTemplate;
  }

  // --------------------------------------------------------------------------
  // УПРАВЛЕНИЕ НАСТРОЙКАМИ ПОЛЬЗОВАТЕЛЯ
  // --------------------------------------------------------------------------

  /**
   * Получить настройки пользователя
   */
  getUserSettings(userId: string): UserSettings | null {
    const settings = this.getData<UserSettings>('user_settings', userId);
    return settings.length > 0 ? settings[0] : null;
  }

  /**
   * Создать настройки пользователя по умолчанию
   */
  createUserSettings(userId: string): UserSettings {
    const existing = this.getUserSettings(userId);
    if (existing) return existing;

    const newSettings: UserSettings = {
      id: this.generateId(),
      user_id: userId,
      notifications: {
        taskUpdates: true,
        deadlineReminders: true,
        teamActivity: false,
        emailNotifications: true
      },
      appearance: {
        theme: 'light',
        language: 'ru',
        compactView: false
      },
      created_at: this.now(),
      updated_at: this.now()
    };

    this.setData('user_settings', [newSettings], userId);
    console.log('⚙️ Созданы настройки пользователя:', userId);
    return newSettings;
  }

  /**
   * Обновить настройки пользователя
   */
  updateUserSettings(userId: string, updates: Partial<UserSettings>): UserSettings | null {
    const settings = this.getUserSettings(userId) || this.createUserSettings(userId);
    
    const updatedSettings = { 
      ...settings, 
      ...updates, 
      updated_at: this.now() 
    };
    
    this.setData('user_settings', [updatedSettings], userId);
    console.log('⚙️ Обновлены настройки пользователя:', userId);
    return updatedSettings;
  }

  // --------------------------------------------------------------------------
  // ЛОГИРОВАНИЕ АКТИВНОСТИ
  // --------------------------------------------------------------------------

  /**
   * Получить логи активности пользователя
   */
  getActivityLogs(userId: string): ActivityLog[] {
    return this.getData<ActivityLog>('activity_logs', userId);
  }

  /**
   * Записать действие в лог активности
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
    
    console.log(`📊 Лог активности: ${action} ${entityType}`, details);
  }

  // --------------------------------------------------------------------------
  // ИНИЦИАЛИЗАЦИЯ И ОЧИСТКА
  // --------------------------------------------------------------------------

  /**
   * Инициализировать базовые шаблоны документов
   * Вызывается один раз при первом запуске
   */
  initializeDefaultTemplates(): void {
    const existing = this.getDocumentTemplates();
    if (existing.length > 0) {
      console.log('📋 Шаблоны уже инициализированы');
      return;
    }

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
Срок выполнения: до {{deadline}}`,
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

1. ОПИСАНИЕ ПРОЕКТА
{{projectDescription}}

2. ТЕХНИЧЕСКИЕ ТРЕБОВАНИЯ
Технологический стек: {{techStack}}

3. ФУНКЦИОНАЛЬНЫЕ ТРЕБОВАНИЯ
[Детальное описание функций]`,
        fields: [
          { id: '1', name: 'projectName', label: 'Название проекта', type: 'text', required: true },
          { id: '2', name: 'projectDescription', label: 'Описание проекта', type: 'textarea', required: true },
          { id: '3', name: 'techStack', label: 'Технологический стек', type: 'select', required: true, options: ['React + Node.js', 'Vue + Laravel', 'Angular + .NET'] }
        ],
        is_custom: false
      }
    ];

    defaultTemplates.forEach(template => {
      this.createDocumentTemplate(template);
    });
    
    console.log('📋 Инициализированы базовые шаблоны документов');
  }

  /**
   * Очистить все данные пользователя
   * Используется при выходе из системы
   */
  clearUserData(userId: string): void {
    const tables = [
      'projects', 
      'project_members', 
      'tasks', 
      'task_comments', 
      'documents', 
      'activity_logs', 
      'user_settings'
    ];
    
    tables.forEach(table => {
      localStorage.removeItem(this.getKey(table, userId));
    });
    
    console.log('🧹 Очищены данные пользователя:', userId);
  }

  /**
   * Экспортировать все данные пользователя
   * Для резервного копирования
   */
  getAllUserData(userId: string): any {
    const data = {
      projects: this.getProjects(userId),
      tasks: this.getTasks(userId),
      documents: this.getDocuments(userId),
      projectMembers: this.getProjectMembers(userId),
      taskComments: this.getTaskComments(userId),
      activityLogs: this.getActivityLogs(userId),
      userSettings: this.getUserSettings(userId),
      exportDate: this.now()
    };
    
    console.log('📦 Экспорт данных пользователя:', userId, 'записей:', Object.values(data).flat().length);
    return data;
  }
}

// ============================================================================
// ЭКСПОРТ И ИНИЦИАЛИЗАЦИЯ
// ============================================================================

/**
 * Единственный экземпляр базы данных
 * Используется во всем приложении
 */
export const db = new LocalDatabase();

/**
 * Инициализация базовых данных при первом запуске
 */
db.initializeDefaultTemplates();

console.log('🚀 Локальная база данных TeamHub инициализирована');