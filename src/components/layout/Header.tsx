import React from 'react';
import { Button } from '../ui/button';
import { Moon, Sun, Globe, Menu, X, User, LogOut } from 'lucide-react';

import { Avatar } from '../ui/avatar';
import { useAuth } from '../../lib/auth';

interface HeaderProps {
  currentPage: string;
  onPageChange: (page: string) => void;
  theme: string;
  onThemeChange: () => void;
}

export function Header({ currentPage, onPageChange, theme, onThemeChange }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const { user, signOutUser } = useAuth();
  const [isAdmin, setIsAdmin] = React.useState(false);

  // Check if user is admin
  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!user) {
        setIsAdmin(false);
        return;
      }
      try {
        const token = await user.getIdTokenResult();
        if (cancelled) return;
        const role = (token.claims?.role as string) || 'client';
        const email = (user.email || '').toLowerCase();
        const isWhitelistedAdmin = ['admin@ugsdesk.com'].includes(email);
        setIsAdmin(role === 'admin' || isWhitelistedAdmin);
      } catch (e) {
        setIsAdmin(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

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
                {!isAdmin && (
                  <div className="flex items-center space-x-2 px-2.5 py-1.5 bg-green-50 dark:bg-green-950/20 rounded-full border border-green-200 dark:border-green-800">
                    <Avatar className="w-8 h-8 overflow-hidden rounded-full">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      {user.photoURL ? <img src={user.photoURL} alt="me" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-primary/20" />}
                    </Avatar>
                    <span className="text-sm text-green-700 dark:text-green-300 font-medium truncate max-w-[140px]">
                      {firstName}
                    </span>
                  </div>
                )}
                {isAdmin && (
                  <div className="flex items-center space-x-2 px-2.5 py-1.5 bg-red-50 dark:bg-red-950/20 rounded-full border border-red-200 dark:border-red-800">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span className="text-sm text-red-700 dark:text-red-300 font-medium">
                      admin
                    </span>
                  </div>
                )}
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onPageChange(isAdmin ? 'admin-dashboard' : (user.emailVerified ? 'client-dashboard' : 'verify-email'))}
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

        {/* Mobile Navigation - Full page overlay */}
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            
            {/* Mobile Menu Panel */}
            <div className={`fixed top-0 right-0 h-full w-full bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl z-50 md:hidden transform transition-transform duration-300 ease-in-out ${
              mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
            }`}>
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-border">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-primary to-red-600 rounded-lg flex items-center justify-center">
                    <Globe className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h1 className="text-lg font-bold text-foreground">UGS</h1>
                    <p className="text-xs text-muted-foreground -mt-1">inspiring borderless thinking</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-9 h-9 p-0"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Navigation Content */}
              <div className="flex flex-col h-full">
                {/* Navigation Links */}
                <div className="flex-1 px-6 py-8">
                  <div className="space-y-6">
                    {navigation.map((item, index) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          onPageChange(item.id);
                          setMobileMenuOpen(false);
                        }}
                        className={`w-full text-left py-4 px-4 rounded-xl text-lg font-medium transition-all duration-200 ${
                          currentPage === item.id
                            ? 'bg-primary text-primary-foreground shadow-lg'
                            : 'text-foreground hover:bg-accent hover:text-accent-foreground'
                        }`}
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        {item.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* User Section */}
                <div className="px-6 pb-8 space-y-4 border-t border-border pt-6">
                  {user ? (
                    <>
                      {/* User Info */}
                      {!isAdmin && (
                        <div className="flex items-center space-x-3 p-4 bg-green-50 dark:bg-green-950/20 rounded-xl border border-green-200 dark:border-green-800">
                          <Avatar className="w-12 h-12 overflow-hidden rounded-full">
                            {user.photoURL ? (
                              <img src={user.photoURL} alt="me" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full bg-primary/20 flex items-center justify-center">
                                <User className="w-6 h-6 text-primary" />
                              </div>
                            )}
                          </Avatar>
                          <div className="flex-1">
                            <p className="font-medium text-green-700 dark:text-green-300">{firstName}</p>
                            <p className="text-sm text-green-600 dark:text-green-400">{user.email}</p>
                          </div>
                        </div>
                      )}
                      {isAdmin && (
                        <div className="flex items-center space-x-3 p-4 bg-red-50 dark:bg-red-950/20 rounded-xl border border-red-200 dark:border-red-800">
                          <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-red-700 dark:text-red-300">Administrator</p>
                            <p className="text-sm text-red-600 dark:text-red-400">{user.email}</p>
                          </div>
                        </div>
                      )}
                      
                      {/* Action Buttons */}
                      <div className="space-y-3">
                        <Button 
                          variant="outline" 
                          size="lg"
                          className="w-full justify-start h-14 text-base"
                          onClick={() => {
                            onPageChange(isAdmin ? 'admin-dashboard' : (user.emailVerified ? 'client-dashboard' : 'verify-email'));
                            setMobileMenuOpen(false);
                          }}
                        >
                          <User className="w-5 h-5 mr-3" />
                          Dashboard
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="lg"
                          className="w-full justify-start h-14 text-base text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
                          onClick={() => {
                            signOutUser();
                            setMobileMenuOpen(false);
                          }}
                        >
                          <LogOut className="w-5 h-5 mr-3" />
                          Sign Out
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="space-y-3">
                      <Button 
                        variant="outline" 
                        size="lg"
                        className="w-full h-14 text-base"
                        onClick={() => {
                          onPageChange('signin');
                          setMobileMenuOpen(false);
                        }}
                      >
                        Sign In
                      </Button>
                      <Button 
                        size="lg"
                        className="w-full h-14 text-base"
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
            </div>
          </>
        )}
      </div>
    </header>
  );
}
