# Simple Navbar Component

A generic, reusable navbar component built with React and Tailwind CSS.

## Components

### `Navbar`
The main navbar container with responsive layout.

```tsx
<Navbar className="custom-classes">
  {/* children */}
</Navbar>
```

### `NavbarBrand`
For logos, titles, or brand elements.

```tsx
<NavbarBrand href="/" className="custom-classes">
  <img src="/logo.png" alt="Logo" />
  <span>Brand Name</span>
</NavbarBrand>
```

### `NavbarMenu`
Container for navigation items (hidden on mobile by default).

```tsx
<NavbarMenu className="custom-classes">
  <NavbarItem>Home</NavbarItem>
  <NavbarItem>About</NavbarItem>
</NavbarMenu>
```

### `NavbarItem`
Individual navigation links or buttons.

```tsx
<NavbarItem
  href="/about"
  active={currentPage === 'about'}
  onClick={() => onPageChange('about')}
  className="custom-classes"
>
  About
</NavbarItem>
```

### `NavbarActions`
Container for action buttons (sign in, theme toggle, etc.).

```tsx
<NavbarActions className="custom-classes">
  <Button>Sign In</Button>
  <Button variant="outline">Sign Up</Button>
</NavbarActions>
```

## Usage Example

```tsx
import {
  Navbar,
  NavbarBrand,
  NavbarMenu,
  NavbarItem,
  NavbarActions
} from './components/Navbar';

function MyComponent() {
  const [currentPage, setCurrentPage] = useState('home');

  return (
    <Navbar>
      <NavbarBrand>
        <Globe className="w-6 h-6" />
        <span>My App</span>
      </NavbarBrand>

      <NavbarMenu>
        <NavbarItem
          active={currentPage === 'home'}
          onClick={() => setCurrentPage('home')}
        >
          Home
        </NavbarItem>
        <NavbarItem
          active={currentPage === 'about'}
          onClick={() => setCurrentPage('about')}
        >
          About
        </NavbarItem>
      </NavbarMenu>

      <NavbarActions>
        <Button>Sign In</Button>
      </NavbarActions>
    </Navbar>
  );
}
```

## Features

- ✅ Responsive design (mobile-friendly)
- ✅ TypeScript support
- ✅ Customizable with className props
- ✅ Active state support
- ✅ Flexible layout system
- ✅ Built with Tailwind CSS

## Props

### Navbar
- `className?: string` - Additional CSS classes
- `children: React.ReactNode` - Navbar content

### NavbarBrand
- `href?: string` - Link URL
- `onClick?: () => void` - Click handler
- `className?: string` - Additional CSS classes
- `children: React.ReactNode` - Brand content

### NavbarMenu
- `className?: string` - Additional CSS classes
- `children: React.ReactNode` - Menu items

### NavbarItem
- `href?: string` - Link URL
- `onClick?: () => void` - Click handler
- `active?: boolean` - Active state
- `className?: string` - Additional CSS classes
- `children: React.ReactNode` - Item content

### NavbarActions
- `className?: string` - Additional CSS classes
- `children: React.ReactNode` - Action buttons
