import React, { useState } from 'react';
import { Sun, Moon, Menu, X } from 'lucide-react'; // Added Menu and X icons
import { getTheme as readTheme, toggleTheme as flipTheme, type AppTheme } from './theme';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card';
import { Button } from './button';
import { Badge } from './badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { listAllApplications, getVisaApplication, updateVisaApplication, sendApplicationMessage, subscribeApplicationMessages, type VisaApplication, type AppMessage } from '../lib/db';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from './avatar';
import { Progress } from './progress';
import { MobileSidebar, MobileMenuButton } from './MobileSidebar';
import { useIsMobile } from './use-mobile';
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
  Cell,
  Legend
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
  Star,
  BarChart3,
  Mail,
  Clipboard,
  Check,
  XCircle,
  LogOut,
  Send
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './dialog';
import { DesktopSidebar } from './DesktopSidebar';
import { useAuth } from '../lib/auth';

interface AdminDashboardProps {
  onPageChange: (page: string) => void;
  onLogout: () => void;
}

export function AdminDashboard({ onPageChange, onLogout }: AdminDashboardProps) {
  const [selectedTab, setSelectedTab] = useState('overview');
  const [theme, setTheme] = useState<AppTheme>(readTheme());
  const [applications, setApplications] = useState<(VisaApplication & { id: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const isMobile = useIsMobile();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false); // State for sidebar collapse
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  // Keep unsubscribe handle for messages
  const messagesUnsub = React.useRef<undefined | (() => void)>(undefined);
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [selectedApp, setSelectedApp] = useState<(VisaApplication & { id: string }) | null>(null);
  const { user } = useAuth();
  const [messages, setMessages] = useState<(AppMessage & { id: string })[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [newMessage, setNewMessage] = useState('');

  React.useEffect(() => {
    const onChange = (e: Event) => {
      const detail = (e as CustomEvent<AppTheme>).detail;
      setTheme(detail || readTheme());
    };
    window.addEventListener('themechange', onChange as EventListener);
    return () => window.removeEventListener('themechange', onChange as EventListener);
  }, []);

  React.useEffect(() => {
    if (!detailsOpen) {
      // Cleanup when dialog closes
      messagesUnsub.current?.();
      messagesUnsub.current = undefined;
    }
    return () => {
      messagesUnsub.current?.();
      messagesUnsub.current = undefined;
    };
  }, [detailsOpen]);

  async function openDetails(id: string) {
    try {
      setSelectedAppId(id);
      setDetailsOpen(true);
      setDetailsLoading(true);
      const app = await getVisaApplication(id);
      setSelectedApp((app as any) || null);
      // Subscribe to messages in real-time
      try {
        setMessagesLoading(true);
        messagesUnsub.current?.();
        messagesUnsub.current = subscribeApplicationMessages(id, (items) => {
          setMessages(items as any);
        });
      } catch (e) {
        setMessages([]);
      } finally {
        setMessagesLoading(false);
      }
    } catch (e: any) {
      toast.error(e?.message || 'Failed to fetch application details');
    } finally {
      setDetailsLoading(false);
    }
  }

  async function sendMsg() {
    if (!selectedAppId || !user || !newMessage.trim()) return;
    try {
      const sent = await sendApplicationMessage(selectedAppId, { text: newMessage.trim(), byUid: user.uid, byRole: 'admin' });
      setMessages(prev => [...prev, { id: (sent as any).id, ...(sent as any) }]);
      setNewMessage('');
    } catch (e: any) {
      toast.error(e?.message || 'Failed to send message');
    }
  }

  async function updateSelectedStatus(newStatus: 'submitted' | 'in_review' | 'approved' | 'rejected') {
    if (!selectedAppId) return;
    try {
      await updateVisaApplication(selectedAppId, { status: newStatus });
      setApplications(prev => prev.map(a => a.id === selectedAppId ? { ...a, status: newStatus } as any : a));
      setSelectedApp(prev => prev ? ({ ...prev, status: newStatus }) as any : prev);
      toast.success('Status updated');
    } catch (e: any) {
      toast.error(e?.message || 'Failed to update status');
    }
  }

  // Load applications from Firebase
  React.useEffect(() => {
    let ignore = false;
    async function loadApplications() {
      try {
        setLoading(true);
        const { items } = await listAllApplications(50);
        if (!ignore) {
          setApplications(items);
        }
      } catch (error) {
        console.error('Error loading applications:', error);
        if (!ignore) {
          toast.error('Failed to load applications');
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }
    loadApplications();
    return () => { ignore = true; };
  }, []);

  // Calculate real stats from applications data
  const totalApplications = applications.length;
  const approvedApplications = applications.filter(app => app.status === 'approved').length;
  const totalRevenue = applications.reduce((sum, app) => sum + (app.estimatedCost || 0), 0);
  const successRate = totalApplications > 0 ? ((approvedApplications / totalApplications) * 100).toFixed(1) : '0';
  const uniqueUsers = new Set(applications.map(app => app.uid)).size;

  const overviewStats = [
    { title: 'Total Applications', value: totalApplications.toString(), change: '+12%', icon: FileText, color: 'text-blue-600' },
    { title: 'Active Users', value: uniqueUsers.toString(), change: '+8%', icon: Users, color: 'text-green-600' },
    { title: 'Revenue (Est.)', value: `$${totalRevenue.toLocaleString()}`, change: '+23%', icon: DollarSign, color: 'text-purple-600' },
    { title: 'Success Rate', value: `${successRate}%`, change: '+2.1%', icon: CheckCircle, color: 'text-emerald-600' }
  ];

  // Calculate service stats from real data
  const serviceStats = [
    {
      name: 'Tourism & Leisure',
      applications: applications.filter(app => app.travel?.serviceType === 'tourist').length,
      revenue: applications.filter(app => app.travel?.serviceType === 'tourist').reduce((sum, app) => sum + (app.estimatedCost || 0), 0),
      success: 97.8,
      icon: Plane,
      color: '#3b82f6'
    },
    {
      name: 'Immigration',
      applications: applications.filter(app => app.travel?.serviceType === 'immigration').length,
      revenue: applications.filter(app => app.travel?.serviceType === 'immigration').reduce((sum, app) => sum + (app.estimatedCost || 0), 0),
      success: 98.9,
      icon: Home,
      color: '#10b981'
    },
    {
      name: 'Business',
      applications: applications.filter(app => app.travel?.serviceType === 'business').length,
      revenue: applications.filter(app => app.travel?.serviceType === 'business').reduce((sum, app) => sum + (app.estimatedCost || 0), 0),
      success: 99.1,
      icon: Building,
      color: '#f59e0b'
    },
    {
      name: 'Education',
      applications: applications.filter(app => app.travel?.serviceType === 'student').length,
      revenue: applications.filter(app => app.travel?.serviceType === 'student').reduce((sum, app) => sum + (app.estimatedCost || 0), 0),
      success: 97.2,
      icon: GraduationCap,
      color: '#8b5cf6'
    }
  ];

  const monthlyData = [
    { month: 'Jan', applications: 890, revenue: 23400 },
    { month: 'Feb', applications: 1250, revenue: 31200 },
    { month: 'Mar', applications: 1480, revenue: 42800 },
    { month: 'Apr', applications: 1320, revenue: 38900 },
    { month: 'May', applications: 1680, revenue: 48300 },
    { month: 'Jun', applications: 1920, revenue: 52100 }
  ];

  // Transform Firebase applications to display format
  const recentApplications = applications.slice(0, 10).map(app => ({
    id: app.id,
    client: `${app.personalInfo?.firstName || ''} ${app.personalInfo?.lastName || ''}`.trim() || 'Unknown',
    service: getServiceDisplayName(app.travel?.serviceType),
    country: app.travel?.destination || 'Not specified',
    status: getStatusDisplayName(app.status),
    date: app.createdAt?.toDate?.()?.toISOString()?.slice(0, 10) || 'Unknown',
    amount: app.estimatedCost ? `$${app.estimatedCost}` : 'TBD',
    email: app.userEmail || app.personalInfo?.email || 'No email',
    priority: app.priority || 'normal'
  }));

  function getServiceDisplayName(serviceType?: string): string {
    switch (serviceType) {
      case 'tourist': return 'Tourist Visa';
      case 'business': return 'Business Visa';
      case 'student': return 'Student Visa';
      case 'work': return 'Work Visa';
      case 'immigration': return 'Immigration Services';
      default: return 'Other Services';
    }
  }

  function getStatusDisplayName(status: string): string {
    switch (status) {
      case 'submitted': return 'Processing';
      case 'in_review': return 'Under Review';
      case 'approved': return 'Approved';
      case 'rejected': return 'Rejected';
      default: return 'Pending';
    }
  }

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

  // Admin tabs configuration
  const adminTabs = [
    { value: 'overview', label: 'Overview', icon: BarChart3, description: 'Dashboard overview and analytics' },
    { value: 'applications', label: 'Applications', icon: FileText, badge: applications.length.toString(), description: 'Manage visa applications' },
    { value: 'users', label: 'Users', icon: Users, description: 'User management and profiles' },
    { value: 'visaed', label: 'VisaEd', icon: GraduationCap, description: 'Educational content management' },
    { value: 'allen', label: 'Allen AI', icon: Bot, description: 'AI assistant analytics' },
    { value: 'analytics', label: 'Analytics', icon: BarChart3, description: 'Advanced analytics and reports' }
  ];

  return (
    <div className="min-h-screen bg-background no-hscroll">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="site-container">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <MobileMenuButton onClick={() => setMobileSidebarOpen(true)} />
              {/* Desktop Hamburger Icon */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                className="hidden md:inline-flex" // Show only on medium screens and up
                aria-label="Toggle sidebar"
              >
                {isSidebarCollapsed ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </Button>
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
            
            <div className="flex items-center space-x-2 sm:space-x-3">
              <Button variant="ghost" size="sm" onClick={() => setTheme(flipTheme())} className="relative w-9 h-9 p-0" aria-label="Toggle theme">
                <Sun className={`w-4 h-4 transition-opacity ${theme === 'dark' ? 'opacity-100' : 'opacity-0'}`} />
                <Moon className={`w-4 h-4 transition-opacity absolute ${theme === 'dark' ? 'opacity-0' : 'opacity-100'}`} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onPageChange('home')}
                className="w-9 h-9 p-0"
                aria-label="Back to website"
                title="Back to website"
              >
                <Home className="w-4 h-4" />
              </Button>
              {/* Desktop-only Logout */}
              <Button
                variant="outline"
                size="sm"
                onClick={onLogout}
                className="hidden md:inline-flex"
                title="Log out"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Details Dialog (moved outside header) */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-[95vw] w-[95vw] sm:w-full sm:max-w-xl rounded-2xl p-0 overflow-hidden flex flex-col max-h-[90vh]">
          <DialogHeader className="relative bg-gradient-to-r from-red-500 to-pink-500 text-white p-5">
            <button
              type="button"
              onClick={() => setDetailsOpen(false)}
              aria-label="Close details"
              className="absolute left-3 top-3 p-1 rounded-md text-white/90 hover:text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/30"
            >
              <X className="w-4 h-4" />
            </button>
            <DialogTitle className="text-white flex items-center justify-between">
              <span>Application Details</span>
              {selectedAppId && (
                <span className="text-xs opacity-90 truncate max-w-[50vw] sm:max-w-none">ID: {selectedAppId}</span>
              )}
            </DialogTitle>
            <DialogDescription className="text-white/80">Full application information and quick actions</DialogDescription>
          </DialogHeader>

          <div className="p-5 space-y-6 overflow-x-hidden overflow-y-auto flex-1">
            {detailsLoading ? (
              <div className="space-y-3">
                <div className="h-4 w-40 bg-muted rounded animate-pulse" />
                <div className="h-3 w-64 bg-muted rounded animate-pulse" />
                <div className="h-3 w-52 bg-muted rounded animate-pulse" />
                <div className="h-48 w-full bg-muted rounded animate-pulse" />
              </div>
            ) : !selectedApp ? (
              <div className="text-sm text-muted-foreground">No data available.</div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Client</p>
                    <p className="font-semibold">
                      {`${selectedApp.personalInfo?.firstName ?? ''} ${selectedApp.personalInfo?.lastName ?? ''}`.trim() || 'Unknown'}
                    </p>
                  </div>
                  <Badge className={getStatusColor(getStatusDisplayName(selectedApp.status as any))}>
                    {getStatusDisplayName(selectedApp.status as any)}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="truncate break-words">{selectedApp.userEmail || selectedApp.personalInfo?.email || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Phone</p>
                    <p>{selectedApp.personalInfo?.phone || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Service</p>
                    <p>{getServiceDisplayName(selectedApp.travel?.serviceType)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Country</p>
                    <p>{selectedApp.travel?.destination || '—'}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium">Travel Details</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground">Purpose</p>
                      <p>{selectedApp.travel?.purpose || '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Dates</p>
                      <p>{selectedApp.travel?.travelDate || '—'} → {selectedApp.travel?.returnDate || '—'}</p>
                    </div>
                    <div className="sm:col-span-2">
                      <p className="text-xs text-muted-foreground">Accommodation</p>
                      <p className="truncate break-words">{selectedApp.travel?.accommodation || '—'}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium">Additional</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground">Processing Speed</p>
                      <p>{selectedApp.additionalInfo?.processingSpeed || '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Consultation</p>
                      <p>{selectedApp.additionalInfo?.consultationNeeded ? 'Yes' : 'No'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Document Review</p>
                      <p>{selectedApp.additionalInfo?.documentReview ? 'Yes' : 'No'}</p>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="space-y-3">
                  <p className="text-sm font-medium flex items-center"><MessageSquare className="w-4 h-4 mr-2" /> Messages</p>
                  <div className="border rounded-lg p-3 max-h-56 overflow-y-auto bg-muted/30">
                    {messagesLoading ? (
                      <div className="text-xs text-muted-foreground">Loading messages…</div>
                    ) : messages.length === 0 ? (
                      <div className="text-xs text-muted-foreground">No messages yet. Start the conversation.</div>
                    ) : (
                      <div className="space-y-2">
                        {messages.map((m) => (
                          <div key={m.id} className={`text-sm p-2 rounded-md ${m.byRole === 'admin' ? 'bg-blue-500/10' : 'bg-gray-500/10'}`}>
                            <div className="text-xs text-muted-foreground mb-1">{m.byRole === 'admin' ? 'Admin' : 'Client'}</div>
                            <div>{m.text}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <input
                      value={newMessage}
                      onChange={e => setNewMessage(e.target.value)}
                      placeholder="Type a message…"
                      className="flex-1 bg-transparent border border-border rounded-md px-3 py-2 text-sm"
                    />
                    <Button size="sm" onClick={sendMsg} className="bg-gradient-to-r from-red-500 to-pink-500 text-white">
                      <Send className="w-4 h-4 mr-1" /> Send
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="p-5 pt-0">
            {/* Primary contact actions above status controls with ample spacing */}
            <div className="grid grid-cols-2 gap-2 w-full mb-3">
              <Button variant="secondary" onClick={() => selectedAppId && navigator.clipboard.writeText(selectedAppId)}>
                <Clipboard className="w-4 h-4 mr-2" /> Copy ID
              </Button>
              <Button variant="outline" onClick={() => {
                const email = selectedApp?.userEmail || selectedApp?.personalInfo?.email;
                if (email) window.open(`mailto:${email}`);
              }}>
                <Mail className="w-4 h-4 mr-2" /> Email
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full">
              <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => updateSelectedStatus('in_review')}>
                <Clock className="w-4 h-4 mr-2" /> In Review
              </Button>
              <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => updateSelectedStatus('approved')}>
                <Check className="w-4 h-4 mr-2" /> Approve
              </Button>
              <Button variant="destructive" className="bg-red-600 hover:bg-red-700" onClick={() => updateSelectedStatus('rejected')}>
                <XCircle className="w-4 h-4 mr-2" /> Reject
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Main Content */}
      {/* Fixed left desktop sidebar; expands on hover when collapsed (Gemini-like) */}
      <div
        className="hidden lg:block fixed left-0 top-16 z-30 h-[calc(100vh-4rem)] py-2"
        onMouseEnter={() => setIsSidebarHovered(true)}
        onMouseLeave={() => setIsSidebarHovered(false)}
      >
        <div className={`${(isSidebarCollapsed && !isSidebarHovered) ? 'w-16' : 'w-64'} h-full px-2`}>
          <DesktopSidebar
            items={adminTabs as any}
            selected={selectedTab}
            onSelect={setSelectedTab}
            collapsed={isSidebarCollapsed && !isSidebarHovered}
            onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          />
        </div>
      </div>

      <div className="site-container site-max pt-6 md:pt-8 pb-12">
        {/* Admin quick actions removed per request */}
        {/* Desktop: content shifts right to accommodate fixed sidebar */}
        <div className="grid grid-cols-12 gap-4 md:gap-6">
          {/* Hide legacy sidebar column on lg to avoid duplicate */}
          <div className="col-span-12 lg:hidden">
            <DesktopSidebar
              items={adminTabs as any}
              selected={selectedTab}
              onSelect={setSelectedTab}
              collapsed={isSidebarCollapsed}
              onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            />
          </div>
          {/* Note: content margin depends only on base collapsed state to avoid shifting on hover */}
          <div className={`col-span-12 lg:col-span-12 ${isSidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'}`}>
            <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
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
                        cx="45%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={95}
                        paddingAngle={4}
                        fill="#8884d8"
                        dataKey="applications"
                        labelLine={false}
                        label={false}
                      >
                        {serviceStats.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => [value, 'Applications']} />
                      {/* Legend on the right to avoid label overlap */}
                      <Legend layout="vertical" align="right" verticalAlign="middle" iconType="circle" />
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
                {loading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, index) => (
                      <div key={index} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border rounded-lg animate-pulse">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-muted rounded-full"></div>
                          <div className="space-y-2">
                            <div className="h-4 bg-muted rounded w-32"></div>
                            <div className="h-3 bg-muted rounded w-48"></div>
                            <div className="h-3 bg-muted rounded w-24"></div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="h-6 bg-muted rounded w-20"></div>
                          <div className="h-4 bg-muted rounded w-16"></div>
                          <div className="w-8 h-8 bg-muted rounded"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : recentApplications.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No applications found</p>
                    <p className="text-sm">Applications will appear here when users submit visa requests</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentApplications.map((app, index) => (
                      <div key={index} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border rounded-lg">
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
                        <div className="flex items-center space-x-3 sm:space-x-4">
                          <Badge className={getStatusColor(app.status)}>{app.status}</Badge>
                          <span className="font-semibold">{app.amount}</span>
                          <Button
                            variant="secondary"
                            size="sm"
                            className="bg-gradient-to-r from-red-500 to-pink-500 text-white hover:from-red-600 hover:to-pink-600"
                            onClick={() => openDetails(app.id)}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            <span className="hidden sm:inline">View Details</span>
                            <span className="sm:hidden">View</span>
                          </Button>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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


              {/* Users Tab */}
              <TabsContent value="users" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>User Management</CardTitle>
                    <CardDescription>Manage registered users and their permissions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">User management features coming soon...</p>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* VisaEd Tab */}
              <TabsContent value="visaed" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>VisaEd Analytics</CardTitle>
                    <CardDescription>Educational content performance and engagement</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">VisaEd analytics coming soon...</p>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Allen AI Tab */}
              <TabsContent value="allen" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Allen AI Analytics</CardTitle>
                    <CardDescription>AI assistant performance and user interactions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">Allen AI analytics coming soon...</p>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Analytics Tab */}
              <TabsContent value="analytics" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Advanced Analytics</CardTitle>
                    <CardDescription>Detailed reports and business intelligence</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">Advanced analytics coming soon...</p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <MobileSidebar
        isOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
        onTabChange={setSelectedTab}
        selectedTab={selectedTab}
        tabs={adminTabs}
        userData={{
          name: "Admin User",
          email: "admin@ugs.com",
          status: "Administrator"
        }}
        isAdmin={true}
        onLogout={onLogout}
      />
    </div>
  );
}

export interface DesktopSidebarProps {
  items: any[];
  selected: string;
  onSelect: (value: string) => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}
