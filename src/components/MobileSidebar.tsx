import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './button';
import { Badge } from './badge';
import { Avatar, AvatarFallback, AvatarImage } from './avatar';

import { 
  X, 
  Menu, 
  Home, 
  FileText, 
  Users, 
  GraduationCap, 
  Bot, 
  BarChart3, 
  Settings, 
  Shield, 
  MessageSquare, 
  Upload, 
  Globe,
  Crown,
  Sparkles,
  LogOut,
  Bell,
  User,
  Camera,
  HelpCircle,
  KeyRound,
  Download,
  Trash2,
  MapPin,
  Phone,
  Mail
} from 'lucide-react';

interface TabItem {
  value: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  description?: string;
}

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onTabChange: (tab: string) => void;
  selectedTab: string;
  tabs: TabItem[];
  userData?: {
    name: string;
    email: string;
    status: string;
    avatar?: string;
  };
  isAdmin?: boolean;
  onLogout?: () => void;
  onPageChange?: (page: string) => void;
}

export function MobileSidebar({
  isOpen,
  onClose,
  onTabChange,
  selectedTab,
  tabs,
  userData,
  isAdmin = false,
  onLogout,
  onPageChange
}: MobileSidebarProps) {
  // Prevent body scroll when sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('sidebar-open');
    } else {
      document.body.classList.remove('sidebar-open');
    }

    return () => {
      document.body.classList.remove('sidebar-open');
    };
  }, [isOpen]);

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 mobile-backdrop-blur z-40 lg:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed left-0 top-0 h-full w-80 max-w-[85vw] bg-white/95 dark:bg-gray-950/95 mobile-backdrop-blur border-r border-white/20 dark:border-gray-800/20 shadow-2xl z-50 lg:hidden"
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/20 dark:border-gray-800/20">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-red-500 via-pink-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                    <Globe className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                      {isAdmin ? 'UGS Admin' : 'UGS Client Portal'}
                    </h1>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {isAdmin ? 'Control Center' : 'Premium Dashboard'}
                    </p>
                  </div>
                </div>
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                    className="w-9 h-9 p-0"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </motion.div>
              </div>

              {/* User Profile Section */}
              {userData && (
                <div className="p-6 border-b border-white/20 dark:border-gray-800/20">
                  <div className="flex items-center space-x-4">
                    <Avatar className="w-12 h-12 ring-2 ring-gradient-to-r from-red-500 to-pink-500">
                      {userData.avatar ? (
                        <AvatarImage src={userData.avatar} alt={userData.name} />
                      ) : null}
                      <AvatarFallback className="bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold">
                        {userData.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm truncate">
                        {userData.name}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {userData.email}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        {isAdmin ? (
                          <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-xs">
                            Admin
                          </Badge>
                        ) : (
                          <>
                            <Crown className="w-3 h-3 text-yellow-500" />
                            <span className="text-xs font-medium text-primary">
                              {userData.status}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Tabs */}
              <div className="flex-1 overflow-y-auto py-4">
                <div className="space-y-2 px-4">
                  {tabs.map((tab, index) => (
                    <motion.div
                      key={tab.value}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                                             <Button
                         variant={selectedTab === tab.value ? "default" : "ghost"}
                         className={`w-full justify-start h-auto p-4 rounded-xl transition-all duration-300 mobile-touch-target ${
                           selectedTab === tab.value
                             ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg'
                             : 'hover:bg-white/50 dark:hover:bg-gray-800/50'
                         }`}
                         onClick={() => {
                           onTabChange(tab.value);
                           onClose();
                         }}
                       >
                        <div className="flex items-center space-x-3 w-full">
                          <tab.icon className={`w-5 h-5 ${
                            selectedTab === tab.value ? 'text-white' : 'text-gray-600 dark:text-gray-400'
                          }`} />
                          <div className="flex-1 text-left">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">{tab.label}</span>
                              {tab.badge && (
                                <Badge className="bg-white/20 text-white text-xs">
                                  {tab.badge}
                                </Badge>
                              )}
                            </div>
                            {tab.description && (
                              <p className={`text-xs mt-1 ${
                                selectedTab === tab.value 
                                  ? 'text-white/80' 
                                  : 'text-gray-500 dark:text-gray-400'
                              }`}>
                                {tab.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Footer Actions */}
              <div className="p-4 border-t border-white/20 dark:border-gray-800/20 space-y-2">
                {onLogout && (
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 mobile-touch-target"
                      onClick={() => {
                        onLogout();
                        onClose();
                      }}
                    >
                      <LogOut className="w-4 h-4 mr-3" />
                      Logout
                    </Button>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// Mobile menu button component
interface MobileMenuButtonProps {
  onClick: () => void;
  className?: string;
}

export function MobileMenuButton({ onClick, className = "" }: MobileMenuButtonProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={className}
    >
      <Button
        variant="ghost"
        size="sm"
        onClick={onClick}
        className="lg:hidden w-9 h-9 p-0"
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5" />
      </Button>
    </motion.div>
  );
}
