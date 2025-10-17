import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  Search, 
  Tag, 
  ArrowRight, 
  Globe, 
  TrendingUp,
  Bell,
  BookOpen,
  Share2,
  Eye,
  Newspaper,
  FileText,
  AlertTriangle,
  Star,
  Users,
  ChevronRight
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';

interface NewsUpdatesPageProps {
  onPageChange: (page: string) => void;
}

interface NewsArticle {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: 'visa-updates' | 'policy-changes' | 'company-news' | 'travel-alerts' | 'success-stories';
  date: string;
  readTime: string;
  image: string;
  author: string;
  tags: string[];
  featured: boolean;
  views: number;
}

const newsArticles: NewsArticle[] = [
  {
    id: '1',
    title: 'New Digital Visa Processing System Launches for 15 Countries',
    excerpt: 'Revolutionary digital platform reduces visa processing time by 60% across major destinations including UAE, Canada, and Australia.',
    content: 'UGS is proud to announce the launch of our new digital visa processing system...',
    category: 'visa-updates',
    date: '2025-01-10',
    readTime: '3 min read',
    image: 'https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80',
    author: 'Sarah Johnson',
    tags: ['Digital Processing', 'UAE', 'Canada', 'Australia'],
    featured: true,
    views: 1250
  },
  {
    id: '2',
    title: 'Ethiopia Introduces New E-Visa System for Business Travelers',
    excerpt: 'Ethiopian government streamlines business visa applications with new electronic system, reducing processing time to 48 hours.',
    content: 'The Ethiopian Ministry of Foreign Affairs has announced...',
    category: 'policy-changes',
    date: '2025-01-08',
    readTime: '2 min read',
    image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80',
    author: 'Michael Chen',
    tags: ['Ethiopia', 'E-Visa', 'Business Travel'],
    featured: false,
    views: 890
  },
  {
    id: '3',
    title: 'UGS Celebrates 10,000 Successful Visa Applications',
    excerpt: 'Milestone achievement reflects our commitment to excellence in visa and immigration services worldwide.',
    content: 'We are thrilled to announce that UGS has successfully processed...',
    category: 'company-news',
    date: '2025-01-05',
    readTime: '4 min read',
    image: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80',
    author: 'David Wilson',
    tags: ['Milestone', 'Success', 'Achievement'],
    featured: true,
    views: 2100
  },
  {
    id: '4',
    title: 'Travel Alert: Updated COVID-19 Requirements for European Union',
    excerpt: 'Latest health and safety protocols for travelers entering EU countries effective January 2025.',
    content: 'Important updates regarding COVID-19 travel requirements...',
    category: 'travel-alerts',
    date: '2025-01-03',
    readTime: '5 min read',
    image: 'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80',
    author: 'Dr. Emily Rodriguez',
    tags: ['COVID-19', 'EU', 'Health Requirements'],
    featured: false,
    views: 1560
  },
  {
    id: '5',
    title: 'Client Success: From Student Visa to Permanent Residency',
    excerpt: 'How Amara transformed her dreams into reality with our comprehensive immigration support services.',
    content: 'Meet Amara, one of our valued clients who successfully...',
    category: 'success-stories',
    date: '2025-01-01',
    readTime: '6 min read',
    image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80',
    author: 'Lisa Thompson',
    tags: ['Student Visa', 'Permanent Residency', 'Success Story'],
    featured: false,
    views: 780
  },
  {
    id: '6',
    title: 'New Partnership with Global Immigration Law Firms',
    excerpt: 'Strategic partnerships expand our service capabilities across 25 countries with expert legal support.',
    content: 'UGS announces new strategic partnerships with leading immigration law firms...',
    category: 'company-news',
    date: '2024-12-28',
    readTime: '3 min read',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80',
    author: 'Robert Kim',
    tags: ['Partnership', 'Legal Services', 'Global Expansion'],
    featured: false,
    views: 950
  }
];

const categories = [
  { id: 'all', name: 'All Updates', icon: Newspaper, color: 'bg-gradient-to-r from-blue-500 to-blue-600' },
  { id: 'visa-updates', name: 'Visa Updates', icon: FileText, color: 'bg-gradient-to-r from-emerald-500 to-emerald-600' },
  { id: 'policy-changes', name: 'Policy Changes', icon: TrendingUp, color: 'bg-gradient-to-r from-orange-500 to-orange-600' },
  { id: 'company-news', name: 'Company News', icon: Bell, color: 'bg-gradient-to-r from-purple-500 to-purple-600' },
  { id: 'travel-alerts', name: 'Travel Alerts', icon: AlertTriangle, color: 'bg-gradient-to-r from-red-500 to-red-600' },
  { id: 'success-stories', name: 'Success Stories', icon: Star, color: 'bg-gradient-to-r from-yellow-500 to-yellow-600' }
];

export function NewsUpdatesPage({ onPageChange }: NewsUpdatesPageProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);

  const filteredArticles = newsArticles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const featuredArticles = filteredArticles.filter(article => article.featured);
  const regularArticles = filteredArticles.filter(article => !article.featured);

  const getCategoryColor = (category: string) => {
    const colors = {
      'visa-updates': 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
      'policy-changes': 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300',
      'company-news': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
      'travel-alerts': 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
      'success-stories': 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (selectedArticle) {
    return (
      <div className="min-h-screen bg-background">
        {/* Article Header */}
        <div className="bg-gradient-to-br from-primary/5 via-background to-muted/20 dark:from-primary/10 dark:via-background dark:to-muted/10">
          <div className="container mx-auto px-6 md:px-8 lg:px-12 py-12">
            <Button
              variant="ghost"
              onClick={() => setSelectedArticle(null)}
              className="mb-6 hover:bg-primary/10"
            >
              ← Back to News
            </Button>
            
            <div className="max-w-4xl mx-auto">
              <Badge className={`mb-4 ${getCategoryColor(selectedArticle.category)}`}>
                {selectedArticle.category.replace('-', ' ').toUpperCase()}
              </Badge>
              
              <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                {selectedArticle.title}
              </h1>
              
              <div className="flex flex-wrap items-center gap-6 text-muted-foreground mb-8">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(selectedArticle.date)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{selectedArticle.readTime}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  <span>{selectedArticle.views} views</span>
                </div>
                <span>By {selectedArticle.author}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Article Content */}
        <div className="container mx-auto px-6 md:px-8 lg:px-12 py-12">
          <div className="max-w-4xl mx-auto">
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <p className="text-xl text-muted-foreground mb-8">{selectedArticle.excerpt}</p>
              <div className="bg-muted/30 p-8 rounded-2xl mb-8">
                <p>This is where the full article content would be displayed. The content management system would render the complete article with rich formatting, images, and embedded media.</p>
                <p>Key points covered in this article:</p>
                <ul>
                  <li>Detailed analysis of the topic</li>
                  <li>Impact on visa applicants</li>
                  <li>Step-by-step guidance</li>
                  <li>Expert recommendations</li>
                </ul>
              </div>
            </div>

            {/* Article Tags */}
            <div className="flex flex-wrap gap-2 mb-8">
              {selectedArticle.tags.map((tag, index) => (
                <Badge key={index} variant="outline" className="bg-primary/5">
                  <Tag className="w-3 h-3 mr-1" />
                  {tag}
                </Badge>
              ))}
            </div>

            {/* Share Actions */}
            <div className="flex items-center justify-between p-6 bg-muted/30 rounded-2xl">
              <span className="font-medium">Share this article:</span>
              <Button variant="outline" size="sm">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-16 md:py-20 bg-muted/30">
        <div className="site-container site-max">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6">
              <Newspaper className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Latest Updates</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
              News & Updates
            </h1>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Stay informed with the latest visa updates, policy changes, and immigration news from around the world
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search news and articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-12 text-base"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-12 bg-background">
        <div className="site-container site-max">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-4">Browse by Category</h2>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((category) => {
              const Icon = category.icon;
              const isSelected = selectedCategory === category.id;
              return (
                <Button
                  key={category.id}
                  variant={isSelected ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category.id)}
                  className="flex items-center gap-2"
                >
                  <Icon className="w-4 h-4" />
                  {category.name}
                </Button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Articles */}
      {featuredArticles.length > 0 && (
        <section className="py-16 md:py-20 bg-muted/30">
          <div className="site-container site-max">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-4">
                <Star className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">Featured</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Featured Articles</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">Most important updates and breaking news in immigration and visa services</p>
            </div>
          <div className="grid lg:grid-cols-2 gap-8">
            {featuredArticles.map((article) => (
                <div
                  key={article.id} 
                  className="group relative h-full cursor-pointer overflow-hidden rounded-3xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
                  onClick={() => setSelectedArticle(article)}
                >
                  {/* Featured Badge */}
                  <div className="absolute top-6 left-6 z-10">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full shadow-lg">
                      <Star className="w-3 h-3" />
                      FEATURED
                    </div>
                  </div>
                  
                  {/* Image Placeholder */}
                  <div className="relative aspect-[16/10] bg-gradient-to-br from-red-50 via-pink-50 to-orange-50 dark:from-red-950/50 dark:via-pink-950/50 dark:to-orange-950/50 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 via-pink-500/10 to-orange-500/10" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="p-8 rounded-full bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm">
                        <Newspaper className="w-16 h-16 text-red-500/60 dark:text-red-400/60" />
                      </div>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                  </div>
                  
                  {/* Content */}
                  <div className="p-8">
                    <div className="flex items-center justify-between mb-4">
                      <Badge className={`${getCategoryColor(article.category)} px-3 py-1 text-xs font-semibold`}>
                        {article.category.replace('-', ' ').toUpperCase()}
                      </Badge>
                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <Eye className="w-4 h-4" />
                        <span className="font-medium">{article.views.toLocaleString()}</span>
                      </div>
                    </div>
                    
                    <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors duration-300 leading-tight">
                      {article.title}
                    </h3>
                    
                    <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed line-clamp-3">
                      {article.excerpt}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span className="font-medium">{formatDate(article.date)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span className="font-medium">{article.readTime}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-semibold group-hover:gap-3 transition-all duration-300">
                        <span className="text-sm">Read More</span>
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                      </div>
                    </div>
                  </div>
                  
                  {/* Hover Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 via-pink-500/5 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl" />
                </div>
            ))}
          </div>
        </div>
      </section>
      )}

      {/* Regular Articles */}
      <section className="py-16 md:py-20">
        <div className="site-container site-max">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-4">
              <FileText className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Latest News</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Recent Updates</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">Stay up to date with the latest developments in visa processing and immigration policies</p>
          </div>
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">
            {regularArticles.map((article) => (
              <div 
                key={article.id} 
                className="group relative h-full cursor-pointer overflow-hidden rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                onClick={() => setSelectedArticle(article)}
              >
                {/* Image Placeholder */}
                <div className="relative aspect-[4/3] bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-indigo-500/5 to-purple-500/5" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="p-4 rounded-full bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
                      <FileText className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                    </div>
                  </div>
                </div>
                
                {/* Content */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <Badge className={`${getCategoryColor(article.category)} px-2 py-1 text-xs font-semibold`}>
                      {article.category.replace('-', ' ').toUpperCase()}
                    </Badge>
                    <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                      <Eye className="w-3 h-3" />
                      <span className="font-medium">{article.views}</span>
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-bold mb-3 text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300 leading-tight line-clamp-2">
                    {article.title}
                  </h3>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 leading-relaxed line-clamp-2">
                    {article.excerpt}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span className="font-medium">{formatDate(article.date)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span className="font-medium">{article.readTime}</span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform duration-300" />
                  </div>
                </div>
                
                {/* Hover Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* No Results */}
      {filteredArticles.length === 0 && (
        <section className="py-16">
          <div className="site-container site-max text-center">
            <div className="max-w-md mx-auto">
              <Search className="w-16 h-16 text-muted-foreground/40 mx-auto mb-4" />
              <h3 className="text-2xl font-semibold mb-2">No articles found</h3>
              <p className="text-muted-foreground mb-6">
                Try adjusting your search terms or category filter
              </p>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                }}
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Newsletter Signup */}
      <section className="relative py-20 bg-primary text-primary-foreground">
        <div className="site-container site-max text-center">
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-8">
              <Bell className="w-8 h-8" />
            </div>
            
            <h3 className="text-3xl md:text-4xl font-bold mb-6">
              Stay Updated
            </h3>
            <p className="text-xl mb-8 opacity-90">
              Subscribe to our newsletter for the latest visa updates and immigration news
            </p>
            
            <div className="max-w-md mx-auto flex gap-4">
              <Input 
                placeholder="Enter your email" 
                className="flex-1 bg-white/20 border-white/20 text-white placeholder:text-white/70"
              />
              <Button variant="secondary">
                Subscribe
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
