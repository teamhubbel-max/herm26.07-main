import React, { useState } from 'react';
import { DragDropContext, DropResult } from 'react-beautiful-dnd';
import { 
  ArrowLeft, 
  Plus, 
  Users, 
  Calendar, 
  TrendingUp, 
  Settings,
  UserPlus,
  Download,
  Shield
} from 'lucide-react';
import { Task } from '../types/Task';
import { Board } from '../types/Task';
import { UserRow } from './UserRow';
import { AddTaskModal } from './AddTaskModal';
import { TaskDetailsModal } from './TaskDetailsModal';
import { InviteUserModal } from './InviteUserModal';
import { AccessSettingsModal } from './AccessSettingsModal';
import { ReportModal } from './ReportModal';
import { FloatingSidebar } from './FloatingSidebar';

interface User {
  id: string;
  name: string;
  avatar: string;
  role: 'owner' | 'member' | 'observer';
  tasks: {
    todo: Task[];
    inprogress: Task[];
    done: Task[];
  };
}

interface ProjectBoardProps {
  project: any;
  onBack: () => void;
  board: Board;
  onMoveTask: (taskId: string, destinationColumnId: string, destinationIndex: number) => void;
  onAddTask: (task: any) => void;
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
  onDeleteTask: (taskId: string) => void;
  onAddComment: (taskId: string, content: string) => void;
  getTaskComments: (taskId: string) => Promise<any[]>;
}

export const ProjectBoard: React.FC<ProjectBoardProps> = ({ 
  project, onBack, board, onMoveTask, onAddTask, onUpdateTask, onDeleteTask, onAddComment, getTaskComments 
}) => {
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [isTaskDetailsModalOpen, setIsTaskDetailsModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isAccessModalOpen, setIsAccessModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string>('');

  // Используем реальные данные из доски
  const allTasks = board.columns.flatMap(column => column.tasks);

  const columns = [
    { id: 'todo', title: 'Холодильник', color: 'bg-gray-100' },
    { id: 'inprogress', title: 'Сделать', color: 'bg-blue-100' },
    { id: 'inprogress2', title: 'В работе', color: 'bg-orange-100' },
    { id: 'done', title: 'Выполнено', color: 'bg-green-100' }
  ];

  // Создаем пользователей на основе реальных задач
  const users: User[] = [
    {
      id: project?.owner_id || '1',
      name: project?.owner?.name || 'Владелец проекта',
      avatar: project?.owner?.avatar || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150',
      role: 'owner' as const,
      tasks: {
        todo: allTasks.filter(t => t.status === 'todo'),
        inprogress: allTasks.filter(t => t.status === 'inprogress'),
        inprogress2: allTasks.filter(t => t.status === 'inprogress2'),
        done: allTasks.filter(t => t.status === 'done')
      }
    },
    // Добавляем других участников проекта
    ...(project?.members || []).filter((member: any) => member.id !== project?.owner_id).map((member: any) => ({
      id: member.id,
      name: member.name,
      avatar: member.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=random`,
      role: 'member' as const,
      tasks: {
        todo: allTasks.filter(t => t.status === 'todo' && t.assignee === member.name),
        inprogress: allTasks.filter(t => t.status === 'inprogress' && t.assignee === member.name),
        inprogress2: allTasks.filter(t => t.status === 'inprogress2' && t.assignee === member.name),
        done: allTasks.filter(t => t.status === 'done' && t.assignee === member.name)
      }
    }))
  ];

  // Добавляем пользователя "Неназначенные задачи" если есть задачи без исполнителя
  const unassignedTasks = {
    todo: allTasks.filter(t => t.status === 'todo' && !t.assignee),
    inprogress: allTasks.filter(t => t.status === 'inprogress' && !t.assignee),
    inprogress2: allTasks.filter(t => t.status === 'inprogress2' && !t.assignee),
    done: allTasks.filter(t => t.status === 'done' && !t.assignee)
  };

  const hasUnassignedTasks = Object.values(unassignedTasks).some(tasks => tasks.length > 0);

  // Убираем фейкового пользователя "Неназначенные"
  // if (hasUnassignedTasks) {
  //   users.push({
  //     id: 'unassigned',
  //     name: 'Неназначенные',
  //     avatar: 'https://ui-avatars.com/api/?name=?&background=cccccc&color=666666',
  //     role: 'observer',
  //     tasks: unassignedTasks
  //   });
  // }

  const handleDragEnd = (result: DropResult) => {
    onMoveTask(result.draggableId, result.destination?.droppableId || '', result.destination?.index || 0);
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsTaskDetailsModalOpen(true);
  };

  const handleAddTask = (userId?: string) => {
    setSelectedUserId(userId || '');
    setIsAddTaskModalOpen(true);
  };

  const handleTaskAdd = (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    onAddTask(task);
    setIsAddTaskModalOpen(false);
    setSelectedUserId('');
  };

  const handleTaskUpdate = (taskId: string, updates: Partial<Task>) => {
    onUpdateTask(taskId, updates);
  };

  const totalTasks = allTasks.length;
  const completedTasks = allTasks.filter(t => t.status === 'done').length;
  const inProgressTasks = allTasks.filter(t => t.status === 'inprogress' || t.status === 'inprogress2').length;

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-blue-500 text-white p-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="flex items-center space-x-2 text-white hover:text-blue-200 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Назад к проектам</span>
              </button>
              <h1 className="text-xl font-bold">{project?.title || 'mosmarketsrv.ru'}</h1>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-8 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4" />
                  <span>Участников: {users.length}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>Всего задач: {totalTasks}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4" />
                  <span>В работе: {inProgressTasks}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span>Выполнено: {completedTasks}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Board */}
        <div className="p-6">
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            {/* Column Headers */}
            <div className="grid border-b border-gray-200" style={{ gridTemplateColumns: '80px 1fr 1fr 1fr 1fr' }}>
              <div className="p-4 bg-gray-50 font-medium text-gray-900 border-r border-gray-200">
                <Users className="w-5 h-5 mx-auto" />
              </div>
              {columns.map((column) => (
                <div key={column.id} className={`p-4 ${column.color} font-medium text-gray-900 border-r border-gray-200 last:border-r-0`}>
                  {column.title}
                </div>
              ))}
            </div>

            {/* User Rows */}
            <DragDropContext onDragEnd={handleDragEnd}>
              {users.map((user, index) => (
                <UserRow
                  key={user.id}
                  user={user}
                  columns={columns}
                  onTaskClick={handleTaskClick}
                  onAddTask={() => handleAddTask(user.id)}
                  isLastRow={index === users.length - 1}
                />
              ))}
            </DragDropContext>
          </div>
        </div>
      </div>

      {/* Floating Sidebar */}
      <FloatingSidebar
        onAddTask={() => handleAddTask()}
        onInviteUser={() => setIsInviteModalOpen(true)}
        onAccessSettings={() => setIsAccessModalOpen(true)}
        onGenerateReport={() => setIsReportModalOpen(true)}
      />

      {/* Modals */}
      <AddTaskModal
        isOpen={isAddTaskModalOpen}
        onClose={() => {
          setIsAddTaskModalOpen(false);
          setSelectedUserId('');
        }}
        onAdd={handleTaskAdd}
        users={users}
        selectedUserId={selectedUserId}
      />

      {selectedTask && (
        <TaskDetailsModal
          isOpen={isTaskDetailsModalOpen}
          onClose={() => {
            setIsTaskDetailsModalOpen(false);
            setSelectedTask(null);
          }}
          task={selectedTask}
          onUpdate={handleTaskUpdate}
          onAddComment={onAddComment}
          getTaskComments={getTaskComments}
        />
      )}

      <InviteUserModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        project={project}
      />

      <AccessSettingsModal
        isOpen={isAccessModalOpen}
        onClose={() => setIsAccessModalOpen(false)}
        users={users}
        onUpdateAccess={(userId, role) => {
          setUsers(prevUsers => 
            prevUsers.map(user => 
              user.id === userId ? { ...user, role } : user
            )
          );
        }}
      />

      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        project={project}
        users={users}
      />
    </>
  );
};