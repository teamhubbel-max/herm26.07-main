import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

// Функция для проверки и отправки напоминаний о дедлайнах
async function checkDeadlines() {
  try {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)

    const dayAfterTomorrow = new Date(tomorrow)
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1)

    // Получаем задачи с дедлайном завтра
    const tasksResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/tasks?due_date=gte.${tomorrow.toISOString()}&due_date=lt.${dayAfterTomorrow.toISOString()}&status=neq.done&select=*,assignee:profiles!tasks_assignee_id_fkey(id,full_name,telegram_id),project:projects(title)`,
      {
        headers: {
          'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          'apikey': SUPABASE_SERVICE_ROLE_KEY,
        },
      }
    )

    const tasks = await tasksResponse.json()

    for (const task of tasks) {
      if (task.assignee?.telegram_id) {
        // Отправляем напоминание через telegram-bot функцию
        await fetch(`${SUPABASE_URL}/functions/v1/telegram-bot`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          },
          body: JSON.stringify({
            type: 'deadline_reminder',
            chat_id: task.assignee.telegram_id,
            task_title: task.title,
            project_title: task.project.title,
            due_date: task.due_date
          }),
        })

        // Логируем отправку уведомления
        await fetch(`${SUPABASE_URL}/rest/v1/telegram_notifications`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
            'Content-Type': 'application/json',
            'apikey': SUPABASE_SERVICE_ROLE_KEY,
          },
          body: JSON.stringify({
            user_id: task.assignee.id,
            telegram_id: task.assignee.telegram_id,
            message: `Напоминание о дедлайне: ${task.title}`,
            notification_type: 'deadline_reminder',
            entity_id: task.id,
            delivered: true
          }),
        })
      }
    }

    return { success: true, checked_tasks: tasks.length }
  } catch (error) {
    console.error('Error checking deadlines:', error)
    return { success: false, error: error.message }
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { action } = await req.json()

    if (action === 'check_deadlines') {
      const result = await checkDeadlines()
      
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ error: 'Unknown action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})