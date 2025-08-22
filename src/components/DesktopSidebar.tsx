import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from './avatar';

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
}

export function DesktopSidebar({ items, selected, onSelect, className = '', collapsed = false, userData }: DesktopSidebarProps) {
  return (
    <div className={`hidden lg:block ${className}`}>
      <div className={`flex lg:flex-col w-full h-full overflow-y-auto bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl border border-white/20 dark:border-gray-800/20 shadow-sm rounded-xl p-2 gap-2`}>
        {/* User profile header */}
        {userData ? (
          <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-start'} w-full px-2 py-2 rounded-lg bg-black/[0.02] dark:bg-white/[0.03]`}>
            <Avatar className={`${collapsed ? 'w-8 h-8' : 'w-10 h-10'} ring-1 ring-black/5 dark:ring-white/10`}>
              {userData.avatar ? (
                <AvatarImage src={userData.avatar} alt={userData.name} />
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
                <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{userData.email}</div>
              </div>
            ) : null}
          </div>
        ) : null}
        
        {items.map((it) => {
          const Icon = it.icon;
          const active = selected === it.value;
          return (
            <button
              key={it.value}
              onClick={() => onSelect(it.value)}
              className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'} w-full text-left ${collapsed ? 'px-2' : 'px-3'} py-2 rounded-lg transition-all ${
                active
                  ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow'
                  : 'hover:bg-black/[0.04] dark:hover:bg-white/5'
              }`}
              title={collapsed ? it.label : undefined}
              aria-label={it.label}
            >
              <span className="flex items-center gap-2">
                {Icon ? <Icon className="w-4 h-4" /> : null}
                {!collapsed ? (
                  <span className="text-sm font-medium">{it.label}</span>
                ) : null}
              </span>
              {!collapsed && it.badge ? (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-md border ${active ? 'bg-white/20' : 'bg-black/5 dark:bg-white/10'} }`}>
                  {it.badge}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default DesktopSidebar;
