import React, { useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import { getTheme as readTheme, toggleTheme as flipTheme, type AppTheme } from './theme';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card';
import { Button } from './button';
import { Badge } from './badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { Avatar, AvatarFallback, AvatarImage } from './avatar';
import { Progress } from './progress';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  Users,
  FileText,
  TrendingUp,
  Globe,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  UserPlus,
  MessageSquare,
  Plane,
  Home,
  Building,
  GraduationCap,
  Bot,
  Calendar,
  Download,
  Filter,
  Search,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Star
} from 'lucide-react';

interface AdminDashboardProps {
  onPageChange: (page: string) => void;
  onLogout: () => void;
}

export function AdminDashboard({ onPageChange, onLogout }: AdminDashboardProps) {
  const [selectedTab, setSelectedTab] = useState('overview');
  const [theme, setTheme] = useState<AppTheme>(readTheme());

  React.useEffect(() => {
    const onChange = (e: Event) => {
      const detail = (e as CustomEvent<AppTheme>).detail;
      setTheme(detail || readTheme());
    };
    window.addEventListener('themechange', onChange as EventListener);
    return () => window.removeEventListener('themechange', onChange as EventListener);
  }, []);

  // Mock data for the dashboard
  const overviewStats = [
    { title: 'Total Applications', value: '12,847', change: '+12%', icon: FileText, color: 'text-blue-600' },
    { title: 'Active Users', value: '8,392', change: '+8%', icon: Users, color: 'text-green-600' },
    { title: 'Revenue (MTD)', value: '$247,890', change: '+23%', icon: DollarSign, color: 'text-purple-600' },
    { title: 'Success Rate', value: '98.2%', change: '+2.1%', icon: CheckCircle, color: 'text-emerald-600' }
  ];

  const serviceStats = [
    { name: 'Tourism & Leisure', applications: 4580, revenue: 98420, success: 97.8, icon: Plane, color: '#3b82f6' },
    { name: 'Immigration', applications: 3240, revenue: 142380, success: 98.9, icon: Home, color: '#10b981' },
    { name: 'Trade License', applications: 1890, revenue: 89450, success: 99.1, icon: Building, color: '#f59e0b' },
    { name: 'Education', applications: 3137, revenue: 76340, success: 97.2, icon: GraduationCap, color: '#8b5cf6' }
  ];

  const monthlyData = [
    { month: 'Jan', applications: 890, revenue: 23400 },
    { month: 'Feb', applications: 1250, revenue: 31200 },
    { month: 'Mar', applications: 1480, revenue: 42800 },
    { month: 'Apr', applications: 1320, revenue: 38900 },
    { month: 'May', applications: 1680, revenue: 48300 },
    { month: 'Jun', applications: 1920, revenue: 52100 }
  ];

  const recentApplications = [
    { id: 'APP-001', client: 'John Doe', service: 'Tourist Visa', country: 'USA', status: 'Approved', date: '2024-01-15', amount: '$299' },
    { id: 'APP-002', client: 'Sarah Smith', service: 'Work Visa', country: 'Canada', status: 'Processing', date: '2024-01-14', amount: '$899' },
    { id: 'APP-003', client: 'Mike Johnson', service: 'Student Visa', country: 'UK', status: 'Pending', date: '2024-01-14', amount: '$599' },
    { id: 'APP-004', client: 'Emily Chen', service: 'Business Visa', country: 'Australia', status: 'Approved', date: '2024-01-13', amount: '$399' },
    { id: 'APP-005', client: 'David Wilson', service: 'Immigration', country: 'Germany', status: 'Processing', date: '2024-01-13', amount: '$1299' }
  ];

  const visaEdStats = [
    { course: 'Tourist Visa Fundamentals', enrolled: 1240, completed: 980, rating: 4.8 },
    { course: 'Student Visa Mastery', enrolled: 890, completed: 650, rating: 4.9 },
    { course: 'Immigration Law Basics', enrolled: 560, completed: 420, rating: 4.7 },
    { course: 'Business Visa Guide', enrolled: 340, completed: 280, rating: 4.6 }
  ];

  const allenInteractions = [
    { date: '2024-01-15', queries: 450, satisfaction: 4.6, resolved: 89 },
    { date: '2024-01-14', queries: 520, satisfaction: 4.5, resolved: 91 },
    { date: '2024-01-13', queries: 380, satisfaction: 4.7, resolved: 88 },
    { date: '2024-01-12', queries: 490, satisfaction: 4.4, resolved: 85 },
    { date: '2024-01-11', queries: 410, satisfaction: 4.8, resolved: 93 }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'Processing': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'Pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'Rejected': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-red-600 rounded-lg flex items-center justify-center">
                  <Globe className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold">UGS Admin</h1>
                  <p className="text-xs text-muted-foreground">Control Center</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={() => setTheme(flipTheme())} className="relative w-9 h-9 p-0">
                <Sun className={`w-4 h-4 transition-opacity ${theme === 'dark' ? 'opacity-100' : 'opacity-0'}`} />
                <Moon className={`w-4 h-4 transition-opacity absolute ${theme === 'dark' ? 'opacity-0' : 'opacity-100'}`} />
              </Button>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-primary text-white text-xs">AD</AvatarFallback>
              </Avatar>
              <Button variant="ghost" size="sm" onClick={onLogout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 bg-transparent p-0 gap-2">
            <TabsTrigger value="overview" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:to-pink-500 data-[state=active]:text-white shadow-sm hover:shadow transition-all">Overview</TabsTrigger>
            <TabsTrigger value="applications" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:to-pink-500 data-[state=active]:text-white shadow-sm hover:shadow transition-all">Applications</TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:to-pink-500 data-[state=active]:text-white shadow-sm hover:shadow transition-all">Users</TabsTrigger>
            <TabsTrigger value="visaed" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:to-pink-500 data-[state=active]:text-white shadow-sm hover:shadow transition-all">VisaEd</TabsTrigger>
            <TabsTrigger value="allen" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:to-pink-500 data-[state=active]:text-white shadow-sm hover:shadow transition-all">Allen AI</TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:to-pink-500 data-[state=active]:text-white shadow-sm hover:shadow transition-all">Analytics</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {overviewStats.map((stat, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">{stat.title}</p>
                        <p className="text-2xl font-bold">{stat.value}</p>
                        <p className={`text-xs ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                          {stat.change} from last month
                        </p>
                      </div>
                      <div className={`w-12 h-12 rounded-xl bg-opacity-10 flex items-center justify-center ${stat.color}`}>
                        <stat.icon className={`w-6 h-6 ${stat.color}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Charts */}
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Applications</CardTitle>
                  <CardDescription>Application trends over the last 6 months</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="applications" stroke="#3b82f6" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Service Distribution</CardTitle>
                  <CardDescription>Applications by service type</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={serviceStats}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="applications"
                        label={({ name, percent = 0 }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {serviceStats.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Service Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Service Performance</CardTitle>
                <CardDescription>Overview of all service categories</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {serviceStats.map((service, index) => (
                    <div key={index} className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-xl bg-opacity-10 flex items-center justify-center`} style={{ backgroundColor: `${service.color}20` }}>
                          <service.icon className="w-5 h-5" style={{ color: service.color }} />
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm">{service.name}</h4>
                          <p className="text-xs text-muted-foreground">{service.applications} applications</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Success Rate</span>
                          <span className="font-medium">{service.success}%</span>
                        </div>
                        <Progress value={service.success} className="h-2" />
                        <p className="text-xs text-muted-foreground">Revenue: ${service.revenue.toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Applications Tab */}
          <TabsContent value="applications" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Application Management</h2>
              <div className="flex items-center space-x-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="hover:scale-[1.02] active:scale-95 transition-transform">
                      <Filter className="w-4 h-4 mr-2" />
                      Filter
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent align="end" className="w-64 space-y-3">
                    <div>
                      <p className="text-sm font-medium mb-2">Status</p>
                      <div className="flex flex-wrap gap-2">
                        {['Approved','Processing','Pending','Rejected'].map(s => (
                          <Button key={s} variant="secondary" size="sm" className="px-2 py-1">{s}</Button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-2">Country</p>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        {['USA','Canada','UK','Australia','Germany','France'].map(c => (
                          <Button key={c} variant="ghost" className="h-7 px-2 justify-start">{c}</Button>
                        ))}
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <Button size="sm" className="bg-gradient-to-r from-red-500 to-pink-500">Apply</Button>
                    </div>
                  </PopoverContent>
                </Popover>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="hover:scale-[1.02] active:scale-95 transition-transform">
                      <Search className="w-4 h-4 mr-2" />
                      Search
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent align="end" className="w-80">
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs text-muted-foreground">Search by client, ID or service</label>
                        <input className="mt-1 w-full bg-transparent border border-border rounded-md px-3 py-2 text-sm" placeholder="e.g. John Doe, APP-001, Work Visa" />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <Button variant="secondary" className="justify-start">Clients</Button>
                        <Button variant="secondary" className="justify-start">IDs</Button>
                        <Button variant="secondary" className="justify-start">Services</Button>
                        <Button variant="secondary" className="justify-start">Countries</Button>
                      </div>
                      <div className="flex justify-end">
                        <Button size="sm" className="bg-gradient-to-r from-red-500 to-pink-500">Search</Button>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Recent Applications</CardTitle>
                <CardDescription>Latest visa applications and their status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentApplications.map((app, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-semibold">{app.client}</h4>
                          <p className="text-sm text-muted-foreground">{app.service} - {app.country}</p>
                          <p className="text-xs text-muted-foreground">{app.id} • {app.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <Badge className={getStatusColor(app.status)}>{app.status}</Badge>
                        <span className="font-semibold">{app.amount}</span>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">User Management</h2>
              <Button>
                <UserPlus className="w-4 h-4 mr-2" />
                Add User
              </Button>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <Users className="w-8 h-8 text-blue-600" />
                    <div>
                      <p className="text-2xl font-bold">8,392</p>
                      <p className="text-sm text-muted-foreground">Total Users</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <UserPlus className="w-8 h-8 text-green-600" />
                    <div>
                      <p className="text-2xl font-bold">247</p>
                      <p className="text-sm text-muted-foreground">New This Month</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <Clock className="w-8 h-8 text-orange-600" />
                    <div>
                      <p className="text-2xl font-bold">1,240</p>
                      <p className="text-sm text-muted-foreground">Active Today</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>User Activity</CardTitle>
                <CardDescription>Recent user registrations and activity</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="applications" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* VisaEd Tab */}
          <TabsContent value="visaed" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">VisaEd Management</h2>
              <Button>
                <GraduationCap className="w-4 h-4 mr-2" />
                Add Course
              </Button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <GraduationCap className="w-8 h-8 text-blue-600" />
                    <div>
                      <p className="text-2xl font-bold">3,030</p>
                      <p className="text-sm text-muted-foreground">Total Enrollments</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                    <div>
                      <p className="text-2xl font-bold">2,330</p>
                      <p className="text-sm text-muted-foreground">Completed Courses</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <Star className="w-8 h-8 text-yellow-600" />
                    <div>
                      <p className="text-2xl font-bold">4.7</p>
                      <p className="text-sm text-muted-foreground">Average Rating</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <TrendingUp className="w-8 h-8 text-purple-600" />
                    <div>
                      <p className="text-2xl font-bold">77%</p>
                      <p className="text-sm text-muted-foreground">Completion Rate</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Course Performance</CardTitle>
                <CardDescription>Enrollment and completion statistics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {visaEdStats.map((course, index) => (
                    <div key={index} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold">{course.course}</h4>
                        <div className="flex items-center space-x-2">
                          <Star className="w-4 h-4 text-yellow-500" />
                          <span className="text-sm">{course.rating}</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Enrolled</p>
                          <p className="font-semibold">{course.enrolled}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Completed</p>
                          <p className="font-semibold">{course.completed}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Rate</p>
                          <p className="font-semibold">{Math.round((course.completed / course.enrolled) * 100)}%</p>
                        </div>
                      </div>
                      <Progress value={(course.completed / course.enrolled) * 100} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Allen AI Tab */}
          <TabsContent value="allen" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Allen AI Analytics</h2>
              <Button>
                <Bot className="w-4 h-4 mr-2" />
                AI Settings
              </Button>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <MessageSquare className="w-8 h-8 text-blue-600" />
                    <div>
                      <p className="text-2xl font-bold">2,250</p>
                      <p className="text-sm text-muted-foreground">Daily Queries</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                    <div>
                      <p className="text-2xl font-bold">89%</p>
                      <p className="text-sm text-muted-foreground">Resolution Rate</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <Star className="w-8 h-8 text-yellow-600" />
                    <div>
                      <p className="text-2xl font-bold">4.6</p>
                      <p className="text-sm text-muted-foreground">Satisfaction Score</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Allen AI Performance</CardTitle>
                <CardDescription>Daily interaction metrics and satisfaction scores</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={allenInteractions}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="queries" stroke="#3b82f6" strokeWidth={2} />
                    <Line type="monotone" dataKey="resolved" stroke="#10b981" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Advanced Analytics</h2>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  <Calendar className="w-4 h-4 mr-2" />
                  Date Range
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export Report
                </Button>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Trends</CardTitle>
                  <CardDescription>Monthly revenue growth analysis</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="revenue" fill="#10b981" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Success Rates by Service</CardTitle>
                  <CardDescription>Approval rates across different services</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {serviceStats.map((service, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{service.name}</span>
                          <span className="text-sm text-muted-foreground">{service.success}%</span>
                        </div>
                        <Progress value={service.success} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Geographic Distribution</CardTitle>
                <CardDescription>Applications by destination country</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {['USA', 'Canada', 'UK', 'Australia', 'Germany', 'France', 'Japan', 'Others'].map((country, index) => (
                    <div key={index} className="text-center p-4 border rounded-lg">
                      <p className="font-semibold">{country}</p>
                      <p className="text-2xl font-bold text-primary">{Math.floor(Math.random() * 2000) + 500}</p>
                      <p className="text-xs text-muted-foreground">applications</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}