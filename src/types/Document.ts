export interface Document {
  id: string;
  title: string;
  description: string;
  templateId: string;
  templateName: string;
  projectId: string;
  projectTitle: string;
  projectColor: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  status: 'draft' | 'completed' | 'sent';
  fileUrl?: string;
  counterparty?: {
    name: string;
    inn: string;
    address: string;
    phone: string;
    email: string;
    director: string;
  };
}

export interface DocumentTemplate {
  id: string;
  title: string;
  description: string;
  category: string;
  fields: DocumentField[];
  content: string;
  isCustom: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface DocumentField {
  id: string;
  name: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | 'textarea';
  required: boolean;
  placeholder?: string;
  options?: string[];
  defaultValue?: string;
}

export type DocumentStatus = 'all' | 'draft' | 'completed' | 'sent';
export type DocumentSortOption = 'name' | 'created' | 'updated' | 'project';