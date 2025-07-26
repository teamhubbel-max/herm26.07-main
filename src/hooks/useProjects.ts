import { useState, useEffect } from 'react';
import { supabase, Project, ProjectMember } from '../lib/supabase';
import { useAuth } from './useAuth';

export interface ProjectWithStats extends Project {
  membersCount: number;
  tasksCount: number;
  completedTasks: number;
  progress: number;
  role: 'owner' | 'member' | 'observer';
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
  const { user, profile } = useAuth();
  const [projects, setProjects] = useState<ProjectWithStats[]>([]);
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
    if (!user) {
      setProjects([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Get projects where user is a member
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('*');

      if (projectsError) throw projectsError;

      // Get all project members for this user
      const { data: allMembersData, error: membersError } = await supabase
        .from('project_members')
        .select('project_id, role')
        .eq('user_id', user.id);

      if (membersError) throw membersError;

      // Get user's project IDs and roles
      const userProjectIds = allMembersData?.map(m => m.project_id) || [];
      const userRoles = allMembersData?.reduce((acc, m) => {
        acc[m.project_id] = m.role;
        return acc;
      }, {} as Record<string, string>) || {};
      
      // Filter projects where user is owner or member
      const userProjects = (projectsData || []).filter(project => 
        userProjectIds.includes(project.id) || project.owner_id === user.id
      );

      // Get owner information separately
      const ownerIds = [...new Set(userProjects.map(p => p.owner_id))];
      const { data: ownersData } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', ownerIds);

      const ownersMap = (ownersData || []).reduce((acc, owner) => {
        acc[owner.id] = owner;
        return acc;
      }, {} as Record<string, any>);

      // Get task statistics for each project
      const projectsWithStats = await Promise.all(
        userProjects.map(async (project) => {
          const { data: tasksData } = await supabase
            .from('tasks')
            .select('id, status')
            .eq('project_id', project.id);

          const tasksCount = tasksData?.length || 0;
          const completedTasksCount = tasksData?.filter(t => t.status === 'done').length || 0;
          const progress = tasksCount > 0 ? Math.round((completedTasksCount / tasksCount) * 100) : 0;

          // Get project members
          const { data: projectMembersData } = await supabase
            .from('project_members')
            .select('user_id, role')
            .eq('project_id', project.id);
          
          // Get member profiles
          const memberIds = projectMembersData?.map(m => m.user_id) || [];
          const { data: memberProfilesData } = await supabase
            .from('profiles')
            .select('id, full_name, avatar_url')
            .in('id', memberIds);

          const memberProfiles = (memberProfilesData || []).reduce((acc, profile) => {
            acc[profile.id] = profile;
            return acc;
          }, {} as Record<string, any>);
          
          // Get user's role 
          const userRole = userRoles[project.id] || (project.owner_id === user.id ? 'owner' : 'member');
          
          const members = (projectMembersData || []).map((member: any) => {
            const profile = memberProfiles[member.user_id];
            return {
              id: member.user_id,
              name: profile?.full_name || 'Unknown',
              avatar: profile?.avatar_url
            };
          });

          const owner = ownersMap[project.owner_id] || {
            full_name: 'Unknown',
            avatar_url: null
          };

          return {
            ...project,
            role: userRole,
            createdAt: new Date(project.created_at),
            updatedAt: new Date(project.updated_at),
            lastActivity: new Date(project.last_activity),
            hasNotifications: false,
            membersCount: projectMembersData?.length || 0,
            tasksCount,
            completedTasks: completedTasksCount,
            progress,
            owner: {
              name: owner.full_name,
              avatar: owner.avatar_url
            },
            members
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

  const createProject = async (projectData: any) => {
    if (!user) return null;

    try {
      // Create project
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .insert({
          title: projectData.title,
          description: projectData.description,
          color: projectData.color,
          status: projectData.status,
          owner_id: user.id
        })
        .select()
        .single();

      if (projectError) throw projectError;

      // Add creator as owner
      const { error: memberError } = await supabase
        .from('project_members')
        .insert({
          project_id: project.id,
          user_id: user.id,
          role: 'owner'
        });

      if (memberError) throw memberError;

      // Reload projects
      await loadProjects();

      return project;
    } catch (err) {
      console.error('Error creating project:', err);
      setError(err instanceof Error ? err.message : 'Error creating project');
      return null;
    }
  };

  const updateProject = async (projectId: string, updates: any) => {
    if (!user) return;

    try {
      const { data: updatedProject, error } = await supabase
        .from('projects')
        .update({
          title: updates.title,
          description: updates.description,
          color: updates.color,
          status: updates.status,
          last_activity: new Date().toISOString()
        })
        .eq('id', projectId)
        .select()
        .single();

      if (error) throw error;

      // Reload projects to get updated stats
      await loadProjects();
    } catch (err) {
      console.error('Error updating project:', err);
      setError(err instanceof Error ? err.message : 'Error updating project');
    }
  };

  const archiveProject = async (projectId: string) => {
    await updateProject(projectId, { status: 'archived' });
  };

  const deleteProject = async (projectId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);

      if (error) throw error;

      setProjects(prev => prev.filter(project => project.id !== projectId));
    } catch (err) {
      console.error('Error deleting project:', err);
      setError(err instanceof Error ? err.message : 'Error deleting project');
    }
  };

  const leaveProject = async (projectId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('project_members')
        .delete()
        .eq('project_id', projectId)
        .eq('user_id', user.id);

      if (error) throw error;

      setProjects(prev => prev.filter(project => project.id !== projectId));
    } catch (err) {
      console.error('Error leaving project:', err);
      setError(err instanceof Error ? err.message : 'Error leaving project');
    }
  };

  return {
    projects,
    loading,
    error,
    createProject,
    updateProject,
    archiveProject,
    deleteProject,
    leaveProject,
    refetch: loadProjects
  };
};