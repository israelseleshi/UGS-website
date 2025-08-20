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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "./tabs";
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
} from "lucide-react";
import { getTheme as readTheme, toggleTheme as flipTheme, type AppTheme } from "./theme";
import { useAuth } from "../lib/auth";
import { getUser, listUserApplications, upsertUser } from "../lib/db";

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
  const { user } = useAuth();

  React.useEffect(() => {
    const onChange = (e: Event) => {
      const detail = (e as CustomEvent<AppTheme>).detail;
      setTheme(detail || readTheme());
    };
    window.addEventListener('themechange', onChange as EventListener);
    return () => window.removeEventListener('themechange', onChange as EventListener);
  }, []);

  // Firestore-backed client data
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
    let ignore = false;
    async function load() {
      if (!user) return;
      try {
        // Load profile
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
            profileImage: null,
          });
        }

        // Load applications for this user
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
          if (!ignore) setApplications(mapped);
        } catch {
          // If listing fails (e.g., rules), leave as empty
          if (!ignore) setApplications([]);
        }
      } catch {
        // ignore errors and keep defaults
      }
    }
    load();
    return () => {
      ignore = true;
    };
  }, [user]);

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

  const documents = [
    {
      name: "Passport Copy",
      type: "PDF",
      size: "2.4 MB",
      uploaded: "2024-01-15",
      status: "Verified",
    },
    {
      name: "Bank Statement",
      type: "PDF",
      size: "1.8 MB",
      uploaded: "2024-01-15",
      status: "Verified",
    },
    {
      name: "Employment Letter",
      type: "PDF",
      size: "956 KB",
      uploaded: "2024-01-14",
      status: "Pending",
    },
    {
      name: "Photo ID",
      type: "JPG",
      size: "1.2 MB",
      uploaded: "2024-01-13",
      status: "Verified",
    },
    {
      name: "Travel Insurance",
      type: "PDF",
      size: "2.1 MB",
      uploaded: "2024-01-12",
      status: "Verified",
    },
  ];

  const recentActivity = [
    {
      action: "Document verified",
      description: "Passport copy approved by visa officer",
      time: "2 hours ago",
      type: "success",
    },
    {
      action: "Application updated",
      description:
        "Tourist visa application moved to processing",
      time: "1 day ago",
      type: "info",
    },
    {
      action: "Payment received",
      description: "Express processing fee payment confirmed",
      time: "2 days ago",
      type: "success",
    },
    {
      action: "Document requested",
      description: "Additional bank statement required",
      time: "3 days ago",
      type: "warning",
    },
  ];

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-950 dark:via-gray-900 dark:to-blue-950/20">
      {/* Luxury Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 dark:bg-gray-950/80 border-b border-white/20 dark:border-gray-800/50"
      >
        <div className="container mx-auto px-6 sm:px-8 lg:px-12">
          <div className="flex flex-wrap items-center justify-between gap-3 h-20">
            {/* Left side - Logo and greeting */}
            <div className="flex items-center space-x-6">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex items-center space-x-3"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-red-500 via-pink-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Globe className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                    UGS Client Portal
                  </h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Premium Dashboard
                  </p>
                </div>
              </motion.div>

              <div className="hidden md:block">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Good morning,{" "}
                  <span className="font-semibold text-primary">
                    {clientData.name}
                  </span>
                </p>
                <p className="text-xs text-gray-400">
                  Welcome back to your premium portal
                </p>
              </div>
            </div>

            {/* Right side - Actions and profile */}
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={() => setTheme(flipTheme())} className="relative w-9 h-9 p-0">
                <Sun className={`w-4 h-4 transition-opacity ${theme === 'dark' ? 'opacity-100' : 'opacity-0'}`} />
                <Moon className={`w-4 h-4 transition-opacity absolute ${theme === 'dark' ? 'opacity-0' : 'opacity-100'}`} />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange('home')}
                className="hidden sm:flex"
              >
                <Home className="w-4 h-4 mr-2" />
                Back to Website
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onPageChange('home')}
                className="sm:hidden w-9 h-9 p-0"
                aria-label="Back to website"
                title="Back to website"
              >
                <Home className="w-4 h-4" />
              </Button>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  className="relative"
                >
                  <Bell className="w-5 h-5" />
                  {notifications > 0 && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full flex items-center justify-center"
                    >
                      {notifications}
                    </motion.div>
                  )}
                </Button>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-3 px-4 py-2 bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-700 rounded-full shadow-lg border border-white/20 dark:border-gray-700/50"
              >
                <Avatar className="w-8 h-8 ring-2 ring-gradient-to-r from-red-500 to-pink-500">
                  <AvatarFallback className="bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold text-sm">
                    {clientData.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:block">
                  <p className="text-sm font-semibold">
                    {clientData.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {clientData.status}
                  </p>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onLogout}
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="container mx-auto px-6 sm:px-8 lg:px-12 pt-10 pb-12 lg:pt-14 lg:pb-16">
        <Tabs
          value={selectedTab}
          onValueChange={setSelectedTab}
          className="space-y-8"
        >
          {/* Premium Tab Navigation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <TabsList className="grid w-full max-w-6xl mx-auto p-2 bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl border border-white/20 dark:border-gray-800/20 shadow-2xl rounded-2xl overflow-x-auto whitespace-nowrap [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden grid-flow-col auto-cols-max sm:grid-flow-row sm:auto-cols-auto sm:grid-cols-6">
              <TabsTrigger
                value="overview"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:to-pink-500 data-[state=active]:text-white rounded-xl transition-all duration-300"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="applications"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:to-pink-500 data-[state=active]:text-white rounded-xl transition-all duration-300"
              >
                Applications
              </TabsTrigger>
              <TabsTrigger
                value="documents"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:to-pink-500 data-[state=active]:text-white rounded-xl transition-all duration-300"
              >
                Documents
              </TabsTrigger>
              <TabsTrigger
                value="support"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:to-pink-500 data-[state=active]:text-white rounded-xl transition-all duration-300"
              >
                Support
              </TabsTrigger>
              <TabsTrigger
                value="profile"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:to-pink-500 data-[state=active]:text-white rounded-xl transition-all duration-300"
              >
                Profile
              </TabsTrigger>
              <TabsTrigger
                value="settings"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:to-pink-500 data-[state=active]:text-white rounded-xl transition-all duration-300"
              >
                Settings
              </TabsTrigger>
            </TabsList>
          </motion.div>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-8">
            {/* Welcome Banner */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="relative overflow-hidden bg-gradient-to-br from-red-500 via-pink-500 to-orange-500 text-white border-0 shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent" />
                <CardContent className="relative p-8 lg:p-12">
                  <div className="flex items-center justify-between">
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <Crown className="w-8 h-8 text-yellow-300" />
                        <div>
                          <h2 className="text-2xl font-bold">
                            Welcome back, {clientData.name}!
                          </h2>
                          <p className="text-white/80">
                            You're a {clientData.status} with
                            exclusive benefits
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
                        <div className="flex items-center space-x-2">
                          <Sparkles className="w-4 h-4" />
                          <span>
                            Member since{" "}
                            {clientData.memberSince}
                          </span>
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
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 20,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="opacity-20"
                    >
                      <Gem className="w-24 h-24" />
                    </motion.div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Stats Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10"
            >
              {[
                {
                  title: "Active Applications",
                  value: "3",
                  change: "+1",
                  icon: FileText,
                  gradient: "from-blue-500 to-cyan-500",
                },
                {
                  title: "Visas Approved",
                  value: "8",
                  change: "+2",
                  icon: CheckCircle,
                  gradient: "from-emerald-500 to-teal-500",
                },
                {
                  title: "Documents Verified",
                  value: "24",
                  change: "+5",
                  icon: Shield,
                  gradient: "from-purple-500 to-indigo-500",
                },
                {
                  title: "Countries Visited",
                  value: "12",
                  change: "+3",
                  icon: Globe,
                  gradient: "from-orange-500 to-red-500",
                },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.02, y: -5 }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                  }}
                >
                  <Card className="relative overflow-hidden bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl border border-white/20 dark:border-gray-800/20 shadow-2xl">
                    <CardContent className="p-6 lg:p-8">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            {stat.title}
                          </p>
                          <p className="text-3xl font-bold">
                            {stat.value}
                          </p>
                          <p className="text-xs text-emerald-600 dark:text-emerald-400">
                            {stat.change} this month
                          </p>
                        </div>
                        <div
                          className={`w-12 h-12 rounded-xl bg-gradient-to-r ${stat.gradient} flex items-center justify-center shadow-lg`}
                        >
                          <stat.icon className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    </CardContent>
                    <motion.div
                      className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r ${stat.gradient}`}
                      initial={{ width: 0 }}
                      animate={{ width: "100%" }}
                      transition={{
                        delay: 0.5 + index * 0.1,
                        duration: 0.8,
                      }}
                    />
                  </Card>
                </motion.div>
              ))}
            </motion.div>

            {/* Applications Overview */}
            <div className="grid lg:grid-cols-3 gap-8">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="lg:col-span-2"
              >
                <Card className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl border border-white/20 dark:border-gray-800/20 shadow-2xl">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <FileText className="w-5 h-5 text-primary" />
                      <span>Recent Applications</span>
                    </CardTitle>
                    <CardDescription>
                      Track your visa application progress
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6 lg:space-y-8">
                    {applications
                      .slice(0, 3)
                      .map((app, index) => (
                        <motion.div
                          key={app.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 * index }}
                          whileHover={{ scale: 1.02 }}
                          className="p-5 md:p-6 rounded-xl bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-700 border border-white/50 dark:border-gray-700/50 shadow-lg"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg flex items-center justify-center">
                                <Plane className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <h4 className="font-semibold">
                                  {app.type}
                                </h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {app.country}
                                </p>
                              </div>
                            </div>
                            <Badge
                              className={getStatusColor(
                                app.status,
                              )}
                            >
                              {app.status}
                            </Badge>
                          </div>

                          <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                              <span>Progress</span>
                              <span>{app.progress}%</span>
                            </div>
                            <Progress
                              value={app.progress}
                              className="h-2"
                            />
                          </div>

                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-5 text-sm text-gray-600 dark:text-gray-400">
                            <span>
                              Expected: {app.expectedDate}
                            </span>
                            <span className="font-semibold text-primary">
                              {app.amount}
                            </span>
                          </div>
                        </motion.div>
                      ))}
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="space-y-6 lg:space-y-8"
              >
                {/* Recent Activity */}
                <Card className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl border border-white/20 dark:border-gray-800/20 shadow-2xl">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Clock className="w-5 h-5 text-primary" />
                      <span>Recent Activity</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentActivity
                        .slice(0, 4)
                        .map((activity, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 * index }}
                            className="flex items-start space-x-3 p-3 rounded-lg bg-gradient-to-r from-white/50 to-transparent dark:from-gray-800/50"
                          >
                            <div
                              className={`w-2 h-2 rounded-full mt-2 ${
                                activity.type === "success"
                                  ? "bg-emerald-500"
                                  : activity.type === "warning"
                                    ? "bg-amber-500"
                                    : "bg-blue-500"
                              }`}
                            />
                            <div className="flex-1">
                              <p className="text-sm font-medium">
                                {activity.action}
                              </p>
                              <p className="text-xs text-gray-600 dark:text-gray-400">
                                {activity.description}
                              </p>
                              <p className="text-xs text-gray-400">
                                {activity.time}
                              </p>
                            </div>
                          </motion.div>
                        ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white border-0 shadow-2xl">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Sparkles className="w-5 h-5" />
                      <span>Quick Actions</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        variant="secondary"
                        className="w-full justify-start bg-white/20 hover:bg-white/30 text-white border-0"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        New Application
                      </Button>
                    </motion.div>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        variant="secondary"
                        className="w-full justify-start bg-white/20 hover:bg-white/30 text-white border-0"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Document
                      </Button>
                    </motion.div>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        variant="secondary"
                        className="w-full justify-start bg-white/20 hover:bg-white/30 text-white border-0"
                      >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Contact Support
                      </Button>
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </TabsContent>

          {/* Applications Tab */}
          <TabsContent
            value="applications"
            className="space-y-6"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between"
            >
              <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  My Applications
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Manage and track your visa applications
                </p>
              </div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600">
                  <Plus className="w-4 h-4 mr-2" />
                  New Application
                </Button>
              </motion.div>
            </motion.div>

            <div className="space-y-6">
              {applications.map((app, index) => (
                <motion.div
                  key={app.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  whileHover={{ scale: 1.02 }}
                >
                  <Card className="overflow-hidden bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl border border-white/20 dark:border-gray-800/20 shadow-2xl">
                    <CardContent className="p-6">
                      <div className="grid lg:grid-cols-4 gap-6">
                        <div className="lg:col-span-2">
                          <div className="flex items-center space-x-4 mb-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                              <Plane className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <h3 className="text-xl font-bold">
                                {app.type}
                              </h3>
                              <p className="text-gray-600 dark:text-gray-400 flex items-center">
                                <MapPin className="w-4 h-4 mr-1" />
                                {app.country}
                              </p>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                              <span>Application ID:</span>
                              <span className="font-mono font-medium">
                                {app.id}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Visa Officer:</span>
                              <span className="font-medium">
                                {app.officer}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Documents:</span>
                              <span className="font-medium">
                                {app.documents} uploaded
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <Badge
                                className={getStatusColor(
                                  app.status,
                                )}
                              >
                                {app.status}
                              </Badge>
                              <Badge
                                className={getPriorityColor(
                                  app.priority,
                                )}
                              >
                                {app.priority}
                              </Badge>
                            </div>
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>Progress</span>
                                <span>{app.progress}%</span>
                              </div>
                              <Progress
                                value={app.progress}
                                className="h-3"
                              />
                            </div>
                          </div>

                          <div className="text-sm space-y-1">
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">
                                Submitted:
                              </span>
                              <span>{app.submittedDate}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">
                                Expected:
                              </span>
                              <span>{app.expectedDate}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">
                                Amount:
                              </span>
                              <span className="font-semibold text-primary">
                                {app.amount}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col space-y-2">
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full"
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </Button>
                          </motion.div>
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full"
                            >
                              <Download className="w-4 h-4 mr-2" />
                              Download
                            </Button>
                          </motion.div>
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full"
                            >
                              <MessageSquare className="w-4 h-4 mr-2" />
                              Contact Officer
                            </Button>
                          </motion.div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between"
            >
              <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  Document Manager
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Securely store and manage your visa documents
                </p>
              </div>
              <div className="flex space-x-3">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button variant="outline">
                    <Search className="w-4 h-4 mr-2" />
                    Search
                  </Button>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Document
                  </Button>
                </motion.div>
              </div>
            </motion.div>

            <Card className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl border border-white/20 dark:border-gray-800/20 shadow-2xl">
              <CardContent className="p-6">
                <div className="space-y-4">
                  {documents.map((doc, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * index }}
                      whileHover={{ scale: 1.02 }}
                      className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-white/50 to-gray-50/50 dark:from-gray-800/50 dark:to-gray-700/50 border border-white/20 dark:border-gray-700/20"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                          <FileText className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h4 className="font-semibold">
                            {doc.name}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {doc.type} • {doc.size} • Uploaded{" "}
                            {doc.uploaded}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <Badge
                          className={
                            doc.status === "Verified"
                              ? getStatusColor("Approved")
                              : getStatusColor("Under Review")
                          }
                        >
                          {doc.status}
                        </Badge>
                        <div className="flex space-x-1">
                          <motion.div
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </motion.div>
                          <motion.div
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Button variant="ghost" size="sm">
                              <Download className="w-4 h-4" />
                            </Button>
                          </motion.div>
                          <motion.div
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Button variant="ghost" size="sm">
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </motion.div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Support Tab */}
          <TabsContent value="support" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-2">
                Premium Support Center
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Get expert help from our dedicated support team
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  title: "Live Chat Support",
                  description: "24/7 instant assistance",
                  icon: MessageSquare,
                  gradient: "from-green-500 to-emerald-500",
                  action: "Start Chat",
                },
                {
                  title: "Video Consultation",
                  description: "Face-to-face expert guidance",
                  icon: Camera,
                  gradient: "from-blue-500 to-cyan-500",
                  action: "Book Call",
                },
                {
                  title: "Priority Phone Line",
                  description: "Direct access to specialists",
                  icon: Phone,
                  gradient: "from-purple-500 to-indigo-500",
                  action: "Call Now",
                },
              ].map((support, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  whileHover={{ scale: 1.05 }}
                >
                  <Card className="text-center bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl border border-white/20 dark:border-gray-800/20 shadow-2xl">
                    <CardContent className="p-6">
                      <div
                        className={`w-16 h-16 bg-gradient-to-r ${support.gradient} rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg`}
                      >
                        <support.icon className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-xl font-bold mb-2">
                        {support.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        {support.description}
                      </p>
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button
                          className={`w-full bg-gradient-to-r ${support.gradient} hover:opacity-90`}
                        >
                          {support.action}
                        </Button>
                      </motion.div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* FAQ Section */}
            <Card className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl border border-white/20 dark:border-gray-800/20 shadow-2xl">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <HelpCircle className="w-5 h-5 text-primary" />
                  <span>Frequently Asked Questions</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    "How long does visa processing take?",
                    "What documents do I need for my application?",
                    "Can I track my application status?",
                    "What if my visa is denied?",
                  ].map((question, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * index }}
                      whileHover={{ x: 10 }}
                      className="p-4 rounded-lg bg-gradient-to-r from-white/50 to-gray-50/50 dark:from-gray-800/50 dark:to-gray-700/50 cursor-pointer border border-white/20 dark:border-gray-700/20"
                    >
                      <p className="font-medium">{question}</p>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-2">
                My Profile
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Manage your personal information and preferences
              </p>
            </motion.div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Profile Info */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="text-center bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl border border-white/20 dark:border-gray-800/20 shadow-2xl">
                  <CardContent className="p-6">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="relative inline-block mb-6"
                    >
                      <Avatar className="w-24 h-24 ring-4 ring-gradient-to-r from-red-500 to-pink-500">
                        <AvatarFallback className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-2xl font-bold">
                          {clientData.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center cursor-pointer shadow-lg"
                      >
                        <Camera className="w-4 h-4 text-white" />
                      </motion.div>
                    </motion.div>

                    <h3 className="text-xl font-bold mb-2">
                      {clientData.name}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-1">
                      {clientData.email}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      {clientData.phone}
                    </p>

                    <div className="flex items-center justify-center space-x-2 mb-4">
                      <Crown className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm font-semibold text-primary">
                        {clientData.status}
                      </span>
                    </div>

                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button className="w-full bg-gradient-to-r from-red-500 to-pink-500">
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Profile
                      </Button>
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Profile Details */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="lg:col-span-2"
              >
                <Card className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl border border-white/20 dark:border-gray-800/20 shadow-2xl">
                  <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>
                      Update your profile details and
                      preferences
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          Full Name
                        </label>
                        <motion.input
                          whileFocus={{ scale: 1.02 }}
                          className="w-full p-3 rounded-xl bg-white/50 dark:bg-gray-800/50 border border-white/20 dark:border-gray-700/20 backdrop-blur-sm"
                          defaultValue={clientData.name}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          Email Address
                        </label>
                        <motion.input
                          whileFocus={{ scale: 1.02 }}
                          className="w-full p-3 rounded-xl bg-white/50 dark:bg-gray-800/50 border border-white/20 dark:border-gray-700/20 backdrop-blur-sm"
                          defaultValue={clientData.email}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          Phone Number
                        </label>
                        <motion.input
                          whileFocus={{ scale: 1.02 }}
                          className="w-full p-3 rounded-xl bg-white/50 dark:bg-gray-800/50 border border-white/20 dark:border-gray-700/20 backdrop-blur-sm"
                          defaultValue={clientData.phone}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          Nationality
                        </label>
                        <motion.select
                          whileFocus={{ scale: 1.02 }}
                          className="w-full p-3 rounded-xl bg-white/50 dark:bg-gray-800/50 border border-white/20 dark:border-gray-700/20 backdrop-blur-sm"
                        >
                          <option>United States</option>
                          <option>Canada</option>
                          <option>United Kingdom</option>
                          <option>Other</option>
                        </motion.select>
                      </div>
                    </div>

                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Save Changes
                      </Button>
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-2">
                Settings & Preferences
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Customize your account and notification
                preferences
              </p>
            </motion.div>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Notification Settings */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl border border-white/20 dark:border-gray-800/20 shadow-2xl">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Bell className="w-5 h-5 text-primary" />
                      <span>Notifications</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {[
                      {
                        label: "Email notifications",
                        description:
                          "Receive updates via email",
                      },
                      {
                        label: "SMS notifications",
                        description: "Get text message alerts",
                      },
                      {
                        label: "Application updates",
                        description:
                          "Status change notifications",
                      },
                      {
                        label: "Marketing emails",
                        description:
                          "Promotional content and offers",
                      },
                    ].map((setting, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * index }}
                        className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-white/50 to-gray-50/50 dark:from-gray-800/50 dark:to-gray-700/50"
                      >
                        <div>
                          <p className="font-medium">
                            {setting.label}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {setting.description}
                          </p>
                        </div>
                        <motion.input
                          whileHover={{ scale: 1.1 }}
                          type="checkbox"
                          className="w-4 h-4"
                          defaultChecked={index < 2}
                        />
                      </motion.div>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Security Settings */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl border border-white/20 dark:border-gray-800/20 shadow-2xl">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Shield className="w-5 h-5 text-primary" />
                      <span>Security</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <motion.div whileHover={{ scale: 1.02 }}>
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                      >
                        <KeyRound className="w-4 h-4 mr-2" />
                        Change Password
                      </Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.02 }}>
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                      >
                        <Shield className="w-4 h-4 mr-2" />
                        Two-Factor Authentication
                      </Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.02 }}>
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download My Data
                      </Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.02 }}>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Account
                      </Button>
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}