import React from 'react';

interface NavbarProps {
  className?: string;
  children: React.ReactNode;
}

export function Navbar({ className = '', children }: NavbarProps) {
  return (
    <nav className={`bg-background border-b border-border ${className}`}>
      <div className="site-container">
        <div className="flex items-center justify-between h-16">
          {children}
        </div>
      </div>
    </nav>
  );
}

interface NavbarBrandProps {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  className?: string;
}

export function NavbarBrand({ children, href, onClick, className = '' }: NavbarBrandProps) {
  const Component = href ? 'a' : 'div';

  return (
    <Component
      className={`flex items-center ${className}`}
      href={href}
      onClick={onClick}
    >
      {children}
    </Component>
  );
}

interface NavbarMenuProps {
  children: React.ReactNode;
  className?: string;
}

export function NavbarMenu({ children, className = '' }: NavbarMenuProps) {
  return (
    <div className={`hidden md:flex items-center space-x-4 ${className}`}>
      {children}
    </div>
  );
}

interface NavbarItemProps {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  active?: boolean;
  className?: string;
}

export function NavbarItem({ children, href, onClick, active, className = '' }: NavbarItemProps) {
  const Component = href ? 'a' : 'button';

  return (
    <Component
      className={`text-sm transition-colors hover:text-primary px-3 py-2 rounded-md ${
        active
          ? 'text-primary font-medium bg-primary/10'
          : 'text-muted-foreground hover:text-foreground'
      } ${className}`}
      href={href}
      onClick={onClick}
    >
      {children}
    </Component>
  );
}

interface NavbarActionsProps {
  children: React.ReactNode;
  className?: string;
}

export function NavbarActions({ children, className = '' }: NavbarActionsProps) {
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {children}
    </div>
  );
}
