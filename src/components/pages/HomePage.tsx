import React from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { ImageWithFallback } from '../shared/ImageWithFallback';
import { Typewriter } from '../shared/Typewriter';
import { 
  Plane, 
  Home, 
  Building, 
  GraduationCap, 
  Globe, 
  ArrowRight, 
  CheckCircle, 
  Users, 
  Clock, 
  Shield,
  Star,
  MessageCircle
} from 'lucide-react';

interface HomePageProps {
  onPageChange: (page: string) => void;
}

export function HomePage({ onPageChange }: HomePageProps) {
  const services = [
    {
      icon: Plane,
      title: 'Tourism & Leisure',
      description: 'Seamless visa processing for your travel adventures worldwide.',
      image: 'https://images.unsplash.com/photo-1721138942121-a26751b520b5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwYXNzcG9ydCUyMHRyYXZlbCUyMHZpc2ElMjBkb2N1bWVudHN8ZW58MXx8fHwxNzU1NTk2NjAxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      features: ['Tourist Visas', 'Transit Visas', 'Group Travel', 'Express Processing']
    },
    {
      icon: Home,
      title: 'Immigration & Relocation',
      description: 'Expert guidance for permanent residency and relocation services.',
      image: 'https://images.unsplash.com/photo-1666790676906-0295230c121d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBvZmZpY2UlMjBidXNpbmVzc3xlbnwxfHx8fDE3NTU1ODI2NDB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      features: ['Permanent Residence', 'Work Permits', 'Family Reunification', 'Citizenship']
    },
    {
      icon: Building,
      title: 'International Trade License',
      description: 'Complete business setup and trade license formation globally.',
      image: 'https://images.unsplash.com/photo-1666790676906-0295230c121d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBvZmZpY2UlMjBidXNpbmVzc3xlbnwxfHx8fDE3NTU1ODI2NDB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      features: ['Business Incorporation', 'Trade Licenses', 'Banking Setup', 'Compliance']
    },
    {
      icon: GraduationCap,
      title: 'International Education',
      description: 'Student visa services and educational institution partnerships.',
      image: 'https://images.unsplash.com/photo-1558409816-5370d92f4bdf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbnRlcm5hdGlvbmFsJTIwZWR1Y2F0aW9uJTIwZ3JhZHVhdGlvbnxlbnwxfHx8fDE3NTU1OTY2MDd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      features: ['Student Visas', 'University Applications', 'Scholarships', 'Post-Study Work']
    }
  ];

  const stats = [
    { number: '50,000+', label: 'Visas Processed', icon: CheckCircle },
    { number: '120+', label: 'Countries Covered', icon: Globe },
    { number: '15+', label: 'Years Experience', icon: Clock },
    { number: '98%', label: 'Success Rate', icon: Star }
  ];

  return (
  <div className="min-h-screen bg-hero-diagonal relative no-hscroll">
      {/* Hero Section */}
      <section className="relative min-h-[calc(100vh-5rem)] py-10 md:py-24 flex items-center overflow-hidden">
        {/* layered subtle gradients */}
        <div className="pointer-events-none absolute inset-0 bg-hero-radial" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-transparent dark:from-primary/20 dark:via-background dark:to-transparent" />
        <div className="pointer-events-none absolute -right-28 top-1/3 h-[320px] w-[320px] md:h-[520px] md:w-[520px] rounded-full bg-gradient-to-tr from-primary/20 to-transparent blur-3xl opacity-50 dark:opacity-40" />
        <div className="relative z-10 site-container site-max">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <div className="space-y-8">
              <div className="space-y-6">
                <div className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-full text-sm font-medium shadow-sm">
                  <Globe className="w-4 h-4 mr-2" />
                  Your Gateway to Global Opportunities
                </div>
                <h1 className="text-4xl md:text-7xl font-extrabold text-foreground leading-tight min-h-[160px] md:min-h-[240px] animate-fade-in tracking-tight">
                  <Typewriter
                    text="Inspiring Borderless Thinking"
                    speed={120}
                    className="block"
                  />
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground leading-relaxed animate-slide-up-fade [animation-delay:.15s] max-w-xl">
                  United Global Services simplifies visa processes, immigration, and international services with expert guidance and seamless solutions.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 animate-slide-up-fade [animation-delay:.25s]">
                <Button 
                  size="lg" 
                  className="text-base px-8"
                  onClick={() => onPageChange('services')}
                >
                  Explore Services
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="text-base px-8"
                  onClick={() => onPageChange('allen')}
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Chat with Allen AI
                </Button>
              </div>

              {/* Trust indicators */}
              <div className="flex flex-wrap items-center gap-x-6 gap-y-4 pt-8 md:pt-10 animate-slide-up-fade [animation-delay:.35s]">
                <div className="flex items-center space-x-2">
                  <Shield className="w-5 h-5 text-green-500" />
                  <span className="text-sm text-muted-foreground">Secure & Confidential</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-blue-500" />
                  <span className="text-sm text-muted-foreground">Expert Team</span>
                </div>
              </div>
            </div>

            <div className="relative">
              {/* Decorative rotated panels behind card */}
              <div className="pointer-events-none absolute left-1/2 top-4 md:top-8 z-10 h-[320px] w-[360px] md:h-[440px] md:w-[480px] lg:h-[520px] lg:w-[560px] -translate-x-1/2 -rotate-6 rounded-3xl bg-gradient-to-br from-primary/30 to-red-700/25 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.6)] ring-1 ring-primary/20 dark:from-primary/25 dark:to-red-900/25" />
              <div className="pointer-events-none absolute left-1/2 top-10 md:top-16 z-0 h-[320px] w-[360px] md:h-[440px] md:w-[480px] lg:h-[520px] lg:w-[560px] -translate-x-1/2 -rotate-12 rounded-3xl bg-gradient-to-tr from-primary/10 via-background/40 to-transparent blur-xl" />

              <div className="relative z-20 mx-auto w-full max-w-lg lg:max-w-xl animate-scale-in">
                <div className="group relative rounded-[2.25rem] bg-gradient-to-b from-foreground/[0.08] to-foreground/[0.04] p-[2px] shadow-xl ring-1 ring-border/40 backdrop-blur-sm supports-[backdrop-filter]:bg-foreground/5">
                  <div className="rounded-[2rem] bg-card/95 supports-[backdrop-filter]:bg-card/90 px-5 md:px-8 pt-6 md:pt-8 pb-8 md:pb-10">
                    <div className="relative overflow-hidden rounded-2xl ring-1 ring-border/20 shadow-inner">
                      <ImageWithFallback
                        src="https://images.unsplash.com/photo-1721138942121-a26751b520b5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwYXNzcG9ydCUyMHRyYXZlbCUyMHZpc2ElMjBkb2N1bWVudHN8ZW58MXx8fHwxNzU1NTk2NjAxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                        alt="Passport and visa documents"
                        className="aspect-[4/3] w-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                      />
                      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(0,0,0,0)_0%,rgba(0,0,0,0.45)_75%)] mix-blend-multiply" />
                    </div>
                    <div className="mt-7 space-y-4">
                      <h3 className="font-semibold text-base tracking-tight">Ready to Start Your Journey?</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">Join thousands who trust UGS for their visa and immigration needs.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative py-20 md:py-24 border-y border-border/60 bg-background/60">
        <div className="relative site-container site-max">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 lg:gap-16">
            {stats.map((stat, index) => (
              <div key={index} className="text-center space-y-3">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-red-500/10 flex items-center justify-center">
                  <stat.icon className="w-5 h-5 text-red-500" />
                </div>
                <div className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">{stat.number}</div>
                <div className="text-sm md:text-base text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="pt-24 pb-28 md:pt-28 md:pb-32">
        <div className="site-container site-max">
          <div className="text-center mb-14 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Services</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Comprehensive visa and immigration solutions tailored to your unique needs
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {services.map((service, index) => (
              <Card key={index} className="group hover:shadow-xl transition-shadow cursor-pointer overflow-hidden rounded-2xl border border-border/50 bg-card/80" onClick={() => onPageChange('services')}>
                <CardContent className="p-0">
                  <div className="relative overflow-hidden rounded-t-2xl aspect-[16/9]">
                    <ImageWithFallback
                      src={service.image}
                      alt={service.title}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                    <div className="absolute top-4 left-4">
                      <div className="w-12 h-12 bg-white/95 dark:bg-white/90 rounded-xl flex items-center justify-center shadow-md ring-1 ring-black/10">
                        <service.icon className="w-6 h-6 text-red-500" />
                      </div>
                    </div>
                  </div>
                  <div className="p-6 bg-card">
                    <CardHeader className="p-0">
                      <CardTitle className="text-xl mb-2">{service.title}</CardTitle>
                      <CardDescription className="text-base">{service.description}</CardDescription>
                    </CardHeader>
                    <div className="mt-4 space-y-2">
                      {service.features.map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex items-center text-sm text-muted-foreground">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                          {feature}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12 md:mt-14">
            <Button 
              size="lg" 
              onClick={() => onPageChange('services')}
              className="px-8"
            >
              View All Services
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 md:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-red-500 via-red-600 to-red-700" />
        <div className="absolute inset-0 opacity-40 mix-blend-overlay bg-[radial-gradient(circle_at_20%_20%,white_.5%,transparent_60%)]" />
        <div className="relative site-container site-max text-center">
          <div className="space-y-10 text-white">
            <h2 className="text-3xl md:text-4xl font-bold">Ready to Begin Your Journey?</h2>
            <p className="text-xl opacity-90 max-w-3xl mx-auto leading-relaxed">
              Get personalized guidance from our expert team. Start your visa application process today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" className="px-8 bg-gray-900 hover:bg-gray-800 text-white" onClick={() => onPageChange('request')}>
                Request Visa Service
              </Button>
              <Button size="lg" variant="outline" className="px-8 bg-white/10 hover:bg-white/20 border-white/20 text-white" onClick={() => onPageChange('visaed')}>
                Learn More at VisaEd
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}