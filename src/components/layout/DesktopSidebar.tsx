import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Globe, LogOut, Menu } from 'lucide-react';

export interface SidebarItem {
  value: string;
  label: string;
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  badge?: string;
  description?: string;
}

interface DesktopSidebarProps {
  items: SidebarItem[];
  selected: string;
  onSelect: (value: string) => void;
  className?: string;
  /** When true, renders a compact, icon-only sidebar */
  collapsed?: boolean;
  /** Optional callback for a collapse/expand toggle control, if rendered by parent */
  onToggleCollapse?: () => void;
  userData?: { name: string; email: string; status?: string; avatar?: string };
  headerTitle?: string;
  headerSubtitle?: string;
  onLogout?: () => void;
}

export function DesktopSidebar({ items, selected, onSelect, className = '', collapsed = false, userData, headerTitle, headerSubtitle, onLogout, onToggleCollapse }: DesktopSidebarProps) {
  return (
    <div className={`h-full ${className}`}>
      <div className={`flex flex-col h-full w-full overflow-hidden backdrop-blur-xl bg-white/60 dark:bg-gray-900/60 border-r border-white/20 dark:border-gray-800/20 shadow-2xl px-3 pt-0 pb-4`}>
        {/* Sidebar top spacing preserved; internal toggle intentionally removed */}
        {/* Brand/Header */}
        {(headerTitle || headerSubtitle) ? (
          <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'} w-full px-2 py-2 mb-2`}>
            <div className="flex items-center">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 via-pink-500 to-orange-500 flex items-center justify-center shadow-lg ring-1 ring-white/30 dark:ring-white/10 ${collapsed ? '' : 'mr-3'}`}>
                <Globe className="w-5 h-5 text-white" />
              </div>
              {!collapsed ? (
                <div className="min-w-0">
                  <div className="text-sm font-semibold leading-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300">{headerTitle}</div>
                  {headerSubtitle ? (
                    <div className="text-[11px] text-muted-foreground truncate">{headerSubtitle}</div>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>
        ) : null}

        {/* User profile header */}
        {userData ? (
          <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-start'} w-full px-2 py-2`}>
            <Avatar className={`${collapsed ? 'w-8 h-8' : 'w-10 h-10'} ring-1 ring-white/40 dark:ring-white/10 shadow` }>
              {userData.avatar ? (
                <AvatarImage className="object-cover" src={userData.avatar} alt={userData.name} />
              ) : null}
              <AvatarFallback className="bg-gradient-to-r from-red-500 to-pink-500 text-white">
                {userData.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')}
              </AvatarFallback>
            </Avatar>
            {!collapsed ? (
              <div className="ml-3 min-w-0">
                <div className="text-sm font-medium truncate">{userData.name}</div>
                <div className="text-xs text-muted-foreground truncate">{userData.email}</div>
              </div>
            ) : null}
          </div>
        ) : null}

        <div className="mt-2 space-y-1">
          {items.map((it) => {
            const active = selected === it.value;
            const Icon = it.icon;
            return (
              <button
                key={it.value}
                onClick={() => onSelect(it.value)}
                className={`group flex items-start w-full px-3 py-2 rounded-md transition-all text-left ${
                  active
                    ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg ring-1 ring-white/20'
                    : 'text-foreground hover:bg-white/40 dark:hover:bg-gray-800/40'
                }`}
                title={it.label}
              >
                {Icon ? (
                  <Icon className={`mt-0.5 w-4 h-4 ${active ? 'text-white' : 'text-muted-foreground group-hover:text-foreground'}`} />
                ) : null}
                {!collapsed ? (
                  <div className="ml-3 min-w-0 flex-1">
                    <div className={`text-sm font-semibold truncate ${active ? 'text-white' : ''}`}>{it.label}</div>
                    {it.description ? (
                      <div className={`text-xs truncate ${active ? 'text-white/90' : 'text-muted-foreground'}`}>{it.description}</div>
                    ) : null}
                  </div>
                ) : (
                  <span className="sr-only">{it.label}</span>
                )}
                {!collapsed && it.badge ? (
                  <span className={`ml-auto self-center text-[10px] px-1.5 py-0.5 rounded ${active ? 'bg-white/25 text-white' : 'bg-white/50 dark:bg-gray-800/60 text-muted-foreground'}`}>{it.badge}</span>
                ) : null}
              </button>
            );
          })}
        </div>

        {/* Footer actions */}
        {onLogout ? (
          <div className="mt-auto pt-3">
            <button
              onClick={onLogout}
              className={`w-full flex items-center px-3 py-2 rounded-md text-red-600 hover:bg-red-50/60 dark:hover:bg-red-950/30 ${collapsed ? 'justify-center' : ''}`}
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
              {!collapsed ? <span className="ml-3 text-sm font-medium">Logout</span> : null}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default DesktopSidebar;
