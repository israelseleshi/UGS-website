import React, { useEffect } from 'react';
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
      {/* Backdrop (kept for fade layering under the full-screen overlay) */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 mobile-backdrop-blur z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar (full-screen menu) */}
      {isOpen && (
        <div
          className="fixed inset-0 h-full w-full z-50 lg:hidden pointer-events-none"
        >
          {/* Drawer panel */}
          <div className="pointer-events-auto absolute left-0 top-0 h-full w-[320px] sm:w-[360px] shadow-2xl ring-1 ring-black/10 dark:ring-white/10 overflow-hidden rounded-none">
            <div className="flex flex-col h-full bg-white/95 text-gray-900 dark:bg-gray-900/95 dark:text-white mobile-backdrop-blur">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-black/10 dark:border-white/10 bg-white/80 dark:bg-gray-900/80 backdrop-blur">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-red-500 via-pink-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg ring-1 ring-white/20">
                    <Globe className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-lg font-bold">
                      {isAdmin ? 'UGS Admin' : 'UGS Client Portal'}
                    </h1>
                    <p className="text-xs text-gray-500 dark:text-gray-300">
                      {isAdmin ? 'Control Center' : 'Premium Dashboard'}
                    </p>
                  </div>
                </div>
                <div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                    className="w-9 h-9 p-0 text-gray-700 hover:bg-black/5 dark:text-white dark:hover:bg-white/10"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              {/* User Profile Section */}
              {userData && (
                <div className="p-6 border-b border-black/10 dark:border-white/10">
                  <div className="flex items-center space-x-4">
                    <Avatar className="w-12 h-12 ring-2 ring-black/10 dark:ring-white/20">
                      {userData.avatar ? (
                        <AvatarImage className="object-cover" src={userData.avatar} alt={userData.name} />
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
                      <p className="text-xs text-gray-500 dark:text-gray-300 truncate">
                        {userData.email}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        {isAdmin ? (
                          <Badge className="bg-black/10 text-gray-900 dark:bg-white/10 dark:text-white text-xs">
                            Admin
                          </Badge>
                        ) : (
                          <>
                            <Crown className="w-3 h-3 text-yellow-300" />
                            <span className="text-xs font-medium">
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
                  {tabs.map((tab) => (
                    <div key={tab.value}>
                      <Button
                        variant={"ghost"}
                        className={`w-full justify-start h-auto p-4 rounded-xl transition-all duration-300 mobile-touch-target border ${
                          selectedTab === tab.value
                            ? 'border-transparent bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg'
                            : 'border-black/10 bg-transparent text-gray-900 hover:bg-black/5 dark:border-white/10 dark:text-white dark:hover:bg-white/10'
                        }`}
                        onClick={() => {
                          onTabChange(tab.value);
                          onClose();
                        }}
                      >
                        <div className="flex items-center space-x-3 w-full">
                          <tab.icon className={`w-5 h-5 ${selectedTab === tab.value ? 'text-white' : 'text-gray-900 dark:text-white'}`} />
                          <div className="flex-1 text-left">
                            <div className="flex items-center space-x-2">
                              <span className={`font-medium ${selectedTab === tab.value ? 'text-white' : ''}`}>{tab.label}</span>
                              {tab.badge && (
                                <Badge className={`${selectedTab === tab.value ? 'bg-white/20 text-white' : 'bg-black/10 text-gray-900 dark:bg-white/20 dark:text-white'} text-xs`}>
                                  {tab.badge}
                                </Badge>
                              )}
                            </div>
                            {tab.description && (
                              <p className={`text-xs mt-1 ${selectedTab === tab.value ? 'text-white/90' : 'text-gray-600 dark:text-white/80'}`}>
                                {tab.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer Actions */}
              <div className="p-4 border-t border-black/10 dark:border-white/10 space-y-2 bg-white/70 dark:bg-gray-900/70 backdrop-blur">
                {onLogout && (
                  <div>
                    <Button
                      variant="ghost"
                      className="w-full justify-start mobile-touch-target text-gray-900 hover:bg-black/5 dark:text-white dark:hover:bg-white/10"
                      onClick={() => {
                        onLogout();
                        onClose();
                      }}
                    >
                      <LogOut className="w-5 h-5 mr-3" />
                      Sign Out
                    </Button>
                  </div>
                )}
              </div>
              </div>
            </div>
            {/* Transparent right-side area to close on click */}
            <div className="pointer-events-auto absolute left-[320px] sm:left-[360px] right-0 top-0 bottom-0" onClick={onClose} />
          </div>
        )}
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
    <div className={className}>
      <Button
        variant="ghost"
        size="sm"
        onClick={onClick}
        className="lg:hidden w-9 h-9 p-0"
        aria-label="Open menu"
      >
        <Menu className="w-6 h-6" />
      </Button>
    </div>
  );
}
