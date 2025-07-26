import { useState, useEffect } from 'react';
import { Project } from '../types/Project';
import { db } from '../lib/database';
import { useAuth } from './useAuth';

export interface ProjectWithStats extends Project {
  membersCount: number;
  tasksCount: number;
  completedTasks: number;
  progress: number;
  owner: {
    name: string;
    avatar?: string;
  };
  members: Array<{
    id: string;
    name: string;
    avatar?: string;
  }>;
}

export const useProjects = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<ProjectWithStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadProjects();
    }
  }, [user]);

  const loadProjects = () => {
    if (!user) {
      setProjects([]);
      setLoading(false);
      return;
    }

    try {
      const dbProjects = db.getProjects(user.id);
      const projectsWithStats: ProjectWithStats[] = dbProjects.map(project => {
        const tasks = db.getTasksByProject(project.id, user.id);
        const completedTasks = tasks.filter(t => t.status === 'done').length;
        const progress = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

        return {
          ...project,
          role: 'owner' as const, // Упрощаем для демо
          createdAt: new Date(project.created_at),
          updatedAt: new Date(project.updated_at),
          lastActivity: new Date(project.last_activity),
          hasNotifications: false,
          membersCount: 1,
          tasksCount: tasks.length,
          completedTasks,
          progress,
          color: project.color,
          owner: {
            name: user.full_name,
            avatar: user.avatar_url
          },
          members: [{
            id: user.id,
            name: user.full_name,
            avatar: user.avatar_url
          }]
        };
      });

      setProjects(projectsWithStats);
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const createProject = (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!user) return null;

    const newProject = db.createProject({
      title: projectData.title,
      description: projectData.description,
      color: projectData.color,
      status: projectData.status,
      owner_id: user.id
    }, user.id);

    // Создаем ProjectWithStats объект
    const projectWithStats: ProjectWithStats = {
      ...newProject,
      role: 'owner' as const,
      createdAt: new Date(newProject.created_at),
      updatedAt: new Date(newProject.updated_at),
      lastActivity: new Date(newProject.last_activity),
      hasNotifications: false,
      membersCount: 1,
      tasksCount: 0,
      completedTasks: 0,
      progress: 0,
      owner: {
        name: user.full_name,
        avatar: user.avatar_url
      },
      members: [{
        id: user.id,
        name: user.full_name,
        avatar: user.avatar_url
      }]
    };

    setProjects(prev => [projectWithStats, ...prev]);
    return projectWithStats;
  };

  const updateProject = (projectId: string, updates: Partial<Project>) => {
    if (!user) return;

    const updated = db.updateProject(projectId, {
      title: updates.title,
      description: updates.description,
      color: updates.color,
      status: updates.status
    }, user.id);

    if (updated) {
      loadProjects(); // Перезагружаем для обновления статистики
    }
  };

  const archiveProject = (projectId: string) => {
    updateProject(projectId, { status: 'archived' });
  };

  const deleteProject = (projectId: string) => {
    if (!user) return;

    const deleted = db.deleteProject(projectId, user.id);
    if (deleted) {
      setProjects(prev => prev.filter(project => project.id !== projectId));
    }
  };

  const leaveProject = (projectId: string) => {
    // Для демо просто удаляем проект
    deleteProject(projectId);
  };

  return {
    projects,
    loading,
    createProject,
    updateProject,
    archiveProject,
    deleteProject,
    leaveProject,
    refetch: loadProjects
  };
};