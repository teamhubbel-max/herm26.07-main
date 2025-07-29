import React, { useState } from 'react';
import { DragDropContext, DropResult } from 'react-beautiful-dnd';
import { ArrowLeft, Users, Calendar, TrendingUp } from 'lucide-react';
import { Board as BoardType, Task } from '../types/Task';
import { Column } from './Column';
import { AddTaskModal } from './AddTaskModal';

interface BoardProps {
  board: BoardType;
  project?: any;
  onMoveTask: (taskId: string, destinationColumnId: string, destinationIndex: number) => void;
  onAddTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
  onDeleteTask: (taskId: string) => void;
  searchTerm: string;
  onBackToDashboard?: () => void;
}

export const Board: React.FC<BoardProps> = ({
  board,
  project,
  onMoveTask,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  searchTerm,
  onBackToDashboard
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [targetStatus, setTargetStatus] = useState<'todo' | 'inprogress' | 'done'>('todo');

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    onMoveTask(draggableId, destination.droppableId, destination.index);
  };

  const handleAddTask = (status: 'todo' | 'inprogress' | 'done') => {
    setTargetStatus(status);
    setIsAddModalOpen(true);
  };

  const handleTaskAdd = (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    onAddTask({ ...task, status: targetStatus });
    setIsAddModalOpen(false);
  };

  // Filter tasks based on search term
  const filteredBoard = {
    ...board,
    columns: board.columns.map(column => ({
      ...column,
      tasks: column.tasks.filter(task => 
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (task.assignee && task.assignee.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }))
  };

  return (
    <>
      <div className="p-6">
        {/* Project Header */}
        {project && (
          <div className="mb-6 bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {onBackToDashboard && (
                  <button
                    onClick={onBackToDashboard}
                    className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>К панели управления</span>
                  </button>
                )}
                <div 
                  className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg"
                  style={{ backgroundColor: project.color }}
                >
                  {project.title.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">{project.title}</h1>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Users className="w-4 h-4" />
                      <span>{project.membersCount} участников</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <TrendingUp className="w-4 h-4" />
                      <span>{project.progress}% выполнено</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>Обновлён {new Date(project.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Team Members */}
              <div className="flex -space-x-2">
                {project.members.slice(0, 4).map((member: any, index: number) => (
                  <img
                    key={member.id}
                    src={member.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=random`}
                    alt={member.name}
                    className="w-8 h-8 rounded-full border-2 border-white"
                    title={member.name}
                  />
                ))}
                {project.membersCount > 4 && (
                  <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-600">
                    +{project.membersCount - 4}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {project ? `Доска задач - ${project.title}` : board.title}
          </h1>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <span>
              Всего задач: {board.columns.reduce((sum, col) => sum + col.tasks.length, 0)}
            </span>
            <span>•</span>
            <span>
              Выполнено: {board.columns.find(col => col.status === 'done')?.tasks.length || 0}
            </span>
            <span>•</span>
            <span>
              В работе: {board.columns.find(col => col.status === 'inprogress')?.tasks.length || 0}
            </span>
          </div>
        </div>

        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {filteredBoard.columns.map((column) => (
              <Column
                key={column.id}
                column={column}
                onUpdate={onUpdateTask}
                onDelete={onDeleteTask}
                onAddTask={handleAddTask}
              />
            ))}
          </div>
        </DragDropContext>
      </div>

      <AddTaskModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleTaskAdd}
        defaultStatus={targetStatus}
      />
    </>
  );
};