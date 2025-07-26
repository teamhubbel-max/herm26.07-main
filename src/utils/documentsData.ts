import { v4 as uuidv4 } from 'uuid';
import { Document, DocumentTemplate } from '../types/Document';

export const createMockDocuments = (projects: any[]): Document[] => {
  const now = new Date();
  
  return [
    {
      id: uuidv4(),
      title: 'Договор на разработку ПО',
      description: 'Договор на разработку системы управления проектами',
      templateId: 'contract-dev',
      templateName: 'Договор на разработку',
      projectId: projects[0]?.id || '1',
      projectTitle: projects[0]?.title || 'Гермес',
      projectColor: projects[0]?.color || '#3B82F6',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      createdBy: 'Александр Похомов',
      status: 'completed',
      counterparty: {
        name: 'ООО "ТехноСофт"',
        inn: '7701234567',
        address: 'г. Москва, ул. Тверская, д. 1',
        phone: '+7 (495) 123-45-67',
        email: 'info@technosoft.ru',
        director: 'Иванов Иван Иванович'
      }
    },
    {
      id: uuidv4(),
      title: 'Техническое задание',
      description: 'ТЗ на разработку мобильного приложения',
      templateId: 'tech-spec',
      templateName: 'Техническое задание',
      projectId: projects[1]?.id || '2',
      projectTitle: projects[1]?.title || 'Мобильное приложение',
      projectColor: projects[1]?.color || '#10B981',
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      createdBy: 'Артем Богданский',
      status: 'draft',
      counterparty: {
        name: 'ИП Петров П.П.',
        inn: '123456789012',
        address: 'г. СПб, Невский пр., д. 50',
        phone: '+7 (812) 987-65-43',
        email: 'petrov@example.com',
        director: 'Петров Петр Петрович'
      }
    },
    {
      id: uuidv4(),
      title: 'Акт выполненных работ',
      description: 'Акт по завершению этапа редизайна',
      templateId: 'work-act',
      templateName: 'Акт выполненных работ',
      projectId: projects[2]?.id || '3',
      projectTitle: projects[2]?.title || 'Редизайн сайта',
      projectColor: projects[2]?.color || '#8B5CF6',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
      createdBy: 'Lolita',
      status: 'sent'
    }
  ];
};

export const createMockTemplates = (): DocumentTemplate[] => {
  return [
    {
      id: 'contract-dev',
      title: 'Договор на разработку',
      description: 'Стандартный договор на разработку программного обеспечения',
      category: 'Договоры',
      isCustom: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      fields: [
        {
          id: 'contract_number',
          name: 'contractNumber',
          label: 'Номер договора',
          type: 'text',
          required: true,
          placeholder: 'Например: Д-001/2024'
        },
        {
          id: 'contract_date',
          name: 'contractDate',
          label: 'Дата договора',
          type: 'date',
          required: true
        },
        {
          id: 'project_cost',
          name: 'projectCost',
          label: 'Стоимость проекта',
          type: 'number',
          required: true,
          placeholder: 'Сумма в рублях'
        },
        {
          id: 'deadline',
          name: 'deadline',
          label: 'Срок выполнения',
          type: 'date',
          required: true
        }
      ],
      content: `ДОГОВОР НА РАЗРАБОТКУ ПРОГРАММНОГО ОБЕСПЕЧЕНИЯ

№ {{contractNumber}} от {{contractDate}}

Заказчик: {{counterparty.name}}
ИНН: {{counterparty.inn}}
Адрес: {{counterparty.address}}

Предмет договора: Разработка программного обеспечения
Стоимость: {{projectCost}} рублей
Срок выполнения: до {{deadline}}`
    },
    {
      id: 'tech-spec',
      title: 'Техническое задание',
      description: 'Шаблон технического задания на разработку',
      category: 'Техническая документация',
      isCustom: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      fields: [
        {
          id: 'project_name',
          name: 'projectName',
          label: 'Название проекта',
          type: 'text',
          required: true
        },
        {
          id: 'project_description',
          name: 'projectDescription',
          label: 'Описание проекта',
          type: 'textarea',
          required: true
        },
        {
          id: 'tech_stack',
          name: 'techStack',
          label: 'Технологический стек',
          type: 'select',
          required: true,
          options: ['React + Node.js', 'Vue + Laravel', 'Angular + .NET', 'Flutter + Firebase']
        }
      ],
      content: `ТЕХНИЧЕСКОЕ ЗАДАНИЕ

Проект: {{projectName}}
Заказчик: {{counterparty.name}}

1. ОПИСАНИЕ ПРОЕКТА
{{projectDescription}}

2. ТЕХНИЧЕСКИЕ ТРЕБОВАНИЯ
Технологический стек: {{techStack}}

3. ФУНКЦИОНАЛЬНЫЕ ТРЕБОВАНИЯ
[Детальное описание функций]`
    },
    {
      id: 'work-act',
      title: 'Акт выполненных работ',
      description: 'Акт приемки выполненных работ',
      category: 'Отчетность',
      isCustom: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      fields: [
        {
          id: 'act_number',
          name: 'actNumber',
          label: 'Номер акта',
          type: 'text',
          required: true
        },
        {
          id: 'work_period',
          name: 'workPeriod',
          label: 'Период выполнения работ',
          type: 'text',
          required: true,
          placeholder: 'Например: январь 2024'
        },
        {
          id: 'work_description',
          name: 'workDescription',
          label: 'Описание выполненных работ',
          type: 'textarea',
          required: true
        }
      ],
      content: `АКТ ВЫПОЛНЕННЫХ РАБОТ

№ {{actNumber}} от {{currentDate}}

Исполнитель: Наша компания
Заказчик: {{counterparty.name}}

Период: {{workPeriod}}

ВЫПОЛНЕННЫЕ РАБОТЫ:
{{workDescription}}

Работы выполнены в полном объеме и в срок.`
    },
    {
      id: 'invoice',
      title: 'Счет на оплату',
      description: 'Счет для выставления заказчику',
      category: 'Финансы',
      isCustom: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      fields: [
        {
          id: 'invoice_number',
          name: 'invoiceNumber',
          label: 'Номер счета',
          type: 'text',
          required: true
        },
        {
          id: 'amount',
          name: 'amount',
          label: 'Сумма к оплате',
          type: 'number',
          required: true
        },
        {
          id: 'payment_terms',
          name: 'paymentTerms',
          label: 'Срок оплаты (дней)',
          type: 'number',
          required: true,
          defaultValue: '10'
        }
      ],
      content: `СЧЕТ НА ОПЛАТУ

№ {{invoiceNumber}} от {{currentDate}}

Плательщик: {{counterparty.name}}
ИНН: {{counterparty.inn}}

К оплате: {{amount}} рублей
Срок оплаты: {{paymentTerms}} дней

Назначение платежа: Оплата по договору`
    }
  ];
};