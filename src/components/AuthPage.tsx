import React, { useState } from 'react';
import { AlertCircle, Mail, Lock, User, Eye, EyeOff, LogIn, UserPlus } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

/**
 * ==========================================================================
 * СТРАНИЦА АВТОРИЗАЦИИ (AUTH PAGE)
 * ==========================================================================
 * 
 * Простая и понятная форма авторизации с переключением между режимами.
 * Поддерживает только email/password без внешних провайдеров.
 * 
 * ФУНКЦИОНАЛЬНОСТЬ:
 * - Переключение: вход ↔ регистрация
 * - Валидация полей в реальном времени
 * - Показ/скрытие пароля
 * - Четкие сообщения об ошибках
 * - Автоматические подсказки для пользователя
 * 
 * ДИЗАЙН:
 * - Градиентный фон с анимацией
 * - Стеклянный эффект для формы
 * - Плавные анимации переходов
 * - Адаптивная верстка для мобильных
 * 
 * АНИМАЦИИ:
 * - fadeIn при загрузке страницы
 * - slideIn для формы
 * - bounce для кнопок
 * - pulse для состояния загрузки
 */
export const AuthPage: React.FC = () => {
  const { signInWithEmail, signUpWithEmail, loading, error } = useAuth();
  
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: ''
  });

  const [validationErrors, setValidationErrors] = useState({
    email: '',
    password: '',
    fullName: ''
  });

  const validateForm = () => {
    const errors = {
      email: '',
      password: '',
      fullName: ''
    };

    // Email validation
    if (!formData.email) {
      errors.email = 'Email обязателен';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Некорректный email';
    }

    // Password validation
    if (!formData.password) {
      errors.password = 'Пароль обязателен';
    } else if (formData.password.length < 6) {
      errors.password = 'Пароль должен быть минимум 6 символов';
    }

    // Full name validation for sign up
    if (isSignUp && !formData.fullName.trim()) {
      errors.fullName = 'Имя обязательно';
    }

    setValidationErrors(errors);
    return !Object.values(errors).some(error => error !== '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    console.log(`🔐 Попытка ${isSignUp ? 'регистрации' : 'входа'} с email:`, formData.email);
    
    try {
      let result;
      
      if (isSignUp) {
        result = await signUpWithEmail(
          formData.email, 
          formData.password, 
          formData.fullName
        );
      } else {
        result = await signInWithEmail(formData.email, formData.password);
      }

      if (result.error) {
        console.error('❌ Ошибка авторизации:', result.error);
      } else {
        console.log('✅ Успешная авторизация');
        // Форма очистится автоматически при успешной авторизации
      }
    } catch (err) {
      console.error('❌ Исключение при авторизации:', err);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Очищаем ошибку валидации при вводе
    if (validationErrors[field as keyof typeof validationErrors]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const toggleMode = () => {
    console.log(`🔄 Переключение на ${!isSignUp ? 'регистрацию' : 'вход'}`);
    setIsSignUp(!isSignUp);
    setFormData({ email: '', password: '', fullName: '' });
    setValidationErrors({ email: '', password: '', fullName: '' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="w-full max-w-md">
        {/* Logo and Header */}
        <div className="text-center mb-8 animate-slideIn">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl shadow-2xl mb-6 animate-scaleUp">
            <span className="text-white font-bold text-3xl">H</span>
          </div>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            {isSignUp ? 'Создать аккаунт' : 'Добро пожаловать'}
          </h1>
          <p className="text-gray-600 text-lg">
            {isSignUp 
              ? 'Присоединяйтесь к TeamHub для управления проектами'
              : 'Войдите в TeamHub для продолжения работы'
            }
          </p>
        </div>

        {/* Auth Form */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 animate-slideIn">
          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start space-x-3 animate-fadeIn">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-medium text-red-800">Ошибка авторизации</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
                {error.includes('Неверный email или пароль') && (
                  <p className="text-sm text-red-600 mt-2">
                    💡 Возможно, вам нужно сначала{' '}
                    <button 
                      onClick={() => setIsSignUp(true)}
                      className="underline hover:no-underline font-medium transition-all"
                    >
                      зарегистрироваться
                    </button>
                  </p>
                )}
                {error.includes('уже существует') && (
                  <p className="text-sm text-red-600 mt-2">
                    💡 Попробуйте{' '}
                    <button 
                      onClick={() => setIsSignUp(false)}
                      className="underline hover:no-underline font-medium transition-all"
                    >
                      войти
                    </button>
                    {' '}с этим email
                  </p>
                )}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name - только для регистрации */}
            {isSignUp && (
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Полное имя
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    className={`w-full pl-12 pr-4 py-4 border-2 rounded-xl focus:outline-none transition-all duration-300 ${
                      validationErrors.fullName 
                        ? 'border-red-300 focus:border-red-500 bg-red-50' 
                        : 'border-gray-200 focus:border-blue-500 focus:bg-blue-50'
                    }`}
                    placeholder="Введите ваше полное имя"
                    required={isSignUp}
                  />
                </div>
                {validationErrors.fullName && (
                  <p className="text-sm text-red-600 flex items-center space-x-1">
                    <AlertCircle className="w-4 h-4" />
                    <span>{validationErrors.fullName}</span>
                  </p>
                )}
              </div>
            )}

            {/* Email */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Email адрес
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`w-full pl-12 pr-4 py-4 border-2 rounded-xl focus:outline-none transition-all duration-300 ${
                    validationErrors.email 
                      ? 'border-red-300 focus:border-red-500 bg-red-50' 
                      : 'border-gray-200 focus:border-blue-500 focus:bg-blue-50'
                  }`}
                  placeholder="your@email.com"
                  required
                />
              </div>
              {validationErrors.email && (
                <p className="text-sm text-red-600 flex items-center space-x-1">
                  <AlertCircle className="w-4 h-4" />
                  <span>{validationErrors.email}</span>
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Пароль
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className={`w-full pl-12 pr-14 py-4 border-2 rounded-xl focus:outline-none transition-all duration-300 ${
                    validationErrors.password 
                      ? 'border-red-300 focus:border-red-500 bg-red-50' 
                      : 'border-gray-200 focus:border-blue-500 focus:bg-blue-50'
                  }`}
                  placeholder="Введите пароль"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {validationErrors.password && (
                <p className="text-sm text-red-600 flex items-center space-x-1">
                  <AlertCircle className="w-4 h-4" />
                  <span>{validationErrors.password}</span>
                </p>
              )}
              {isSignUp && (
                <p className="text-xs text-gray-500 mt-1">
                  Минимум 6 символов
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  {isSignUp ? <UserPlus className="w-5 h-5" /> : <LogIn className="w-5 h-5" />}
                  <span className="text-lg">
                    {isSignUp ? 'Создать аккаунт' : 'Войти в систему'}
                  </span>
                </>
              )}
            </button>
          </form>

          {/* Toggle Mode */}
          <div className="text-center mt-8">
            <p className="text-gray-600 mb-3">
              {isSignUp ? 'Уже есть аккаунт?' : 'Нет аккаунта?'}
            </p>
            <button
              onClick={toggleMode}
              className="text-blue-600 hover:text-blue-700 font-semibold text-lg transition-all duration-300 hover:underline"
            >
              {isSignUp ? 'Войти в систему' : 'Создать аккаунт'}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 animate-fadeIn">
          <p className="text-sm text-gray-500">
            © 2024 TeamHub. Современная система управления проектами.
          </p>
        </div>
      </div>
    </div>
  );
};