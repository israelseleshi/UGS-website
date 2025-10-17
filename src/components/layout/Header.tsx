import React from 'react';
import { Button } from '../ui/button';
import { 
  Sun, 
  Moon, 
  Menu, 
  User,
  LogOut,
  UserPlus,
  LogIn,
  Globe
} from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { getUser } from '../../lib/db';
import { EnhancedMobileSidebar, EnhancedSidebarTrigger } from '../ui/enhanced-mobile-sidebar';
import { useEnhancedMobile } from '../ui/use-mobile-gestures';

interface HeaderProps {
  currentPage: string;
  onPageChange: (page: string) => void;
  theme: string;
  onThemeChange: () => void;
  isAdmin?: boolean;
  isClient?: boolean;
}

export function Header({ currentPage, onPageChange, theme, onThemeChange, isAdmin, isClient }: HeaderProps) {
  const { user, signOutUser } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [userDisplayName, setUserDisplayName] = React.useState<string>('');

  // Fetch user's full name from Firestore
  React.useEffect(() => {
    let ignore = false;
    async function fetchUserName() {
      if (!user) {
        setUserDisplayName('');
        return;
      }
      try {
        const udoc = await getUser(user.uid);
        if (!ignore && udoc) {
          const fullFromParts = `${(udoc as any)?.firstName ?? ""} ${(udoc as any)?.lastName ?? ""}`.trim();
          const displayName = 
            user.displayName ||
            (udoc as any)?.fullName ||
            (fullFromParts || undefined) ||
            (udoc as any)?.name ||
            (user.email ? user.email.split("@")[0] : "User");
          setUserDisplayName(displayName);
        }
      } catch {
        if (!ignore) {
          setUserDisplayName(user.displayName || (user.email ? user.email.split("@")[0] : "User"));
        }
      }
    }
    fetchUserName();
    return () => { ignore = true; };
  }, [user]);
  const { isMobile, supportsTouch, supportsHaptics } = useEnhancedMobile();

  const navigation = [
    { name: 'Home', id: 'home' },
    { name: 'Services', id: 'services' },
    { name: 'VisaEd', id: 'visaed' },
    { name: 'Allen AI', id: 'allen' },
    { name: 'News', id: 'news' },
    { name: 'About', id: 'about' }
  ];

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <div className="flex items-center">
            <img 
              src="/ugs-logo.png" 
              alt="UGS Logo" 
              className="w-44 h-44 md:w-48 md:h-48 object-contain dark:brightness-0 dark:invert hover:dark:brightness-100 hover:dark:invert-0 transition-all duration-300 ease-in-out cursor-pointer"
            />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <button
                key={item.id}
                onClick={() => onPageChange(item.id)}
                className={`text-lg font-medium px-4 py-2 transition-all duration-200 hover:text-primary ${
                  currentPage === item.id
                    ? 'text-primary font-semibold'
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
              variant="ghost"
              size="lg"
              onClick={onThemeChange}
              className="w-12 h-12 p-0"
            >
              {theme === 'dark' ? (
                <Sun className="w-6 h-6" />
              ) : (
                <Moon className="w-6 h-6" />
              )}
            </Button>
            
            {user ? (
              // Authenticated user display
              <div className="hidden sm:flex items-center space-x-3">
                
                <div 
                  className="flex items-center space-x-3 cursor-pointer hover:opacity-80 transition-opacity duration-200"
                  onClick={() => onPageChange(isAdmin ? 'admin-dashboard' : 'client-dashboard')}
                >
                  {!isAdmin && user.photoURL ? (
                    <div className="relative">
                      <img 
                        src={user.photoURL} 
                        alt="Profile" 
                        className="w-8 h-8 rounded-full object-cover ring-2 ring-white dark:ring-gray-600 shadow-sm"
                      />
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                    </div>
                  ) : (
                    <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center shadow-sm">
                      <span className="text-white font-semibold text-xs">
                        {(userDisplayName || user.displayName || user.email || 'U').charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    {isAdmin ? (
                      <div className="px-3 py-1 bg-gradient-to-r from-red-600 to-red-700 text-white text-xs font-bold rounded-full shadow-sm">
                        ADMIN
                      </div>
                    ) : (
                      <div>
                        <div className="text-sm font-semibold text-foreground truncate">
                          {userDisplayName || user.displayName || user.email}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={signOutUser}
                  className="w-9 h-9 p-0"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              // Unauthenticated user buttons
              <div className="hidden sm:flex space-x-2">
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={() => onPageChange('signin')}
                  className="px-6 py-3 text-base font-medium"
                >
                  Sign In
                </Button>
                <Button 
                  size="lg"
                  onClick={() => onPageChange('signup')}
                  className="px-6 py-3 text-base font-medium"
                >
                  Get Started
                </Button>
              </div>
            )}

            {/* Enhanced mobile menu button - moved to right side */}
            <div className="md:hidden">
              <EnhancedSidebarTrigger
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2"
                aria-label="Toggle navigation menu"
              >
                <Menu className="h-5 w-5" />
              </EnhancedSidebarTrigger>
            </div>

          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <div className="flex flex-col space-y-3">
              {navigation.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    onPageChange(item.id);
                    setIsMobileMenuOpen(false);
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
                // Authenticated user mobile menu
                <div className="px-4 pt-3 border-t border-border space-y-4">
                  
                  {/* Premium Profile Section */}
                  <div 
                    className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-xl p-4 border border-gray-200 dark:border-gray-600 cursor-pointer hover:from-gray-100 hover:to-gray-150 dark:hover:from-gray-750 dark:hover:to-gray-650 transition-all duration-200"
                    onClick={() => {
                      onPageChange(isAdmin ? 'admin-dashboard' : 'client-dashboard');
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {!isAdmin && user.photoURL ? (
                          <div className="relative">
                            <img 
                              src={user.photoURL} 
                              alt="Profile" 
                              className="w-10 h-10 rounded-full object-cover ring-2 ring-white dark:ring-gray-600 shadow-sm"
                            />
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-700"></div>
                          </div>
                        ) : (
                          <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center shadow-sm">
                            <span className="text-white font-semibold text-sm">
                              {(userDisplayName || user.displayName || user.email || 'U').charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          {isAdmin ? (
                            <div className="flex items-center space-x-2">
                              <div className="px-3 py-1 bg-gradient-to-r from-red-600 to-red-700 text-white text-xs font-bold rounded-full shadow-sm">
                                ADMIN
                              </div>
                            </div>
                          ) : (
                            <div>
                              <div className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                {userDisplayName || user.displayName || user.email}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          signOutUser();
                          setIsMobileMenuOpen(false);
                        }}
                        className="w-9 h-9 p-0 hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 rounded-lg transition-colors"
                        title="Sign out"
                      >
                        <LogOut className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                // Unauthenticated user mobile menu
                <div className="flex space-x-2 px-4 pt-3 border-t border-border">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => {
                      onPageChange('signin');
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    Sign In
                  </Button>
                  <Button 
                    size="sm" 
                    className="flex-1"
                    onClick={() => {
                      onPageChange('signup');
                      setIsMobileMenuOpen(false);
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
