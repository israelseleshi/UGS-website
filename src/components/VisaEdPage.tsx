import React, { useState } from 'react';
import { toast } from 'sonner';
import { createVisaEdRegistration } from '../lib/db';
import { useAuth } from '../lib/auth';
import { Button } from './button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card';
import { Input } from './input';
import { Label } from './label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { Textarea } from './textarea';
import { Checkbox } from './checkbox';
import { RadioGroup, RadioGroupItem } from './radio-group';
import { ImageWithFallback } from './ImageWithFallback';
import { 
  GraduationCap, 
  BookOpen, 
  Users, 
  Award, 
  Clock, 
  Globe,
  CheckCircle,
  ArrowRight,
  Play,
  Calendar,
  User,
  Mail,
  Phone
} from 'lucide-react';

interface VisaEdPageProps {
  onPageChange: (page: string) => void;
}

export function VisaEdPage({ onPageChange }: VisaEdPageProps) {
  const [registrationData, setRegistrationData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    currentLocation: '',
    targetCountry: '',
    visaType: '',
    experienceLevel: '',
    learningGoals: '',
    preferredSchedule: '',
    agreeToTerms: false
  });
  const [submitting, setSubmitting] = useState(false);
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const { user } = useAuth();

  const handleInputChange = (field: string, value: string | boolean) => {
    setRegistrationData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    try {
      setSubmitting(true);
      const uid = user?.uid || 'guest';
      const payload = {
        uid,
        userEmail: registrationData.email,
        courseName: registrationData.visaType ? `${registrationData.visaType} Visa Path` : 'VisaEd Course',
        plan: 'free' as const,
        status: 'registered' as const,
        form: {
          firstName: registrationData.firstName,
          lastName: registrationData.lastName,
          email: registrationData.email,
          phone: registrationData.phone,
          currentLocation: registrationData.currentLocation,
          targetCountry: registrationData.targetCountry,
          visaType: registrationData.visaType,
          experienceLevel: registrationData.experienceLevel,
          learningGoals: registrationData.learningGoals,
          preferredSchedule: registrationData.preferredSchedule,
          agreeToTerms: registrationData.agreeToTerms,
        },
      };
      const created = await createVisaEdRegistration(uid, payload);
      setSubmittedId((created as any).id || null);
      toast.success('You are registered for VisaEd! We sent details to your email.');
      // Reset minimal fields but keep email for confirmation display
      setRegistrationData(prev => ({ ...prev, firstName: '', lastName: '', phone: '', learningGoals: '' }));
    } catch (e: any) {
      toast.error(e?.message || 'Failed to register. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const features = [
    {
      icon: BookOpen,
      title: 'Expert-Led Courses',
      description: 'Learn from immigration lawyers and visa specialists with 15+ years of experience.'
    },
    {
      icon: Globe,
      title: 'Country-Specific Modules',
      description: 'Detailed guidance for 50+ countries including requirements and processes.'
    },
    {
      icon: Users,
      title: 'Interactive Workshops',
      description: 'Live Q&A sessions, case studies, and peer-to-peer learning opportunities.'
    },
    {
      icon: Award,
      title: 'Certification Program',
      description: 'Earn verified certificates upon completion of specialized visa courses.'
    }
  ];

  // Helper to build a course slug from the title
  const toSlug = (title: string) => title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const courses = [
    {
      title: 'Tourist Visa Fundamentals',
      duration: '2 weeks',
      level: 'Beginner',
      topics: ['Application Process', 'Required Documents', 'Interview Preparation', 'Common Mistakes'],
      image: 'https://images.unsplash.com/photo-1721138942121-a26751b520b5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwYXNzcG9ydCUyMHRyYXZlbCUyMHZpc2ElMjBkb2N1bWVudHN8ZW58MXx8fHwxNzU1NTk2NjAxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
    },
    {
      title: 'Student Visa Mastery',
      duration: '4 weeks',
      level: 'Intermediate',
      topics: ['University Selection', 'Financial Requirements', 'Statement of Purpose', 'Post-Study Options'],
      image: 'https://images.unsplash.com/photo-1558409816-5370d92f4bdf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbnRlcm5hdGlvbmFsJTIwZWR1Y2F0aW9uJTIwZ3JhZHVhdGlvbnxlbnwxfHx8fDE3NTU1OTY2MDd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
    },
    {
      title: 'Immigration Law Basics',
      duration: '6 weeks',
      level: 'Advanced',
      topics: ['Legal Framework', 'Rights & Obligations', 'Appeals Process', 'Policy Changes'],
      image: 'https://images.unsplash.com/photo-1666790676906-0295230c121d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBvZmZpY2UlMjBidXNpbmVzc3xlbnwxfHx8fDE3NTU1ODI2NDB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
    }
  ];

  const stats = [
    { number: '10,000+', label: 'Students Enrolled' },
    { number: '95%', label: 'Success Rate' },
    { number: '50+', label: 'Countries Covered' },
    { number: '24/7', label: 'Support Available' }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-24 md:py-28 bg-gradient-to-br from-blue-50 via-background to-indigo-50/30 dark:from-blue-950/20 dark:via-background dark:to-indigo-950/10">
        <div className="site-container site-max">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-6">
                <div className="inline-flex items-center px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium">
                  <GraduationCap className="w-4 h-4 mr-2" />
                  VisaEd - Learn. Apply. Succeed.
                </div>
                <h1 className="text-4xl md:text-6xl font-bold text-foreground leading-tight">
                  Master Visa
                  <span className="text-blue-600"> Education </span>
                  & Immigration
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  Comprehensive courses designed to help you navigate visa processes with confidence. Learn from experts and increase your approval chances.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="text-base px-8 bg-blue-600 hover:bg-blue-700">
                  Start Learning Today
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button variant="outline" size="lg" className="text-base px-8">
                  <Play className="w-5 h-5 mr-2" />
                  Watch Demo
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-2xl font-bold text-foreground">{stat.number}</div>
                    <div className="text-xs text-muted-foreground">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="relative w-full max-w-lg mx-auto">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-indigo-600/20 rounded-3xl rotate-3" />
                <Card className="relative bg-card shadow-2xl">
                  <CardContent className="p-6">
                    <ImageWithFallback
                      src="https://images.unsplash.com/photo-1558409816-5370d92f4bdf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbnRlcm5hdGlvbmFsJTIwZWR1Y2F0aW9uJTIwZ3JhZHVhdGlvbnxlbnwxfHx8fDE3NTU1OTY2MDd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                      alt="Students learning about visas"
                      className="w-full h-48 object-cover rounded-2xl mb-6"
                    />
                    <h3 className="font-semibold mb-2">Join Thousands of Successful Students</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Our proven curriculum has helped students achieve 95% visa approval rates.
                    </p>
                    <div className="flex items-center text-sm text-green-600">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Next cohort starts March 1st
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 md:py-28">
        <div className="site-container site-max">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose VisaEd?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Learn from industry experts and gain the knowledge you need for successful visa applications
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
            {features.map((feature, index) => (
              <Card key={index} className="text-center rounded-2xl ring-1 ring-border/50 hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl mx-auto mb-4 flex items-center justify-center">
                    <feature.icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <CardTitle className="text-lg mb-2">{feature.title}</CardTitle>
                  <CardDescription className="text-sm">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Courses Section */}
      <section className="py-24 md:py-28 bg-muted/30">
        <div className="site-container site-max">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Popular Courses</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Structured learning paths designed for different visa categories and experience levels
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {courses.map((course, index) => (
              <Card key={index} className="group rounded-2xl ring-1 ring-border/50 hover:shadow-xl transition-shadow">
                <CardContent className="p-0">
                  <div className="relative h-56 lg:h-64 overflow-hidden">
                    <ImageWithFallback
                      src={course.image}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-4 right-4">
                      <span className="bg-white/90 text-blue-600 px-2 py-1 rounded-full text-xs font-medium">
                        {course.level}
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-lg">{course.title}</h3>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="w-4 h-4 mr-1" />
                        {course.duration}
                      </div>
                    </div>
                    <div className="space-y-2 mb-4">
                      {course.topics.map((topic, topicIndex) => (
                        <div key={topicIndex} className="flex items-center text-sm text-muted-foreground">
                          <CheckCircle className="w-3 h-3 text-green-500 mr-2 flex-shrink-0" />
                          {topic}
                        </div>
                      ))}
                    </div>
                    <Button className="w-full" variant="outline" onClick={() => onPageChange(`course:${toSlug(course.title)}`)}>
                      Learn More
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Registration Form Section */}
      <section className="py-24 md:py-28" id="register">
        <div className="site-container site-max">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Register for VisaEd</h2>
              <p className="text-xl text-muted-foreground">
                Start your visa education journey today with personalized learning paths
              </p>
            </div>

            <Card className="shadow-xl rounded-2xl ring-1 ring-border/50">
              <CardHeader>
                <CardTitle className="text-2xl">Personal Information</CardTitle>
                <CardDescription>
                  Tell us about yourself and your visa education goals
                </CardDescription>
              </CardHeader>
              <CardContent>
                {submittedId ? (
                  <div className="text-center space-y-4 py-8">
                    <CheckCircle className="w-12 h-12 text-green-600 mx-auto" />
                    <h3 className="text-xl font-semibold">Registration Successful</h3>
                    <p className="text-sm text-muted-foreground">
                      Your VisaEd enrollment has been created. Confirmation was sent to {registrationData.email || 'your email'}.
                    </p>
                    <div className="text-xs text-muted-foreground">Ref: {submittedId}</div>
                    <div className="flex gap-3 justify-center pt-2">
                      <Button onClick={() => onPageChange('client-dashboard')}>Go to Dashboard</Button>
                      <Button variant="outline" onClick={() => setSubmittedId(null)}>Register Another</Button>
                    </div>
                  </div>
                ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <div className="relative">
                        <User className="w-4 h-4 absolute left-3 top-3.5 text-muted-foreground" />
                        <Input id="firstName" placeholder="John" className="pl-10" value={registrationData.firstName} onChange={(e) => handleInputChange('firstName', e.target.value)} required />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <div className="relative">
                        <User className="w-4 h-4 absolute left-3 top-3.5 text-muted-foreground" />
                        <Input id="lastName" placeholder="Doe" className="pl-10" value={registrationData.lastName} onChange={(e) => handleInputChange('lastName', e.target.value)} required />
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <div className="relative">
                        <Mail className="w-4 h-4 absolute left-3 top-3.5 text-muted-foreground" />
                        <Input id="email" type="email" placeholder="john@example.com" className="pl-10" value={registrationData.email} onChange={(e) => handleInputChange('email', e.target.value)} required />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <div className="relative">
                        <Phone className="w-4 h-4 absolute left-3 top-3.5 text-muted-foreground" />
                        <Input id="phone" type="tel" placeholder="+1 (555) 000-0000" className="pl-10" value={registrationData.phone} onChange={(e) => handleInputChange('phone', e.target.value)} />
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="currentLocation">Current Location</Label>
                      <Select onValueChange={(value) => handleInputChange('currentLocation', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your country" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="us">United States</SelectItem>
                          <SelectItem value="ca">Canada</SelectItem>
                          <SelectItem value="uk">United Kingdom</SelectItem>
                          <SelectItem value="au">Australia</SelectItem>
                          <SelectItem value="in">India</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="targetCountry">Target Destination</Label>
                      <Select onValueChange={(value) => handleInputChange('targetCountry', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Where do you want to go?" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="us">United States</SelectItem>
                          <SelectItem value="ca">Canada</SelectItem>
                          <SelectItem value="uk">United Kingdom</SelectItem>
                          <SelectItem value="au">Australia</SelectItem>
                          <SelectItem value="de">Germany</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Visa Type of Interest</Label>
                    <RadioGroup value={registrationData.visaType} onValueChange={(value) => handleInputChange('visaType', value)} className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="tourist" id="tourist" />
                        <Label htmlFor="tourist" className="text-sm">Tourist</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="student" id="student" />
                        <Label htmlFor="student" className="text-sm">Student</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="work" id="work" />
                        <Label htmlFor="work" className="text-sm">Work</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="immigration" id="immigration" />
                        <Label htmlFor="immigration" className="text-sm">Immigration</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="experienceLevel">Experience Level</Label>
                    <Select onValueChange={(value) => handleInputChange('experienceLevel', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your experience level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner - First time applying</SelectItem>
                        <SelectItem value="intermediate">Intermediate - Some experience</SelectItem>
                        <SelectItem value="advanced">Advanced - Multiple applications</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="learningGoals">Learning Goals</Label>
                    <Textarea id="learningGoals" placeholder="What do you hope to achieve through VisaEd? (Optional)" className="min-h-[150px]" value={registrationData.learningGoals} onChange={(e) => handleInputChange('learningGoals', e.target.value)} />
                  </div>

                  <div className="space-y-2">
                    <Label>Preferred Learning Schedule</Label>
                    <RadioGroup value={registrationData.preferredSchedule} onValueChange={(value) => handleInputChange('preferredSchedule', value)} className="grid md:grid-cols-3 gap-4">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="weekdays" id="weekdays" />
                        <Label htmlFor="weekdays" className="text-sm">Weekday evenings</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="weekends" id="weekends" />
                        <Label htmlFor="weekends" className="text-sm">Weekends</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="flexible" id="flexible" />
                        <Label htmlFor="flexible" className="text-sm">Flexible</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Checkbox id="terms" checked={registrationData.agreeToTerms} onCheckedChange={(checked) => handleInputChange('agreeToTerms', checked as boolean)} required />
                    <Label htmlFor="terms" className="text-sm leading-relaxed">
                      I agree to VisaEd's Terms of Service and Privacy Policy. I consent to receiving educational materials and course updates via email.
                    </Label>
                  </div>

                  <Button type="submit" size="lg" disabled={submitting} className="w-full bg-red-600 hover:bg-red-700 text-white">
                    {submitting ? 'Registering…' : 'Register for VisaEd'}
                    {!submitting && <ArrowRight className="w-5 h-5 ml-2" />}
                  </Button>
                </form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
 