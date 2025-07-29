// Локальная база данных для управления всеми данными
export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  role: string;
  organization_name?: string;
  organization_inn?: string;
  organization_address?: string;
  organization_phone?: string;
  organization_email?: string;
  organization_director?: string;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  color: string;
  status: 'active' | 'completed' | 'paused' | 'archived';
  owner_id: string;
  created_at: string;
  updated_at: string;
  last_activity: string;
}

export interface ProjectMember {
  id: string;
  project_id: string;
  user_id: string;
  role: 'owner' | 'member' | 'observer';
  joined_at: string;
}

export interface ProjectInvitation {
  id: string;
  project_id: string;
  inviter_id: string;
  invitee_email: string;
  role: 'member' | 'observer';
  status: 'pending' | 'accepted' | 'rejected';
  message?: string;
  created_at: string;
  expires_at: string;
}

export interface UserSettings {
  id: string;
  user_id: string;
  notifications: {
    taskUpdates: boolean;
    deadlineReminders: boolean;
    teamActivity: boolean;
    emailNotifications: boolean;
    telegramNotifications: boolean;
  };
  appearance: {
    theme: 'light' | 'dark' | 'system';
    language: string;
    compactView: boolean;
  };
  telegram: {
    username?: string;
    chat_id?: string;
    connected: boolean;
  };
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'inprogress' | 'inprogress2' | 'done';
  priority: 'low' | 'medium' | 'high';
  category: string;
  project_id: string;
  assignee_id?: string;
  created_by: string;
  due_date?: string;
  created_at: string;
  updated_at: string;
}

export interface TaskComment {
  id: string;
  task_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface Document {
  id: string;
  title: string;
  description: string;
  template_id?: string;
  project_id: string;
  created_by: string;
  status: 'draft' | 'completed' | 'sent';
  counterparty?: any;
  template_fields?: any;
  file_url?: string;
  created_at: string;
  updated_at: string;
}

export interface DocumentTemplate {
  id: string;
  title: string;
  description: string;
  category: string;
  content: string;
  fields: any[];
  is_custom: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface ActivityLog {
  id: string;
  project_id: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  details: any;
  created_at: string;
}

class LocalDatabase {
  private getKey(table: string, userId?: string): string {
    return userId ? `hermes_${table}_${userId}` : `hermes_${table}`;
  }

  private getData<T>(table: string, userId?: string): T[] {
    try {
      const key = this.getKey(table, userId);
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error(`Error loading ${table}:`, error);
      return [];
    }
  }

  private setData<T>(table: string, data: T[], userId?: string): void {
    try {
      const key = this.getKey(table, userId);
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error(`Error saving ${table}:`, error);
    }
  }

  // Project Invitations
  getProjectInvitations(userId: string): ProjectInvitation[] {
    return this.getData<ProjectInvitation>('project_invitations', userId);
  }

  createProjectInvitation(invitation: Omit<ProjectInvitation, 'id' | 'created_at' | 'expires_at'>, userId: string): ProjectInvitation {
    const invitations = this.getProjectInvitations(userId);
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days
    
    const newInvitation: ProjectInvitation = {
      ...invitation,
      id: crypto.randomUUID(),
      created_at: now.toISOString(),
      expires_at: expiresAt.toISOString()
    };
    
    invitations.push(newInvitation);
    this.setData('project_invitations', invitations, userId);
    return newInvitation;
  }

  updateProjectInvitation(invitationId: string, updates: Partial<ProjectInvitation>, userId: string): ProjectInvitation | null {
    const invitations = this.getProjectInvitations(userId);
    const index = invitations.findIndex(i => i.id === invitationId);
    if (index === -1) return null;

    invitations[index] = { ...invitations[index], ...updates };
    this.setData('project_invitations', invitations, userId);
    return invitations[index];
  }

  // User Settings
  getUserSettings(userId: string): UserSettings | null {
    const settings = this.getData<UserSettings>('user_settings', userId);
    return settings.length > 0 ? settings[0] : null;
  }

  createUserSettings(userId: string): UserSettings {
    const settings = this.getData<UserSettings>('user_settings', userId);
    if (settings.length > 0) return settings[0];

    const newSettings: UserSettings = {
      id: crypto.randomUUID(),
      user_id: userId,
      notifications: {
        taskUpdates: true,
        deadlineReminders: true,
        teamActivity: false,
        emailNotifications: true,
        telegramNotifications: false
      },
      appearance: {
        theme: 'light',
        language: 'ru',
        compactView: false
      },
      telegram: {
        connected: false
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    this.setData('user_settings', [newSettings], userId);
    return newSettings;
  }

  updateUserSettings(userId: string, updates: Partial<UserSettings>): UserSettings | null {
    const settings = this.getUserSettings(userId) || this.createUserSettings(userId);
    const updatedSettings = { 
      ...settings, 
      ...updates, 
      updated_at: new Date().toISOString() 
    };
    
    this.setData('user_settings', [updatedSettings], userId);
    return updatedSettings;
  }

  // Users
  getUsers(): User[] {
    return this.getData<User>('users');
  }

  createUser(user: Omit<User, 'id' | 'created_at' | 'updated_at'>): User {
    const users = this.getUsers();
    const now = new Date().toISOString();
    const newUser: User = {
      ...user,
      id: crypto.randomUUID(),
      created_at: now,
      updated_at: now
    };
    users.push(newUser);
    this.setData('users', users);
    return newUser;
  }

  getUserByEmail(email: string): User | undefined {
    return this.getUsers().find(u => u.email === email);
  }

  updateUser(userId: string, updates: Partial<User>): User | null {
    const users = this.getUsers();
    const index = users.findIndex(u => u.id === userId);
    if (index === -1) return null;

    users[index] = { ...users[index], ...updates, updated_at: new Date().toISOString() };
    this.setData('users', users);
    return users[index];
  }

  // Projects
  getProjects(userId: string): Project[] {
    return this.getData<Project>('projects', userId);
  }

  createProject(project: Omit<Project, 'id' | 'created_at' | 'updated_at' | 'last_activity'>, userId: string): Project {
    const projects = this.getProjects(userId);
    const now = new Date().toISOString();
    const newProject: Project = {
      ...project,
      id: crypto.randomUUID(),
      created_at: now,
      updated_at: now,
      last_activity: now
    };
    projects.push(newProject);
    this.setData('projects', projects, userId);

    // Создаем участника проекта (владелец)
    this.createProjectMember({
      project_id: newProject.id,
      user_id: userId,
      role: 'owner'
    }, userId);

    this.logActivity(newProject.id, userId, 'create', 'project', newProject.id, { title: newProject.title });
    return newProject;
  }

  updateProject(projectId: string, updates: Partial<Project>, userId: string): Project | null {
    const projects = this.getProjects(userId);
    const index = projects.findIndex(p => p.id === projectId);
    if (index === -1) return null;

    projects[index] = { 
      ...projects[index], 
      ...updates, 
      updated_at: new Date().toISOString(),
      last_activity: new Date().toISOString()
    };
    this.setData('projects', projects, userId);
    this.logActivity(projectId, userId, 'update', 'project', projectId, updates);
    return projects[index];
  }

  deleteProject(projectId: string, userId: string): boolean {
    const projects = this.getProjects(userId);
    const filteredProjects = projects.filter(p => p.id !== projectId);
    if (filteredProjects.length === projects.length) return false;

    this.setData('projects', filteredProjects, userId);
    
    // Удаляем связанные данные
    this.deleteProjectMembers(projectId, userId);
    this.deleteProjectTasks(projectId, userId);
    this.deleteProjectDocuments(projectId, userId);
    
    return true;
  }

  // Project Members
  getProjectMembers(userId: string): ProjectMember[] {
    return this.getData<ProjectMember>('project_members', userId);
  }

  createProjectMember(member: Omit<ProjectMember, 'id' | 'joined_at'>, userId: string): ProjectMember {
    const members = this.getProjectMembers(userId);
    const newMember: ProjectMember = {
      ...member,
      id: crypto.randomUUID(),
      joined_at: new Date().toISOString()
    };
    members.push(newMember);
    this.setData('project_members', members, userId);
    return newMember;
  }

  deleteProjectMembers(projectId: string, userId: string): void {
    const members = this.getProjectMembers(userId);
    const filteredMembers = members.filter(m => m.project_id !== projectId);
    this.setData('project_members', filteredMembers, userId);
  }

  // Tasks
  getTasks(userId: string): Task[] {
    return this.getData<Task>('tasks', userId);
  }

  getTasksByProject(projectId: string, userId: string): Task[] {
    return this.getTasks(userId).filter(t => t.project_id === projectId);
  }

  createTask(task: Omit<Task, 'id' | 'created_at' | 'updated_at'>, userId: string): Task {
    const tasks = this.getTasks(userId);
    const now = new Date().toISOString();
    const newTask: Task = {
      ...task,
      id: crypto.randomUUID(),
      created_at: now,
      updated_at: now
    };
    tasks.push(newTask);
    this.setData('tasks', tasks, userId);
    this.logActivity(task.project_id, userId, 'create', 'task', newTask.id, { title: newTask.title });
    return newTask;
  }

  updateTask(taskId: string, updates: Partial<Task>, userId: string): Task | null {
    const tasks = this.getTasks(userId);
    const index = tasks.findIndex(t => t.id === taskId);
    if (index === -1) return null;

    tasks[index] = { ...tasks[index], ...updates, updated_at: new Date().toISOString() };
    this.setData('tasks', tasks, userId);
    this.logActivity(tasks[index].project_id, userId, 'update', 'task', taskId, updates);
    return tasks[index];
  }

  deleteTask(taskId: string, userId: string): boolean {
    const tasks = this.getTasks(userId);
    const task = tasks.find(t => t.id === taskId);
    if (!task) return false;

    const filteredTasks = tasks.filter(t => t.id !== taskId);
    this.setData('tasks', filteredTasks, userId);
    this.deleteTaskComments(taskId, userId);
    this.logActivity(task.project_id, userId, 'delete', 'task', taskId, { title: task.title });
    return true;
  }

  deleteProjectTasks(projectId: string, userId: string): void {
    const tasks = this.getTasks(userId);
    const filteredTasks = tasks.filter(t => t.project_id !== projectId);
    this.setData('tasks', filteredTasks, userId);
  }

  // Task Comments
  getTaskComments(userId: string): TaskComment[] {
    return this.getData<TaskComment>('task_comments', userId);
  }

  getCommentsByTask(taskId: string, userId: string): TaskComment[] {
    return this.getTaskComments(userId).filter(c => c.task_id === taskId);
  }

  createTaskComment(comment: Omit<TaskComment, 'id' | 'created_at' | 'updated_at'>, userId: string): TaskComment {
    const comments = this.getTaskComments(userId);
    const now = new Date().toISOString();
    const newComment: TaskComment = {
      ...comment,
      id: crypto.randomUUID(),
      created_at: now,
      updated_at: now
    };
    comments.push(newComment);
    this.setData('task_comments', comments, userId);
    
    // Находим задачу для логирования
    const task = this.getTasks(userId).find(t => t.id === comment.task_id);
    if (task) {
      this.logActivity(task.project_id, userId, 'comment', 'task', comment.task_id, { content: comment.content });
    }
    
    return newComment;
  }

  deleteTaskComments(taskId: string, userId: string): void {
    const comments = this.getTaskComments(userId);
    const filteredComments = comments.filter(c => c.task_id !== taskId);
    this.setData('task_comments', filteredComments, userId);
  }

  // Documents
  getDocuments(userId: string): Document[] {
    return this.getData<Document>('documents', userId);
  }

  createDocument(document: Omit<Document, 'id' | 'created_at' | 'updated_at'>, userId: string): Document {
    const documents = this.getDocuments(userId);
    const now = new Date().toISOString();
    const newDocument: Document = {
      ...document,
      id: crypto.randomUUID(),
      created_at: now,
      updated_at: now
    };
    documents.push(newDocument);
    this.setData('documents', documents, userId);
    this.logActivity(document.project_id, userId, 'create', 'document', newDocument.id, { title: newDocument.title });
    return newDocument;
  }

  updateDocument(documentId: string, updates: Partial<Document>, userId: string): Document | null {
    const documents = this.getDocuments(userId);
    const index = documents.findIndex(d => d.id === documentId);
    if (index === -1) return null;

    documents[index] = { ...documents[index], ...updates, updated_at: new Date().toISOString() };
    this.setData('documents', documents, userId);
    this.logActivity(documents[index].project_id, userId, 'update', 'document', documentId, updates);
    return documents[index];
  }

  deleteDocument(documentId: string, userId: string): boolean {
    const documents = this.getDocuments(userId);
    const document = documents.find(d => d.id === documentId);
    if (!document) return false;

    const filteredDocuments = documents.filter(d => d.id !== documentId);
    this.setData('documents', filteredDocuments, userId);
    this.logActivity(document.project_id, userId, 'delete', 'document', documentId, { title: document.title });
    return true;
  }

  deleteProjectDocuments(projectId: string, userId: string): void {
    const documents = this.getDocuments(userId);
    const filteredDocuments = documents.filter(d => d.project_id !== projectId);
    this.setData('documents', filteredDocuments, userId);
  }

  // Document Templates
  getDocumentTemplates(): DocumentTemplate[] {
    return this.getData<DocumentTemplate>('document_templates');
  }

  createDocumentTemplate(template: Omit<DocumentTemplate, 'id' | 'created_at' | 'updated_at'>): DocumentTemplate {
    const templates = this.getDocumentTemplates();
    const now = new Date().toISOString();
    const newTemplate: DocumentTemplate = {
      ...template,
      id: crypto.randomUUID(),
      created_at: now,
      updated_at: now
    };
    templates.push(newTemplate);
    this.setData('document_templates', templates);
    return newTemplate;
  }

  // Activity Logs
  getActivityLogs(userId: string): ActivityLog[] {
    return this.getData<ActivityLog>('activity_logs', userId);
  }

  logActivity(projectId: string, userId: string, action: string, entityType: string, entityId: string, details: any): void {
    const logs = this.getActivityLogs(userId);
    const newLog: ActivityLog = {
      id: crypto.randomUUID(),
      project_id: projectId,
      user_id: userId,
      action,
      entity_type: entityType,
      entity_id: entityId,
      details,
      created_at: new Date().toISOString()
    };
    logs.push(newLog);
    this.setData('activity_logs', logs, userId);
  }

  // Initialize default templates
  initializeDefaultTemplates(): void {
    const existing = this.getDocumentTemplates();
    if (existing.length > 0) return;

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
  }

  // Clear user data (for logout)
  clearUserData(userId: string): void {
    const tables = ['projects', 'project_members', 'tasks', 'task_comments', 'documents', 'activity_logs', 'user_settings', 'project_invitations'];
    tables.forEach(table => {
      localStorage.removeItem(this.getKey(table, userId));
    });
  }

  // Get all user data for export
  getAllUserData(userId: string): any {
    return {
      projects: this.getProjects(userId),
      tasks: this.getTasks(userId),
      documents: this.getDocuments(userId),
      projectMembers: this.getProjectMembers(userId),
      taskComments: this.getTaskComments(userId),
      activityLogs: this.getActivityLogs(userId),
      userSettings: this.getUserSettings(userId),
      projectInvitations: this.getProjectInvitations(userId)
    };
  }
}

export const db = new LocalDatabase();

// Initialize default templates on first load
db.initializeDefaultTemplates();