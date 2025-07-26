import { useState, useEffect } from 'react';
import { Document, DocumentTemplate } from '../types/Document';
import { db } from '../lib/database';
import { useAuth } from './useAuth';

interface DocumentWithProject extends Document {
  projectTitle: string;
  projectColor: string;
  templateName: string;
  createdAt: Date;
  updatedAt: Date;
}

export const useDocuments = (projects: any[]) => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<DocumentWithProject[]>([]);
  const [templates, setTemplates] = useState<DocumentTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadDocuments();
      loadTemplates();
    }
  }, [user, projects]);

  const loadDocuments = () => {
    if (!user) return;

    try {
      const dbDocuments = db.getDocuments(user.id);
      const dbTemplates = db.getDocumentTemplates();
      
      const documentsWithProject: DocumentWithProject[] = dbDocuments.map(doc => {
        const project = projects.find(p => p.id === doc.project_id);
        const template = dbTemplates.find(t => t.id === doc.template_id);
        
        return {
          ...doc,
          projectTitle: project?.title || 'Неизвестный проект',
          projectColor: project?.color || '#3B82F6',
          templateName: template?.title || 'Без шаблона',
          createdAt: new Date(doc.created_at),
          updatedAt: new Date(doc.updated_at)
        };
      });

      setDocuments(documentsWithProject);
    } catch (error) {
      console.error('Error loading documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTemplates = () => {
    try {
      const dbTemplates = db.getDocumentTemplates();
      const templatesWithDates = dbTemplates.map(template => ({
        ...template,
        createdAt: new Date(template.created_at),
        updatedAt: new Date(template.updated_at)
      }));
      setTemplates(templatesWithDates);
    } catch (error) {
      console.error('Error loading templates:', error);
    }
  };

  const createDocument = (documentData: Omit<DocumentWithProject, 'id' | 'createdAt' | 'updatedAt' | 'projectTitle' | 'projectColor' | 'templateName'>) => {
    if (!user) return;

    const newDocument = db.createDocument({
      title: documentData.title,
      description: documentData.description,
      template_id: documentData.template_id,
      project_id: documentData.project_id,
      created_by: user.id,
      status: documentData.status,
      counterparty: documentData.counterparty,
      template_fields: documentData.template_fields,
      file_url: documentData.file_url
    }, user.id);

    if (newDocument) {
      loadDocuments(); // Перезагружаем документы
    }
    return newDocument;
  };

  const updateDocument = (documentId: string, updates: Partial<DocumentWithProject>) => {
    if (!user) return;

    const dbUpdates: Partial<Document> = {
      title: updates.title,
      description: updates.description,
      status: updates.status,
      counterparty: updates.counterparty,
      template_fields: updates.template_fields,
      file_url: updates.file_url
    };

    const updated = db.updateDocument(documentId, dbUpdates, user.id);
    if (updated) {
      loadDocuments(); // Перезагружаем документы
    }
  };

  const deleteDocument = (documentId: string) => {
    if (!user) return;

    const deleted = db.deleteDocument(documentId, user.id);
    if (deleted) {
      setDocuments(prev => prev.filter(doc => doc.id !== documentId));
    }
  };

  const createTemplate = (templateData: Omit<DocumentTemplate, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTemplate = db.createDocumentTemplate({
      title: templateData.title,
      description: templateData.description,
      category: templateData.category,
      content: templateData.content,
      fields: templateData.fields,
      is_custom: templateData.isCustom,
      created_by: user?.id
    });

    if (newTemplate) {
      loadTemplates(); // Перезагружаем шаблоны
    }
    return newTemplate;
  };

  const updateTemplate = (templateId: string, updates: Partial<DocumentTemplate>) => {
    // Для упрощения пока не реализуем
    console.log('Update template:', templateId, updates);
  };

  const deleteTemplate = (templateId: string) => {
    // Для упрощения пока не реализуем
    console.log('Delete template:', templateId);
  };

  return {
    documents,
    templates,
    loading,
    createDocument,
    updateDocument,
    deleteDocument,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    refetch: loadDocuments
  };
};