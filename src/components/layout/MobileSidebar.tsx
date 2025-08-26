import React, { useEffect } from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

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
      <div
        className={`fixed inset-0 h-full w-full z-50 lg:hidden pointer-events-none transition-all duration-300 ease-in-out ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Drawer panel */}
        <div className={`pointer-events-auto absolute left-0 top-0 h-full w-[320px] sm:w-[360px] shadow-2xl ring-1 ring-black/10 dark:ring-white/10 overflow-hidden rounded-none transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
            <div className="flex flex-col h-full bg-white/95 text-gray-900 dark:bg-gray-900/95 dark:text-white mobile-backdrop-blur">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-black/10 dark:border-white/10 bg-white/80 dark:bg-gray-900/80 backdrop-blur">
                <div className="flex items-center space-x-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                    className="w-9 h-9 p-0 text-gray-700 hover:bg-black/5 dark:text-white dark:hover:bg-white/10 transition-colors duration-200"
                  >
                    <Menu className="w-5 h-5" />
                  </Button>
                </div>
                <div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                    className="w-9 h-9 p-0 text-gray-700 hover:bg-black/5 dark:text-white dark:hover:bg-white/10 transition-colors duration-200"
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

              {/* Navigation Tabs - Stacked Design */}
              <div className="flex-1 overflow-y-auto py-4">
                <div className="space-y-0 px-4">
                  {tabs.map((tab) => (
                    <button
                      key={tab.value}
                      className={`group flex items-start w-full px-4 py-4 transition-all duration-300 ease-in-out text-left border-l-4 mobile-touch-target ${
                        selectedTab === tab.value
                          ? 'bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-950/20 dark:to-pink-950/20 text-red-700 dark:text-red-300 border-red-500 shadow-sm'
                          : 'text-gray-900 dark:text-white hover:bg-black/5 dark:hover:bg-white/5 border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                      onClick={() => {
                        onTabChange(tab.value);
                        onClose();
                      }}
                    >
                      <tab.icon className={`mt-0.5 w-5 h-5 ${selectedTab === tab.value ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white'}`} />
                      <div className="ml-3 min-w-0 flex-1">
                        <div className="flex items-center space-x-2">
                          <span className={`text-sm font-semibold truncate ${selectedTab === tab.value ? 'text-red-700 dark:text-red-300' : ''}`}>{tab.label}</span>
                          {tab.badge && (
                            <Badge className={`text-xs ${selectedTab === tab.value ? 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}>
                              {tab.badge}
                            </Badge>
                          )}
                        </div>
                        {tab.description && (
                          <p className={`text-xs mt-1 truncate ${selectedTab === tab.value ? 'text-red-600/80 dark:text-red-400/80' : 'text-gray-500 dark:text-gray-400'}`}>
                            {tab.description}
                          </p>
                        )}
                      </div>
                    </button>
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
            {/* Transparent right-side area to close on click */}
            <div className="pointer-events-auto absolute left-[320px] sm:left-[360px] right-0 top-0 bottom-0" onClick={onClose} />
          </div>
        </div>
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
