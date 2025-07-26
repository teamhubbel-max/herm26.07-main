import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface TelegramUpdate {
  update_id: number
  message?: {
    message_id: number
    from: {
      id: number
      first_name: string
      last_name?: string
      username?: string
    }
    chat: {
      id: number
      type: string
    }
    date: number
    text?: string
  }
}

interface TelegramMessage {
  chat_id: number
  text: string
  parse_mode?: string
  reply_markup?: any
}

const TELEGRAM_BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

// Отправка сообщения в Telegram
async function sendTelegramMessage(message: TelegramMessage) {
  const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(message),
  })
  
  return response.json()
}

// Генерация кода верификации
function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// Сохранение кода верификации в базе данных
async function saveVerificationCode(telegramId: number, email: string, code: string) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/telegram_verifications`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
      'apikey': SUPABASE_SERVICE_ROLE_KEY,
    },
    body: JSON.stringify({
      telegram_id: telegramId,
      email: email,
      verification_code: code,
      expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 минут
      verified: false
    }),
  })
  
  if (!response.ok) {
    throw new Error('Failed to save verification code')
  }
}

// Проверка кода верификации
async function verifyCode(telegramId: number, code: string) {
  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/telegram_verifications?telegram_id=eq.${telegramId}&verification_code=eq.${code}&verified=eq.false&expires_at=gt.${new Date().toISOString()}`,
    {
      headers: {
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
      },
    }
  )
  
  const data = await response.json()
  
  if (data.length > 0) {
    // Помечаем код как использованный
    await fetch(`${SUPABASE_URL}/rest/v1/telegram_verifications?id=eq.${data[0].id}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
      },
      body: JSON.stringify({ verified: true }),
    })
    
    return data[0]
  }
  
  return null
}

// Связывание Telegram с пользователем
async function linkTelegramToUser(email: string, telegramId: number, username?: string) {
  // Находим пользователя по email
  const userResponse = await fetch(
    `${SUPABASE_URL}/rest/v1/profiles?email=eq.${email}`,
    {
      headers: {
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
      },
    }
  )
  
  const users = await userResponse.json()
  
  if (users.length > 0) {
    // Обновляем профиль пользователя
    await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${users[0].id}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
      },
      body: JSON.stringify({
        telegram_id: telegramId,
        telegram_username: username
      }),
    })
    
    return users[0]
  }
  
  return null
}

// Отправка уведомления о новой задаче
export async function sendTaskNotification(userId: string, taskTitle: string, projectTitle: string) {
  try {
    const userResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}`,
      {
        headers: {
          'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          'apikey': SUPABASE_SERVICE_ROLE_KEY,
        },
      }
    )
    
    const users = await userResponse.json()
    
    if (users.length > 0 && users[0].telegram_id) {
      await sendTelegramMessage({
        chat_id: users[0].telegram_id,
        text: `🔔 *Новая задача назначена*\n\n📋 Задача: ${taskTitle}\n📁 Проект: ${projectTitle}\n\nПерейдите в приложение для просмотра деталей.`,
        parse_mode: 'Markdown'
      })
    }
  } catch (error) {
    console.error('Error sending task notification:', error)
  }
}

// Отправка уведомления о выполненной задаче
export async function sendTaskCompletedNotification(projectId: string, taskTitle: string, assigneeName: string) {
  try {
    // Получаем руководителей и наблюдателей проекта
    const membersResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/project_members?project_id=eq.${projectId}&role=in.(owner,observer)&select=*,profile:profiles(*)`,
      {
        headers: {
          'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          'apikey': SUPABASE_SERVICE_ROLE_KEY,
        },
      }
    )
    
    const members = await membersResponse.json()
    
    for (const member of members) {
      if (member.profile.telegram_id) {
        await sendTelegramMessage({
          chat_id: member.profile.telegram_id,
          text: `✅ *Задача выполнена*\n\n📋 Задача: ${taskTitle}\n👤 Исполнитель: ${assigneeName}\n\nЗадача успешно завершена.`,
          parse_mode: 'Markdown'
        })
      }
    }
  } catch (error) {
    console.error('Error sending task completed notification:', error)
  }
}

// Отправка уведомления о приближающемся дедлайне
export async function sendDeadlineNotification(userId: string, taskTitle: string, dueDate: Date) {
  try {
    const userResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}`,
      {
        headers: {
          'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          'apikey': SUPABASE_SERVICE_ROLE_KEY,
        },
      }
    )
    
    const users = await userResponse.json()
    
    if (users.length > 0 && users[0].telegram_id) {
      const daysUntilDeadline = Math.ceil((dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      
      await sendTelegramMessage({
        chat_id: users[0].telegram_id,
        text: `⏰ *Приближается дедлайн*\n\n📋 Задача: ${taskTitle}\n📅 Дедлайн: ${dueDate.toLocaleDateString('ru-RU')}\n⏳ Осталось: ${daysUntilDeadline} дн.\n\nНе забудьте завершить задачу вовремя!`,
        parse_mode: 'Markdown'
      })
    }
  } catch (error) {
    console.error('Error sending deadline notification:', error)
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body: TelegramUpdate = await req.json()
    
    if (body.message?.text) {
      const chatId = body.message.chat.id
      const text = body.message.text
      const userId = body.message.from.id
      const username = body.message.from.username
      
      // Команда /start
      if (text === '/start' || text === '/start register') {
        await sendTelegramMessage({
          chat_id: chatId,
          text: `👋 Добро пожаловать в Hermes Project Manager!\n\n🔗 Для связи вашего аккаунта отправьте команду:\n\`/verify ваш@email.com\`\n\n📋 Доступные команды:\n/help - помощь\n/verify - верификация аккаунта\n/status - статус аккаунта`,
          parse_mode: 'Markdown'
        })
      }
      
      // Команда /help
      else if (text === '/help') {
        await sendTelegramMessage({
          chat_id: chatId,
          text: `📚 *Справка по командам:*\n\n/start - начать работу с ботом\n/verify email - привязать аккаунт\n/status - проверить статус\n/tasks - мои задачи\n/help - эта справка\n\n🔔 Бот автоматически присылает уведомления о:\n• Новых задачах\n• Завершенных задачах\n• Приближающихся дедлайнах`,
          parse_mode: 'Markdown'
        })
      }
      
      // Команда /verify email
      else if (text.startsWith('/verify ')) {
        const email = text.replace('/verify ', '').trim()
        
        if (!email.includes('@')) {
          await sendTelegramMessage({
            chat_id: chatId,
            text: '❌ Неверный формат email. Используйте: /verify ваш@email.com'
          })
        } else {
          const verificationCode = generateVerificationCode()
          
          try {
            await saveVerificationCode(userId, email, verificationCode)
            
            await sendTelegramMessage({
              chat_id: chatId,
              text: `📧 Код верификации отправлен!\n\n🔑 Ваш код: \`${verificationCode}\`\n\n⏰ Код действителен 10 минут.\nВведите его в приложении для завершения привязки аккаунта.`,
              parse_mode: 'Markdown'
            })
          } catch (error) {
            await sendTelegramMessage({
              chat_id: chatId,
              text: '❌ Ошибка при создании кода верификации. Попробуйте позже.'
            })
          }
        }
      }
      
      // Проверка кода верификации (6-значное число)
      else if (/^\d{6}$/.test(text)) {
        const verification = await verifyCode(userId, text)
        
        if (verification) {
          const user = await linkTelegramToUser(verification.email, userId, username)
          
          if (user) {
            await sendTelegramMessage({
              chat_id: chatId,
              text: `✅ *Аккаунт успешно привязан!*\n\n👤 Email: ${verification.email}\n🔗 Telegram: @${username || 'пользователь'}\n\n🔔 Теперь вы будете получать уведомления о задачах и дедлайнах.`,
              parse_mode: 'Markdown'
            })
          } else {
            await sendTelegramMessage({
              chat_id: chatId,
              text: '❌ Пользователь с таким email не найден. Сначала зарегистрируйтесь в приложении.'
            })
          }
        } else {
          await sendTelegramMessage({
            chat_id: chatId,
            text: '❌ Неверный или истекший код верификации. Запросите новый код командой /verify ваш@email.com'
          })
        }
      }
      
      // Команда /status
      else if (text === '/status') {
        const userResponse = await fetch(
          `${SUPABASE_URL}/rest/v1/profiles?telegram_id=eq.${userId}`,
          {
            headers: {
              'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
              'apikey': SUPABASE_SERVICE_ROLE_KEY,
            },
          }
        )
        
        const users = await userResponse.json()
        
        if (users.length > 0) {
          await sendTelegramMessage({
            chat_id: chatId,
            text: `✅ *Аккаунт привязан*\n\n👤 Email: ${users[0].email}\n📝 Имя: ${users[0].full_name}\n🔔 Уведомления: включены`,
            parse_mode: 'Markdown'
          })
        } else {
          await sendTelegramMessage({
            chat_id: chatId,
            text: '❌ Аккаунт не привязан. Используйте команду /verify ваш@email.com для привязки.'
          })
        }
      }
      
      // Команда /tasks
      else if (text === '/tasks') {
        const userResponse = await fetch(
          `${SUPABASE_URL}/rest/v1/profiles?telegram_id=eq.${userId}`,
          {
            headers: {
              'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
              'apikey': SUPABASE_SERVICE_ROLE_KEY,
            },
          }
        )
        
        const users = await userResponse.json()
        
        if (users.length > 0) {
          const tasksResponse = await fetch(
            `${SUPABASE_URL}/rest/v1/tasks?assignee_id=eq.${users[0].id}&status=neq.done&select=*,project:projects(title)`,
            {
              headers: {
                'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
                'apikey': SUPABASE_SERVICE_ROLE_KEY,
              },
            }
          )
          
          const tasks = await tasksResponse.json()
          
          if (tasks.length > 0) {
            const tasksList = tasks.map((task: any, index: number) => 
              `${index + 1}. ${task.title}\n   📁 ${task.project.title}\n   ⏰ ${task.due_date ? new Date(task.due_date).toLocaleDateString('ru-RU') : 'Без дедлайна'}`
            ).join('\n\n')
            
            await sendTelegramMessage({
              chat_id: chatId,
              text: `📋 *Ваши активные задачи:*\n\n${tasksList}`,
              parse_mode: 'Markdown'
            })
          } else {
            await sendTelegramMessage({
              chat_id: chatId,
              text: '✅ У вас нет активных задач!'
            })
          }
        } else {
          await sendTelegramMessage({
            chat_id: chatId,
            text: '❌ Аккаунт не привязан. Используйте команду /verify ваш@email.com'
          })
        }
      }
      
      // Неизвестная команда
      else {
        await sendTelegramMessage({
          chat_id: chatId,
          text: '❓ Неизвестная команда. Используйте /help для просмотра доступных команд.'
        })
      }
    }

    return new Response(JSON.stringify({ ok: true }), {
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