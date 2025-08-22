import React, { useState } from 'react';
import { Sun, Moon, Menu, X } from 'lucide-react'; // Added Menu and X icons
import { getTheme as readTheme, toggleTheme as flipTheme, type AppTheme } from './theme';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card';
import { Button } from './button';
import { Badge } from './badge';
// Removed Tabs UI in favor of sidebar-driven conditional rendering
// import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { listAllApplications, getVisaApplication, updateVisaApplication, sendDirectMessage, subscribeDirectMessages, listVisaEdRegistrations, ensureBaseCollections, type VisaApplication, type VisaEdRegistration } from '../lib/db';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from './avatar';
// import { Progress } from './progress';
import { MobileSidebar, MobileMenuButton } from './MobileSidebar';
import { useIsMobile } from './use-mobile';
import ChatPanel, { type ChatMessage as UiChatMessage } from './ChatPanel';
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
  Send,
  User,
  Phone,
  MapPin,
  Flag,
  ShieldCheck
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './dialog';
import { DesktopSidebar } from './DesktopSidebar';
import { useAuth } from '../lib/auth';
import { isFirebaseConfigured } from '../lib/firebase';

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
  // Local UI-only chat state for Messages tab (per-user threads)
  const [selectedChatUserId, setSelectedChatUserId] = useState<string | null>(null);
  const [chatByUser, setChatByUser] = useState<Record<string, UiChatMessage[]>>({});
  const [chatInputByUser, setChatInputByUser] = useState<Record<string, string>>({});
  const [chatPendingByUser, setChatPendingByUser] = useState<Record<string, boolean>>({});
  const chatMessagesUnsub = React.useRef<undefined | (() => void)>(undefined);
  // Derive unique chat users from applications
  const chatUsers = React.useMemo(() => {
    const userMap = new Map<string, { id: string; name: string; email: string; count: number }>();
    for (const app of applications) {
      const id = (app.uid || app.userEmail || app.id) as string;
      const name = `${app.personalInfo?.firstName || ''} ${app.personalInfo?.lastName || ''}`.trim() || 'Unknown';
      const email = (app.userEmail || app.personalInfo?.email || 'N/A') as string;
      const prev = userMap.get(id);
      if (prev) userMap.set(id, { ...prev, count: prev.count + 1 });
      else userMap.set(id, { id, name, email, count: 1 });
    }
    return Array.from(userMap.values());
  }, [applications]);
  // Default selected chat user once users list is available
  React.useEffect(() => {
    if (!selectedChatUserId && chatUsers.length > 0) {
      setSelectedChatUserId(chatUsers[0].id);
    }
  }, [selectedChatUserId, chatUsers]);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [selectedApp, setSelectedApp] = useState<(VisaApplication & { id: string }) | null>(null);
  const { user } = useAuth();
  
  // VisaEd state
  const [visaEdRegs, setVisaEdRegs] = useState<(VisaEdRegistration & { id: string })[]>([]);
  const [visaEdLoading, setVisaEdLoading] = useState(true);
  const [visaEdSearch, setVisaEdSearch] = useState('');
  const [visaEdPlanFilter, setVisaEdPlanFilter] = useState<'all' | 'free' | 'premium' | 'luxury'>('all');
  const [visaEdStatusFilter, setVisaEdStatusFilter] = useState<'all' | 'registered' | 'active' | 'completed' | 'cancelled'>('all');
  // VisaEd dialogs and selection
  const [selectedReg, setSelectedReg] = useState<(VisaEdRegistration & { id: string }) | null>(null);
  const [regViewOpen, setRegViewOpen] = useState(false);
  const [regMsgOpen, setRegMsgOpen] = useState(false);
  const [regMsg, setRegMsg] = useState('');

  React.useEffect(() => {
    const onChange = (e: Event) => {
      const detail = (e as CustomEvent<AppTheme>).detail;
      setTheme(detail || readTheme());
    };
    window.addEventListener('themechange', onChange as EventListener);
    return () => window.removeEventListener('themechange', onChange as EventListener);
  }, []);

  // Seed base collections when admin logs in (safe no-op if already exist)
  React.useEffect(() => {
    ensureBaseCollections().catch(() => {});
  }, []);

  // Load VisaEd registrations
  React.useEffect(() => {
    let ignore = false;
    async function loadRegs() {
      try {
        if (!isFirebaseConfigured) {
          if (!ignore) setVisaEdLoading(false);
          return;
        }
        setVisaEdLoading(true);
        const { items } = await listVisaEdRegistrations(100);
        const filtered = (items || []).filter((it: any) => {
          if (!it) return false;
          const id = (it as any).id as string | undefined;
          const type = (it as any)._type as string | undefined;
          const email = (it as any).userEmail as string | undefined;
          const uid = (it as any).uid as string | undefined;
          if (id === '_seed') return false;
          if (type === 'seed') return false;
          if (email && /(^|[._-])seed($|@|\.)/i.test(email)) return false;
          if (uid === '_seed') return false;
          return true;
        });
        if (!ignore) setVisaEdRegs(filtered as any);
      } catch (e) {
        console.error('Failed to load VisaEd registrations', e);
      } finally {
        if (!ignore) setVisaEdLoading(false);
      }
    }
    loadRegs();
    return () => { ignore = true; };
  }, []);

  

  async function openDetails(id: string) {
    try {
      setSelectedAppId(id);
      setDetailsOpen(true);
      setDetailsLoading(true);
      const app = await getVisaApplication(id);
      setSelectedApp((app as any) || null);
    } catch (e: any) {
      toast.error(e?.message || 'Failed to fetch application details');
    } finally {
      setDetailsLoading(false);
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
        if (!isFirebaseConfigured) {
          if (!ignore) setLoading(false);
          return;
        }
        setLoading(true);
        const { items } = await listAllApplications(50);
        const filtered = (items || []).filter((it: any) => {
          if (!it) return false;
          const id = (it as any).id as string | undefined;
          const type = (it as any)._type as string | undefined;
          const email = (it as any).userEmail as string | undefined;
          const uid = (it as any).uid as string | undefined;
          if (id === '_seed') return false;
          if (type === 'seed') return false;
          if (email && /(^|[._-])seed($|@|\.)/i.test(email)) return false;
          if (uid === '_seed') return false;
          return true;
        });
        if (!ignore) setApplications(filtered as any);
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

  // Helper: resolve userId (uid) for a conversation entry
  const getUserIdForChat = React.useCallback((id: string | null) => {
    if (!id) return null;
    const match = applications.find(a => a.uid === id) || applications.find(a => a.userEmail === id) || applications.find(a => a.id === id);
    return match?.uid || null;
  }, [applications]);

  // Subscribe to direct messages for the active chat user (top-level messages collection)
  React.useEffect(() => {
    chatMessagesUnsub.current?.();
    chatMessagesUnsub.current = undefined;
    const activeId = selectedChatUserId || chatUsers[0]?.id || null;
    const userId = getUserIdForChat(activeId);
    if (!userId) {
      setChatByUser(prev => ({ ...prev, [activeId as string]: [] }));
      return;
    }
    try {
      chatMessagesUnsub.current = subscribeDirectMessages(userId, (items) => {
        const mapped: UiChatMessage[] = items.map(it => ({
          id: it.id,
          text: it.text,
          // In ChatPanel, 'user' is rendered on the right. For admin view, our own messages should be right-aligned.
          by: it.byRole === 'admin' ? 'user' : 'admin',
          at: (it as any)?.createdAt?.toDate?.()?.toLocaleString?.() || undefined,
        }));
        setChatByUser(prev => ({ ...prev, [activeId as string]: mapped }));
      });
    } catch {
      // ignore
    }
    return () => {
      chatMessagesUnsub.current?.();
      chatMessagesUnsub.current = undefined;
    };
  }, [selectedChatUserId, chatUsers, getUserIdForChat]);

  const overviewStats = [
    { title: 'Total Applications', value: totalApplications.toString(), icon: FileText, color: 'text-blue-600' },
    { title: 'Active Users', value: uniqueUsers.toString(), icon: Users, color: 'text-green-600' },
    { title: 'Revenue (Est.)', value: `ETB ${totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'text-purple-600' },
    { title: 'Success Rate', value: `${successRate}%`, icon: CheckCircle, color: 'text-emerald-600' }
  ];

  // Transform Firebase applications to display format
  const recentApplications = applications.slice(0, 10).map(app => ({
    id: app.id,
    client: `${app.personalInfo?.firstName || ''} ${app.personalInfo?.lastName || ''}`.trim() || 'Unknown',
    service: getServiceDisplayName(app.travel?.serviceType),
    country: app.travel?.destination || 'Not specified',
    status: getStatusDisplayName(app.status),
    date: app.createdAt?.toDate?.()?.toISOString()?.slice(0, 10) || 'Unknown',
    amount: app.estimatedCost ? `ETB ${app.estimatedCost}` : 'TBD',
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


  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'Processing': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'Pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'Rejected': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  // Removed mock colors and datasets used by charts

  // Convert ISO region codes to full country names (falls back gracefully)
  const toCountryName = (code?: string) => {
    if (!code) return '—';
    const v = code.trim();
    try {
      // Prefer English names for consistency in admin
      const Display = (Intl as any)?.DisplayNames;
      if (Display) {
        const dn = new Display(['en'], { type: 'region' });
        return dn.of(v.toUpperCase()) || v;
      }
      return v;
    } catch {
      return v;
    }
  };

  // Derived list for VisaEd filtered regs
  const filteredVisaEdRegs = visaEdRegs
    .filter(r => {
      const q = visaEdSearch.trim().toLowerCase();
      if (!q) return true;
      return (
        (r.userEmail || '').toLowerCase().includes(q) ||
        (r.courseName || '').toLowerCase().includes(q) ||
        (r.plan || '').toLowerCase().includes(q)
      );
    })
    .filter(r => (visaEdPlanFilter === 'all' ? true : (r.plan === visaEdPlanFilter)))
    .filter(r => (visaEdStatusFilter === 'all' ? true : (r.status === visaEdStatusFilter)));

  // Admin tabs configuration
  const adminTabs = [
    { value: 'overview', label: 'Overview', icon: BarChart3 },
    { value: 'applications', label: 'Applications', icon: FileText, badge: applications.length.toString() },
    { value: 'users', label: 'Users', icon: Users },
    { value: 'visaed', label: 'VisaEd', icon: GraduationCap },
    { value: 'allen', label: 'Allen AI', icon: Bot },
    { value: 'messages', label: 'Messages', icon: MessageSquare },
    { value: 'analytics', label: 'Analytics', icon: BarChart3 }
  ];

  return (
    <div className="min-h-screen bg-background no-hscroll admin-strong-borders">
      {/* Header */}
      <div className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 dark:bg-gray-950/80 border-b border-white/20 dark:border-gray-800/50">
        <div className="site-container">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-3">
              <MobileMenuButton onClick={() => setMobileSidebarOpen(true)} />
              {/* Desktop sidebar toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSidebarCollapsed(v => !v)}
                className="hidden lg:inline-flex"
                aria-label="Toggle sidebar"
                title="Toggle sidebar"
              >
                <Menu className="w-6 h-6" />
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
        <DialogContent className="w-[100vw] max-w-[100vw] sm:max-w-2xl rounded-none sm:rounded-2xl p-0 overflow-hidden flex flex-col h-[95vh] sm:h-auto">
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

          <div className="p-4 sm:p-5 space-y-4 overflow-x-hidden overflow-y-auto flex-1 break-words">
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
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1"><User className="w-3.5 h-3.5" /> Client</p>
                    <p className="font-semibold">
                      {`${selectedApp.personalInfo?.firstName ?? ''} ${selectedApp.personalInfo?.lastName ?? ''}`.trim() || 'Unknown'}
                    </p>
                  </div>
                  <Badge className={getStatusColor(getStatusDisplayName(selectedApp.status as any))}>
                    {getStatusDisplayName(selectedApp.status as any)}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> Email</p>
                    <p className="break-words">{selectedApp.userEmail || selectedApp.personalInfo?.email || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> Phone</p>
                    <p>{selectedApp.personalInfo?.phone || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1"><FileText className="w-3.5 h-3.5" /> Service</p>
                    <p>{getServiceDisplayName(selectedApp.travel?.serviceType)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1"><Flag className="w-3.5 h-3.5" /> Country</p>
                    <p>{selectedApp.travel?.destination || '—'}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium">Travel Details</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground flex items-center gap-1"><Plane className="w-3.5 h-3.5" /> Purpose</p>
                      <p>{selectedApp.travel?.purpose || '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Dates</p>
                      <p>{selectedApp.travel?.travelDate || '—'} → {selectedApp.travel?.returnDate || '—'}</p>
                    </div>
                    <div className="sm:col-span-2">
                      <p className="text-xs text-muted-foreground flex items-center gap-1"><Building className="w-3.5 h-3.5" /> Accommodation</p>
                      <p className="break-words">{selectedApp.travel?.accommodation || '—'}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium">Additional</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Processing Speed</p>
                      <p>{selectedApp.additionalInfo?.processingSpeed || '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground flex items-center gap-1"><UserPlus className="w-3.5 h-3.5" /> Consultation</p>
                      <p>{selectedApp.additionalInfo?.consultationNeeded ? 'Yes' : 'No'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5" /> Document Review</p>
                      <p>{selectedApp.additionalInfo?.documentReview ? 'Yes' : 'No'}</p>
                    </div>
                  </div>
                </div>

                {/* Messages moved to Messages tab */}
                <div className="space-y-3">
                  <p className="text-sm font-medium flex items-center"><MessageSquare className="w-4 h-4 mr-2" /> Messages</p>
                  <div className="border rounded-lg p-4 bg-muted/20 flex items-center justify-between">
                    <p className="text-xs sm:text-sm text-muted-foreground">Conversations are managed in the Messages tab.</p>
                    <Button
                      size="sm"
                      className="bg-gradient-to-r from-red-500 to-pink-500 text-white"
                      onClick={() => {
                        const targetUserId = (selectedApp?.uid || selectedApp?.userEmail || selectedAppId) as string;
                        setSelectedTab('messages');
                        if (targetUserId) setSelectedChatUserId(targetUserId);
                        setDetailsOpen(false);
                      }}
                    >
                      Open Conversation
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="p-4 sm:p-5 pt-0">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full">
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={() => updateSelectedStatus('in_review')}>
                <Clock className="w-4 h-4 mr-2" /> In Review
              </Button>
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={() => updateSelectedStatus('approved')}>
                <Check className="w-4 h-4 mr-2" /> Approve
              </Button>
              <Button size="sm" variant="destructive" className="bg-red-600 hover:bg-red-700" onClick={() => updateSelectedStatus('rejected')}>
                <XCircle className="w-4 h-4 mr-2" /> Reject
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* VisaEd: View Registration Dialog */}
      <Dialog open={regViewOpen} onOpenChange={setRegViewOpen}>
        <DialogContent className="w-[100vw] max-w-[100vw] sm:max-w-2xl rounded-none sm:rounded-2xl p-0 overflow-hidden flex flex-col h-[95vh] sm:h-auto">
          <DialogHeader className="relative bg-gradient-to-r from-red-500 to-pink-500 text-white p-5">
            <button
              type="button"
              onClick={() => setRegViewOpen(false)}
              aria-label="Close enrollment details"
              className="absolute left-3 top-3 p-1 rounded-md text-white/90 hover:text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/30"
            >
              <X className="w-4 h-4" />
            </button>
            <DialogTitle className="text-white flex items-center gap-2">
              <GraduationCap className="w-5 h-5" /> Enrollment Details
            </DialogTitle>
            <DialogDescription className="text-white/80">VisaEd registration overview</DialogDescription>
          </DialogHeader>
          <div className="p-5 space-y-6 text-sm overflow-y-auto overflow-x-hidden flex-1">
            {!selectedReg ? (
              <div className="text-muted-foreground">No registration selected.</div>
            ) : (
              <>
                {/* Summary chips (email moved below into Personal Info) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <div className="flex items-center gap-3 rounded-lg border bg-card p-3">
                    <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center">
                      <GraduationCap className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-[11px] text-muted-foreground">Course</p>
                      <p className="font-semibold leading-tight break-words">{selectedReg.courseName || '—'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-lg border bg-card p-3">
                    <div className="w-8 h-8 rounded-md bg-amber-500/10 flex items-center justify-center">
                      <Star className="w-4 h-4 text-amber-500" />
                    </div>
                    <div>
                      <p className="text-[11px] text-muted-foreground">Plan</p>
                      <p className="font-semibold uppercase leading-tight">{selectedReg.plan || 'free'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-lg border bg-card p-3">
                    <div className="w-8 h-8 rounded-md bg-emerald-500/10 flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                    </div>
                    <div>
                      <p className="text-[11px] text-muted-foreground">Status</p>
                      <p className="font-semibold leading-tight capitalize">{selectedReg.status || 'registered'}</p>
                    </div>
                  </div>
                </div>

                {/* Personal info with icons */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                    <User className="w-4 h-4" /> Personal Information
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center"><User className="w-4 h-4 text-primary" /></div>
                      <div>
                        <p className="text-[11px] text-muted-foreground">First Name</p>
                        <p className="font-medium">{selectedReg.form?.firstName || '—'}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center"><User className="w-4 h-4 text-primary" /></div>
                      <div>
                        <p className="text-[11px] text-muted-foreground">Last Name</p>
                        <p className="font-medium">{selectedReg.form?.lastName || '—'}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-md bg-emerald-500/10 flex items-center justify-center"><Phone className="w-4 h-4 text-emerald-500" /></div>
                      <div>
                        <p className="text-[11px] text-muted-foreground">Phone</p>
                        <p className="font-medium break-words">{selectedReg.form?.phone || '—'}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-md bg-purple-500/10 flex items-center justify-center"><MapPin className="w-4 h-4 text-purple-500" /></div>
                      <div>
                        <p className="text-[11px] text-muted-foreground">Current Location</p>
                        <p className="font-medium">{toCountryName(selectedReg.form?.currentLocation)}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-md bg-sky-500/10 flex items-center justify-center"><Flag className="w-4 h-4 text-sky-500" /></div>
                      <div>
                        <p className="text-[11px] text-muted-foreground">Target Destination</p>
                        <p className="font-medium">{toCountryName(selectedReg.form?.targetCountry)}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-md bg-blue-500/10 flex items-center justify-center"><Mail className="w-4 h-4 text-blue-500" /></div>
                      <div>
                        <p className="text-[11px] text-muted-foreground">Email</p>
                        <p className="font-medium break-words">{selectedReg.form?.email || selectedReg.userEmail || '—'}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-md bg-rose-500/10 flex items-center justify-center"><Plane className="w-4 h-4 text-rose-500" /></div>
                      <div>
                        <p className="text-[11px] text-muted-foreground">Visa Type</p>
                        <p className="font-medium capitalize">{selectedReg.form?.visaType || '—'}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-md bg-indigo-500/10 flex items-center justify-center"><Star className="w-4 h-4 text-indigo-500" /></div>
                      <div>
                        <p className="text-[11px] text-muted-foreground">Experience Level</p>
                        <p className="font-medium capitalize">{selectedReg.form?.experienceLevel || '—'}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-md bg-teal-500/10 flex items-center justify-center"><Calendar className="w-4 h-4 text-teal-500" /></div>
                      <div>
                        <p className="text-[11px] text-muted-foreground">Preferred Schedule</p>
                        <p className="font-medium capitalize">{selectedReg.form?.preferredSchedule || '—'}</p>
                      </div>
                    </div>
                    <div className="sm:col-span-2 flex items-start gap-3">
                      <div className="w-8 h-8 rounded-md bg-amber-500/10 flex items-center justify-center"><FileText className="w-4 h-4 text-amber-500" /></div>
                      <div className="flex-1">
                        <p className="text-[11px] text-muted-foreground">Learning Goals</p>
                        <p className="font-medium break-words whitespace-pre-wrap">{selectedReg.form?.learningGoals || '—'}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-md bg-green-500/10 flex items-center justify-center"><ShieldCheck className="w-4 h-4 text-green-500" /></div>
                      <div>
                        <p className="text-[11px] text-muted-foreground">Agreed to Terms</p>
                        <p className="font-medium">{selectedReg.form?.agreeToTerms ? 'Yes' : 'No'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Optional payment reference */}
                {selectedReg.paymentRef && (
                  <div className="flex items-center gap-3 rounded-lg border bg-card p-3">
                    <div className="w-8 h-8 rounded-md bg-fuchsia-500/10 flex items-center justify-center">
                      <Clipboard className="w-4 h-4 text-fuchsia-500" />
                    </div>
                    <div>
                      <p className="text-[11px] text-muted-foreground">Payment Ref</p>
                      <p className="font-semibold break-words">{selectedReg.paymentRef}</p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
          <DialogFooter className="p-5 pt-0">
            <div className="flex w-full justify-end gap-2">
              <Button onClick={() => setRegViewOpen(false)} className="bg-gradient-to-r from-red-500 to-pink-500 text-white">Close</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* VisaEd: Message Dialog */}
      <Dialog open={regMsgOpen} onOpenChange={setRegMsgOpen}>
        <DialogContent className="w-[100vw] max-w-[100vw] sm:max-w-lg rounded-none sm:rounded-2xl p-0 overflow-hidden">
          <DialogHeader className="relative bg-gradient-to-r from-red-500 to-pink-500 text-white p-5">
            <DialogTitle className="text-white">Message Enrollment</DialogTitle>
            <DialogDescription className="text-white/80">Send an email to the registrant</DialogDescription>
          </DialogHeader>
          <div className="p-5 space-y-4">
            <div className="text-sm">
              <p className="text-xs text-muted-foreground">To</p>
              <p className="font-medium break-words">{selectedReg?.userEmail || '—'}</p>
            </div>
            <textarea
              value={regMsg}
              onChange={(e) => setRegMsg(e.target.value)}
              placeholder="Write your message…"
              className="w-full h-32 bg-transparent border border-border rounded-md px-3 py-2 text-sm"
            />
          </div>
          <DialogFooter className="p-5 pt-0">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full">
              <Button variant="secondary" onClick={() => { if (selectedReg?.userEmail) navigator.clipboard.writeText(selectedReg.userEmail); }}>
                <Clipboard className="w-4 h-4 mr-2" /> Copy Email
              </Button>
              <Button variant="outline" onClick={() => {
                const to = selectedReg?.userEmail;
                if (!to) return;
                const subject = encodeURIComponent('UGS VisaEd — Support');
                const body = encodeURIComponent(regMsg || '');
                window.open(`mailto:${to}?subject=${subject}&body=${body}`);
              }}>
                <Mail className="w-4 h-4 mr-2" /> Open Mail
              </Button>
              <Button className="bg-gradient-to-r from-red-500 to-pink-500 text-white" onClick={() => setRegMsgOpen(false)}>Close</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Main Content */}
      {/* Fixed left desktop sidebar; full height with collapse/expand */}
      <div
        className="hidden lg:flex fixed left-0 top-20 bottom-0 z-30 items-stretch"
        onMouseEnter={() => setIsSidebarHovered(true)}
        onMouseLeave={() => setIsSidebarHovered(false)}
      >
        <div
          className={`${(isSidebarCollapsed && !isSidebarHovered) ? 'w-16' : 'w-64'} h-full transition-all duration-300`}
        >
          <DesktopSidebar
            items={adminTabs as any}
            selected={selectedTab}
            onSelect={setSelectedTab}
            collapsed={isSidebarCollapsed && !isSidebarHovered}
            onToggleCollapse={() => setIsSidebarCollapsed(v => !v)}
            onLogout={onLogout}
          />
        </div>
      </div>

      <div className="site-container site-max pt-6 md:pt-8 pb-12">
        {/* Admin quick actions removed per request */}
        {/* Desktop: content shifts right to accommodate fixed sidebar */}
        <div className="grid grid-cols-12 gap-4 md:gap-6">
          {/* Content shifted right for fixed sidebar (dynamic with collapse) */}
          <div className={`col-span-12 lg:col-span-12 transition-all duration-300 ${ (isSidebarCollapsed && !isSidebarHovered) ? 'lg:pl-16' : 'lg:pl-64' }`}>
            {/* Conditional sections rendered based on selectedTab */}
          {/* Messages (UI-only with user list) */}
          {selectedTab === 'messages' && (
            <div className="space-y-6">
            {(() => {
              const users = chatUsers;
              const activeId = selectedChatUserId || users[0]?.id || null;

              const activeMessages = (activeId && chatByUser[activeId]) || [];
              const activeInput = (activeId && chatInputByUser[activeId]) || '';
              const activePending = !!(activeId && chatPendingByUser[activeId]);

              const setActiveInput = (v: string) => setChatInputByUser(prev => ({ ...prev, [activeId as string]: v }));
              const pushMessage = (msg: UiChatMessage) => setChatByUser(prev => ({ ...prev, [activeId as string]: [ ...(prev[activeId as string] || []), msg ] }));
              const setPending = (b: boolean) => setChatPendingByUser(prev => ({ ...prev, [activeId as string]: b }));

              return (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  {/* User list */}
                  <div className="md:col-span-5 lg:col-span-4">
                    <Card className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl border border-white/20 dark:border-gray-800/20 shadow-2xl h-full">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">Conversations</CardTitle>
                        <CardDescription>Select a user to chat</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-2 max-h-[28rem] overflow-auto pr-2 flex flex-col items-center">
                        {users.length === 0 ? (
                          <div className="text-sm text-muted-foreground">No users available.</div>
                        ) : (
                          users.map(u => (
                            <button
                              key={u.id}
                              onClick={() => setSelectedChatUserId(u.id)}
                              className={`w-72 mx-auto text-left p-3 rounded-lg border transition flex items-center gap-3 ${ (selectedChatUserId || users[0]?.id) === u.id ? 'bg-primary/10 border-primary/20' : 'bg-card border-border hover:bg-muted/40'}`}
                            >
                              <Avatar className="h-8 w-8"><AvatarFallback>{(u.name || u.email).slice(0,2).toUpperCase()}</AvatarFallback></Avatar>
                              <div className="flex-1">
                                <div className="font-medium whitespace-normal break-words leading-tight">{u.name}</div>
                              </div>
                              <div className="ml-auto shrink-0"><Badge variant="secondary">{u.count}</Badge></div>
                            </button>
                          ))
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  {/* Chat area */}
                  <div className="md:col-span-7 lg:col-span-8">
                    <ChatPanel
                      messages={activeMessages}
                      input={activeInput}
                      setInput={setActiveInput}
                      pending={activePending}
                      onSend={() => {
                        const text = activeInput.trim();
                        const activeId = selectedChatUserId || users[0]?.id || null;
                        if (!activeId || !text) return;
                        if (!user) { toast.error('Not authenticated'); return; }
                        const userId = getUserIdForChat(activeId);
                        if (!userId) { toast.error('No user id found for this conversation'); return; }
                        setPending(true);
                        sendDirectMessage(userId, { text, byUid: user.uid, byRole: 'admin' })
                          .then(() => {
                            setActiveInput('');
                            // Realtime listener will append the new message
                          })
                          .catch((e: any) => toast.error(e?.message || 'Failed to send message'))
                          .finally(() => setPending(false));
                      }}
                      placeholder="Type a message to the client..."
                      emptyState="No messages yet. Start a conversation with this user."
                    />
                  </div>
                </div>
              );
            })()}
            </div>
          )}
            {selectedTab === 'overview' && (
              <div className="space-y-6">
            {/* Stats Cards: 2-column layout for 4 cards (2x2) */}
            <div className="grid grid-cols-2 gap-4 md:gap-6">
              {overviewStats.map((stat, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">{stat.title}</p>
                        <p className="text-2xl font-bold">{stat.value}</p>
                      </div>
                      <div className={`w-12 h-12 rounded-xl bg-opacity-10 flex items-center justify-center ${stat.color}`}>
                        <stat.icon className={`w-6 h-6 ${stat.color}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            {/* Overview Analytics (empty state) */}
            <Card>
              <CardHeader>
                <CardTitle>Overview Analytics</CardTitle>
                <CardDescription>Live analytics will appear here</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-6 text-sm text-muted-foreground">No analytics data yet.</div>
              </CardContent>
            </Card>

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
          </div>
        )}

          {/* Applications */}
          {selectedTab === 'applications' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Applications</h2>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>All Applications</CardTitle>
                  <CardDescription>Manage and review submissions</CardDescription>
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
                  ) : applications.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No applications yet</p>
                      <p className="text-sm">They will appear here once users submit visa requests</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {applications.map((app) => {
                        const client = `${app.personalInfo?.firstName || ''} ${app.personalInfo?.lastName || ''}`.trim() || 'Unknown';
                        const service = getServiceDisplayName(app.travel?.serviceType);
                        const country = app.travel?.destination || '—';
                        const amount = app.estimatedCost ? `ETB ${app.estimatedCost.toLocaleString()}` : '—';
                        return (
                          <div key={app.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border rounded-lg">
                            <div className="flex items-center space-x-4">
                              <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                                <FileText className="w-5 h-5" />
                              </div>
                              <div>
                                <h4 className="font-semibold">{client}</h4>
                                <p className="text-sm text-muted-foreground">{service} - {country}</p>
                                <p className="text-xs text-muted-foreground">{app.id}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3 sm:space-x-4">
                              <Badge className={getStatusColor(app.status)}>{app.status || 'pending'}</Badge>
                              <span className="font-semibold">{amount}</span>
                              <Button
                                variant="secondary"
                                size="sm"
                                className="bg-gradient-to-r from-red-500 to-pink-500 text-white hover:from-red-600 hover:to-pink-600"
                                onClick={() => openDetails(app.id)}
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Users */}
          {selectedTab === 'users' && (
            <div className="space-y-6">
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
                      <p className="text-2xl font-bold">{uniqueUsers}</p>
                      <p className="text-sm text-muted-foreground">Unique Users (from applications)</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <UserPlus className="w-8 h-8 text-green-600" />
                    <div>
                      <p className="text-2xl font-bold">{
                        applications.filter(a => {
                          const d = (a.createdAt as any)?.toDate?.() as Date | undefined;
                          if (!d) return false;
                          const now = new Date();
                          return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
                        }).length
                      }</p>
                      <p className="text-sm text-muted-foreground">Applications This Month</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <Clock className="w-8 h-8 text-orange-600" />
                    <div>
                      <p className="text-2xl font-bold">{
                        applications.filter(a => {
                          const d = (a.createdAt as any)?.toDate?.() as Date | undefined;
                          if (!d) return false;
                          const now = new Date();
                          return d.toDateString() === now.toDateString();
                        }).length
                      }</p>
                      <p className="text-sm text-muted-foreground">Applications Today</p>
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
                <div className="p-6 text-sm text-muted-foreground">No revenue data yet.</div>
              </CardContent>
            </Card>
          </div>
        )}

          {/* VisaEd */}
          {selectedTab === 'visaed' && (
            <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">VisaEd Management</h2>
              <Button>
                <GraduationCap className="w-4 h-4 mr-2" />
                Add Course
              </Button>
            </div>

            {/* KPI cards (static for now): 2-column layout */}
            <div className="grid grid-cols-2 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <GraduationCap className="w-8 h-8 text-blue-600" />
                    <div>
                      <p className="text-2xl font-bold">{visaEdRegs.length}</p>
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
                      <p className="text-2xl font-bold">{visaEdRegs.filter(r => r.status === 'completed').length}</p>
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
                      <p className="text-2xl font-bold">{(() => {
                        const total = visaEdRegs.length || 1;
                        const completed = visaEdRegs.filter(r => r.status === 'completed').length;
                        return Math.round((completed / total) * 100);
                      })()}%</p>
                      <p className="text-sm text-muted-foreground">Completion Rate</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <TrendingUp className="w-8 h-8 text-purple-600" />
                    <div>
                      <p className="text-2xl font-bold">{visaEdRegs.filter(r => r.status === 'active').length}</p>
                      <p className="text-sm text-muted-foreground">Active Enrollments</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Enrollments */}
            <Card>
              <CardHeader>
                <CardTitle>Enrollments</CardTitle>
                <CardDescription>All VisaEd registrations across plans</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                  <input
                    value={visaEdSearch}
                    onChange={(e) => setVisaEdSearch(e.target.value)}
                    placeholder="Search by email, course or plan"
                    className="w-full sm:max-w-sm bg-transparent border border-border rounded-md px-3 py-2 text-sm"
                  />
                  <div className="flex gap-2">
                    <select value={visaEdPlanFilter} onChange={e => setVisaEdPlanFilter(e.target.value as any)} className="bg-transparent border border-border rounded-md px-2 py-2 text-sm">
                      <option value="all">All Plans</option>
                      <option value="free">Free</option>
                      <option value="premium">Premium</option>
                      <option value="luxury">Luxury</option>
                    </select>
                    <select value={visaEdStatusFilter} onChange={e => setVisaEdStatusFilter(e.target.value as any)} className="bg-transparent border border-border rounded-md px-2 py-2 text-sm">
                      <option value="all">All Status</option>
                      <option value="registered">Registered</option>
                      <option value="active">Active</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
                <div className="mt-4">
                  {visaEdLoading ? (
                    <div className="text-sm text-muted-foreground">Loading enrollments…</div>
                  ) : (
                    <div className="overflow-x-auto rounded-xl border">
                      <table className="min-w-full text-sm">
                        <thead className="bg-muted/40">
                          <tr className="text-left">
                            <th className="px-4 py-3 font-medium">Course</th>
                            <th className="px-4 py-3 font-medium">Plan</th>
                            <th className="px-4 py-3 font-medium">Status</th>
                            <th className="px-4 py-3 font-medium">Email</th>
                            <th className="px-4 py-3 font-medium text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredVisaEdRegs.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="px-4 py-6 text-center text-muted-foreground">No enrollments found</td>
                            </tr>
                          ) : (
                            filteredVisaEdRegs.map((r) => (
                              <tr key={r.id} className="border-t hover:bg-muted/20">
                                <td className="px-4 py-3">
                                  <div className="font-medium">{r.courseName || 'Course'}</div>
                                </td>
                                <td className="px-4 py-3">
                                  <Badge variant="secondary" className="uppercase text-[10px] tracking-wide">{r.plan || 'free'}</Badge>
                                </td>
                                <td className="px-4 py-3">
                                  <Badge className="text-[10px] tracking-wide">{r.status || 'registered'}</Badge>
                                </td>
                                <td className="px-4 py-3 max-w-[18rem]">
                                  <div className="truncate" title={r.userEmail || ''}>{r.userEmail || '—'}</div>
                                </td>
                                <td className="px-4 py-3">
                                  <div className="flex items-center gap-2 justify-end">
                                    <Button size="sm" variant="secondary" onClick={() => { setSelectedReg(r); setRegViewOpen(true); }}>
                                      <Eye className="w-4 h-4 mr-2" /> View
                                    </Button>
                                    <Button size="sm" className="bg-gradient-to-r from-red-500 to-pink-500 text-white" onClick={() => { setSelectedReg(r); setRegMsgOpen(true); setRegMsg(''); }}>
                                      <MessageSquare className="w-4 h-4 mr-2" /> Message
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Overview Analytics</CardTitle>
                <CardDescription>Live analytics will appear here</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-6 text-sm text-muted-foreground">No analytics data yet.</div>
              </CardContent>
            </Card>
          </div>
        )}

          {/* Allen AI */}
          {selectedTab === 'allen' && (
            <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Allen AI Analytics</h2>
              <Button>
                <Bot className="w-4 h-4 mr-2" />
                AI Settings
              </Button>
            </div>
            {/* No mock KPIs; show clean empty state until real analytics are wired */}
            <Card>
              <CardHeader>
                <CardTitle>Allen AI Performance</CardTitle>
                <CardDescription>Daily interaction metrics and satisfaction scores</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-6 text-sm text-muted-foreground">No analytics data yet.</div>
              </CardContent>
            </Card>
          </div>
        )}

          {/* Analytics */}
          {selectedTab === 'analytics' && (
            <div className="space-y-6">
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
                  <div className="p-6 text-sm text-muted-foreground">No revenue data yet.</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Success Rates by Service</CardTitle>
                  <CardDescription>Approval rates across different services</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="p-6 text-sm text-muted-foreground">No service stats yet.</div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Geographic Distribution</CardTitle>
                <CardDescription>Applications by destination country</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-6 text-sm text-muted-foreground">No geographic data yet.</div>
              </CardContent>
              </Card>
              </div>
            )}
            {/* End conditional sections */}
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
