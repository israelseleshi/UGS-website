import React from 'react';
import { Button } from '../ui/button';
import { 
  Globe, 
  Menu, 
  X, 
  Sun, 
  Moon, 
  User, 
  LogOut,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { motion, AnimatePresence } from 'framer-motion';
import { EnhancedMobileSidebar, EnhancedSidebarTrigger } from '../ui/enhanced-mobile-sidebar';
import { useEnhancedMobile } from '../ui/use-mobile-gestures';

interface HeaderProps {
  currentPage: string;
  onPageChange: (page: string) => void;
  theme: string;
  onThemeChange: () => void;
}

export function Header({ currentPage, onPageChange, theme, onThemeChange }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const { user, signOutUser } = useAuth();
  const { isMobile, supportsTouch, supportsHaptics } = useEnhancedMobile();

  const navigation = [
    { name: 'Home', id: 'home' },
    { name: 'Services', id: 'services' },
    { name: 'VisaEd', id: 'visaed' },
    { name: 'About', id: 'about' },
    { name: 'Allen AI', id: 'allen' }
  ];

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
      <div className="container mx-auto px-4">
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

          {/* Enhanced mobile menu button */}
          <div className="md:hidden">
            <EnhancedSidebarTrigger
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2"
              aria-label="Toggle navigation menu"
            >
              <Menu className="h-5 w-5" />
            </EnhancedSidebarTrigger>
          </div>

          {/* Right side buttons */}
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={onThemeChange}
              className="w-9 h-9 p-0"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </Button>
            
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
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
