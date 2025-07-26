import { useState, useEffect } from 'react';
import { db, User } from '../lib/database';

interface Session {
  user: User;
  access_token: string;
  refresh_token: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initAuth = () => {
      try {
        // Проверяем сохраненную сессию
        const savedSession = localStorage.getItem('hermes-session');
        
        if (savedSession) {
          const sessionData = JSON.parse(savedSession);
          
          // Проверяем существует ли пользователь в базе
          const userData = db.getUserByEmail(sessionData.user.email);
          if (userData) {
            sessionData.user = userData; // Обновляем данные пользователя
          }
          
          setSession(sessionData);
          setUser(sessionData.user);
        }
      } catch (err) {
        console.error('Error loading session:', err);
        // Очищаем поврежденные данные
        localStorage.removeItem('hermes-session');
      }
      
      setLoading(false);
    };

    initAuth();
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      setLoading(true);
      setError(null);

      // Проверяем не существует ли уже пользователь в базе
      const userExists = db.getUserByEmail(email);
      
      if (userExists) {
        throw new Error('Пользователь с таким email уже существует');
      }

      // Создаем нового пользователя в базе
      const newUser = db.createUser({
        email,
        full_name: fullName,
        role: 'member',
        avatar_url: undefined
      });

      const newSession: Session = {
        user: newUser,
        access_token: crypto.randomUUID(),
        refresh_token: crypto.randomUUID()
      };

      // Сохраняем сессию
      localStorage.setItem('hermes-session', JSON.stringify(newSession));

      setUser(newUser);
      setSession(newSession);

      return { data: { user: newUser, session: newSession }, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка регистрации';
      setError(errorMessage);
      return { data: null, error: { message: errorMessage } };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      // Проверяем существует ли пользователь в базе
      const foundUser = db.getUserByEmail(email);
      
      if (!foundUser) {
        throw new Error('Пользователь не найден');
      }

      // В реальном приложении здесь была бы проверка пароля
      // Для демо принимаем любой пароль

      const newSession: Session = {
        user: foundUser,
        access_token: crypto.randomUUID(),
        refresh_token: crypto.randomUUID()
      };

      // Сохраняем сессию
      localStorage.setItem('hermes-session', JSON.stringify(newSession));

      setUser(foundUser);
      setSession(newSession);

      return { data: { user: foundUser, session: newSession }, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка входа';
      setError(errorMessage);
      return { data: null, error: { message: errorMessage } };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      // Очищаем данные пользователя
      if (user) {
        db.clearUserData(user.id);
      }
      
      localStorage.removeItem('hermes-session');
      
      setUser(null);
      setSession(null);
      setError(null);

      return { error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка выхода';
      return { error: { message: errorMessage } };
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    try {
      if (!user) {
        return { error: new Error('Пользователь не авторизован') };
      }

      const updatedUser = db.updateUser(user.id, updates);
      if (!updatedUser) {
        return { error: new Error('Ошибка обновления профиля') };
      }

      setUser(updatedUser);
      
      // Обновляем сессию
      const newSession = { ...session!, user: updatedUser };
      setSession(newSession);
      localStorage.setItem('hermes-session', JSON.stringify(newSession));

      return { data: updatedUser, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка обновления профиля';
      return { data: null, error: { message: errorMessage } };
    }
  };

  return {
    user,
    profile: user, // Для совместимости с существующим кодом
    session,
    loading,
    error,
    isSupabaseConfigured: true,
    signUp,
    signIn,
    signOut,
    updateProfile,
  };
};