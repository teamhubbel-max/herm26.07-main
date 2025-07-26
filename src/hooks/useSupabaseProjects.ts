import { useState, useEffect } from 'react';
import { supabase, Project, ProjectMember, Profile } from '../lib/supabase';
import { useAuth } from './useAuth';

export interface ProjectWithMembers extends Project {
  members: (ProjectMember & { profile: Profile })[];
  member_count: number;
  tasks_count: number;
  completed_tasks_count: number;
  progress: number;
}

export const useSupabaseProjects = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<ProjectWithMembers[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadProjects();
    } else {
      setProjects([]);
      setLoading(false);
    }
  }, [user]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      setError(null);

      // Получаем проекты пользователя с участниками
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select(`
          *,
          project_members!inner (
            id,
            role,
            joined_at,
            user_id,
            profile:profiles (
              id,
              email,
              full_name,
              avatar_url
            )
          )
        `)
        .eq('project_members.user_id', user?.id);

      if (projectsError) throw projectsError;

      // Получаем статистику задач для каждого проекта
      const projectsWithStats = await Promise.all(
        (projectsData || []).map(async (project) => {
          const { data: tasksData } = await supabase
            .from('tasks')
            .select('id, status')
            .eq('project_id', project.id);

          const tasksCount = tasksData?.length || 0;
          const completedTasksCount = tasksData?.filter(t => t.status === 'done').length || 0;
          const progress = tasksCount > 0 ? Math.round((completedTasksCount / tasksCount) * 100) : 0;

          return {
            ...project,
            members: project.project_members,
            member_count: project.project_members.length,
            tasks_count: tasksCount,
            completed_tasks_count: completedTasksCount,
            progress,
          };
        })
      );

      setProjects(projectsWithStats);
    } catch (err) {
      console.error('Error loading projects:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const createProject = async (projectData: {
    title: string;
    description?: string;
    color?: string;
  }) => {
    if (!user) throw new Error('User not authenticated');

    try {
      // Создаем проект
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .insert({
          title: projectData.title,
          description: projectData.description || '',
          color: projectData.color || '#3B82F6',
          owner_id: user.id,
        })
        .select()
        .single();

      if (projectError) throw projectError;

      // Добавляем создателя как владельца проекта
      const { error: memberError } = await supabase
        .from('project_members')
        .insert({
          project_id: project.id,
          user_id: user.id,
          role: 'owner',
        });

      if (memberError) throw memberError;

      // Перезагружаем проекты
      await loadProjects();

      return project;
    } catch (err) {
      console.error('Error creating project:', err);
      throw err;
    }
  };

  const updateProject = async (projectId: string, updates: Partial<Project>) => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .update({
          ...updates,
          last_activity: new Date().toISOString(),
        })
        .eq('id', projectId)
        .select()
        .single();

      if (error) throw error;

      // Обновляем локальное состояние
      setProjects(prev => prev.map(p => 
        p.id === projectId ? { ...p, ...data } : p
      ));

      return data;
    } catch (err) {
      console.error('Error updating project:', err);
      throw err;
    }
  };

  const deleteProject = async (projectId: string) => {
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);

      if (error) throw error;

      // Удаляем из локального состояния
      setProjects(prev => prev.filter(p => p.id !== projectId));
    } catch (err) {
      console.error('Error deleting project:', err);
      throw err;
    }
  };

  const leaveProject = async (projectId: string) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { error } = await supabase
        .from('project_members')
        .delete()
        .eq('project_id', projectId)
        .eq('user_id', user.id);

      if (error) throw error;

      // Удаляем из локального состояния
      setProjects(prev => prev.filter(p => p.id !== projectId));
    } catch (err) {
      console.error('Error leaving project:', err);
      throw err;
    }
  };

  const inviteUser = async (projectId: string, email: string, role: 'member' | 'observer' = 'member') => {
    try {
      // Ищем пользователя по email
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single();

      if (profileError) throw new Error('Пользователь не найден');

      // Добавляем пользователя в проект
      const { error: memberError } = await supabase
        .from('project_members')
        .insert({
          project_id: projectId,
          user_id: profile.id,
          role,
        });

      if (memberError) throw memberError;

      // Перезагружаем проекты
      await loadProjects();
    } catch (err) {
      console.error('Error inviting user:', err);
      throw err;
    }
  };

  const updateMemberRole = async (projectId: string, userId: string, role: 'owner' | 'member' | 'observer') => {
    try {
      const { error } = await supabase
        .from('project_members')
        .update({ role })
        .eq('project_id', projectId)
        .eq('user_id', userId);

      if (error) throw error;

      // Перезагружаем проекты
      await loadProjects();
    } catch (err) {
      console.error('Error updating member role:', err);
      throw err;
    }
  };

  return {
    projects,
    loading,
    error,
    createProject,
    updateProject,
    deleteProject,
    leaveProject,
    inviteUser,
    updateMemberRole,
    refetch: loadProjects,
  };
};