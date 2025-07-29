import React, { useState } from 'react';
import { Loader2, AlertCircle, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export const AuthPage: React.FC = () => {
  const { 
    signInWithGoogle, 
    signInWithEmail, 
    signUpWithEmail, 
    loading, 
    error, 
    isSupabaseConfigured, 
    enterDemoMode 
  } = useAuth();
  
  const [isSignUp, setIsSignUp] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: ''
  });

  const handleGoogleSignIn = async () => {
    console.log('🔐 Попытка входа через Google');
    setAuthLoading(true);
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        console.error('❌ Ошибка входа через Google:', error);
      }
    } catch (error) {
      console.error('❌ Исключение при входе через Google:', error);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log(`🔐 Попытка ${isSignUp ? 'регистрации' : 'входа'} по email:`, formData.email);
    setAuthLoading(true);
    
    try {
      if (isSignUp) {
        console.log('📝 Регистрация нового пользователя');
        const { error } = await signUpWithEmail(
          formData.email, 
          formData.password, 
          formData.fullName
        );
        if (error) {
          console.error('❌ Ошибка регистрации:', error);
        } else {
          console.log('✅ Регистрация успешна');
        }
      } else {
        console.log('🔑 Вход существующего пользователя');
        const { error } = await signInWithEmail(formData.email, formData.password);
        if (error) {
          console.error('❌ Ошибка входа:', error);
        } else {
          console.log('✅ Вход успешен');
        }
      }
    } catch (error) {
      console.error('❌ Исключение при авторизации:', error);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleDemoMode = () => {
    console.log('🎭 Активация демо режима');
    enterDemoMode();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg mb-4">
            <span className="text-white font-bold text-2xl">H</span>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isSignUp ? 'Создать аккаунт' : 'Добро пожаловать в Гермес'}
          </h1>
          <p className="text-gray-600">
            {isSignUp 
              ? 'Зарегистрируйтесь для начала работы'
              : 'Система управления проектами для современных команд'
            }
          </p>
        </div>

        {/* Auth Form */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <div className="space-y-6">
            {/* Error Display */}
            {error && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-medium text-red-800">Ошибка авторизации</h3>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                  {error.includes('Неверный email или пароль') && (
                    <p className="text-sm text-red-600 mt-2">
                      💡 Возможно, вам нужно сначала <button 
                        onClick={() => setIsSignUp(true)}
                        className="underline hover:no-underline font-medium"
                      >
                        зарегистрироваться
                      </button>
                    </p>
                  )}
                  {error.includes('уже существует') && (
                    <p className="text-sm text-red-600 mt-2">
                      💡 Попробуйте <button 
                        onClick={() => setIsSignUp(false)}
                        className="underline hover:no-underline font-medium"
                      >
                        войти
                      </button> с этим email
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Google Auth Button */}
            {isSupabaseConfigured && (
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={authLoading || loading}
                className="w-full bg-white border-2 border-gray-300 text-gray-700 font-medium py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center space-x-3 hover:bg-gray-50 hover:border-gray-400 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {authLoading || loading ? (
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
            {isSupabaseConfigured && (
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">или</span>
                </div>
              </div>
            )}

            {/* Email/Password Form */}
            {isSupabaseConfigured && (
              <form onSubmit={handleEmailAuth} className="space-y-4">
                {isSignUp && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Полное имя
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        value={formData.fullName}
                        onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Введите ваше имя"
                        required={isSignUp}
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email адрес
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Пароль
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                      className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Введите пароль"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={authLoading || loading}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-4 px-6 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {authLoading || loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <span>{isSignUp ? 'Создать аккаунт' : 'Войти'}</span>
                  )}
                </button>
              </form>
            )}

            {/* Toggle Sign In/Up */}
            {isSupabaseConfigured && (
              <div className="text-center">
                <button
                  onClick={() => {
                    console.log(`🔄 Переключение на ${!isSignUp ? 'регистрацию' : 'вход'}`);
                    setIsSignUp(!isSignUp);
                    setFormData({ email: '', password: '', fullName: '' });
                  }}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  {isSignUp 
                    ? 'Уже есть аккаунт? Войти' 
                    : 'Нет аккаунта? Зарегистрироваться'
                  }
                </button>
              </div>
            )}

            {/* Supabase Status */}
            {!isSupabaseConfigured && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="text-sm font-medium text-yellow-800">Требуется настройка</h3>
                    <p className="text-sm text-yellow-700 mt-1">
                      Подключите Supabase для полноценной авторизации. Нажмите "Connect to Supabase" в правом верхнем углу.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Demo Mode */}
            <div className="pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handleDemoMode}
                className="w-full bg-gray-500 hover:bg-gray-600 text-white font-medium py-3 px-6 rounded-xl transition-all duration-200"
              >
                Демо режим (без авторизации)
              </button>
              <p className="text-xs text-gray-500 text-center mt-2">
                Для тестирования функций без регистрации
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            Продолжая, вы соглашаетесь с условиями использования
          </p>
        </div>
      </div>
    </div>
  );
};