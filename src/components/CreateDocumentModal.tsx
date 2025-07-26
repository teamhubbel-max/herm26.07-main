import React, { useState, useEffect } from 'react';
import { X, FileText, Building, User, Mail, Phone, MapPin } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface CreateDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  templates: any[];
  projects: any[];
  onCreateDocument: (document: any) => void;
}

export const CreateDocumentModal: React.FC<CreateDocumentModalProps> = ({
  isOpen,
  onClose,
  templates,
  projects,
  onCreateDocument
}) => {
  const { user } = useAuth();
  const [step, setStep] = useState(1); // 1 - выбор шаблона, 2 - заполнение данных
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [selectedProject, setSelectedProject] = useState('');
  const [documentTitle, setDocumentTitle] = useState('');
  const [documentDescription, setDocumentDescription] = useState('');
  const [counterparty, setCounterparty] = useState({
    name: '',
    inn: '',
    address: '',
    phone: '',
    email: '',
    director: ''
  });
  const [templateFields, setTemplateFields] = useState<any>({});

  // Автоматически заполняем данные контрагента из настроек пользователя
  useEffect(() => {
    if (user && step === 2) {
      setCounterparty({
        name: user.organization_name || '',
        inn: user.organization_inn || '',
        address: user.organization_address || '',
        phone: user.organization_phone || '',
        email: user.organization_email || user.email || '',
        director: user.organization_director || ''
      });
    }
  }, [user, step]);

  const templateCategories = [...new Set(templates.map(t => t.category))];

  const handleTemplateSelect = (template: any) => {
    setSelectedTemplate(template);
    setDocumentTitle(template.title);
    setDocumentDescription(template.description);
    setStep(2);
  };

  const handleFieldChange = (fieldName: string, value: string) => {
    setTemplateFields(prev => ({ ...prev, [fieldName]: value }));
  };

  const handleCounterpartyChange = (field: string, value: string) => {
    setCounterparty(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    if (!selectedTemplate || !selectedProject) return;

    const project = projects.find(p => p.id === selectedProject);
    
    const newDocument = {
      title: documentTitle,
      description: documentDescription,
      templateId: selectedTemplate.id,
      templateName: selectedTemplate.title,
      projectId: selectedProject,
      projectTitle: project?.title || '',
      projectColor: project?.color || '#3B82F6',
      createdBy: 'Текущий пользователь',
      status: 'draft',
      counterparty: counterparty.name ? counterparty : undefined,
      templateFields
    };

    onCreateDocument(newDocument);
    
    // Reset form
    setStep(1);
    setSelectedTemplate(null);
    setSelectedProject('');
    setDocumentTitle('');
    setDocumentDescription('');
    setCounterparty({
      name: '',
      inn: '',
      address: '',
      phone: '',
      email: '',
      director: ''
    });
    setTemplateFields({});
    
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
            <FileText className="w-5 h-5" />
            <span>
              {step === 1 ? 'Выбор шаблона документа' : 'Заполнение данных документа'}
            </span>
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {step === 1 ? (
          /* Step 1: Template Selection */
          <div className="p-6">
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Выберите шаблон документа</h3>
              <p className="text-gray-600">Выберите готовый шаблон или создайте новый в редакторе документов</p>
            </div>

            {templateCategories.map(category => (
              <div key={category} className="mb-8">
                <h4 className="text-md font-medium text-gray-800 mb-4">{category}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {templates
                    .filter(template => template.category === category)
                    .map(template => (
                      <button
                        key={template.id}
                        onClick={() => handleTemplateSelect(template)}
                        className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 text-left"
                      >
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <FileText className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <h5 className="font-medium text-gray-900">{template.title}</h5>
                            {template.isCustom && (
                              <span className="text-xs text-purple-600 font-medium">Пользовательский</span>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600">{template.description}</p>
                      </button>
                    ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Step 2: Document Data */
          <div className="p-6 space-y-6">
            {/* Document Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-blue-800 mb-2">Выбранный шаблон</h3>
              <p className="text-blue-700">{selectedTemplate?.title}</p>
            </div>

            {/* Project Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Проект *</label>
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Выберите проект</option>
                {projects.map(project => (
                  <option key={project.id} value={project.id}>{project.title}</option>
                ))}
              </select>
            </div>

            {/* Document Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Название документа *</label>
              <input
                type="text"
                value={documentTitle}
                onChange={(e) => setDocumentTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Document Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Описание</label>
              <textarea
                value={documentDescription}
                onChange={(e) => setDocumentDescription(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            {/* Counterparty Info */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center space-x-2">
                <Building className="w-5 h-5" />
                <span>Реквизиты контрагента</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Building className="w-4 h-4 inline mr-1" />
                    Название организации
                  </label>
                  <input
                    type="text"
                    value={counterparty.name}
                    onChange={(e) => handleCounterpartyChange('name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="ООО 'Название'"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">ИНН</label>
                  <input
                    type="text"
                    value={counterparty.inn}
                    onChange={(e) => handleCounterpartyChange('inn', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="1234567890"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    Адрес
                  </label>
                  <input
                    type="text"
                    value={counterparty.address}
                    onChange={(e) => handleCounterpartyChange('address', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="г. Москва, ул. Примерная, д. 1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Phone className="w-4 h-4 inline mr-1" />
                    Телефон
                  </label>
                  <input
                    type="text"
                    value={counterparty.phone}
                    onChange={(e) => handleCounterpartyChange('phone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="+7 (495) 123-45-67"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Mail className="w-4 h-4 inline mr-1" />
                    Email
                  </label>
                  <input
                    type="email"
                    value={counterparty.email}
                    onChange={(e) => handleCounterpartyChange('email', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="info@company.ru"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <User className="w-4 h-4 inline mr-1" />
                    Руководитель
                  </label>
                  <input
                    type="text"
                    value={counterparty.director}
                    onChange={(e) => handleCounterpartyChange('director', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Иванов Иван Иванович"
                  />
                </div>
              </div>
            </div>

            {/* Template Fields */}
            {selectedTemplate?.fields && selectedTemplate.fields.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Дополнительные поля</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedTemplate.fields.map((field: any) => (
                    <div key={field.id}>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {field.label} {field.required && '*'}
                      </label>
                      {field.type === 'textarea' ? (
                        <textarea
                          value={templateFields[field.name] || field.defaultValue || ''}
                          onChange={(e) => handleFieldChange(field.name, e.target.value)}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                          placeholder={field.placeholder}
                          required={field.required}
                        />
                      ) : field.type === 'select' ? (
                        <select
                          value={templateFields[field.name] || field.defaultValue || ''}
                          onChange={(e) => handleFieldChange(field.name, e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required={field.required}
                        >
                          <option value="">Выберите...</option>
                          {field.options?.map((option: string) => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type={field.type}
                          value={templateFields[field.name] || field.defaultValue || ''}
                          onChange={(e) => handleFieldChange(field.name, e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder={field.placeholder}
                          required={field.required}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-between pt-6 border-t border-gray-200">
              <button
                onClick={() => setStep(1)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Назад к шаблонам
              </button>
              <div className="flex space-x-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Отмена
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!selectedTemplate || !selectedProject || !documentTitle}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Создать документ
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};