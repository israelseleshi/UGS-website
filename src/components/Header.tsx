import React from 'react';
import { Button } from './button';
import { Moon, Sun, Globe, Menu, X, User, LogOut } from 'lucide-react';
import { Avatar } from './avatar';
import { useAuth } from '../lib/auth';

interface HeaderProps {
  currentPage: string;
  onPageChange: (page: string) => void;
  theme: string;
  onThemeChange: () => void;
}

export function Header({ currentPage, onPageChange, theme, onThemeChange }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const { user, signOutUser } = useAuth();

  // Prefer first name when available
  const firstName = React.useMemo(() => {
    const name = user?.displayName?.trim();
    if (name) {
      const first = name.split(/\s+/)[0];
      return first;
    }
    return user?.email?.split('@')[0] || 'User';
  }, [user?.displayName, user?.email]);

  const navigation = [
    { name: 'Home', id: 'home' },
    { name: 'Services', id: 'services' },
    { name: 'VisaEd', id: 'visaed' },
    { name: 'About', id: 'about' },
    { name: 'Allen AI', id: 'allen' }
  ];

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
      <div className="site-container">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-red-600 rounded-lg flex items-center justify-center">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">UGS</h1>
              <p className="text-xs text-muted-foreground -mt-1">inspiring borderless thinking</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <button
                key={item.id}
                onClick={() => onPageChange(item.id)}
                className={`text-sm transition-colors hover:text-primary ${
                  currentPage === item.id
                    ? 'text-primary font-medium'
                    : 'text-muted-foreground'
                }`}
              >
                {item.name}
              </button>
            ))}
          </nav>

          {/* Right side buttons */}
          <div className="flex items-center space-x-3">
            <Button
              aria-label="Toggle theme"
              variant="ghost"
              size="sm"
              onClick={onThemeChange}
              className="w-9 h-9 p-0"
            >
              <Sun className={`w-4 h-4 transition-opacity ${theme === 'dark' ? 'opacity-100' : 'opacity-0'}`} />
              <Moon className={`w-4 h-4 transition-opacity absolute ${theme === 'dark' ? 'opacity-0' : 'opacity-100'}`} />
            </Button>
            
            {user ? (
              <div className="hidden sm:flex items-center space-x-3">
                <div className="flex items-center space-x-2 px-2.5 py-1.5 bg-green-50 dark:bg-green-950/20 rounded-full border border-green-200 dark:border-green-800">
                  <Avatar className="w-8 h-8 overflow-hidden rounded-full">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {user.photoURL ? <img src={user.photoURL} alt="me" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-primary/20" />}
                  </Avatar>
                  <span className="text-sm text-green-700 dark:text-green-300 font-medium truncate max-w-[140px]">
                    {firstName}
                  </span>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onPageChange(user.emailVerified ? 'client-dashboard' : 'verify-email')}
                >
                  <User className="w-4 h-4 mr-1" />
                  Dashboard
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={signOutUser}
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="hidden sm:flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onPageChange('signin')}
                >
                  Sign In
                </Button>
                <Button 
                  size="sm"
                  onClick={() => onPageChange('signup')}
                >
                  Get Started
                </Button>
              </div>
            )}

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden w-9 h-9 p-0"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <div className="flex flex-col space-y-3">
              {navigation.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    onPageChange(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`text-left px-4 py-2 rounded-md text-sm transition-colors ${
                    currentPage === item.id
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  }`}
                >
                  {item.name}
                </button>
              ))}
              {user ? (
                <div className="px-4 pt-3 border-t border-border space-y-2">
                  <div className="flex items-center space-x-2 p-2 bg-green-50 dark:bg-green-950/20 rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-green-700 dark:text-green-300 font-medium">
                      {firstName}
                    </span>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => {
                      onPageChange(user.emailVerified ? 'client-dashboard' : 'verify-email');
                      setMobileMenuOpen(false);
                    }}
                  >
                    <User className="w-4 h-4 mr-2" />
                    Dashboard
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full"
                    onClick={() => {
                      signOutUser();
                      setMobileMenuOpen(false);
                    }}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              ) : (
                <div className="flex space-x-2 px-4 pt-3 border-t border-border">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => {
                      onPageChange('signin');
                      setMobileMenuOpen(false);
                    }}
                  >
                    Sign In
                  </Button>
                  <Button 
                    size="sm" 
                    className="flex-1"
                    onClick={() => {
                      onPageChange('signup');
                      setMobileMenuOpen(false);
                    }}
                  >
                    Get Started
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
