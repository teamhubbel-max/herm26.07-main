import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Star, Link, Building, Tag, TrendingUp, Users } from 'lucide-react';

interface Competitor {
  id: string;
  name: string;
  website: string;
  logo?: string;
  rating: number;
  category: string;
  strengths: string[];
  weaknesses: string[];
  pricing: {
    plan: string;
    price: number;
    features: string[];
  }[];
  socialMedia: {
    platform: string;
    followers: number;
    engagement: number;
  }[];
  lastUpdated: Date;
}

interface CompetitorCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  competitor?: Competitor | null;
  onSave: (competitor: Omit<Competitor, 'id'>) => void;
}

export const CompetitorCardModal: React.FC<CompetitorCardModalProps> = ({
  isOpen,
  onClose,
  competitor,
  onSave
}) => {
  const [formData, setFormData] = useState({
    name: '',
    website: '',
    logo: '',
    rating: 0,
    category: '',
    strengths: [''],
    weaknesses: [''],
    pricing: [{ plan: '', price: 0, features: [''] }],
    socialMedia: [{ platform: '', followers: 0, engagement: 0 }]
  });

  useEffect(() => {
    if (competitor) {
      setFormData({
        name: competitor.name,
        website: competitor.website,
        logo: competitor.logo || '',
        rating: competitor.rating,
        category: competitor.category,
        strengths: competitor.strengths.length > 0 ? competitor.strengths : [''],
        weaknesses: competitor.weaknesses.length > 0 ? competitor.weaknesses : [''],
        pricing: competitor.pricing.length > 0 ? competitor.pricing.map(p => ({
          ...p,
          features: p.features.length > 0 ? p.features : ['']
        })) : [{ plan: '', price: 0, features: [''] }],
        socialMedia: competitor.socialMedia.length > 0 ? competitor.socialMedia : [{ platform: '', followers: 0, engagement: 0 }]
      });
    } else {
      setFormData({
        name: '',
        website: '',
        logo: '',
        rating: 0,
        category: '',
        strengths: [''],
        weaknesses: [''],
        pricing: [{ plan: '', price: 0, features: [''] }],
        socialMedia: [{ platform: '', followers: 0, engagement: 0 }]
      });
    }
  }, [competitor]);

  const addStrength = () => {
    setFormData(prev => ({
      ...prev,
      strengths: [...prev.strengths, '']
    }));
  };

  const updateStrength = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      strengths: prev.strengths.map((s, i) => i === index ? value : s)
    }));
  };

  const removeStrength = (index: number) => {
    setFormData(prev => ({
      ...prev,
      strengths: prev.strengths.filter((_, i) => i !== index)
    }));
  };

  const addWeakness = () => {
    setFormData(prev => ({
      ...prev,
      weaknesses: [...prev.weaknesses, '']
    }));
  };

  const updateWeakness = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      weaknesses: prev.weaknesses.map((w, i) => i === index ? value : w)
    }));
  };

  const removeWeakness = (index: number) => {
    setFormData(prev => ({
      ...prev,
      weaknesses: prev.weaknesses.filter((_, i) => i !== index)
    }));
  };

  const addPricingPlan = () => {
    setFormData(prev => ({
      ...prev,
      pricing: [...prev.pricing, { plan: '', price: 0, features: [''] }]
    }));
  };

  const updatePricingPlan = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      pricing: prev.pricing.map((p, i) => 
        i === index ? { ...p, [field]: value } : p
      )
    }));
  };

  const removePricingPlan = (index: number) => {
    setFormData(prev => ({
      ...prev,
      pricing: prev.pricing.filter((_, i) => i !== index)
    }));
  };

  const addFeature = (planIndex: number) => {
    setFormData(prev => ({
      ...prev,
      pricing: prev.pricing.map((p, i) => 
        i === planIndex ? { ...p, features: [...p.features, ''] } : p
      )
    }));
  };

  const updateFeature = (planIndex: number, featureIndex: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      pricing: prev.pricing.map((p, i) => 
        i === planIndex ? {
          ...p,
          features: p.features.map((f, fi) => fi === featureIndex ? value : f)
        } : p
      )
    }));
  };

  const removeFeature = (planIndex: number, featureIndex: number) => {
    setFormData(prev => ({
      ...prev,
      pricing: prev.pricing.map((p, i) => 
        i === planIndex ? {
          ...p,
          features: p.features.filter((_, fi) => fi !== featureIndex)
        } : p
      )
    }));
  };

  const addSocialMedia = () => {
    setFormData(prev => ({
      ...prev,
      socialMedia: [...prev.socialMedia, { platform: '', followers: 0, engagement: 0 }]
    }));
  };

  const updateSocialMedia = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      socialMedia: prev.socialMedia.map((s, i) => 
        i === index ? { ...s, [field]: value } : s
      )
    }));
  };

  const removeSocialMedia = (index: number) => {
    setFormData(prev => ({
      ...prev,
      socialMedia: prev.socialMedia.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = () => {
    const cleanedData = {
      ...formData,
      strengths: formData.strengths.filter(s => s.trim()),
      weaknesses: formData.weaknesses.filter(w => w.trim()),
      pricing: formData.pricing.filter(p => p.plan.trim()).map(p => ({
        ...p,
        features: p.features.filter(f => f.trim())
      })),
      socialMedia: formData.socialMedia.filter(s => s.platform.trim()),
      lastUpdated: new Date()
    };

    onSave(cleanedData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
            <Building className="w-5 h-5" />
            <span>{competitor ? 'Редактировать конкурента' : 'Добавить конкурента'}</span>
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Название компании *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Название конкурента"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Link className="w-4 h-4 inline mr-1" />
                Веб-сайт *
              </label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://competitor.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Логотип (URL)</label>
              <input
                type="url"
                value={formData.logo}
                onChange={(e) => setFormData(prev => ({ ...prev, logo: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://example.com/logo.png"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Tag className="w-4 h-4 inline mr-1" />
                Категория
              </label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="SaaS, Управление проектами, и т.д."
              />
            </div>
          </div>

          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Рейтинг</label>
            <div className="flex items-center space-x-2">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  onClick={() => setFormData(prev => ({ ...prev, rating: star }))}
                  className={`w-8 h-8 transition-colors ${
                    star <= formData.rating
                      ? 'text-yellow-400 hover:text-yellow-500'
                      : 'text-gray-300 hover:text-yellow-300'
                  }`}
                >
                  <Star className="w-full h-full fill-current" />
                </button>
              ))}
              <span className="text-sm text-gray-600 ml-2">{formData.rating}/5</span>
            </div>
          </div>

          {/* Strengths */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700">Сильные стороны</label>
              <button
                onClick={addStrength}
                className="bg-green-500 text-white px-3 py-1 rounded-lg flex items-center space-x-1 text-sm hover:bg-green-600 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Добавить</span>
              </button>
            </div>
            <div className="space-y-2">
              {formData.strengths.map((strength, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={strength}
                    onChange={(e) => updateStrength(index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Сильная сторона"
                  />
                  <button
                    onClick={() => removeStrength(index)}
                    className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Weaknesses */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700">Слабые стороны</label>
              <button
                onClick={addWeakness}
                className="bg-red-500 text-white px-3 py-1 rounded-lg flex items-center space-x-1 text-sm hover:bg-red-600 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Добавить</span>
              </button>
            </div>
            <div className="space-y-2">
              {formData.weaknesses.map((weakness, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={weakness}
                    onChange={(e) => updateWeakness(index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Слабая сторона"
                  />
                  <button
                    onClick={() => removeWeakness(index)}
                    className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700">Тарифные планы</label>
              <button
                onClick={addPricingPlan}
                className="bg-blue-500 text-white px-3 py-1 rounded-lg flex items-center space-x-1 text-sm hover:bg-blue-600 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Добавить план</span>
              </button>
            </div>
            <div className="space-y-4">
              {formData.pricing.map((plan, planIndex) => (
                <div key={planIndex} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900">План {planIndex + 1}</h4>
                    <button
                      onClick={() => removePricingPlan(planIndex)}
                      className="p-1 text-red-500 hover:text-red-700 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <input
                      type="text"
                      value={plan.plan}
                      onChange={(e) => updatePricingPlan(planIndex, 'plan', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Название плана"
                    />
                    <input
                      type="number"
                      value={plan.price}
                      onChange={(e) => updatePricingPlan(planIndex, 'price', Number(e.target.value))}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Цена"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Функции</span>
                      <button
                        onClick={() => addFeature(planIndex)}
                        className="text-blue-500 hover:text-blue-700 text-sm"
                      >
                        + Добавить функцию
                      </button>
                    </div>
                    <div className="space-y-2">
                      {plan.features.map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={feature}
                            onChange={(e) => updateFeature(planIndex, featureIndex, e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            placeholder="Функция плана"
                          />
                          <button
                            onClick={() => removeFeature(planIndex, featureIndex)}
                            className="p-1 text-red-500 hover:text-red-700 transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Social Media */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700">
                <Users className="w-4 h-4 inline mr-1" />
                Социальные сети
              </label>
              <button
                onClick={addSocialMedia}
                className="bg-purple-500 text-white px-3 py-1 rounded-lg flex items-center space-x-1 text-sm hover:bg-purple-600 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Добавить</span>
              </button>
            </div>
            <div className="space-y-3">
              {formData.socialMedia.map((social, index) => (
                <div key={index} className="grid grid-cols-3 gap-3">
                  <input
                    type="text"
                    value={social.platform}
                    onChange={(e) => updateSocialMedia(index, 'platform', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Платформа"
                  />
                  <input
                    type="number"
                    value={social.followers}
                    onChange={(e) => updateSocialMedia(index, 'followers', Number(e.target.value))}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Подписчики"
                  />
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      step="0.1"
                      value={social.engagement}
                      onChange={(e) => updateSocialMedia(index, 'engagement', Number(e.target.value))}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Вовлеченность %"
                    />
                    <button
                      onClick={() => removeSocialMedia(index)}
                      className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-6 py-3 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Отмена
            </button>
            <button
              onClick={handleSubmit}
              disabled={!formData.name || !formData.website}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {competitor ? 'Обновить' : 'Добавить'} конкурента
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};