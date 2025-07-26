import { supabase } from '../lib/supabase';

interface NotificationData {
  userId: string;
  telegramId?: number;
  message: string;
  notificationType: 'task_assigned' | 'task_completed' | 'deadline_reminder' | 'project_invitation';
  entityId?: string;
}

class TelegramNotificationService {
  private readonly botFunctionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/telegram-bot`;

  async sendNotification(data: NotificationData) {
    try {
      // Сохраняем уведомление в базе данных
      const { error } = await supabase
        .from('telegram_notifications')
        .insert({
          user_id: data.userId,
          telegram_id: data.telegramId || 0,
          message: data.message,
          notification_type: data.notificationType,
          entity_id: data.entityId,
          delivered: false
        });

      if (error) {
        console.error('Error saving notification:', error);
        return false;
      }

      // Отправляем уведомление через бота (если есть telegram_id)
      if (data.telegramId) {
        const response = await fetch('/api/telegram/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            chat_id: data.telegramId,
            message: data.message,
            notification_type: data.notificationType
          }),
        });

        if (!response.ok) {
          console.error('Error sending telegram message:', await response.text());
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('Error sending notification:', error);
      return false;
    }
  }

  async sendTaskAssignedNotification(assigneeId: string, taskTitle: string, projectTitle: string) {
    // Получаем telegram_id пользователя
    const { data: profile } = await supabase
      .from('profiles')
      .select('telegram_id, full_name')
      .eq('id', assigneeId)
      .single();

    if (profile?.telegram_id) {
      await this.sendNotification({
        userId: assigneeId,
        telegramId: profile.telegram_id,
        message: `🔔 *Новая задача назначена*\n\n📋 Задача: ${taskTitle}\n📁 Проект: ${projectTitle}\n\nПерейдите в приложение для просмотра деталей.`,
        notificationType: 'task_assigned'
      });
    }
  }

  async sendTaskCompletedNotification(projectId: string, taskTitle: string, assigneeName: string) {
    // Получаем руководителей и наблюдателей проекта
    const { data: members } = await supabase
      .from('project_members')
      .select(`
        user_id,
        role,
        profile:profiles (
          telegram_id,
          full_name
        )
      `)
      .eq('project_id', projectId)
      .in('role', ['owner', 'observer']);

    if (members) {
      for (const member of members) {
        if (member.profile?.telegram_id) {
          await this.sendNotification({
            userId: member.user_id,
            telegramId: member.profile.telegram_id,
            message: `✅ *Задача выполнена*\n\n📋 Задача: ${taskTitle}\n👤 Исполнитель: ${assigneeName}\n\nЗадача успешно завершена.`,
            notificationType: 'task_completed'
          });
        }
      }
    }
  }

  async sendDeadlineReminder(userId: string, taskTitle: string, dueDate: Date) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('telegram_id, full_name')
      .eq('id', userId)
      .single();

    if (profile?.telegram_id) {
      const daysUntilDeadline = Math.ceil((dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      
      await this.sendNotification({
        userId,
        telegramId: profile.telegram_id,
        message: `⏰ *Приближается дедлайн*\n\n📋 Задача: ${taskTitle}\n📅 Дедлайн: ${dueDate.toLocaleDateString('ru-RU')}\n⏳ Осталось: ${daysUntilDeadline} дн.\n\nНе забудьте завершить задачу вовремя!`,
        notificationType: 'deadline_reminder'
      });
    }
  }

  async sendProjectInvitation(email: string, projectTitle: string, inviterName: string) {
    // Находим пользователя по email
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, telegram_id, full_name')
      .eq('email', email)
      .single();

    if (profile?.telegram_id) {
      await this.sendNotification({
        userId: profile.id,
        telegramId: profile.telegram_id,
        message: `📨 *Приглашение в проект*\n\n📁 Проект: ${projectTitle}\n👤 От: ${inviterName}\n\nВы получили приглашение присоединиться к проекту. Проверьте приложение для ответа.`,
        notificationType: 'project_invitation'
      });
    }
  }

  // Проверка дедлайнов и отправка напоминаний
  async checkAndSendDeadlineReminders() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const dayAfterTomorrow = new Date(tomorrow);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

    try {
      const { data: tasks } = await supabase
        .from('tasks')
        .select(`
          id,
          title,
          due_date,
          assignee_id,
          project:projects (
            title
          )
        `)
        .gte('due_date', tomorrow.toISOString())
        .lt('due_date', dayAfterTomorrow.toISOString())
        .neq('status', 'done');

      if (tasks) {
        for (const task of tasks) {
          if (task.assignee_id && task.due_date) {
            await this.sendDeadlineReminder(
              task.assignee_id,
              task.title,
              new Date(task.due_date)
            );
          }
        }
      }
    } catch (error) {
      console.error('Error checking deadlines:', error);
    }
  }
}

export const telegramNotificationService = new TelegramNotificationService();