import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Plus, 
  Filter, 
  FileText, 
  Calendar, 
  User,
  MoreHorizontal,
  Edit,
  Trash2,
  Download,
  Eye,
  Settings
} from 'lucide-react';
import { Document, DocumentStatus, DocumentSortOption } from '../types/Document';
import { CreateDocumentModal } from './CreateDocumentModal';
import { DocumentEditorModal } from './DocumentEditorModal';

interface DocumentsSectionProps {
  documents: Document[];
  projects: any[];
  onCreateDocument: (document: any) => void;
  onUpdateDocument: (documentId: string, updates: any) => void;
  onDeleteDocument: (documentId: string) => void;
  templates: any[];
  onCreateTemplate: (template: any) => void;
}

export const DocumentsSection: React.FC<DocumentsSectionProps> = ({
  documents,
  projects,
  onCreateDocument,
  onUpdateDocument,
  onDeleteDocument,
  templates,
  onCreateTemplate
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<DocumentStatus>('all');
  const [projectFilter, setProjectFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<DocumentSortOption>('updated');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditorModalOpen, setIsEditorModalOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);

  const filteredAndSortedDocuments = useMemo(() => {
    let filtered = documents;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(doc =>
        doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.templateName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(doc => doc.status === statusFilter);
    }

    // Filter by project
    if (projectFilter !== 'all') {
      filtered = filtered.filter(doc => doc.projectId === projectFilter);
    }

    // Sort documents
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.title.localeCompare(b.title);
        case 'created':
          return b.createdAt.getTime() - a.createdAt.getTime();
        case 'updated':
          return b.updatedAt.getTime() - a.updatedAt.getTime();
        case 'project':
          return a.projectTitle.localeCompare(b.projectTitle);
        default:
          return 0;
      }
    });

    return filtered;
  }, [documents, searchTerm, statusFilter, projectFilter, sortBy]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'sent': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'draft': return 'Черновик';
      case 'completed': return 'Готов';
      case 'sent': return 'Отправлен';
      default: return status;
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusStats = () => {
    return {
      all: documents.length,
      draft: documents.filter(d => d.status === 'draft').length,
      completed: documents.filter(d => d.status === 'completed').length,
      sent: documents.filter(d => d.status === 'sent').length
    };
  };

  const stats = getStatusStats();

  const statusOptions = [
    { value: 'all' as DocumentStatus, label: 'Все документы', count: stats.all },
    { value: 'draft' as DocumentStatus, label: 'Черновики', count: stats.draft },
    { value: 'completed' as DocumentStatus, label: 'Готовые', count: stats.completed },
    { value: 'sent' as DocumentStatus, label: 'Отправленные', count: stats.sent }
  ];

  const sortOptions = [
    { value: 'updated' as DocumentSortOption, label: 'По обновлению' },
    { value: 'created' as DocumentSortOption, label: 'По дате создания' },
    { value: 'name' as DocumentSortOption, label: 'По алфавиту' },
    { value: 'project' as DocumentSortOption, label: 'По проекту' }
  ];

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Документы</h1>
                <p className="text-gray-600 mt-1">Управление документами по проектам</p>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setIsEditorModalOpen(true)}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors duration-200"
                >
                  <Settings className="w-5 h-5" />
                  <span>Редактор документов</span>
                </button>
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors duration-200 shadow-lg hover:shadow-xl"
                >
                  <Plus className="w-5 h-5" />
                  <span>Создать документ</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Filters and Controls */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
            {/* Search and Sort */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 mb-6">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Поиск документов..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="flex items-center space-x-4">
                {/* Project Filter */}
                <select
                  value={projectFilter}
                  onChange={(e) => setProjectFilter(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">Все проекты</option>
                  {projects.map(project => (
                    <option key={project.id} value={project.id}>{project.title}</option>
                  ))}
                </select>

                {/* Sort */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as DocumentSortOption)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {sortOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Status Filter Tabs */}
            <div className="flex flex-wrap gap-2">
              {statusOptions.map(option => (
                <button
                  key={option.value}
                  onClick={() => setStatusFilter(option.value)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-all duration-200 ${
                    statusFilter === option.value
                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                      : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <span className="font-medium">{option.label}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    statusFilter === option.value
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {option.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Documents Grid */}
          {filteredAndSortedDocuments.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📄</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {searchTerm ? 'Документы не найдены' : 'Нет документов'}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm 
                  ? 'Попробуйте изменить критерии поиска'
                  : 'Создайте свой первый документ'
                }
              </p>
              {!searchTerm && (
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center space-x-2 mx-auto transition-colors duration-200"
                >
                  <Plus className="w-5 h-5" />
                  <span>Создать документ</span>
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAndSortedDocuments.map(document => (
                <div
                  key={document.id}
                  className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 cursor-pointer group"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-3 bg-blue-100 rounded-lg">
                        <FileText className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 text-lg leading-tight group-hover:text-blue-600 transition-colors">
                          {document.title}
                        </h3>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(document.status)}`}>
                          {getStatusText(document.status)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="relative">
                      <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
                        <MoreHorizontal className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {document.description}
                  </p>

                  {/* Project Info */}
                  <div className="flex items-center space-x-2 mb-4">
                    <span 
                      className="inline-block w-3 h-3 rounded-full"
                      style={{ backgroundColor: document.projectColor }}
                    ></span>
                    <span className="text-sm font-medium text-gray-700">{document.projectTitle}</span>
                    <span className="text-sm text-gray-500">• {document.templateName}</span>
                  </div>

                  {/* Counterparty */}
                  {document.counterparty && (
                    <div className="bg-gray-50 rounded-lg p-3 mb-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-1">Контрагент</h4>
                      <p className="text-sm text-gray-600">{document.counterparty.name}</p>
                      <p className="text-xs text-gray-500">ИНН: {document.counterparty.inn}</p>
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <User className="w-4 h-4" />
                      <span>{document.createdBy}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(document.updatedAt)}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => {
                          // Открываем просмотр документа
                          console.log('Viewing document:', document.id);
                          // Здесь можно добавить модальное окно просмотра
                        }}
                        className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => {
                          // Открываем редактирование документа
                          console.log('Editing document:', document.id);
                          // Здесь можно добавить модальное окно редактирования
                        }}
                        className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => {
                          // Скачиваем документ
                          const content = `Документ: ${document.title}\n\nОписание: ${document.description}\n\nДата создания: ${document.createdAt.toLocaleDateString()}`;
                          const blob = new Blob([content], { type: 'text/plain' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `${document.title}.txt`;
                          a.click();
                          URL.revokeObjectURL(url);
                        }}
                        className="p-2 text-green-500 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                    <button 
                      onClick={() => onDeleteDocument(document.id)}
                      className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <CreateDocumentModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        templates={templates}
        projects={projects}
        onCreateDocument={onCreateDocument}
      />

      <DocumentEditorModal
        isOpen={isEditorModalOpen}
        onClose={() => setIsEditorModalOpen(false)}
        onCreateTemplate={onCreateTemplate}
      />
    </>
  );
};