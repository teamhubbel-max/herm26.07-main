import React, { useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { X, Save, Plus, Trash2, Settings, FileText } from 'lucide-react';

interface DocumentEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateTemplate: (template: any) => void;
}

export const DocumentEditorModal: React.FC<DocumentEditorModalProps> = ({
  isOpen,
  onClose,
  onCreateTemplate
}) => {
  const [templateData, setTemplateData] = useState({
    title: '',
    description: '',
    category: '',
    content: ''
  });
  const [fields, setFields] = useState<any[]>([]);

  // Конфигурация редактора
  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'align': [] }],
      ['link', 'image'],
      ['clean']
    ],
  };

  const quillFormats = [
    'header', 'bold', 'italic', 'underline', 'strike',
    'color', 'background', 'list', 'bullet', 'align',
    'link', 'image'
  ];
  const fieldTypes = [
    { value: 'text', label: 'Текст' },
    { value: 'number', label: 'Число' },
    { value: 'date', label: 'Дата' },
    { value: 'textarea', label: 'Многострочный текст' },
    { value: 'select', label: 'Выпадающий список' }
  ];

  const categories = [
    'Договоры',
    'Техническая документация',
    'Отчетность',
    'Финансы',
    'Кадры',
    'Прочее'
  ];

  const addField = () => {
    const newField = {
      id: crypto.randomUUID(),
      name: '',
      label: '',
      type: 'text',
      required: false,
      placeholder: '',
      options: []
    };
    setFields(prev => [...prev, newField]);
  };

  const updateField = (fieldId: string, updates: any) => {
    setFields(prev => prev.map(field => 
      field.id === fieldId ? { ...field, ...updates } : field
    ));
  };

  const removeField = (fieldId: string) => {
    setFields(prev => prev.filter(field => field.id !== fieldId));
  };

  const handleSubmit = () => {
    if (!templateData.title || !templateData.content) return;

    const newTemplate = {
      title: templateData.title,
      description: templateData.description,
      category: templateData.category || 'Прочее',
      content: templateData.content,
      fields: fields.filter(field => field.name && field.label),
      isCustom: true
    };

    onCreateTemplate(newTemplate);
    
    // Reset form
    setTemplateData({
      title: '',
      description: '',
      category: '',
      content: ''
    });
    setFields([]);
    
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
            <Settings className="w-5 h-5" />
            <span>Редактор документов</span>
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="space-y-8">
            {/* Template Settings - Full Width Top Section */}
            <div className="bg-gray-50 rounded-lg p-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Настройки шаблона</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Название шаблона *
                    </label>
                    <input
                      type="text"
                      value={templateData.title}
                      onChange={(e) => setTemplateData(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Например: Договор подряда"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Категория
                    </label>
                    <select
                      value={templateData.category}
                      onChange={(e) => setTemplateData(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Выберите категорию</option>
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <label className="text-sm font-medium text-gray-700">Тип документа:</label>
                      <select className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="single">Одиночный</option>
                        <option value="set">Набор документов</option>
                      </select>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Описание
                  </label>
                  <textarea
                    value={templateData.description}
                    onChange={(e) => setTemplateData(prev => ({ ...prev, description: e.target.value }))}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    placeholder="Краткое описание шаблона"
                  />
                </div>
              </div>
            </div>

              {/* Dynamic Fields */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Динамические поля</h3>
                  <button
                    onClick={addField}
                    className="bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Добавить поле</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-80 overflow-y-auto">
                  {fields.map((field, index) => (
                    <div key={field.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-gray-700">Поле {index + 1}</span>
                        <button
                          onClick={() => removeField(field.id)}
                          className="text-red-500 hover:text-red-700 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="space-y-3">
                        <input
                          type="text"
                          value={field.name}
                          onChange={(e) => updateField(field.id, { name: e.target.value })}
                          placeholder="Имя поля"
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                        <input
                          type="text"
                          value={field.label}
                          onChange={(e) => updateField(field.id, { label: e.target.value })}
                          placeholder="Подпись поля"
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                        <select
                          value={field.type}
                          onChange={(e) => updateField(field.id, { type: e.target.value })}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        >
                          {fieldTypes.map(type => (
                            <option key={type.value} value={type.value}>{type.label}</option>
                          ))}
                        </select>
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={field.required}
                            onChange={(e) => updateField(field.id, { required: e.target.checked })}
                            className="rounded"
                          />
                          <span className="text-sm text-gray-600">Обязательное</span>
                        </div>
                      
                      {field.type === 'select' && (
                        <div>
                          <input
                            type="text"
                            value={field.options?.join(', ') || ''}
                            onChange={(e) => updateField(field.id, { options: e.target.value.split(', ').filter(Boolean) })}
                            placeholder="Варианты через запятую"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          />
                        </div>
                      )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            {/* Content Editor - Full Width */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Содержимое документа</h3>
              
              <div className="mb-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <h4 className="text-sm font-medium text-blue-800 mb-2">Доступные переменные:</h4>
                  <div className="text-sm text-blue-700 grid grid-cols-2 md:grid-cols-4 gap-2">
                    <p><code>{'{{counterparty.name}}'}</code> - Название контрагента</p>
                    <p><code>{'{{counterparty.inn}}'}</code> - ИНН контрагента</p>
                    <p><code>{'{{counterparty.address}}'}</code> - Адрес контрагента</p>
                    <p><code>{'{{currentDate}}'}</code> - Текущая дата</p>
                    {fields.map(field => (
                      <p key={field.id}><code>{`{{${field.name}}}`}</code> - {field.label}</p>
                    ))}
                  </div>
                </div>
              </div>

              <div className="border border-gray-300 rounded-lg overflow-hidden">
                <ReactQuill
                  theme="snow"
                  value={templateData.content}
                  onChange={(content) => setTemplateData(prev => ({ ...prev, content }))}
                  modules={quillModules}
                  formats={quillFormats}
                  style={{ height: '500px' }}
                  placeholder="Введите содержимое документа. Используйте переменные в двойных фигурных скобках для динамических данных."
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 mt-8">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Отмена
            </button>
            <button
              onClick={handleSubmit}
              disabled={!templateData.title || !templateData.content}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>Сохранить шаблон</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};