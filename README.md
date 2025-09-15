
# United Global Services - Premium Visa & Immigration Platform

**"Inspiring Borderless Thinking"**

This repository contains the source code for the United Global Services (UGS) official website - a comprehensive, premium platform for visa and immigration services. Built with modern web technologies and designed for enterprise-grade user experience.

-----

## 🚀 About The Project

United Global Services (UGS) is a leading visa and immigration consultancy that has been simplifying global mobility since 2008. This website serves as the primary digital gateway for clients seeking professional visa processing, immigration services, and educational resources. The platform combines cutting-edge technology with premium user experience to deliver world-class service.

### Mission Statement
To break down barriers and create opportunities for individuals and businesses to thrive in an interconnected world through expert visa and immigration services.

### Core Values
- **Professional Excellence**: 98% success rate with over 50,000 applications
- **Global Reach**: Comprehensive services for 120+ countries
- **Innovation**: AI-powered assistance and modern digital solutions
- **Trust**: Secure, transparent, and reliable service delivery

-----

## ✨ Key Features

### 🎯 Core Services
- **Tourism & Leisure**: Complete visa processing for travel adventures worldwide
- **Immigration & Relocation**: Expert assistance for permanent residency and work permits
- **International Trade License**: Business setup and corporate services globally
- **International Education**: Student visa services and university applications

### 💼 Platform Features
- **Premium Client Dashboard**: Comprehensive application management and document center
- **Advanced Admin Portal**: Complete business management and analytics dashboard
- **AI-Powered Assistant (Allen AI)**: Intelligent visa guidance and instant support
- **Educational Platform (VisaEd)**: Interactive courses and visa requirement knowledge base
- **Real-time Messaging**: Secure communication between clients and support team
- **Document Management**: Secure upload, preview, and management system
- **Multi-step Service Requests**: Guided application process with validation
- **Biometric Integration**: Advanced mobile authentication features

### 🎨 Premium Design Features
- **Theme-Responsive Design**: Seamless light/dark mode with adaptive branding
- **Glass Morphism Effects**: Modern UI with backdrop blur and transparency
- **Micro-interactions**: Smooth animations and haptic feedback
- **Mobile-First Responsive**: Optimized for all devices and screen sizes
- **Accessibility Compliant**: WCAG 2.1 AA standards throughout

-----

## 🛠️ Tech Stack

This project is built with modern, enterprise-grade technologies:

### Frontend Technologies
- **Framework:** [React 18](https://reactjs.org/) with [TypeScript](https://www.typescriptlang.org/)
- **Build Tool:** [Vite](https://vitejs.dev/) for fast development and optimized builds
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) with custom design system
- **UI Components:** [shadcn/ui](https://ui.shadcn.com/) for consistent, accessible components
- **Animations:** [Framer Motion](https://www.framer.com/motion/) for smooth, professional animations
- **State Management:** React hooks with Context API patterns

### Backend & Services
- **Authentication:** [Firebase Auth](https://firebase.google.com/products/auth) with role-based access
- **Database:** [Cloud Firestore](https://firebase.google.com/products/firestore) for real-time data
- **Cloud Functions:** [Firebase Functions](https://firebase.google.com/products/functions) for server-side logic
- **Media Management:** [Cloudinary](https://cloudinary.com/) for image optimization and storage
- **Deployment:** [Netlify](https://www.netlify.com/) with continuous deployment

### Development Tools
- **Package Manager:** npm with lock file for dependency consistency
- **Code Quality:** ESLint and TypeScript for code quality and type safety
- **Version Control:** Git with conventional commit patterns
- **Environment Management:** Environment variables for secure configuration

-----

## 🔄 Process Flow & User Journey

### Client User Flow
```
Landing Page → Service Selection → Account Creation → Email Verification → Client Dashboard
     ↓
Service Request → Multi-step Form → Document Upload → Application Submission → Status Tracking
     ↓
Real-time Messaging ← → Admin Support ← → Application Processing → Completion
```

### Admin Workflow
```
Admin Login → Admin Dashboard → User Management → Application Review → Client Communication
     ↓
Document Verification → Status Updates → Analytics Review → System Administration
```

### Service Request Process
1. **Step 1 - Service Selection**: Choose from 4 core service categories
2. **Step 2 - Personal Information**: Complete profile with validation
3. **Step 3 - Travel Details**: Specify travel requirements and destinations
4. **Step 4 - Review & Submit**: Final review with terms acceptance

### Document Management Flow
```
Upload → Validation → Cloudinary Storage → Firestore Metadata → Admin Review → Client Notification
```

### Authentication & Security Flow
```
Registration → Email Verification → Role Assignment → Dashboard Access → Secure Operations
```

-----

## 💬 Realtime Messaging (Premium Experience)

UGS now offers a refined, secure chat channel between clients and support.

- **Storage model:** top-level Firestore collection `messages`
- **Schema:**
  - `userId: string` – UID of the client the thread belongs to
  - `text: string`
  - `byUid: string` – sender UID
  - `byRole: 'user' | 'admin'`
  - `createdAt: Firebase ServerTimestamp`
- **UI alignment:**
  - Client view: user messages (you) on the right; admin on the left
  - Admin view: admin messages (you) on the right; user on the left
- **Timestamps:** Displayed per message using the server timestamp
- **Realtime:** No composite index required for subscriptions

Key implementation files:
- `src/lib/db.ts` → `subscribeDirectMessages()` filters by `userId` and sorts client‑side by `createdAt`.
- `src/components/ClientDashboard.tsx` → client chat send/subscribe; robust sending state + error toasts.
- `src/components/AdminDashboard.tsx` → admin chat with correct left/right alignment and timestamps.

### Firestore Security Rules

Add a rule block for top-level `messages` in your Firestore rules:

```rules
match /databases/{database}/documents {
  match /messages/{docId} {
    allow read, list: if request.auth != null && (
      resource.data.userId == request.auth.uid || request.auth.token.admin == true
    );
    allow create: if request.auth != null && (
      // client can create their own messages
      (request.resource.data.userId == request.auth.uid && request.resource.data.byRole == 'user') ||
      // admins can create for any thread
      request.auth.token.admin == true
    );
    allow update, delete: if request.auth.token.admin == true; // tighten as needed
  }
}
```

This aligns with how the app writes/reads and keeps your chat ultra-responsive.

-----

## 🏁 Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

Make sure you have [Node.js](https://nodejs.org/en/) and [npm](https://www.npmjs.com/) installed on your machine.

### Installation

1. Clone the repo

   git clone https://github.com/israelseleshi/UGS-website.git

2. Navigate to the project directory

   ```sh
   cd UGS-website
   ```
3. Install NPM packages

   ```sh
   npm install
   ```
4. Run the development server

   ```sh
   npm run dev
   ```

   The application will be available at `http://localhost:5173` (or another port if 5173 is in use).

### Environment

Create a `.env` file at the project root following `.env.example`. Provide your Firebase config and any optional keys used by features (e.g., Cloudinary). Restart the dev server after changes.

---

## 📂 Project Structure

The project follows a professional, scalable architecture:

```bash
UGS-website/
├── public/                    # Static assets and favicon
│   ├── ugs-logo.png          # Theme-responsive company logo
│   ├── vite.svg              # Vite build tool icon
│   └── _headers              # Netlify deployment headers
├── src/
│   ├── components/           # Organized component architecture
│   │   ├── ui/              # shadcn/ui base components
│   │   │   ├── button.tsx   # Button variants and styles
│   │   │   ├── card.tsx     # Card layouts and containers
│   │   │   ├── dialog.tsx   # Modal and dialog components
│   │   │   └── ...          # Other UI primitives
│   │   ├── layout/          # Navigation and layout components
│   │   │   ├── Header.tsx   # Main navigation header
│   │   │   ├── DesktopSidebar.tsx
│   │   │   └── MobileSidebar.tsx
│   │   ├── pages/           # Full page components
│   │   │   ├── HomePage.tsx # Landing page with hero
│   │   │   ├── AdminDashboard.tsx
│   │   │   ├── ClientDashboard.tsx
│   │   │   ├── AuthPages.tsx
│   │   │   └── VisaEdPage.tsx
│   │   ├── features/        # Feature-specific components
│   │   │   ├── ServiceRequest.tsx # Multi-step form
│   │   │   ├── AllenAI.tsx  # AI assistant interface
│   │   │   ├── DocumentUpload.tsx
│   │   │   └── ChatPanel.tsx
│   │   ├── shared/          # Shared utility components
│   │   │   ├── ImageWithFallback.tsx
│   │   │   └── Typewriter.tsx
│   │   └── utils/           # Utilities and hooks
│   │       ├── theme.ts     # Theme management
│   │       ├── use-mobile.ts # Mobile detection
│   │       ├── utils.ts     # Helper functions
│   │       └── globals.css  # Global styles
│   ├── lib/                 # Core libraries and configurations
│   │   ├── auth.tsx         # Firebase authentication
│   │   ├── db.ts           # Database operations
│   │   ├── firebase.ts     # Firebase configuration
│   │   ├── cloudinary.ts   # Media management
│   │   ├── countries.ts    # Country mapping utilities
│   │   └── cdn.ts          # CDN optimization
│   ├── App.tsx             # Main application with routing
│   ├── main.tsx            # Application entry point
│   └── index.css           # Global CSS imports
├── functions/              # Firebase Cloud Functions
│   ├── src/
│   │   └── index.ts        # Server-side functions
│   └── package.json        # Functions dependencies
├── .env.example           # Environment variables template
├── firebase.json          # Firebase configuration
├── firestore.rules       # Database security rules
├── firestore.indexes.json # Database indexes
├── tailwind.config.ts    # Tailwind CSS configuration
├── vite.config.ts        # Vite build configuration
├── general.md            # Comprehensive UI documentation
└── README.md             # This file
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18 or higher)
- **npm** (v8 or higher)
- **Firebase CLI** (for deployment)
- **Git** for version control

### Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/israelseleshi/UGS-website.git
   cd UGS-website
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp .env.example .env
   # Edit .env with your Firebase and Cloudinary credentials
   ```

4. **Firebase Setup**
   ```bash
   # Install Firebase CLI globally
   npm install -g firebase-tools
   
   # Login to Firebase
   firebase login
   
   # Deploy Firestore rules and indexes
   firebase deploy --only firestore:rules,firestore:indexes
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```
   Application will be available at `http://localhost:5173`

### Environment Variables
Create a `.env` file with the following variables:
```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Cloudinary Configuration
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_API_KEY=your_api_key
VITE_CLOUDINARY_API_SECRET=your_api_secret
VITE_CLOUDINARY_UPLOAD_FOLDER=ugs/avatars
```

---

## 🧭 Usage Guide

### For Clients
1. **Registration**: Create account with email verification
2. **Service Request**: Use guided multi-step form for visa applications
3. **Document Management**: Upload and manage required documents securely
4. **Dashboard**: Track application status and communicate with support
5. **AI Assistant**: Get instant answers from Allen AI
6. **Real-time Chat**: Direct communication with UGS support team

### For Administrators
1. **Admin Login**: Access admin dashboard with elevated permissions
2. **User Management**: Manage client accounts and applications
3. **Application Processing**: Review and process visa applications
4. **Document Review**: Verify and approve client documents
5. **Analytics**: Monitor business metrics and performance
6. **Support Chat**: Respond to client inquiries in real-time

### Key Features Usage
- **Theme Toggle**: Switch between light/dark modes in header
- **Mobile Navigation**: Enhanced gestures, haptic feedback, voice commands
- **Biometric Auth**: Use fingerprint/Face ID on supported devices
- **Document Upload**: Drag & drop with real-time progress tracking
- **Multi-language**: Full country name display with comprehensive mapping

---

## 🔧 Development & Deployment

### Build Commands
```bash
# Development server
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Type checking
npm run type-check

# Linting
npm run lint
```

### Deployment Process
1. **Automatic Deployment**: Connected to Netlify for continuous deployment
2. **Firebase Functions**: Deploy server-side functions separately
3. **Database Rules**: Update Firestore rules and indexes as needed
4. **Environment Variables**: Configure in Netlify dashboard

### Performance Optimization
- **Code Splitting**: Lazy loading for all major components
- **Image Optimization**: Cloudinary integration with responsive images
- **Bundle Analysis**: Regular bundle size monitoring
- **Caching Strategy**: Optimized caching for static assets

---

## 🧩 Troubleshooting

### Common Issues
- **Authentication**: Ensure Firebase configuration is correct
- **Database Access**: Verify Firestore rules are deployed
- **Image Loading**: Check Cloudinary configuration and network
- **Mobile Features**: Ensure HTTPS for biometric and voice features
- **Theme Issues**: Clear localStorage and refresh for theme problems

### Development Tips
- **Hot Reload**: Vite provides instant hot module replacement
- **TypeScript**: Full type safety throughout the application
- **Component Development**: Use Storybook patterns for isolated development
- **Testing**: Implement unit and integration tests for critical paths

---

## 📊 Analytics & Monitoring

### Performance Metrics
- **Core Web Vitals**: Optimized for Google's performance standards
- **User Experience**: Smooth animations and responsive interactions
- **Accessibility**: WCAG 2.1 AA compliance throughout
- **Security**: Regular security audits and dependency updates

### Business Intelligence
- **User Analytics**: Track user journeys and conversion rates
- **Application Metrics**: Monitor visa application success rates
- **Performance Monitoring**: Real-time application performance tracking
- **Error Tracking**: Comprehensive error logging and reporting

---

## 🤝 Contributing

### Development Standards
- **Code Quality**: TypeScript strict mode with ESLint
- **Component Patterns**: Consistent component architecture
- **Commit Convention**: Conventional commits for clear history
- **Documentation**: Comprehensive code and API documentation

### Pull Request Process
1. Fork the repository
2. Create feature branch from main
3. Implement changes with tests
4. Update documentation as needed
5. Submit pull request with detailed description

---

## 📝 License & Legal

This project is proprietary to United Global Services. All rights reserved.

### Intellectual Property
- **Codebase**: Proprietary UGS technology
- **Design System**: Custom UGS brand implementation
- **Business Logic**: Confidential visa processing workflows
- **Data**: Client information protected under privacy policies

### Third-party Licenses
- React, TypeScript, Tailwind CSS: MIT License
- Firebase: Google Cloud Platform Terms
- Cloudinary: Cloudinary Terms of Service
- shadcn/ui: MIT License

---

## 📞 Support & Contact

For technical support or business inquiries:
- **Website**: [United Global Services](https://ugs-website.netlify.app)
- **Email**: admin@ugsdesk.com
- **Documentation**: See `general.md` for comprehensive UI documentation
- **Repository**: GitHub repository for development team access

**"Inspiring Borderless Thinking"** - United Global Services
