import { useState, useEffect } from 'react';
import { supabase, Document, DocumentTemplate } from '../lib/supabase';
import { useAuth } from './useAuth';

interface DocumentWithProject extends Document {
  projectTitle: string;
  projectColor: string;
  templateName: string;
  createdByName: string;
  createdAt: Date;
  updatedAt: Date;
}

interface DocumentTemplateWithDates extends DocumentTemplate {
  createdAt: Date;
  updatedAt: Date;
}

export const useDocuments = (projects: any[]) => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<DocumentWithProject[]>([]);
  const [templates, setTemplates] = useState<DocumentTemplateWithDates[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadDocuments();
      loadTemplates();
    }
  }, [user, projects]);

  const loadDocuments = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const { data: documentsData, error: documentsError } = await supabase
        .from('documents')
        .select(`
          *,
          project:projects (
            title,
            color
          ),
          template:document_templates (
            title
          ),
          creator:profiles!documents_created_by_fkey (
            full_name
          )
        `)
        .eq('created_by', user.id)
        .order('updated_at', { ascending: false });

      if (documentsError) throw documentsError;

      const documentsWithProject: DocumentWithProject[] = (documentsData || []).map(doc => ({
        ...doc,
        projectTitle: doc.project?.title || 'Неизвестный проект',
        projectColor: doc.project?.color || '#3B82F6',
        templateName: doc.template?.title || 'Без шаблона',
        createdByName: doc.creator?.full_name || 'Неизвестно',
        createdAt: new Date(doc.created_at),
        updatedAt: new Date(doc.updated_at)
      }));

      setDocuments(documentsWithProject);
    } catch (err) {
      console.error('Error loading documents:', err);
      setError(err instanceof Error ? err.message : 'Error loading documents');
    } finally {
      setLoading(false);
    }
  };

  const loadTemplates = async () => {
    try {
      const { data: templatesData, error } = await supabase
        .from('document_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const templatesWithDates = (templatesData || []).map(template => ({
        ...template,
        createdAt: new Date(template.created_at),
        updatedAt: new Date(template.updated_at)
      }));

      setTemplates(templatesWithDates);
    } catch (err) {
      console.error('Error loading templates:', err);
    }
  };

  const createDocument = async (documentData: any) => {
    if (!user) return;

    try {
      const { data: newDocument, error } = await supabase
        .from('documents')
        .insert({
          title: documentData.title,
          description: documentData.description,
          template_id: documentData.templateId,
          project_id: documentData.projectId,
          created_by: user.id,
          status: documentData.status || 'draft',
          counterparty: documentData.counterparty,
          template_fields: documentData.templateFields,
          file_url: documentData.fileUrl
        })
        .select()
        .single();

      if (error) throw error;

      await loadDocuments();
      return newDocument;
    } catch (err) {
      console.error('Error creating document:', err);
      setError(err instanceof Error ? err.message : 'Error creating document');
    }
  };

  const updateDocument = async (documentId: string, updates: any) => {
    if (!user) return;

    try {
      const { data: updatedDocument, error } = await supabase
        .from('documents')
        .update({
          title: updates.title,
          description: updates.description,
          status: updates.status,
          counterparty: updates.counterparty,
          template_fields: updates.templateFields,
          file_url: updates.fileUrl
        })
        .eq('id', documentId)
        .select()
        .single();

      if (error) throw error;

      await loadDocuments();
    } catch (err) {
      console.error('Error updating document:', err);
      setError(err instanceof Error ? err.message : 'Error updating document');
    }
  };

  const deleteDocument = async (documentId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', documentId);

      if (error) throw error;

      setDocuments(prev => prev.filter(doc => doc.id !== documentId));
    } catch (err) {
      console.error('Error deleting document:', err);
      setError(err instanceof Error ? err.message : 'Error deleting document');
    }
  };

  const createTemplate = async (templateData: any) => {
    if (!user) return;

    try {
      const { data: newTemplate, error } = await supabase
        .from('document_templates')
        .insert({
          title: templateData.title,
          description: templateData.description,
          category: templateData.category,
          content: templateData.content,
          fields: templateData.fields,
          is_custom: templateData.isCustom,
          created_by: user.id
        })
        .select()
        .single();

      if (error) throw error;

      await loadTemplates();
      return newTemplate;
    } catch (err) {
      console.error('Error creating template:', err);
      setError(err instanceof Error ? err.message : 'Error creating template');
    }
  };

  const updateTemplate = async (templateId: string, updates: any) => {
    if (!user) return;

    try {
      const { data: updatedTemplate, error } = await supabase
        .from('document_templates')
        .update(updates)
        .eq('id', templateId)
        .select()
        .single();

      if (error) throw error;

      await loadTemplates();
    } catch (err) {
      console.error('Error updating template:', err);
      setError(err instanceof Error ? err.message : 'Error updating template');
    }
  };

  const deleteTemplate = async (templateId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('document_templates')
        .delete()
        .eq('id', templateId);

      if (error) throw error;

      setTemplates(prev => prev.filter(template => template.id !== templateId));
    } catch (err) {
      console.error('Error deleting template:', err);
      setError(err instanceof Error ? err.message : 'Error deleting template');
    }
  };

  return {
    documents,
    templates,
    loading,
    error,
    createDocument,
    updateDocument,
    deleteDocument,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    refetch: loadDocuments
  };
};