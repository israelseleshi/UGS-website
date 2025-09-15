import React, { useState, useEffect, Suspense, lazy } from 'react';
import { getTheme as readTheme, setTheme as writeTheme, toggleTheme as flipTheme, type AppTheme } from './components/utils/theme';
import { motion, AnimatePresence } from 'motion/react';
import { Header } from './components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Button } from './components/ui/button';
import { ImageWithFallback } from './components/shared/ImageWithFallback';
import { AspectRatio } from './components/ui/aspect-ratio';
import { Skeleton } from './components/ui/skeleton';
import { 
  Plane, 
  Home, 
  Building, 
  GraduationCap, 
  Globe,
  Users,
  Award,
  CheckCircle,
  ArrowRight
} from 'lucide-react';
import { useAuth } from './lib/auth';
import { Toaster } from 'sonner';
import { ensureBaseCollections } from './lib/db';
import { cldFetch } from './lib/cdn';

// Lazy-loaded pages/components to reduce initial bundle size
const HomePage = lazy(() => import('./components/pages/HomePage').then(m => ({ default: m.HomePage })));
const AuthPages = lazy(() => import('./components/pages/AuthPages').then(m => ({ default: m.AuthPages })));
const VisaEdPage = lazy(() => import('./components/pages/VisaEdPage').then(m => ({ default: m.VisaEdPage })));
const AllenAI = lazy(() => import('./components/features/AllenAI').then(m => ({ default: m.AllenAI })));
const ServiceRequest = lazy(() => import('./components/features/ServiceRequest').then(m => ({ default: m.ServiceRequest })));
const TradeLicenseRequest = lazy(() => import('./components/features/TradeLicenseRequest').then(m => ({ default: m.TradeLicenseRequest })));
const AdminDashboard = lazy(() => import('./components/pages/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const ClientDashboard = lazy(() => import('./components/pages/ClientDashboard').then(m => ({ default: m.ClientDashboard })));
const VerifyEmail = lazy(() => import('./components/pages/VerifyEmail').then(m => ({ default: m.VerifyEmail })));
const CourseDetailsPage = lazy(() => import('./components/pages/CourseDetailsPage').then(m => ({ default: m.CourseDetailsPage })));

// Basic error boundary to surface runtime errors instead of a blank screen
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { error: any }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error: any) {
    return { error };
  }
  componentDidCatch(error: any, info: any) {
    try { console.error('App crashed:', error, info); } catch {}
  }
  render() {
    if (this.state.error) {
      const msg = String(this.state.error?.message || this.state.error);
      return (
        <div className="min-h-screen bg-background text-foreground p-6">
          <h1 className="text-xl font-bold mb-2">Something went wrong</h1>
          <p className="text-sm text-muted-foreground mb-3">Please check the console for details.</p>
          <pre className="text-xs whitespace-pre-wrap bg-muted/30 border border-border rounded p-3 text-red-600">{msg}</pre>
        </div>
      );
    }
    return this.props.children as any;
  }
}

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [theme, setTheme] = useState<AppTheme>(() => readTheme());
  const [isAdmin, setIsAdmin] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const { user, signOutUser } = useAuth();

  // Theme management
  useEffect(() => {
    setTheme(readTheme());
    const onChange = (e: Event) => {
      const detail = (e as CustomEvent<AppTheme>).detail;
      if (detail === 'light' || detail === 'dark') setTheme(detail);
      else setTheme(readTheme());
    };
    window.addEventListener('themechange', onChange as EventListener);
    return () => window.removeEventListener('themechange', onChange as EventListener);
  }, []);

  // Auto-route on auth state using custom claims; admins bypass email verification
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!user) {
        setIsAdmin(false);
        setIsClient(false);
        return;
      }
      try {
        const token = await user.getIdTokenResult();
        if (cancelled) return;
        const role = (token.claims?.role as string) || 'client';
        const email = (user.email || '').toLowerCase();
        const isWhitelistedAdmin = ['admin@ugsdesk.com'].includes(email);
        // Treat only real auth-related pages as auth pages; allow 'home' to be reachable
        const isAuthPage = ['signin', 'signup', 'verify-email'].includes(currentPage);
        if (role === 'admin' || isWhitelistedAdmin) {
          // Admins do NOT require email verification
          setIsAdmin(true);
          setIsClient(false);
          if (isAuthPage) setCurrentPage('admin-dashboard');
          // Seed base collections on first admin login
          ensureBaseCollections().catch(console.warn);
        } else {
          // Non-admins must verify email before accessing dashboards
          if (!user.emailVerified) {
            setIsAdmin(false);
            setIsClient(false);
            setCurrentPage('verify-email');
            return;
          }
          setIsClient(true);
          setIsAdmin(false);
          if (isAuthPage) setCurrentPage('client-dashboard');
        }
      } catch (e) {
        // Fallback to client
        setIsClient(true);
        setIsAdmin(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, currentPage]);

  useEffect(() => {
    writeTheme(theme);
  }, [theme]);

  const toggleTheme = () => setTheme(flipTheme());

  // Always scroll to top on page change
  useEffect(() => {
    try {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      window.scrollTo(0, 0);
    }
  }, [currentPage]);

  // Authentication handlers
  const handleAdminLogin = () => {
    setIsAdmin(true);
    setIsClient(false);
    setCurrentPage('admin-dashboard');
  };

  const handleUserLogin = () => {
    setIsClient(true);
    setIsAdmin(false);
    setCurrentPage('client-dashboard');
  };

  const handleAdminLogout = async () => {
    try { await signOutUser(); } catch {}
    setIsAdmin(false);
    setIsClient(false);
    setCurrentPage('home');
  };

  const handleClientLogout = async () => {
    try { await signOutUser(); } catch {}
    setIsClient(false);
    setIsAdmin(false);
    setCurrentPage('home');
  };

  // Services page content
  const ServicesPage = () => {
    const [imgLoaded, setImgLoaded] = useState<boolean[]>(() => Array(4).fill(false));
    const services = [
      {
        icon: Plane,
        title: 'Tourism & Leisure',
        description: 'Complete visa processing for your travel adventures worldwide with expert guidance.',
        features: [
          'Tourist visa applications for 120+ countries',
          'Group travel coordination',
          'Express processing options',
          '24/7 support during travel',
          'Visa renewal services',
          'Travel insurance assistance'
        ],
        image: 'https://images.unsplash.com/photo-1721138942121-a26751b520b5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwYXNzcG9ydCUyMHRyYXZlbCUyMHZpc2ElMjBkb2N1bWVudHN8ZW58MXx8fHwxNzU1NTk2NjAxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        cta: 'Apply for Tourist Visa'
      },
      {
        icon: Home,
        title: 'Immigration & Relocation',
        description: 'Expert assistance for permanent residency, work permits, and complete relocation services.',
        features: [
          'Permanent residence applications',
          'Work permit processing',
          'Family reunification services',
          'Citizenship application support',
          'Relocation planning',
          'Legal documentation assistance'
        ],
        image: 'https://images.unsplash.com/photo-1666790676906-0295230c121d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBvZmZpY2UlMjBidXNpbmVzc3xlbnwxfHx8fDE3NTU1ODI2NDB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        cta: 'Start Immigration Process'
      },
      {
        icon: Building,
        title: 'International Trade License',
        description: 'Complete business setup, trade license formation, and corporate services globally.',
        features: [
          'Business incorporation worldwide',
          'Trade license applications',
          'Banking setup assistance',
          'Tax compliance guidance',
          'Corporate governance support',
          'Ongoing compliance management'
        ],
        image: 'https://images.unsplash.com/photo-1666790676906-0295230c121d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBvZmZpY2UlMjBidXNpbmVzc3xlbnwxfHx8fDE3NTU1ODI2NDB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        cta: 'Setup Business'
      },
      {
        icon: GraduationCap,
        title: 'International Education',
        description: 'Student visa services, university applications, and educational pathway guidance.',
        features: [
          'Student visa processing',
          'University application support',
          'Scholarship assistance',
          'Educational pathway planning',
          'Post-study work options',
          'Academic document verification'
        ],
        image: 'https://images.unsplash.com/photo-1558409816-5370d92f4bdf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbnRlcm5hdGlvbmFsJTIwZWR1Y2F0aW9uJTIwZ3JhZHVhdGlvbnxlbnwxfHx8fDE3NTU1OTY2MDd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        cta: 'Apply for Student Visa'
      }
    ];

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="min-h-screen no-hscroll"
      >
        {/* Hero Section */}
        <section className="py-24 md:py-28 bg-gradient-to-b from-primary/5 via-background to-transparent dark:from-primary/10 dark:via-background dark:to-transparent">
          <div className="site-container site-max text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-5xl font-bold mb-6"
            >
              Our Services
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-muted-foreground max-w-3xl mx-auto mb-10"
            >
              Comprehensive visa and immigration solutions designed to make your global journey seamless and successful
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center justify-center space-x-8 text-sm text-muted-foreground"
            >
              <div className="flex items-center">
                <Globe className="w-4 h-4 mr-2 text-primary" />
                120+ Countries
              </div>
              <div className="flex items-center">
                <Users className="w-4 h-4 mr-2 text-primary" />
                50,000+ Clients
              </div>
              <div className="flex items-center">
                <Award className="w-4 h-4 mr-2 text-primary" />
                98% Success Rate
              </div>
            </motion.div>
          </div>
        </section>

        {/* Services Detail */}
        <section className="pt-16 pb-28 md:pt-20 md:pb-32">
          <div className="site-container site-max">
            <div className="space-y-24 md:space-y-28">
              {services.map((service, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className={`grid lg:grid-cols-2 gap-10 lg:gap-16 items-center ${index % 2 === 1 ? 'lg:grid-flow-col-dense' : ''}`}
                >
                  <div className={`space-y-5 order-2 lg:order-1 ${index % 2 === 1 ? 'lg:col-start-2' : ''}`}>
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <service.icon className="w-5 h-5 text-primary" />
                      </div>
                      <h2 className="text-2xl lg:text-3xl font-bold">{service.title}</h2>
                    </div>
                    
                    <p className="text-base lg:text-lg text-muted-foreground leading-relaxed">
                      {service.description}
                    </p>

                    <div className="space-y-2.5">
                      {service.features.map((feature, featureIndex) => (
                        <motion.div
                          key={featureIndex}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.5 + featureIndex * 0.1 }}
                          className="flex items-start space-x-2.5"
                        >
                          <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm lg:text-base text-muted-foreground">{feature}</span>
                        </motion.div>
                      ))}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 pt-4">
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button 
                          size="lg" 
                          onClick={() => setCurrentPage(service.title === 'International Trade License' ? 'trade-license' : 'request')}
                          className="flex items-center"
                        >
                          {service.cta}
                          <ArrowRight className="w-5 h-5 ml-2" />
                        </Button>
                      </motion.div>
                    </div>
                  </div>

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className={`relative order-1 lg:order-2 ${index % 2 === 1 ? 'lg:col-start-1' : ''}`}
                  >
                    {/* Decorative shapes and skeleton similar to ServiceRequest */}
                    <div className="relative mb-2">
                      <div className="absolute -top-3 -left-3 h-24 w-32 md:h-28 md:w-40 rounded-2xl rotate-[-6deg] bg-indigo-600/20 dark:bg-indigo-500/15 blur-[1px]" aria-hidden="true"></div>
                      <div className="absolute -bottom-3 -right-3 h-24 w-32 md:h-28 md:w-40 rounded-2xl rotate-[8deg] bg-blue-600/20 dark:bg-blue-500/15" aria-hidden="true"></div>

                      <div className="relative overflow-hidden rounded-3xl shadow-2xl ring-1 ring-border/40 bg-card">
                        <AspectRatio ratio={16/9}>
                          {!imgLoaded[index] && (
                            <Skeleton className="absolute inset-0 h-full w-full" />
                          )}
                          <ImageWithFallback
                            src={cldFetch(service.image, { w: 1200 })}
                            fallbackSrc={service.image}
                            alt={service.title}
                            className="w-full h-full object-cover"
                            loading="lazy"
                            referrerPolicy="no-referrer"
                            onLoad={() => setImgLoaded(prev => {
                              const next = prev.slice();
                              next[index] = true;
                              return next;
                            })}
                            onError={() => setImgLoaded(prev => {
                              const next = prev.slice();
                              next[index] = true;
                              return next;
                            })}
                          />
                        </AspectRatio>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/15 to-transparent" />
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 md:py-28 bg-muted/30">
          <div className="site-container site-max text-center">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl md:text-4xl font-bold mb-4"
            >
              Ready to Get Started?
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
            >
              Our expert team is here to guide you through every step of your visa application process
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  size="lg" 
                  onClick={() => setCurrentPage('request')}
                  className="px-8"
                >
                  Request Service
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={() => setCurrentPage('signup')}
                  className="px-8"
                >
                  Create Account
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </section>
        </motion.div>
      );
    };

  // About page content (stub)
  function AboutPage() {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-h-screen">
        {/* Hero Section */}
        <section className="py-24 md:py-28 bg-gradient-to-br from-blue-50 via-background to-indigo-50/30 dark:from-blue-950/20 dark:via-background dark:to-indigo-950/10">
          <div className="site-container site-max text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-5xl font-bold mb-6"
            >
              About United Global Services
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-muted-foreground max-w-3xl mx-auto"
            >
              Inspiring borderless thinking through expert visa and immigration services since 2008
            </motion.p>
          </div>
        </section>

        {/* Content */}
        <section className="pt-16 pb-28 md:pt-20 md:pb-32">
          <div className="site-container site-max">
            <div className="max-w-4xl mx-auto space-y-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-center"
              >
                <h2 className="text-3xl font-bold mb-6">Our Story</h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Founded in 2008, United Global Services has been at the forefront of simplifying global mobility.
                  Our mission is to break down barriers and create opportunities for individuals and businesses to
                  thrive in an interconnected world. With over 15 years of experience, we've helped thousands of
                  clients achieve their dreams of traveling, studying, working, and living abroad.
                </p>
              </motion.div>

              <div className="grid md:grid-cols-3 gap-8">
                {[
                  { icon: Users, title: 'Expert Team', description: 'Immigration lawyers, visa specialists, and consultants with decades of combined experience' },
                  { icon: Globe, title: 'Global Reach', description: 'Comprehensive services for over 120 countries with local expertise and partnerships' },
                  { icon: Award, title: 'Proven Results', description: '98% success rate with over 50,000 successful visa applications and immigration cases' }
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                  >
                    <Card className="text-center h-full rounded-2xl shadow-sm ring-1 ring-border/50">
                      <CardContent className="p-6">
                        <div className="w-12 h-12 bg-primary/10 rounded-xl mx-auto mb-4 flex items-center justify-center">
                          <item.icon className="w-6 h-6 text-primary" />
                        </div>
                        <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="text-center"
              >
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button 
                    size="lg" 
                    onClick={() => setCurrentPage('request')}
                    className="px-8"
                  >
                    Work With Us
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>
      </motion.div>
    );
  }

  

  // Render current page with animations
  const renderPage = () => {
    // Dynamic course details routing: pages like 'course:tourist-visa-fundamentals'
    if (currentPage.startsWith('course:')) {
      const courseId = currentPage.substring('course:'.length);
      return (
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <CourseDetailsPage courseId={courseId} onPageChange={setCurrentPage} />
          </motion.div>
        </AnimatePresence>
      );
    }
    const pageComponents = {
      'home': <HomePage onPageChange={setCurrentPage} />,
      'services': <ServicesPage />,
      'about': <AboutPage />,
      'visaed': <VisaEdPage onPageChange={setCurrentPage} />,
      'allen': <AllenAI onPageChange={setCurrentPage} />,
      'signin': <AuthPages type="signin" onPageChange={setCurrentPage} onAdminLogin={handleAdminLogin} onUserLogin={handleUserLogin} />,
      'signup': <AuthPages type="signup" onPageChange={setCurrentPage} onUserLogin={handleUserLogin} />,
      'request': <ServiceRequest onPageChange={setCurrentPage} />,
      'trade-license': <TradeLicenseRequest onPageChange={setCurrentPage} />,
      'verify-email': <VerifyEmail onPageChange={setCurrentPage} />,
      'admin-dashboard': <AdminDashboard onPageChange={setCurrentPage} onLogout={handleAdminLogout} />,
      'client-dashboard': <ClientDashboard onPageChange={setCurrentPage} onLogout={handleClientLogout} />
    };

    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPage}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {pageComponents[currentPage as keyof typeof pageComponents] || pageComponents.home}
        </motion.div>
      </AnimatePresence>
    );
  };

  // Don't show header for dashboards
  const shouldShowHeader = !['admin-dashboard', 'client-dashboard'].includes(currentPage);
  const isDashboardPage = !shouldShowHeader;

  return (
  <ErrorBoundary>
    <div className="min-h-screen bg-background text-foreground app-shell">
        {shouldShowHeader && (
          <Header 
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            theme={theme}
            onThemeChange={flipTheme}
            isAdmin={isAdmin}
            isClient={isClient}
          />
        )}
        <main className="relative">
          <div className={isDashboardPage ? "px-6 sm:px-8 lg:px-12 xl:px-16 2xl:px-24" : "px-0"}>
            <Suspense
              fallback={
                <div className="min-h-[40vh] flex items-center justify-center">
                  <div className="animate-spin h-6 w-6 rounded-full border-2 border-primary border-t-transparent" aria-label="Loading" />
                </div>
              }
            >
              {renderPage()}
            </Suspense>
          </div>
        </main>
        <Toaster richColors position="top-center" />
        
        {/* Footer - only show for non-dashboard pages */}
        {shouldShowHeader && (
          <motion.footer
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="bg-muted/30 border-t border-border"
          >
            <div className="container mx-auto py-12">
              <div className="grid md:grid-cols-4 gap-8">
                <div className="space-y-4">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="flex items-center"
                  >
                    <img 
                      src="/ugs-logo.png" 
                      alt="UGS Logo" 
                      className="w-24 h-24 md:w-28 md:h-28 object-contain dark:brightness-0 dark:invert hover:dark:brightness-100 hover:dark:invert-0 transition-all duration-300 ease-in-out cursor-pointer"
                    />
                  </motion.div>
                  <p className="text-sm text-muted-foreground">
                    Your trusted partner for visa and immigration services worldwide.
                  </p>
                </div>
                
                {[
                  {
                    title: 'Services',
                    links: [
                      { name: 'Tourism & Leisure', action: () => setCurrentPage('services') },
                      { name: 'Immigration & Relocation', action: () => setCurrentPage('services') },
                      { name: 'Trade License Formation', action: () => setCurrentPage('services') },
                      { name: 'International Education', action: () => setCurrentPage('services') }
                    ]
                  },
                  {
                    title: 'Resources',
                    links: [
                      { name: 'VisaEd', action: () => setCurrentPage('visaed') },
                      { name: 'Blog', action: () => {} }
                    ]
                  },
                  {
                    title: 'Company',
                    links: [
                      { name: 'About Us', action: () => setCurrentPage('about') },
                      { name: 'Contact', action: () => {} },
                      { name: 'Careers', action: () => {} },
                      { name: 'Privacy Policy', action: () => {} }
                    ]
                  }
                ].map((section, index) => (
                  <div key={index}>
                    <h4 className="font-semibold mb-4">{section.title}</h4>
                    <div className="space-y-2 text-sm">
                      {section.links.map((link, linkIndex) => (
                        <motion.button
                          key={linkIndex}
                          whileHover={{ x: 5 }}
                          onClick={link.action}
                          className="block text-muted-foreground hover:text-foreground transition-colors text-left"
                        >
                          {link.name}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-border pt-8 mt-8 text-center">
                <p className="text-sm text-muted-foreground">
                  2025 United Global Services. All rights reserved. | Inspiring borderless thinking.
                </p>
              </div>
            </div>
          </motion.footer>
        )}
      </div>
    </ErrorBoundary>
  );
}