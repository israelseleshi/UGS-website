import React from 'react';
import { Navbar, NavbarBrand, NavbarMenu, NavbarItem, NavbarActions } from './Navbar';
import { Button } from './button';
import { Globe, Moon, Sun } from 'lucide-react';

interface NavbarExampleProps {
  currentPage: string;
  onPageChange: (page: string) => void;
  theme: string;
  onThemeChange: () => void;
}

export function NavbarExample({ currentPage, onPageChange, theme, onThemeChange }: NavbarExampleProps) {
  const navigation = [
    { name: 'Home', id: 'home' },
    { name: 'About', id: 'about' },
    { name: 'Services', id: 'services' },
    { name: 'Contact', id: 'contact' }
  ];

  return (
    <Navbar>
      <NavbarBrand>
        <div className="flex items-center space-x-2">
          <Globe className="w-6 h-6 text-primary" />
          <span className="font-bold text-lg">MyApp</span>
        </div>
      </NavbarBrand>

      <NavbarMenu>
        {navigation.map((item) => (
          <NavbarItem
            key={item.id}
            active={currentPage === item.id}
            onClick={() => onPageChange(item.id)}
          >
            {item.name}
          </NavbarItem>
        ))}
      </NavbarMenu>

      <NavbarActions>
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
        <Button size="sm">Sign In</Button>
      </NavbarActions>
    </Navbar>
  );
}
