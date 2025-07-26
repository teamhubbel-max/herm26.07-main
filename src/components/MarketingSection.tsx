import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Plus, 
  TrendingUp, 
  Users, 
  Globe,
  Eye,
  Star,
  Link,
  BarChart3,
  Target,
  Zap,
  Brain,
  ExternalLink,
  Settings,
  Filter,
  Download,
  Bookmark,
  ThumbsUp,
  Share2
} from 'lucide-react';
import { CompetitorAnalysisModal } from './CompetitorAnalysisModal';
import { PostGeneratorModal } from './PostGeneratorModal';
import { CompetitorCardModal } from './CompetitorCardModal';

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

interface Publication {
  id: string;
  title: string;
  summary: string;
  source: string;
  publishedAt: Date;
  relevanceScore: number;
  keywords: string[];
  url: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  bookmarked: boolean;
}

interface Post {
  id: string;
  content: string;
  platform: string;
  engagementRate: number;
  likes: number;
  shares: number;
  comments: number;
  createdAt: Date;
  selected: boolean;
}

export const MarketingSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState('competitors');
  const [searchTerm, setSearchTerm] = useState('');
  const [keywordFilter, setKeywordFilter] = useState('');
  const [selectedCompetitors, setSelectedCompetitors] = useState<string[]>([]);
  const [selectedPosts, setSelectedPosts] = useState<string[]>([]);
  
  // Modals
  const [isCompetitorAnalysisOpen, setIsCompetitorAnalysisOpen] = useState(false);
  const [isPostGeneratorOpen, setIsPostGeneratorOpen] = useState(false);
  const [isCompetitorCardOpen, setIsCompetitorCardOpen] = useState(false);
  const [editingCompetitor, setEditingCompetitor] = useState<Competitor | null>(null);

  // Mock data - в реальном приложении это будет из API
  const [competitors, setCompetitors] = useState<Competitor[]>([
    {
      id: '1',
      name: 'TechFlow Solutions',
      website: 'https://techflow.com',
      logo: 'https://images.pexels.com/photos/267350/pexels-photo-267350.jpeg?auto=compress&cs=tinysrgb&w=150',
      rating: 4.5,
      category: 'SaaS',
      strengths: ['Быстрая разработка', 'Отличная поддержка'],
      weaknesses: ['Высокая цена', 'Сложный интерфейс'],
      pricing: [
        { plan: 'Базовый', price: 99, features: ['5 проектов', 'Базовая поддержка'] },
        { plan: 'Про', price: 299, features: ['Неограниченно проектов', 'Приоритетная поддержка'] }
      ],
      socialMedia: [
        { platform: 'LinkedIn', followers: 15000, engagement: 3.2 },
        { platform: 'Twitter', followers: 8000, engagement: 2.8 }
      ],
      lastUpdated: new Date()
    },
    {
      id: '2',
      name: 'ProjectMaster',
      website: 'https://projectmaster.io',
      rating: 4.2,
      category: 'Project Management',
      strengths: ['Гибкие настройки', 'Интеграции'],
      weaknesses: ['Медленная работа'],
      pricing: [
        { plan: 'Стартап', price: 49, features: ['3 проекта', 'Email поддержка'] }
      ],
      socialMedia: [
        { platform: 'LinkedIn', followers: 5000, engagement: 4.1 }
      ],
      lastUpdated: new Date()
    }
  ]);

  const [publications, setPublications] = useState<Publication[]>([
    {
      id: '1',
      title: 'Тренды управления проектами в 2024',
      summary: 'Исследование показывает рост популярности agile-методологий и инструментов автоматизации в управлении проектами.',
      source: 'TechCrunch',
      publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      relevanceScore: 95,
      keywords: ['управление проектами', 'agile', 'автоматизация'],
      url: 'https://techcrunch.com/project-management-trends',
      sentiment: 'positive',
      bookmarked: false
    },
    {
      id: '2',
      title: 'Сравнение SaaS решений для малого бизнеса',
      summary: 'Подробный анализ популярных SaaS платформ, их преимуществ и недостатков для стартапов.',
      source: 'Forbes',
      publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      relevanceScore: 88,
      keywords: ['SaaS', 'малый бизнес', 'стартапы'],
      url: 'https://forbes.com/saas-small-business',
      sentiment: 'neutral',
      bookmarked: true
    }
  ]);

  const [posts, setPosts] = useState<Post[]>([
    {
      id: '1',
      content: 'Запустили новую функцию автоматизации! Теперь создание отчетов займет в 3 раза меньше времени. 🚀',
      platform: 'LinkedIn',
      engagementRate: 5.2,
      likes: 156,
      shares: 23,
      comments: 45,
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      selected: false
    },
    {
      id: '2',
      content: 'Наша команда выросла до 50+ специалистов! Продолжаем развиваться и искать таланты.',
      platform: 'Twitter',
      engagementRate: 3.8,
      likes: 89,
      shares: 12,
      comments: 18,
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      selected: false
    }
  ]);

  const filteredCompetitors = useMemo(() => {
    return competitors.filter(competitor => 
      competitor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      competitor.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [competitors, searchTerm]);

  const filteredPublications = useMemo(() => {
    return publications.filter(pub => 
      pub.title.toLowerCase().includes(keywordFilter.toLowerCase()) ||
      pub.keywords.some(keyword => keyword.toLowerCase().includes(keywordFilter.toLowerCase()))
    );
  }, [publications, keywordFilter]);

  const toggleCompetitorSelection = (competitorId: string) => {
    setSelectedCompetitors(prev => 
      prev.includes(competitorId) 
        ? prev.filter(id => id !== competitorId)
        : [...prev, competitorId]
    );
  };

  const togglePostSelection = (postId: string) => {
    setSelectedPosts(prev => 
      prev.includes(postId) 
        ? prev.filter(id => id !== postId)
        : [...prev, postId]
    );
  };

  const toggleBookmark = (publicationId: string) => {
    setPublications(prev => 
      prev.map(pub => 
        pub.id === publicationId ? { ...pub, bookmarked: !pub.bookmarked } : pub
      )
    );
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600 bg-green-50';
      case 'negative': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const tabs = [
    { id: 'competitors', label: 'Конкуренты', icon: Target },
    { id: 'publications', label: 'Публикации', icon: Globe },
    { id: 'posts', label: 'Посты', icon: Share2 },
    { id: 'analytics', label: 'Аналитика', icon: BarChart3 }
  ];

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Маркетинг</h1>
                <p className="text-gray-600 mt-1">Анализ конкурентов, мониторинг публикаций и создание контента</p>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setIsCompetitorAnalysisOpen(true)}
                  className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors duration-200"
                >
                  <BarChart3 className="w-5 h-5" />
                  <span>Анализ цен</span>
                </button>
                <button
                  onClick={() => setIsPostGeneratorOpen(true)}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors duration-200 shadow-lg hover:shadow-xl"
                >
                  <Brain className="w-5 h-5" />
                  <span>Генерация поста</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Tabs */}
          <div className="bg-white rounded-xl border border-gray-200 mb-8">
            <div className="flex border-b border-gray-200">
              {tabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 px-6 py-4 font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'text-blue-600 border-b-2 border-blue-600'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="p-6">
              {activeTab === 'competitors' && (
                <div>
                  {/* Search and Controls */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="relative flex-1 max-w-md">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        placeholder="Поиск конкурентов..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <button
                      onClick={() => {
                        setEditingCompetitor(null);
                        setIsCompetitorCardOpen(true);
                      }}
                      className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors"
                    >
                      <Plus className="w-5 h-5" />
                      <span>Добавить конкурента</span>
                    </button>
                  </div>

                  {/* Competitors Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCompetitors.map(competitor => (
                      <div
                        key={competitor.id}
                        className={`bg-white rounded-xl border-2 p-6 cursor-pointer transition-all duration-200 ${
                          selectedCompetitors.includes(competitor.id)
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                        }`}
                        onClick={() => toggleCompetitorSelection(competitor.id)}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <img
                              src={competitor.logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(competitor.name)}&background=random`}
                              alt={competitor.name}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                            <div>
                              <h3 className="font-semibold text-gray-900">{competitor.name}</h3>
                              <span className="text-sm text-gray-500">{competitor.category}</span>
                            </div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingCompetitor(competitor);
                              setIsCompetitorCardOpen(true);
                            }}
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <Settings className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="flex items-center space-x-1 mb-3">
                          {[1, 2, 3, 4, 5].map(star => (
                            <Star
                              key={star}
                              className={`w-4 h-4 ${
                                star <= competitor.rating
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                          <span className="text-sm text-gray-600 ml-2">{competitor.rating}</span>
                        </div>

                        <div className="space-y-2 mb-4">
                          <div>
                            <span className="text-xs text-gray-500">Сильные стороны:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {competitor.strengths.slice(0, 2).map(strength => (
                                <span key={strength} className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                                  {strength}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <a
                            href={competitor.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-blue-600 hover:text-blue-700 flex items-center space-x-1"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>Сайт</span>
                          </a>
                          <span className="text-gray-500">
                            Обновлено {competitor.lastUpdated.toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'publications' && (
                <div>
                  {/* Search and Filter */}
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="relative flex-1 max-w-md">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        placeholder="Поиск по ключевым словам..."
                        value={keywordFilter}
                        onChange={(e) => setKeywordFilter(e.target.value)}
                        className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">Найдено: {filteredPublications.length}</span>
                    </div>
                  </div>

                  {/* Publications List */}
                  <div className="space-y-4">
                    {filteredPublications.map(publication => (
                      <div key={publication.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 cursor-pointer">
                                {publication.title}
                              </h3>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSentimentColor(publication.sentiment)}`}>
                                {publication.sentiment === 'positive' ? 'Позитивная' : 
                                 publication.sentiment === 'negative' ? 'Негативная' : 'Нейтральная'}
                              </span>
                            </div>
                            <p className="text-gray-600 mb-3">{publication.summary}</p>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <span>{publication.source}</span>
                              <span>•</span>
                              <span>{publication.publishedAt.toLocaleDateString()}</span>
                              <span>•</span>
                              <span>Релевантность: {publication.relevanceScore}%</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 ml-4">
                            <button
                              onClick={() => toggleBookmark(publication.id)}
                              className={`p-2 rounded-lg transition-colors ${
                                publication.bookmarked
                                  ? 'text-yellow-600 bg-yellow-50 hover:bg-yellow-100'
                                  : 'text-gray-400 hover:text-yellow-600 hover:bg-yellow-50'
                              }`}
                            >
                              <Bookmark className="w-4 h-4" />
                            </button>
                            <a
                              href={publication.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {publication.keywords.map(keyword => (
                            <span key={keyword} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                              #{keyword}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'posts' && (
                <div>
                  {/* Controls */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-gray-600">
                        Выбрано постов: {selectedPosts.length}
                      </span>
                      {selectedPosts.length > 0 && (
                        <button
                          onClick={() => setIsPostGeneratorOpen(true)}
                          className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                        >
                          <Brain className="w-4 h-4" />
                          <span>Создать пост на основе выбранных</span>
                        </button>
                      )}
                    </div>
                    <button
                      onClick={() => setSelectedPosts([])}
                      className="text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      Очистить выбор
                    </button>
                  </div>

                  {/* Posts Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {posts.map(post => (
                      <div
                        key={post.id}
                        className={`bg-white rounded-lg border-2 p-6 cursor-pointer transition-all duration-200 ${
                          selectedPosts.includes(post.id)
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                        }`}
                        onClick={() => togglePostSelection(post.id)}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                            {post.platform}
                          </span>
                          <span className="text-sm text-gray-500">
                            {post.createdAt.toLocaleDateString()}
                          </span>
                        </div>
                        
                        <p className="text-gray-900 mb-4 leading-relaxed">{post.content}</p>
                        
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-1">
                              <ThumbsUp className="w-4 h-4 text-blue-500" />
                              <span>{post.likes}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Share2 className="w-4 h-4 text-green-500" />
                              <span>{post.shares}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <span>{post.comments} комментариев</span>
                            </div>
                          </div>
                          <span className="font-medium text-purple-600">
                            {post.engagementRate}% вовлеченность
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'analytics' && (
                <div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-900">Отслеживаемые конкуренты</h3>
                        <Target className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="text-3xl font-bold text-gray-900 mb-2">{competitors.length}</div>
                      <p className="text-sm text-gray-600">+2 за этот месяц</p>
                    </div>
                    
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-900">Релевантные публикации</h3>
                        <Globe className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="text-3xl font-bold text-gray-900 mb-2">{publications.length}</div>
                      <p className="text-sm text-gray-600">За последние 7 дней</p>
                    </div>
                    
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-900">Средняя вовлеченность</h3>
                        <TrendingUp className="w-5 h-5 text-purple-600" />
                      </div>
                      <div className="text-3xl font-bold text-gray-900 mb-2">
                        {(posts.reduce((sum, post) => sum + post.engagementRate, 0) / posts.length).toFixed(1)}%
                      </div>
                      <p className="text-sm text-gray-600">По всем постам</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <CompetitorAnalysisModal
        isOpen={isCompetitorAnalysisOpen}
        onClose={() => setIsCompetitorAnalysisOpen(false)}
        competitors={competitors.filter(c => selectedCompetitors.includes(c.id))}
      />

      <PostGeneratorModal
        isOpen={isPostGeneratorOpen}
        onClose={() => setIsPostGeneratorOpen(false)}
        selectedPosts={posts.filter(p => selectedPosts.includes(p.id))}
      />

      <CompetitorCardModal
        isOpen={isCompetitorCardOpen}
        onClose={() => setIsCompetitorCardOpen(false)}
        competitor={editingCompetitor}
        onSave={(competitorData) => {
          if (editingCompetitor) {
            setCompetitors(prev => prev.map(c => 
              c.id === editingCompetitor.id ? { ...competitorData, id: c.id } : c
            ));
          } else {
            setCompetitors(prev => [...prev, { ...competitorData, id: crypto.randomUUID() }]);
          }
          setIsCompetitorCardOpen(false);
          setEditingCompetitor(null);
        }}
      />
    </>
  );
};