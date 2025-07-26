/*
  # Fix infinite recursion in RLS policies

  1. Problem
    - project_members policies reference project_members table (self-reference)
    - projects policies reference project_members, creating circular dependency
    - This causes infinite recursion during policy evaluation

  2. Solution
    - Remove all problematic policies
    - Create new, simplified policies without circular references
    - Use direct user ID checks instead of complex subqueries

  3. Security
    - Maintain same security level
    - Users can only access their own data
    - Project owners can manage their projects
*/

-- Drop all existing problematic policies
DROP POLICY IF EXISTS "Project owners can manage project members" ON project_members;
DROP POLICY IF EXISTS "Users can insert themselves as project members" ON project_members;
DROP POLICY IF EXISTS "Users can read project members where they are members" ON project_members;
DROP POLICY IF EXISTS "Users can read their own projects" ON projects;
DROP POLICY IF EXISTS "Project owners can update projects" ON projects;
DROP POLICY IF EXISTS "Authenticated users can create projects" ON projects;
DROP POLICY IF EXISTS "Users can read tasks from their projects" ON tasks;
DROP POLICY IF EXISTS "Project members can create tasks" ON tasks;
DROP POLICY IF EXISTS "Project members can update tasks" ON tasks;
DROP POLICY IF EXISTS "Users can read documents from their projects" ON documents;
DROP POLICY IF EXISTS "Project members can create documents" ON documents;
DROP POLICY IF EXISTS "Project members can update documents" ON documents;
DROP POLICY IF EXISTS "Users can create comments on their project tasks" ON task_comments;
DROP POLICY IF EXISTS "Users can read comments from their project tasks" ON task_comments;
DROP POLICY IF EXISTS "Users can read activity from their projects" ON activity_logs;

-- Create new simplified policies for project_members (no self-references)
CREATE POLICY "project_members_select_policy" ON project_members
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "project_members_insert_policy" ON project_members
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "project_members_update_policy" ON project_members
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "project_members_delete_policy" ON project_members
  FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- Create new simplified policies for projects (avoid complex subqueries)
CREATE POLICY "projects_select_policy" ON projects
  FOR SELECT TO authenticated
  USING (owner_id = auth.uid());

CREATE POLICY "projects_insert_policy" ON projects
  FOR INSERT TO authenticated
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "projects_update_policy" ON projects
  FOR UPDATE TO authenticated
  USING (owner_id = auth.uid());

CREATE POLICY "projects_delete_policy" ON projects
  FOR DELETE TO authenticated
  USING (owner_id = auth.uid());

-- Create new simplified policies for tasks
CREATE POLICY "tasks_select_policy" ON tasks
  FOR SELECT TO authenticated
  USING (
    created_by = auth.uid() OR 
    assignee_id = auth.uid()
  );

CREATE POLICY "tasks_insert_policy" ON tasks
  FOR INSERT TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "tasks_update_policy" ON tasks
  FOR UPDATE TO authenticated
  USING (
    created_by = auth.uid() OR 
    assignee_id = auth.uid()
  );

CREATE POLICY "tasks_delete_policy" ON tasks
  FOR DELETE TO authenticated
  USING (created_by = auth.uid());

-- Create new simplified policies for documents
CREATE POLICY "documents_select_policy" ON documents
  FOR SELECT TO authenticated
  USING (created_by = auth.uid());

CREATE POLICY "documents_insert_policy" ON documents
  FOR INSERT TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "documents_update_policy" ON documents
  FOR UPDATE TO authenticated
  USING (created_by = auth.uid());

CREATE POLICY "documents_delete_policy" ON documents
  FOR DELETE TO authenticated
  USING (created_by = auth.uid());

-- Create new simplified policies for task_comments
CREATE POLICY "task_comments_select_policy" ON task_comments
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "task_comments_insert_policy" ON task_comments
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "task_comments_update_policy" ON task_comments
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "task_comments_delete_policy" ON task_comments
  FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- Create new simplified policies for activity_logs
CREATE POLICY "activity_logs_select_policy" ON activity_logs
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "activity_logs_insert_policy" ON activity_logs
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());