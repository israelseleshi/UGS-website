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
      image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80',
      features: ['Permanent Residence', 'Work Permits', 'Family Reunification', 'Citizenship']
    },
    {
      icon: Building,
      title: 'International Trade License',
      description: 'Complete business setup and trade license formation globally.',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80',
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
    { number: '120+', label: 'Countries Covered', icon: Globe },
    { number: '15+', label: 'Years Experience', icon: Clock },
    { number: '98%', label: 'Success Rate', icon: Star }
  ];

  return (
  <div className="min-h-screen relative no-hscroll">
      {/* Hero Section with Ethiopian Passport Background */}
      <section className="relative min-h-[calc(100vh-5rem)] py-10 md:py-24 flex items-center overflow-hidden">
        {/* Ethiopian Passport Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/ethiopian-passport-image.jpeg" 
            alt="Ethiopian Passport Background"
            className="w-full h-full object-cover object-center"
          />
          {/* Animated Gray Overlay */}
          <div className="absolute inset-0" 
               style={{
                 animation: 'fadeOverlay 3s ease-in-out infinite alternate'
               }} />
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900/50 via-gray-800/40 to-gray-900/50" />
        </div>
        
        <div className="relative z-10 site-container site-max">
          <div className="flex items-center justify-center lg:justify-start">
            <div className="space-y-8 text-center lg:text-left max-w-4xl">
              <div className="space-y-6">
                <div className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-full text-sm font-medium shadow-sm">
                  <Globe className="w-4 h-4 mr-2" />
                  Your Gateway to Global Opportunities
                </div>
                <h1 className="text-4xl md:text-7xl font-extrabold text-white leading-tight min-h-[160px] md:min-h-[240px] animate-fade-in tracking-tight">
                  <Typewriter
                    text="Inspiring Borderless Thinking"
                    speed={120}
                    className="block"
                  />
                </h1>
                <p className="text-lg md:text-xl text-white/90 leading-relaxed animate-slide-up-fade [animation-delay:.15s] max-w-xl mx-auto lg:mx-0">
                  United Global Services simplifies visa processes, immigration, and international services with expert guidance and seamless solutions.
                </p>
              </div>
              
              <div className="flex justify-center lg:justify-start animate-slide-up-fade [animation-delay:.25s]">
                <Button 
                  size="lg" 
                  className="text-base px-8 bg-primary"
                  onClick={() => onPageChange('services')}
                >
                  Explore Services
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative py-20 md:py-24 border-y border-border/60 bg-background/60">
        <div className="relative site-container site-max">
          <div className="flex items-center justify-center min-h-[200px]">
            <div className="flex flex-col md:flex-row items-center justify-center gap-16 lg:gap-24 xl:gap-32">
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
        </div>
      </section>

      {/* Services Overview Section */}
      <section className="pt-24 pb-28 md:pt-28 md:pb-32 bg-muted/30">
        <div className="site-container site-max">
          <div className="text-center mb-14 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Services</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Comprehensive visa and immigration solutions tailored to your unique needs
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {services.map((service, index) => (
              <Card key={index} className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-300" onClick={() => onPageChange('services')}>
                <div className="relative h-48 md:h-56">
                  <ImageWithFallback
                    src={service.image}
                    alt={service.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 left-4">
                    <div className="w-12 h-12 bg-white/90 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-sm">
                      <service.icon className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-3">{service.title}</h3>
                  <p className="text-muted-foreground mb-4 leading-relaxed">{service.description}</p>
                  <div className="space-y-2">
                    {service.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm text-muted-foreground">{feature}</span>
                      </div>
                    ))}
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