import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Loader2, MessageCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { TelegramVerificationModal } from './TelegramVerificationModal';

export const AuthPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [telegramLoading, setTelegramLoading] = useState(false);
  const [showTelegramModal, setShowTelegramModal] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    fullName: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { isSupabaseConfigured } = useAuth();

  const handleGoogleSignIn = async () => {
    if (!isSupabaseConfigured) {
      setErrors({ general: 'Google OAuth доступен только с настроенной базой данных' });
      return;
    }
    
    try {
      setLoading(true);
      const { supabase } = await import('../lib/supabase');
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      
      if (error) {
        setErrors({ general: error.message });
      }
    } catch (error) {
      setErrors({ general: 'Ошибка входа через Google' });
    } finally {
      setLoading(false);
    }
  };

  const handleTelegramAuth = async () => {
    if (!formData.email) {
      setErrors({ general: 'Введите email адрес для регистрации через Telegram' });
      return;
    }
    
    try {
      setTelegramLoading(true);
      
      // Сохраняем email и открываем модальное окно для Telegram верификации
      setRegisteredEmail(formData.email);
      setShowTelegramModal(true);
      
    } catch (error) {
      setErrors({ general: 'Ошибка при регистрации через Telegram' });
    } finally {
      setTelegramLoading(false);
    }
  };

  const validateEmail = (email: string) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  const handleTelegramSuccess = () => {
    setShowTelegramModal(false);
    setErrors({ general: 'Аккаунт успешно привязан к Telegram! Теперь вы будете получать уведомления.' });
  };
  return (
    <>
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg mb-4">
            <span className="text-white font-bold text-2xl">H</span>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Добро пожаловать в Гермес!
          </h1>
          <p className="text-gray-600">
            Система управления проектами для современных команд
          </p>
        </div>

        {/* Auth Form */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <div className="space-y-6">
            {/* Description */}
            <div className="text-center mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Выберите способ входа</h2>
              <p className="text-gray-600">Войдите с помощью Google или зарегистрируйтесь через Telegram</p>
            </div>

            {/* Google Auth Button */}
            {isSupabaseConfigured && (
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full bg-white border-2 border-gray-300 text-gray-700 font-medium py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center space-x-3 hover:bg-gray-50 hover:border-gray-400 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <>
                    <svg className="w-6 h-6" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <span className="text-lg">Войти через Google</span>
                  </>
                )}
              </button>
            )}
            
            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">или зарегистрируйтесь</span>
              </div>
            </div>

            {/* Telegram Registration Section */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
              <div className="text-center mb-4">
                <MessageCircle className="w-12 h-12 text-blue-600 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-blue-900 mb-2">Регистрация через Telegram</h3>
                <p className="text-blue-700 text-sm">Получайте уведомления прямо в Telegram</p>
              </div>

              {/* Email для Telegram регистрации */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email адрес
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, email: e.target.value }));
                      if (errors.email) {
                        setErrors(prev => ({ ...prev, email: '' }));
                      }
                    }}
                    className={`w-full pl-10 pr-4 py-3 border border-blue-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                      errors.email ? 'border-red-300 bg-red-50' : ''
                    }`}
                    placeholder="example@email.com"
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>
              
              {/* Optional Name */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ваше имя (необязательно)
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                    className="w-full pl-10 pr-4 py-3 border border-blue-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Как к вам обращаться?"
                  />
                </div>
              </div>
              
              {/* Telegram Button */}
              <button
                type="button"
                onClick={handleTelegramAuth}
                disabled={telegramLoading || !formData.email || !validateEmail(formData.email)}
                className="w-full mt-6 bg-blue-500 hover:bg-blue-600 text-white font-medium py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
              >
                {telegramLoading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <>
                    <MessageCircle className="w-6 h-6" />
                    <span className="text-lg">Зарегистрироваться через Telegram</span>
                  </>
                )}
              </button>
            </div>

            {/* General Error */}
            {errors.general && (
              <div className={`p-4 rounded-xl ${
                errors.general.includes('Проверьте email') 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-red-50 border border-red-200'
              }`}>
                <p className={`text-sm ${
                  errors.general.includes('Проверьте email') 
                    ? 'text-green-700' 
                    : 'text-red-700'
                }`}>
                  {errors.general}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            Продолжая, вы соглашаетесь с нашими условиями использования
          </p>
        </div>
      </div>
    </div>
    {/* Telegram Verification Modal */}
    <TelegramVerificationModal
      isOpen={showTelegramModal}
      onClose={() => setShowTelegramModal(false)}
      userEmail={registeredEmail}
      onSuccess={handleTelegramSuccess}
    />
    </>
  );
};