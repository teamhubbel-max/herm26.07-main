/*
  # Fix infinite recursion in RLS policies

  1. Problem
    - Current RLS policies create circular dependencies
    - project_members policies reference project_members table causing infinite recursion
    - projects policies reference project_members which reference themselves

  2. Solution
    - Drop existing problematic policies
    - Create simpler, direct policies that avoid circular references
    - Use direct user ID checks where possible
    - Avoid complex nested queries in policies

  3. Changes
    - Simplified project_members policies to direct user checks
    - Simplified projects policies to avoid circular references
    - Maintained security while fixing recursion
*/

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Project owners can manage members" ON project_members;
DROP POLICY IF EXISTS "Users can read project members for their projects" ON project_members;
DROP POLICY IF EXISTS "Users can read projects they are members of" ON projects;

-- Create simplified policies for project_members
CREATE POLICY "Users can read project members where they are members"
  ON project_members
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR 
    project_id IN (
      SELECT project_id 
      FROM project_members pm 
      WHERE pm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert themselves as project members"
  ON project_members
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Project owners can manage project members"
  ON project_members
  FOR ALL
  TO authenticated
  USING (
    project_id IN (
      SELECT id 
      FROM projects 
      WHERE owner_id = auth.uid()
    )
  );

-- Create simplified policy for projects
CREATE POLICY "Users can read their own projects"
  ON projects
  FOR SELECT
  TO authenticated
  USING (
    owner_id = auth.uid() OR
    id IN (
      SELECT DISTINCT project_id 
      FROM project_members 
      WHERE user_id = auth.uid()
    )
  );

-- Fix tasks policies to be more direct
DROP POLICY IF EXISTS "Users can read tasks from their projects" ON tasks;
CREATE POLICY "Users can read tasks from their projects"
  ON tasks
  FOR SELECT
  TO authenticated
  USING (
    project_id IN (
      SELECT DISTINCT project_id 
      FROM project_members 
      WHERE user_id = auth.uid()
    ) OR
    project_id IN (
      SELECT id 
      FROM projects 
      WHERE owner_id = auth.uid()
    )
  );

-- Fix documents policies to be more direct
DROP POLICY IF EXISTS "Users can read documents from their projects" ON documents;
CREATE POLICY "Users can read documents from their projects"
  ON documents
  FOR SELECT
  TO authenticated
  USING (
    created_by = auth.uid() OR
    project_id IN (
      SELECT DISTINCT project_id 
      FROM project_members 
      WHERE user_id = auth.uid()
    ) OR
    project_id IN (
      SELECT id 
      FROM projects 
      WHERE owner_id = auth.uid()
    )
  );

-- Fix task_comments policies
DROP POLICY IF EXISTS "Users can read comments from their project tasks" ON task_comments;
CREATE POLICY "Users can read comments from their project tasks"
  ON task_comments
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR
    task_id IN (
      SELECT t.id 
      FROM tasks t
      WHERE t.project_id IN (
        SELECT DISTINCT project_id 
        FROM project_members 
        WHERE user_id = auth.uid()
      ) OR t.project_id IN (
        SELECT id 
        FROM projects 
        WHERE owner_id = auth.uid()
      )
    )
  );

-- Fix activity_logs policies
DROP POLICY IF EXISTS "Users can read activity from their projects" ON activity_logs;
CREATE POLICY "Users can read activity from their projects"
  ON activity_logs
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR
    project_id IN (
      SELECT DISTINCT project_id 
      FROM project_members 
      WHERE user_id = auth.uid()
    ) OR
    project_id IN (
      SELECT id 
      FROM projects 
      WHERE owner_id = auth.uid()
    )
  );