import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./card";
import { Button } from "./button";
import { Badge } from "./badge";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "./avatar";
import { Progress } from "./progress";
import { Switch } from "./switch";
import { DesktopSidebar } from "./DesktopSidebar";

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
} from "recharts";
import {
  User,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  Star,
  Plane,
  Home,
  Building,
  GraduationCap,
  Globe,
  Calendar,
  MessageSquare,
  Settings,
  Bell,
  Download,
  Upload,
  Eye,
  Edit,
  Trash2,
  Plus,
  Search,
  Filter,
  MapPin,
  Phone,
  Mail,
  Camera,
  Shield,
  CreditCard,
  HelpCircle,
  LogOut,
  Sparkles,
  Crown,
  Gem,
  KeyRound,
  Sun,
  Moon,
  BarChart3,
  Menu,
  X,
} from "lucide-react";
import { getTheme as readTheme, toggleTheme as flipTheme, type AppTheme } from "./theme";
import { useAuth } from "../lib/auth";
import { getUser, listUserApplications, upsertUser, sendDirectMessage, subscribeDirectMessages, createVisaApplication, type AppMessage } from "../lib/db";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './dialog';
import { MobileSidebar, MobileMenuButton } from './MobileSidebar';
import { useIsMobile } from './use-mobile';
import AvatarUpload from './AvatarUpload';
import ChatPanel, { type ChatMessage as UiChatMessage } from './ChatPanel';

interface ClientDashboardProps {
  onPageChange: (page: string) => void;
  onLogout: () => void;
}

export function ClientDashboard({
  onPageChange,
  onLogout,
}: ClientDashboardProps) {
  const [selectedTab, setSelectedTab] = useState("overview");
  const [notifications, setNotifications] = useState(3);
  const [theme, setTheme] = useState<AppTheme>(readTheme());
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);
  const [messagesOpen, setMessagesOpen] = useState(false);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [messages, setMessages] = useState<(AppMessage & { id: string })[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedMsgAppId, setSelectedMsgAppId] = useState<string | null>(null);
  const messagesUnsub = React.useRef<undefined | (() => void)>(undefined);
  // Support tab chat (wired to Firestore)
  const [supportAppId, setSupportAppId] = useState<string | null>(null);
  const [supportMessages, setSupportMessages] = useState<(AppMessage & { id: string })[]>([]);
  const [supportInput, setSupportInput] = useState('');
  const [supportLoading, setSupportLoading] = useState(false);
  const supportUnsub = React.useRef<undefined | (() => void)>(undefined);

  React.useEffect(() => {
    const onChange = (e: Event) => {
      const detail = (e as CustomEvent<AppTheme>).detail;
      setTheme(detail || readTheme());
    };
    window.addEventListener('themechange', onChange as EventListener);
    return () => window.removeEventListener('themechange', onChange as EventListener);
  }, []);

  const [clientData, setClientData] = useState({
    name: "",
    email: "",
    phone: "",
    memberSince: "",
    status: "Member",
    profileImage: null as string | null,
  });

  const [applications, setApplications] = useState<any[]>([]);

  React.useEffect(() => {
    if (!messagesOpen) {
      messagesUnsub.current?.();
      messagesUnsub.current = undefined;
    }
    return () => {
      messagesUnsub.current?.();
      messagesUnsub.current = undefined;
    };
  }, [messagesOpen]);

  React.useEffect(() => {
    let ignore = false;
    async function load() {
      if (!user) return;
      try {
        let udoc = await getUser(user.uid);
        if (!udoc) {
          try {
            await upsertUser({ uid: user.uid, email: user.email ?? null } as any);
            udoc = await getUser(user.uid);
          } catch {}
        }

        const createdAt = (udoc as any)?.createdAt?.toDate?.() as Date | undefined;
        const memberSince = createdAt ? String(createdAt.getFullYear()) : "";
        const fullFromParts = `${(udoc as any)?.firstName ?? ""} ${(udoc as any)?.lastName ?? ""}`.trim();
        const displayName =
          user.displayName ||
          (udoc as any)?.fullName ||
          (fullFromParts || undefined) ||
          (udoc as any)?.name;
        const phone = (udoc as any)?.phone || (udoc as any)?.phoneNumber || "";
        if (!ignore) {
          setClientData({
            name: displayName || (user.email ? user.email.split("@")[0] : "User"),
            email: user.email || "",
            phone,
            memberSince,
            status: user.emailVerified ? "Verified Member" : "Unverified",
            profileImage: user.photoURL || (udoc as any)?.photoURL || null,
          });
        }

        try {
          const { items } = await listUserApplications(user.uid, 20);
          const mapped = (items || []).map((it: any) => ({
            id: it.id,
            type: it?.travel?.purpose || "Visa Application",
            country: it?.travel?.destination || "—",
            status: mapStatusToDisplay(it?.status),
            submittedDate: formatDate(it?.createdAt),
            expectedDate: "",
            progress: statusToProgress(it?.status),
            documents: 0,
            amount: "",
            priority: "Standard",
            officer: "",
          }));
          if (!ignore) {
            setApplications(mapped);
            // Default Support tab to most recent application if available
            if (!supportAppId && items && items.length > 0) {
              setSupportAppId(items[0].id);
            }
          }
        } catch {
          if (!ignore) setApplications([]);
        }
      } catch {}
    }
    load();
    return () => {
      ignore = true;
    };
  }, [user]);

  // Manage Support tab subscription lifecycle (top-level user messages)
  React.useEffect(() => {
    // Only subscribe when on Support tab and we have user
    if (selectedTab !== 'support' || !user) {
      supportUnsub.current?.();
      supportUnsub.current = undefined;
      return;
    }
    setSupportLoading(true);
    supportUnsub.current?.();
    supportUnsub.current = subscribeDirectMessages(user.uid, (items) => {
      setSupportMessages(items as any);
    });
    setSupportLoading(false);
    return () => {
      supportUnsub.current?.();
      supportUnsub.current = undefined;
    };
  }, [selectedTab, user]);

  async function createNewApplication() {
    if (!user) return;
    try {
      const created = await createVisaApplication(user.uid, {
        status: 'draft',
        personalInfo: { firstName: '', lastName: '', email: user.email ?? '' },
        travel: { destination: '', serviceType: '' },
      });
      const id = (created as any)?.id as string;
      // Optimistically add to local list
      setApplications((prev) => [
        {
          id,
          type: 'Visa Application',
          country: '',
          status: 'Draft',
          submittedDate: '',
          expectedDate: '',
          progress: 10,
          documents: 0,
          amount: '',
          priority: 'Standard',
          officer: '',
        },
        ...prev,
      ]);
      // Prepare Support chat for the new app
      setSelectedTab('support');
    } catch {}
  }

  async function openMessages(appId: string) {
    try {
      setSelectedMsgAppId(appId);
      setMessagesOpen(true);
      setMessagesLoading(true);
      messagesUnsub.current?.();
      messagesUnsub.current = subscribeDirectMessages(user?.uid || '', (items) => {
        setMessages(items as any);
      });
    } catch {
      setMessages([]);
    } finally {
      setMessagesLoading(false);
    }
  }

  async function sendMsg() {
    if (!user || !newMessage.trim()) return;
    try {
      await sendDirectMessage(user.uid, { text: newMessage.trim(), byUid: user.uid, byRole: 'user' });
      setNewMessage('');
    } catch {}
  }

  async function sendSupportMsg() {
    if (!user || !supportInput.trim()) return;
    try {
      await sendDirectMessage(user.uid, { text: supportInput.trim(), byUid: user.uid, byRole: 'user' });
      setSupportInput('');
    } catch {}
  }

  function formatDate(ts: any): string {
    try {
      const d: Date | undefined = ts?.toDate?.();
      if (!d) return "";
      return d.toISOString().slice(0, 10);
    } catch {
      return "";
    }
  }

  function mapStatusToDisplay(s: string | undefined): string {
    switch (s) {
      case "approved": return "Approved";
      case "in_review": return "Under Review";
      case "submitted": return "Processing";
      case "rejected": return "Rejected";
      case "draft":
      default: return "Draft";
    }
  }

  function statusToProgress(s: string | undefined): number {
    switch (s) {
      case "approved": return 100;
      case "in_review": return 50;
      case "submitted": return 25;
      case "rejected": return 100;
      case "draft":
      default: return 10;
    }
  }

  // No mock data: documents and activities are backend-only. Show empty states until wired.

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Approved":
        return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800";
      case "Processing":
        return "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800";
      case "Under Review":
        return "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800";
      case "Rejected":
        return "bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800";
      default:
        return "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-200 dark:border-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Priority":
        return "bg-gradient-to-r from-purple-500 to-pink-500 text-white";
      case "Express":
        return "bg-gradient-to-r from-orange-500 to-red-500 text-white";
      default:
        return "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300";
    }
  };

  const clientTabs = [
    { value: 'overview', label: 'Overview', icon: BarChart3 },
    { value: 'applications', label: 'Applications', icon: FileText, badge: applications.length.toString() },
    { value: 'documents', label: 'Documents', icon: Upload },
    { value: 'support', label: 'Support', icon: MessageSquare },
    { value: 'profile', label: 'Profile', icon: User },
    { value: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <div className="min-h-screen no-hscroll bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-950 dark:via-gray-900 dark:to-blue-950/20">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 dark:bg-gray-950/80 border-b border-white/20 dark:border-gray-800/50"
      >
        <div className="site-container">
          <div className="flex flex-wrap items-center justify-between gap-3 h-20">
            <div className="flex items-center space-x-6">
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
                {isSidebarCollapsed ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </Button>
              <motion.div whileHover={{ scale: 1.05 }} className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-red-500 via-pink-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Globe className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">UGS Client Portal</h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Premium Dashboard</p>
                </div>
              </motion.div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-3">
              <Button variant="ghost" size="sm" onClick={() => setTheme(flipTheme())} className="relative w-9 h-9 p-0" aria-label="Toggle theme">
                <Sun className={`w-4 h-4 transition-opacity ${theme === 'dark' ? 'opacity-100' : 'opacity-0'}`} />
                <Moon className={`w-4 h-4 transition-opacity absolute ${theme === 'dark' ? 'opacity-0' : 'opacity-100'}`} />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => onPageChange('home')} className="w-9 h-9 p-0" aria-label="Back to website" title="Back to website">
                <Home className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={onLogout} className="hidden md:inline-flex" title="Log out">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Fixed left desktop sidebar; full height with collapse/expand */}
      <div className="hidden lg:flex fixed left-0 top-20 bottom-0 z-30 items-stretch"
           onMouseEnter={() => setIsSidebarHovered(true)}
           onMouseLeave={() => setIsSidebarHovered(false)}>
        <div className={`${(isSidebarCollapsed && !isSidebarHovered) ? 'w-16' : 'w-64'} h-full transition-all duration-300`}>
          <DesktopSidebar
            items={clientTabs as any}
            selected={selectedTab}
            onSelect={setSelectedTab}
            userData={{ name: clientData.name, email: clientData.email, status: clientData.status, avatar: clientData.profileImage || undefined }}
            collapsed={isSidebarCollapsed && !isSidebarHovered}
            onToggleCollapse={() => setIsSidebarCollapsed(v => !v)}
            headerTitle="UGS Client Portal"
            headerSubtitle="Premium Dashboard"
            onLogout={onLogout}
          />
        </div>
      </div>

      <div className="site-container site-max pt-8 pb-12 lg:pt-14 lg:pb-16">
        <div className="grid grid-cols-12 gap-6">
          {/* Content shifted right for fixed sidebar (dynamic with collapse) */}
          <div className={`col-span-12 lg:col-span-12 transition-all duration-300 ${ (isSidebarCollapsed && !isSidebarHovered) ? 'lg:pl-16' : 'lg:pl-64' }`}>
            {selectedTab === "overview" && (
              <div className="space-y-8">
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
                  <Card className="relative overflow-hidden bg-gradient-to-br from-red-500 via-pink-500 to-orange-500 text-white border-0 shadow-2xl">
                    <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent" />
                    <CardContent className="relative p-8 lg:p-12">
                      <div className="flex items-center justify-between">
                        <div className="space-y-4">
                          <div className="flex items-center space-x-3">
                            <Crown className="w-8 h-8 text-yellow-300" />
                            <div>
                              <h2 className="text-2xl font-bold">Welcome back, {clientData.name}!</h2>
                              <p className="text-white/80">You're a {clientData.status} with exclusive benefits</p>
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
                            <div className="flex items-center space-x-2">
                              <Sparkles className="w-4 h-4" />
                              <span>Member since {clientData.memberSince}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Shield className="w-4 h-4" />
                              <span>Priority Support</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Globe className="w-4 h-4" />
                              <span>Global Access</span>
                            </div>
                          </div>
                        </div>
                        <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} className="opacity-20">
                          <Gem className="w-24 h-24" />
                        </motion.div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
                  {(() => {
                    const total = applications.length;
                    const approved = applications.filter((a) => a.status === 'Approved').length;
                    const verifiedDocs = 0; // backend-only; integrate later
                    const countries = new Set(applications.map((a) => a.country).filter(Boolean)).size;
                    const stats = [
                      { title: 'Active Applications', value: String(total), change: '', icon: FileText, gradient: 'from-blue-500 to-cyan-500' },
                      { title: 'Visas Approved', value: String(approved), change: '', icon: CheckCircle, gradient: 'from-emerald-500 to-teal-500' },
                      { title: 'Documents Verified', value: String(verifiedDocs), change: '', icon: Shield, gradient: 'from-purple-500 to-indigo-500' },
                      { title: 'Countries Mentioned', value: String(countries), change: '', icon: Globe, gradient: 'from-orange-500 to-red-500' },
                    ];
                    return stats.map((stat, index) => (
                      <motion.div key={index} whileHover={{ scale: 1.02, y: -5 }} transition={{ type: "spring", stiffness: 300 }}>
                        <Card className="relative overflow-hidden bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl border border-white/20 dark:border-gray-800/20 shadow-2xl">
                          <CardContent className="p-6 lg:p-8">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{stat.title}</p>
                                <p className="text-3xl font-bold">{stat.value}</p>
                                {stat.change ? (<p className="text-xs text-emerald-600 dark:text-emerald-400">{stat.change} this month</p>) : null}
                              </div>
                              <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${stat.gradient} flex items-center justify-center shadow-lg`}>
                                <stat.icon className="w-6 h-6 text-white" />
                              </div>
                            </div>
                          </CardContent>
                          <motion.div className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r ${stat.gradient}`} initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ delay: 0.5 + index * 0.1, duration: 0.8 }} />
                        </Card>
                      </motion.div>
                    ));
                  })()}
                </motion.div>

                <div className="grid lg:grid-cols-3 gap-8">
                  <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="lg:col-span-2">
                    <Card className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl border border-white/20 dark:border-gray-800/20 shadow-2xl">
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2"><FileText className="w-5 h-5 text-primary" /><span>Recent Applications</span></CardTitle>
                        <CardDescription>Track your visa application progress</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6 lg:space-y-8">
                        {applications.slice(0, 3).map((app, index) => (
                          <motion.div key={app.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * index }} whileHover={{ scale: 1.02 }} className="p-5 md:p-6 rounded-xl bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-700 border border-white/50 dark:border-gray-700/50 shadow-lg">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg flex items-center justify-center">
                                  <Plane className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                  <h4 className="font-semibold">{app.type}</h4>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">{app.country}</p>
                                </div>
                              </div>
                              <Badge className={getStatusColor(app.status)}>{app.status}</Badge>
                            </div>
                            <div className="space-y-3">
                              <div className="flex justify-between text-sm"><span>Progress</span><span>{app.progress}%</span></div>
                              <Progress value={app.progress} className="h-2" />
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-5 text-sm text-gray-600 dark:text-gray-400">
                              <span>Expected: {app.expectedDate}</span>
                              <span className="font-semibold text-primary">{app.amount}</span>
                            </div>
                            <div className="mt-4 flex items-center justify-between">
                              <div className="text-xs text-gray-500">Submitted: {app.submittedDate || '—'}</div>
                              <Button size="sm" variant="outline" onClick={() => openMessages(app.id)}><MessageSquare className="w-4 h-4 mr-2" /> Messages</Button>
                            </div>
                          </motion.div>
                        ))}
                      </CardContent>
                    </Card>
                  </motion.div>

                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }} className="space-y-6 lg:space-y-8">
                    <Card className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl border border-white/20 dark:border-gray-800/20 shadow-2xl">
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2"><Clock className="w-5 h-5 text-primary" /><span>Recent Activity</span></CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="p-6 text-sm text-gray-600 dark:text-gray-400">No recent activity yet.</div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white border-0 shadow-2xl">
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2"><Sparkles className="w-5 h-5" /><span>Quick Actions</span></CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                          <Button variant="secondary" className="w-full justify-start bg-white/20 hover:bg-white/30 text-white border-0" onClick={createNewApplication}>
                            <Plus className="w-4 h-4 mr-2" />
                            New Application
                          </Button>
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                          <Button variant="secondary" className="w-full justify-start bg-white/20 hover:bg-white/30 text-white border-0">
                            <Upload className="w-4 h-4 mr-2" />
                            Upload Document
                          </Button>
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                          <Button variant="secondary" className="w-full justify-start bg-white/20 hover:bg-white/30 text-white border-0">
                            <MessageSquare className="w-4 h-4 mr-2" />
                            Contact Support
                          </Button>
                        </motion.div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </div>
              </div>
            )}

            {selectedTab === "applications" && (
              <div className="space-y-6">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">My Applications</h2>
                    <p className="text-gray-600 dark:text-gray-400">Manage and track your visa applications</p>
                  </div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button className="bg-gradient-to-r from-red-500 to-pink-500" onClick={createNewApplication}>
                      <Plus className="w-4 h-4 mr-2" />
                      New Application
                    </Button>
                  </motion.div>
                </motion.div>

                {applications.length === 0 ? (
                  <Card className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl border border-white/20 dark:border-gray-800/20 shadow-2xl">
                    <CardContent className="p-8 text-center">
                      <h3 className="text-xl font-semibold mb-2">No applications yet</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Create your first application to get started.</p>
                      <Button className="bg-gradient-to-r from-red-500 to-pink-500" onClick={createNewApplication}>
                        <Plus className="w-4 h-4 mr-2" /> New Application
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                <div className="space-y-6">
                  {applications.map((app, index) => (
                    <motion.div key={app.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * index }} whileHover={{ scale: 1.02 }}>
                      <Card className="overflow-hidden bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl border border-white/20 dark:border-gray-800/20 shadow-2xl">
                        <CardContent className="p-6">
                          <div className="grid lg:grid-cols-4 gap-6">
                            <div className="lg:col-span-2">
                              <div className="flex items-center space-x-4 mb-4">
                                <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                                  <Plane className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                  <h3 className="text-xl font-bold">{app.type}</h3>
                                  <p className="text-gray-600 dark:text-gray-400 flex items-center"><MapPin className="w-4 h-4 mr-1" />{app.country}</p>
                                </div>
                              </div>
                              <div className="space-y-3">
                                <div className="flex justify-between text-sm"><span>Application ID:</span><span className="font-mono font-medium">{app.id}</span></div>
                                <div className="flex justify-between text-sm"><span>Visa Officer:</span><span className="font-medium">{app.officer}</span></div>
                                <div className="flex justify-between text-sm"><span>Documents:</span><span className="font-medium">{app.documents} uploaded</span></div>
                              </div>
                            </div>
                            <div className="space-y-4">
                              <div>
                                <div className="flex items-center justify-between mb-2">
                                  <Badge className={getStatusColor(app.status)}>{app.status}</Badge>
                                  <Badge className={getPriorityColor(app.priority)}>{app.priority}</Badge>
                                </div>
                                <div className="space-y-2">
                                  <div className="flex justify-between text-sm"><span>Progress</span><span>{app.progress}%</span></div>
                                  <Progress value={app.progress} className="h-3" />
                                </div>
                              </div>
                              <div className="text-sm space-y-1">
                                <div className="flex justify-between"><span className="text-gray-600 dark:text-gray-400">Submitted:</span><span>{app.submittedDate}</span></div>
                                <div className="flex justify-between"><span className="text-gray-600 dark:text-gray-400">Expected:</span><span>{app.expectedDate}</span></div>
                                <div className="flex justify-between"><span className="text-gray-600 dark:text-gray-400">Amount:</span><span className="font-semibold text-primary">{app.amount}</span></div>
                              </div>
                            </div>
                            <div className="flex flex-col space-y-2">
                              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Button variant="outline" size="sm" className="w-full"><Eye className="w-4 h-4 mr-2" />View Details</Button>
                              </motion.div>
                              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Button variant="outline" size="sm" className="w-full"><Download className="w-4 h-4 mr-2" />Download</Button>
                              </motion.div>
                              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Button variant="outline" size="sm" className="w-full"><MessageSquare className="w-4 h-4 mr-2" />Contact Officer</Button>
                              </motion.div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
                )}
              </div>
            )}

            {selectedTab === "documents" && (
              <div className="space-y-6">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">Document Manager</h2>
                    <p className="text-gray-600 dark:text-gray-400">Securely store and manage your visa documents</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative hidden sm:block">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input className="pl-9 pr-3 py-2 rounded-md bg-transparent border border-border text-sm" placeholder="Search" />
                    </div>
                    <Button className="bg-gradient-to-r from-red-500 to-pink-500">
                      <Upload className="w-4 h-4 mr-2" /> Upload Document
                    </Button>
                  </div>
                </motion.div>

                <Card className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl border border-white/20 dark:border-gray-800/20 shadow-2xl">
                  <CardContent className="p-0">
                    <div className="p-8 text-center text-sm text-gray-600 dark:text-gray-400">No documents yet.</div>
                  </CardContent>
                </Card>
              </div>
            )}

            {selectedTab === "support" && (
              <div className="space-y-6">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-2">Premium Support Center</h2>
                  <p className="text-gray-600 dark:text-gray-400">Get expert help from our dedicated support team</p>
                </motion.div>

                {/* App context (no dropdown). Auto-select most recent in loader. */}
                {applications.length > 0 && (
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Chatting about: <span className="font-medium text-foreground">{(applications.find(a => a.id === supportAppId) || applications[0])?.type} • {(applications.find(a => a.id === supportAppId) || applications[0])?.country}</span>
                  </div>
                )}
                {applications.length === 0 ? (
                  <Card className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl border border-white/20 dark:border-gray-800/20 shadow-2xl">
                    <CardContent className="p-6 flex items-center justify-between gap-3">
                      <p className="text-sm text-gray-600 dark:text-gray-400">You don’t have any applications yet. Create one to start chatting with support.</p>
                      <Button className="bg-gradient-to-r from-red-500 to-pink-500" onClick={createNewApplication}>
                        <Plus className="w-4 h-4 mr-2" /> New Application
                      </Button>
                    </CardContent>
                  </Card>
                ) : supportAppId ? (
                  <ChatPanel
                    title="Support Chat"
                    description="Chat with UGS support about your application"
                    messages={(supportMessages || []).map((m) => ({
                      id: m.id,
                      text: (m as any).text,
                      by: (m as any).byRole,
                      at: (m as any)?.createdAt?.toDate?.()?.toLocaleString?.() || undefined,
                    }))}
                    pending={supportLoading}
                    input={supportInput}
                    setInput={setSupportInput}
                    onSend={sendSupportMsg}
                    placeholder="Type your message to support..."
                    emptyState="No messages yet. Start the conversation with support."
                  />
                ) : (
                  <Card className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl border border-white/20 dark:border-gray-800/20 shadow-2xl">
                    <CardContent className="p-6">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Preparing chat…</p>
                    </CardContent>
                  </Card>
                )}

                <div className="grid md:grid-cols-3 gap-6">
                  {[{ title: 'Live Chat Support', desc: '24/7 instant assistance', icon: MessageSquare, btn: 'Start Chat', color: 'from-emerald-500 to-green-500' }, { title: 'Video Consultation', desc: 'Face-to-face expert guidance', icon: Camera, btn: 'Book Call', color: 'from-indigo-500 to-blue-500' }, { title: 'Priority Phone Line', desc: 'Direct access to specialists', icon: Phone, btn: 'Call Now', color: 'from-purple-500 to-pink-500' }].map((s, idx) => (
                    <Card key={idx} className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl border border-white/20 dark:border-gray-800/20 shadow-2xl">
                      <CardContent className="p-6 text-center">
                        <div className={`mx-auto w-12 h-12 rounded-xl bg-gradient-to-r ${s.color} flex items-center justify-center mb-3`}>
                          <s.icon className="w-6 h-6 text-white" />
                        </div>
                        <div className="font-semibold mb-1">{s.title}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">{s.desc}</div>
                        <Button variant="outline" className="mx-auto">{s.btn}</Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {selectedTab === "profile" && (
              <div className="space-y-6">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-2">My Profile</h2>
                  <p className="text-gray-600 dark:text-gray-400">Manage your personal information and preferences</p>
                </motion.div>

                <div className="grid lg:grid-cols-3 gap-8">
                  <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
                    <Card className="text-center bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl border border-white/20 dark:border-gray-800/20 shadow-2xl">
                      <CardContent className="p-6">
                        <div className="flex flex-col items-center gap-4">
                          <div className="relative">
                            <Avatar className="w-24 h-24">
                              <AvatarImage src={clientData.profileImage || undefined} alt={clientData.name} />
                              <AvatarFallback>{clientData.name?.slice(0,2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <button
                              type="button"
                              className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-md border border-white/70"
                              title="Update photo"
                              aria-label="Update photo"
                            >
                              <Camera className="w-4 h-4" />
                            </button>
                          </div>
                          <div>
                            <h3 className="text-xl font-semibold">{clientData.name}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{clientData.email}</p>
                          </div>
                        </div>
                        <div className="mt-6 flex flex-col gap-3">
                          <Button variant="outline">Update Photo</Button>
                          <Button variant="outline">Edit Personal Info</Button>
                          <Button className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"><CheckCircle className="w-4 h-4 mr-2" />Save Changes</Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }} className="lg:col-span-2">
                    <Card className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl border border-white/20 dark:border-gray-800/20 shadow-2xl">
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2"><User className="w-5 h-5 text-primary" /><span>Personal Information</span></CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid md:grid-cols-2 gap-5">
                          <div>
                            <label className="text-sm text-gray-600 dark:text-gray-400">Full Name</label>
                            <input defaultValue={clientData.name} className="mt-1 w-full bg-transparent border border-border rounded-md px-3 py-2 text-sm" />
                          </div>
                          <div>
                            <label className="text-sm text-gray-600 dark:text-gray-400">Email Address</label>
                            <input defaultValue={clientData.email} className="mt-1 w-full bg-transparent border border-border rounded-md px-3 py-2 text-sm" />
                          </div>
                          <div>
                            <label className="text-sm text-gray-600 dark:text-gray-400">Phone Number</label>
                            <input defaultValue={clientData.phone} className="mt-1 w-full bg-transparent border border-border rounded-md px-3 py-2 text-sm" />
                          </div>
                          <div>
                            <label className="text-sm text-gray-600 dark:text-gray-400">Nationality</label>
                            <select defaultValue="United States" className="mt-1 w-full bg-transparent border border-border rounded-md px-3 py-2 text-sm">
                              <option>United States</option>
                              <option>Ethiopia</option>
                              <option>United Kingdom</option>
                              <option>Canada</option>
                            </select>
                          </div>
                        </div>
                        <div className="mt-5">
                          <Button className="bg-gradient-to-r from-green-500 to-emerald-500"><CheckCircle className="w-4 h-4 mr-2" />Save Changes</Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </div>
              </div>
            )}

            {selectedTab === "settings" && (
              <div className="space-y-6">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-2">Settings & Preferences</h2>
                  <p className="text-gray-600 dark:text-gray-400">Customize your account and notification preferences</p>
                </motion.div>

                <div className="grid lg:grid-cols-2 gap-8">
                  <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
                    <Card className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl border border-white/20 dark:border-gray-800/20 shadow-2xl">
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2"><Bell className="w-5 h-5 text-primary" /><span>Notifications</span></CardTitle>
                        <CardDescription>Control how we notify you</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span>Email Notifications</span>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <span>SMS Alerts</span>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Marketing Emails</span>
                          <Switch />
                        </div>
                        <div className="pt-4 space-y-2">
                          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                            <Button variant="outline" className="w-full justify-start"><Shield className="w-4 h-4 mr-2" />Privacy Settings</Button>
                          </motion.div>
                          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                            <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700"><Trash2 className="w-4 h-4 mr-2" />Delete Account</Button>
                          </motion.div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}>
                    <Card className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl border border-white/20 dark:border-gray-800/20 shadow-2xl">
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2"><KeyRound className="w-5 h-5 text-primary" /><span>Security</span></CardTitle>
                        <CardDescription>Keep your account protected</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <Button variant="outline" className="w-full justify-between"><span>Change Password</span><KeyRound className="w-4 h-4" /></Button>
                        <Button variant="outline" className="w-full justify-between"><span>Two-Factor Authentication</span><Shield className="w-4 h-4" /></Button>
                        <Button variant="outline" className="w-full justify-between"><span>Download My Data</span><Download className="w-4 h-4" /></Button>
                        <Button variant="outline" className="w-full justify-between text-red-600 hover:text-red-700"><span>Delete Account</span><Trash2 className="w-4 h-4" /></Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                </div>
              </div>
            )}

              <Dialog open={messagesOpen} onOpenChange={setMessagesOpen}>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Application Messages</DialogTitle>
                    <DialogDescription>Chat with UGS support about this application.</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-3">
                    <div className="border rounded-lg p-3 max-h-72 overflow-y-auto bg-muted/30">
                      {messagesLoading ? (
                        <div className="text-xs text-muted-foreground">Loading messages…</div>
                      ) : messages.length === 0 ? (
                        <div className="text-xs text-muted-foreground">No messages yet. Start the conversation.</div>
                      ) : (
                        <div className="space-y-2">
                          {messages.map((m) => (
                            <div key={m.id} className={`text-sm p-2 rounded-md ${m.byRole === 'admin' ? 'bg-blue-500/10' : 'bg-gray-500/10'}`}>
                              <div className="text-xs text-muted-foreground mb-1">{m.byRole === 'admin' ? 'Admin' : 'You'}</div>
                              <div>{m.text}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <input value={newMessage} onChange={e => setNewMessage(e.target.value)} placeholder="Type a message…" className="flex-1 bg-transparent border border-border rounded-md px-3 py-2 text-sm" />
                      <Button size="sm" onClick={sendMsg} className="bg-gradient-to-r from-red-500 to-pink-500 text-white">Send</Button>
                    </div>
                  </div>
                  <DialogFooter>
                    <div className="text-xs text-muted-foreground ml-auto">App ID: {selectedMsgAppId}</div>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
          </div>
        </div>
      </div>

      <MobileSidebar 
        isOpen={mobileSidebarOpen} 
        onClose={() => setMobileSidebarOpen(false)} 
        onTabChange={setSelectedTab} 
        selectedTab={selectedTab} 
        tabs={clientTabs} 
        userData={{ name: clientData.name, email: clientData.email, status: clientData.status, avatar: clientData.profileImage || undefined }} 
        isAdmin={false} 
        onLogout={onLogout} 
      />
    </div>
  );
}
