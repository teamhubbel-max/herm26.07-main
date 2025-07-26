/*
  # Создание таблиц для Telegram интеграции

  1. Новые таблицы
    - `telegram_verifications`
      - `id` (uuid, primary key)
      - `telegram_id` (bigint)
      - `email` (text)
      - `verification_code` (text)
      - `expires_at` (timestamp)
      - `verified` (boolean)
      - `created_at` (timestamp)

  2. Обновления существующих таблиц
    - Добавление полей `telegram_id` и `telegram_username` в таблицу `profiles`

  3. Security
    - Enable RLS on new tables
    - Add appropriate policies
*/

-- Добавляем поля для Telegram в профили пользователей
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'telegram_id'
  ) THEN
    ALTER TABLE profiles ADD COLUMN telegram_id BIGINT;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'telegram_username'
  ) THEN
    ALTER TABLE profiles ADD COLUMN telegram_username TEXT;
  END IF;
END $$;

-- Создаем таблицу для верификации через Telegram
CREATE TABLE IF NOT EXISTS telegram_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  telegram_id BIGINT NOT NULL,
  email TEXT NOT NULL,
  verification_code TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Включаем RLS
ALTER TABLE telegram_verifications ENABLE ROW LEVEL SECURITY;

-- Политика для чтения верификаций (только для service role)
CREATE POLICY "Service role can read all telegram_verifications"
  ON telegram_verifications
  FOR ALL
  TO service_role
  USING (true);

-- Создаем таблицу для уведомлений
CREATE TABLE IF NOT EXISTS telegram_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  telegram_id BIGINT NOT NULL,
  message TEXT NOT NULL,
  notification_type TEXT NOT NULL CHECK (notification_type IN ('task_assigned', 'task_completed', 'deadline_reminder', 'project_invitation')),
  entity_id UUID, -- ID задачи, проекта и т.д.
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  delivered BOOLEAN DEFAULT FALSE
);

-- Включаем RLS для уведомлений
ALTER TABLE telegram_notifications ENABLE ROW LEVEL SECURITY;

-- Политика для уведомлений
CREATE POLICY "Users can read own telegram notifications"
  ON telegram_notifications
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Service role can manage all telegram_notifications"
  ON telegram_notifications
  FOR ALL
  TO service_role
  USING (true);

-- Создаем индексы для оптимизации
CREATE INDEX IF NOT EXISTS idx_profiles_telegram_id ON profiles(telegram_id);
CREATE INDEX IF NOT EXISTS idx_telegram_verifications_telegram_id ON telegram_verifications(telegram_id);
CREATE INDEX IF NOT EXISTS idx_telegram_verifications_code ON telegram_verifications(verification_code);
CREATE INDEX IF NOT EXISTS idx_telegram_notifications_user_id ON telegram_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_telegram_notifications_telegram_id ON telegram_notifications(telegram_id);