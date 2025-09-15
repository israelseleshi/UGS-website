import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Checkbox } from '../ui/checkbox';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { 
  FileText, 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  MapPin, 
  Plane,
  Clock,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Upload,
  AlertCircle,
  DollarSign
} from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { submitVisaApplication } from '../../lib/db';
import { toast } from 'sonner';
import { createVisaApplication, upsertUser } from '../../lib/db';
import { formatCountryDisplay } from '../../lib/countries';
import { AspectRatio } from '../ui/aspect-ratio';
import { ImageWithFallback } from '../shared/ImageWithFallback';
import { cldFetch } from '../../lib/cdn';

interface ServiceRequestProps {
  onPageChange: (page: string) => void;
}

export function ServiceRequest({ onPageChange }: ServiceRequestProps) {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    // Personal Information
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    nationality: '',
    passportNumber: '',
    passportExpiry: '',
    
    // Travel Details
    serviceType: '',
    destinationCountry: '',
    purposeOfTravel: '',
    travelDate: '',
    returnDate: '',
    duration: '',
    previousVisaHistory: '',
    
    // Additional Information
    accommodation: '',
    financialSupport: '',
    emergencyContact: '',
    emergencyPhone: '',
    specialRequirements: '',
    
    // Service Preferences
    processingSpeed: '',
    consultationNeeded: false,
    documentReview: false,
    
    // Agreement
    agreeToTerms: false,
    agreeToPrivacy: false
  });
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear validation errors when user starts typing
    if (validationErrors.length > 0) {
      setValidationErrors([]);
    }
  };

  // Validation functions for each step
  const validateStep1 = (): boolean => {
    const errors: string[] = [];
    
    if (!formData.serviceType) {
      errors.push('Please select a service type');
    }
    
    setValidationErrors(errors);
    return errors.length === 0;
  };

  const validateStep2 = (): boolean => {
    const errors: string[] = [];
    
    if (!formData.firstName.trim()) {
      errors.push('First name is required');
    }
    if (!formData.lastName.trim()) {
      errors.push('Last name is required');
    }
    if (!formData.email.trim()) {
      errors.push('Email address is required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.push('Please enter a valid email address');
    }
    if (!formData.phone.trim()) {
      errors.push('Phone number is required');
    }
    if (!formData.dateOfBirth) {
      errors.push('Date of birth is required');
    }
    if (!formData.nationality) {
      errors.push('Nationality is required');
    }
    if (!formData.passportNumber.trim()) {
      errors.push('Passport number is required');
    }
    if (!formData.passportExpiry) {
      errors.push('Passport expiry date is required');
    }
    
    setValidationErrors(errors);
    return errors.length === 0;
  };

  const validateStep3 = (): boolean => {
    const errors: string[] = [];
    
    if (!formData.destinationCountry) {
      errors.push('Destination country is required');
    }
    if (!formData.purposeOfTravel) {
      errors.push('Purpose of travel is required');
    }
    if (!formData.travelDate) {
      errors.push('Travel date is required');
    }
    if (!formData.previousVisaHistory) {
      errors.push('Previous visa history selection is required');
    }
    
    setValidationErrors(errors);
    return errors.length === 0;
  };

  const validateStep4 = (): boolean => {
    const errors: string[] = [];
    
    if (!formData.processingSpeed) {
      errors.push('Processing speed selection is required');
    }
    if (!formData.agreeToTerms) {
      errors.push('You must agree to the Terms of Service');
    }
    if (!formData.agreeToPrivacy) {
      errors.push('You must agree to the Privacy Policy');
    }
    
    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleNext = () => {
    let isValid = false;
    
    // Validate current step before proceeding
    switch (currentStep) {
      case 1:
        isValid = validateStep1();
        break;
      case 2:
        isValid = validateStep2();
        break;
      case 3:
        isValid = validateStep3();
        break;
      case 4:
        isValid = validateStep4();
        break;
      default:
        isValid = true;
    }
    
    if (isValid && currentStep < 4) {
      setCurrentStep(currentStep + 1);
      setValidationErrors([]); // Clear errors when moving to next step
    } else if (!isValid) {
      // Show toast notification for validation errors
      toast.error(`Please complete all required fields in Step ${currentStep}`);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Please sign in to submit a visa application');
      onPageChange('signin');
      return;
    }

    if (!formData.agreeToTerms || !formData.agreeToPrivacy) {
      toast.error('Please agree to the terms and privacy policy');
      return;
    }

    setIsSubmitting(true);
    try {
      const applicationId = await submitVisaApplication({
        uid: user.uid,
        userEmail: user.email || formData.email,
        
        // Personal Information
        personalInfo: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          dateOfBirth: formData.dateOfBirth,
          nationality: formData.nationality,
          passportNumber: formData.passportNumber,
          passportExpiry: formData.passportExpiry
        },
        
        // Travel Details
        travel: {
          serviceType: formData.serviceType,
          destination: formData.destinationCountry,
          purpose: formData.purposeOfTravel,
          travelDate: formData.travelDate,
          returnDate: formData.returnDate,
          accommodation: formData.accommodation,
          previousVisaHistory: formData.previousVisaHistory
        },
        
        // Additional Information
        additionalInfo: {
          emergencyContact: formData.emergencyContact,
          emergencyPhone: formData.emergencyPhone,
          specialRequirements: formData.specialRequirements,
          processingSpeed: formData.processingSpeed,
          consultationNeeded: formData.consultationNeeded,
          documentReview: formData.documentReview
        },
        
        // Calculated pricing
        estimatedCost: calculateEstimatedCost(),
        
        // Status tracking
        status: 'submitted',
        priority: formData.processingSpeed === 'priority' ? 'high' : formData.processingSpeed === 'express' ? 'medium' : 'normal'
      });
      
      toast.success('Visa application submitted successfully!');
      toast.info('Our team will contact you within 24 hours to confirm details.');

      // Signal the client dashboard to open Messages for this submission
      try {
        sessionStorage.setItem('ugs_open_messages', '1');
        sessionStorage.setItem('ugs_last_app_id', String(applicationId));
      } catch {}

      // Redirect to client dashboard
      onPageChange('client-dashboard');
      
    } catch (error: any) {
      console.error('Error submitting application:', error);
      toast.error(error?.message || 'Failed to submit application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const calculateEstimatedCost = () => {
    const serviceType = services.find(s => s.id === formData.serviceType);
    let baseCost = 199; // Default base cost
    
    if (serviceType?.id === 'business') baseCost = 299;
    else if (serviceType?.id === 'student') baseCost = 499;
    else if (serviceType?.id === 'work') baseCost = 799;
    else if (serviceType?.id === 'immigration') baseCost = 1299;
    
    let additionalCost = 0;
    if (formData.processingSpeed === 'express') additionalCost += 199;
    if (formData.processingSpeed === 'priority') additionalCost += 399;
    if (formData.consultationNeeded) additionalCost += 99;
    if (formData.documentReview) additionalCost += 149;
    
    return baseCost + additionalCost;
  };

  const services = [
    { 
      id: 'tourist', 
      title: 'Tourist Visa', 
      price: 'From ETB 199', 
      time: '5-10 days',
      description: 'For leisure and tourism purposes',
      image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200&auto=format&fit=crop'
    },
    { 
      id: 'business', 
      title: 'Business Visa', 
      price: 'From ETB 299', 
      time: '7-15 days',
      description: 'For business meetings and conferences',
      image: 'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?q=80&w=1200&auto=format&fit=crop'
    },
    { 
      id: 'student', 
      title: 'Student Visa', 
      price: 'From ETB 499', 
      time: '2-8 weeks',
      description: 'For educational purposes',
      image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=1200&auto=format&fit=crop'
    },
    { 
      id: 'work', 
      title: 'Work Visa', 
      price: 'From ETB 799', 
      time: '4-12 weeks',
      description: 'For employment opportunities',
      image: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?q=80&w=1200&auto=format&fit=crop'
    },
    { 
      id: 'immigration', 
      title: 'Immigration Services', 
      price: 'From ETB 1299', 
      time: '6+ months',
      description: 'For permanent residency',
      image: 'https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?q=80&w=1200&auto=format&fit=crop'
    },
    { 
      id: 'other', 
      title: 'Other Services', 
      price: 'Custom Quote', 
      time: 'Varies',
      description: 'Specialized visa services',
      image: 'https://images.unsplash.com/photo-1496302662116-35cc4f36df92?q=80&w=1200&auto=format&fit=crop'
    }
  ];


  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">Service Selection</h2>
              <p className="text-muted-foreground">Choose the visa service that best fits your needs</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {services.map((service) => (
                <Card 
                  key={service.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    formData.serviceType === service.id 
                      ? 'ring-2 ring-primary border-primary' 
                      : ''
                  }`}
                  onClick={() => handleInputChange('serviceType', service.id)}
                >
                  <CardContent className="p-6">
                    {/* Visual banner with decorative background shapes */}
                    <div className="relative mb-5">
                      {/* background shape 1 */}
                      <div className="absolute -top-3 -left-3 h-24 w-32 md:h-28 md:w-40 rounded-2xl rotate-[-6deg] bg-indigo-600/20 dark:bg-indigo-500/15 blur-[1px]" aria-hidden="true"></div>
                      {/* background shape 2 */}
                      <div className="absolute -bottom-3 -right-3 h-24 w-32 md:h-28 md:w-40 rounded-2xl rotate-[8deg] bg-blue-600/20 dark:bg-blue-500/15" aria-hidden="true"></div>

                      <div className="relative rounded-2xl overflow-hidden shadow-sm ring-1 ring-black/5 dark:ring-white/5">
                        <AspectRatio ratio={16/9}>
                          <ImageWithFallback
                            src={cldFetch(service.image, { w: 1200 })}
                            fallbackSrc={service.image}
                            alt={`${service.title} illustrative image`}
                            className="h-full w-full object-cover"
                            loading="lazy"
                            referrerPolicy="no-referrer"
                          />
                        </AspectRatio>
                      </div>
                    </div>

                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-lg">{service.title}</h3>
                        <p className="text-sm text-muted-foreground mb-2">{service.description}</p>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="radio"
                          checked={formData.serviceType === service.id}
                          onChange={() => handleInputChange('serviceType', service.id)}
                          className="w-4 h-4 text-primary"
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="flex items-center">
                        <DollarSign className="w-3 h-3 mr-1" />
                        {service.price}
                      </Badge>
                      <Badge variant="secondary" className="flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {service.time}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">Personal Information</h2>
              <p className="text-muted-foreground">Provide your personal details for the visa application</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-3.5 text-red-600" />
                  <Input
                    id="firstName"
                    placeholder="John"
                    className="pl-10"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-3.5 text-muted-foreground" />
                  <Input
                    id="lastName"
                    placeholder="Doe"
                    className="pl-10"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-3.5 text-red-600" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    className="pl-10"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-3.5 text-red-600" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    className="pl-10"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <div className="relative">
                  <Calendar className="w-4 h-4 absolute left-3 top-3.5 text-red-600" />
                  <Input
                    id="dateOfBirth"
                    type="date"
                    className="pl-10"
                    value={formData.dateOfBirth}
                    onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="nationality">Nationality</Label>
                <Select onValueChange={(value) => handleInputChange('nationality', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select nationality" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="us">United States</SelectItem>
                    <SelectItem value="ca">Canada</SelectItem>
                    <SelectItem value="uk">United Kingdom</SelectItem>
                    <SelectItem value="et">Ethiopia</SelectItem>
                    <SelectItem value="in">India</SelectItem>
                    <SelectItem value="au">Australia</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="passportNumber">Passport Number</Label>
                <div className="relative">
                  <FileText className="w-4 h-4 absolute left-3 top-3.5 text-red-600" />
                  <Input
                    id="passportNumber"
                    placeholder="A12345678"
                    className="pl-10"
                    value={formData.passportNumber}
                    onChange={(e) => handleInputChange('passportNumber', e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="passportExpiry">Passport Expiry Date</Label>
                <div className="relative">
                  <Calendar className="w-4 h-4 absolute left-3 top-3.5 text-muted-foreground" />
                  <Input
                    id="passportExpiry"
                    type="date"
                    className="pl-10"
                    value={formData.passportExpiry}
                    onChange={(e) => handleInputChange('passportExpiry', e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">Travel Details</h2>
              <p className="text-muted-foreground">Tell us about your travel plans and requirements</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="destinationCountry">Destination Country</Label>
                <div className="relative">
                  <MapPin className="w-4 h-4 absolute left-3 top-3.5 text-red-600" />
                  <Select onValueChange={(value) => handleInputChange('destinationCountry', value)}>
                    <SelectTrigger className="pl-10">
                      <SelectValue placeholder="Select destination" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="us">United States</SelectItem>
                      <SelectItem value="ca">Canada</SelectItem>
                      <SelectItem value="uk">United Kingdom</SelectItem>
                      <SelectItem value="et">Ethiopia</SelectItem>
                      <SelectItem value="au">Australia</SelectItem>
                      <SelectItem value="de">Germany</SelectItem>
                      <SelectItem value="fr">France</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="purposeOfTravel">Purpose of Travel</Label>
                <Select onValueChange={(value) => handleInputChange('purposeOfTravel', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select purpose" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tourism">Tourism</SelectItem>
                    <SelectItem value="business">Business</SelectItem>
                    <SelectItem value="education">Education</SelectItem>
                    <SelectItem value="work">Work</SelectItem>
                    <SelectItem value="family">Family Visit</SelectItem>
                    <SelectItem value="medical">Medical</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="travelDate">Intended Travel Date</Label>
                <div className="relative">
                  <Plane className="w-4 h-4 absolute left-3 top-3.5 text-red-600" />
                  <Input
                    id="travelDate"
                    type="date"
                    className="pl-10"
                    value={formData.travelDate}
                    onChange={(e) => handleInputChange('travelDate', e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="returnDate">Return Date (if applicable)</Label>
                <div className="relative">
                  <Plane className="w-4 h-4 absolute left-3 top-3.5 text-red-600 rotate-180" />
                  <Input
                    id="returnDate"
                    type="date"
                    className="pl-10"
                    value={formData.returnDate}
                    onChange={(e) => handleInputChange('returnDate', e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="accommodation">Accommodation Details</Label>
              <Textarea
                id="accommodation"
                placeholder="Hotel name, address, or host information..."
                className="min-h-[80px]"
                value={formData.accommodation}
                onChange={(e) => handleInputChange('accommodation', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Previous Visa History</Label>
              <RadioGroup 
                value={formData.previousVisaHistory}
                onValueChange={(value) => handleInputChange('previousVisaHistory', value)}
                className="grid grid-cols-3 gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="visa-yes" />
                  <Label htmlFor="visa-yes" className="text-sm">Yes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="visa-no" />
                  <Label htmlFor="visa-no" className="text-sm">No</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="denied" id="visa-denied" />
                  <Label htmlFor="visa-denied" className="text-sm">Previously Denied</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="emergencyContact">Emergency Contact Name</Label>
                <Input
                  id="emergencyContact"
                  placeholder="Full name"
                  value={formData.emergencyContact}
                  onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emergencyPhone">Emergency Contact Phone</Label>
                <Input
                  id="emergencyPhone"
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={formData.emergencyPhone}
                  onChange={(e) => handleInputChange('emergencyPhone', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="specialRequirements">Special Requirements or Notes</Label>
              <Textarea
                id="specialRequirements"
                placeholder="Any special circumstances, medical conditions, or additional information we should know..."
                className="min-h-[100px]"
                value={formData.specialRequirements}
                onChange={(e) => handleInputChange('specialRequirements', e.target.value)}
              />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">Service Preferences & Review</h2>
              <p className="text-muted-foreground">Choose your service options and review your application</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-primary" />
                  Processing Speed
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <RadioGroup 
                  value={formData.processingSpeed}
                  onValueChange={(value) => handleInputChange('processingSpeed', value)}
                >
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value="standard" id="standard" />
                      <div>
                        <Label htmlFor="standard" className="font-medium">Standard Processing</Label>
                        <p className="text-sm text-muted-foreground">Regular processing times</p>
                      </div>
                    </div>
                    <Badge variant="secondary">Included</Badge>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value="express" id="express" />
                      <div>
                        <Label htmlFor="express" className="font-medium">Express Processing</Label>
                        <p className="text-sm text-muted-foreground">50% faster processing</p>
                      </div>
                    </div>
                    <Badge variant="outline">+ETB 199</Badge>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value="priority" id="priority" />
                      <div>
                        <Label htmlFor="priority" className="font-medium">Priority Processing</Label>
                        <p className="text-sm text-muted-foreground">Fastest available processing</p>
                      </div>
                    </div>
                    <Badge variant="outline">+ETB 399</Badge>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Additional Services</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Checkbox 
                      id="consultation"
                      checked={formData.consultationNeeded}
                      onCheckedChange={(checked) => handleInputChange('consultationNeeded', checked as boolean)}
                    />
                    <div>
                      <Label htmlFor="consultation" className="font-medium">Expert Consultation Call</Label>
                      <p className="text-sm text-muted-foreground">30-minute call with visa specialist</p>
                    </div>
                  </div>
                  <Badge variant="outline">+ETB 99</Badge>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Checkbox 
                      id="review"
                      checked={formData.documentReview}
                      onCheckedChange={(checked) => handleInputChange('documentReview', checked as boolean)}
                    />
                    <div>
                      <Label htmlFor="review" className="font-medium">Document Review Service</Label>
                      <p className="text-sm text-muted-foreground">Professional review of all documents</p>
                    </div>
                  </div>
                  <Badge variant="outline">+ETB 149</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-muted/30">
              <CardHeader>
                <CardTitle>Application Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>Service Type:</span>
                  <span className="font-medium">{services.find(s => s.id === formData.serviceType)?.title || 'Not selected'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Destination:</span>
                  <span className="font-medium">{formatCountryDisplay(formData.destinationCountry) || 'Not specified'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Travel Date:</span>
                  <span className="font-medium">{formData.travelDate || 'Not specified'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Processing:</span>
                  <span className="font-medium">{formData.processingSpeed || 'Standard'}</span>
                </div>
                <div className="border-t pt-3 mt-3">
                  <div className="flex justify-between font-semibold">
                    <span>Estimated Total:</span>
                    <span className="text-primary">ETB 199 - ETB 1299+</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Checkbox 
                  id="terms" 
                  checked={formData.agreeToTerms}
                  onCheckedChange={(checked) => handleInputChange('agreeToTerms', checked as boolean)}
                  required
                />
                <Label htmlFor="terms" className="text-sm leading-relaxed">
                  I agree to UGS's
                  <Dialog>
                    <DialogTrigger asChild>
                      <button type="button" className="mx-1 text-red-600 underline underline-offset-2">Terms of Service</button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Terms of Service</DialogTitle>
                        <DialogDescription>Review the agreement before continuing.</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-3 text-sm max-h-[60vh] overflow-y-auto">
                        <p>By submitting this application, you authorize UGS to process your personal data and act on your behalf for the selected service.</p>
                        <p>UGS is not responsible for consular decisions. Processing times and outcomes are determined by the respective embassy/consulate.</p>
                        <p>Service fees are for advisory and processing assistance and are non-refundable once processing begins.</p>
                      </div>
                    </DialogContent>
                  </Dialog>
                  and understand that visa approval is not guaranteed.
                </Label>
              </div>
              <div className="flex items-start space-x-3">
                <Checkbox 
                  id="privacy" 
                  checked={formData.agreeToPrivacy}
                  onCheckedChange={(checked) => handleInputChange('agreeToPrivacy', checked as boolean)}
                  required
                />
                <Label htmlFor="privacy" className="text-sm leading-relaxed">
                  I consent to the processing of my personal data and agree to the
                  <Dialog>
                    <DialogTrigger asChild>
                      <button type="button" className="mx-1 text-red-600 underline underline-offset-2">Privacy Policy</button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Privacy Policy</DialogTitle>
                        <DialogDescription>How we collect, use, and protect your data.</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-3 text-sm max-h-[60vh] overflow-y-auto">
                        <p>Your information is used solely for processing your application and communicating updates.</p>
                        <p>We implement industry-standard security to safeguard your data and only share with authorities as required.</p>
                        <p>You may request deletion of your data subject to legal and regulatory requirements.</p>
                      </div>
                    </DialogContent>
                  </Dialog>.
                </Label>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">Important Notice</p>
                  <p className="text-blue-800 dark:text-blue-200">
                    After submission, our team will review your application and contact you within 24 hours to confirm details and provide payment instructions.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-[100svh] no-hscroll bg-gradient-to-br from-red-50 via-background to-orange-50/30 dark:from-red-950/10 dark:via-background dark:to-orange-950/5 flex flex-col">
      <div className="flex-1 overflow-y-auto scroll-y-touch">
        <div className="site-container site-max py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Visa Service Request</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Start your visa application journey with our expert guidance and streamlined process.
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm font-medium">Step {currentStep} of 4</div>
            <div className="text-sm text-muted-foreground">
              {currentStep === 1 && 'Service Selection'}
              {currentStep === 2 && 'Personal Information'}
              {currentStep === 3 && 'Travel Details'}
              {currentStep === 4 && 'Review & Submit'}
            </div>
          </div>
          <Progress value={(currentStep / 4) * 100} className="h-2" />
        </div>

        {/* Form Content */}
        <div className="max-w-4xl mx-auto">
          <Card className="shadow-xl">
            <CardContent className="p-6 md:p-8">
              <form onSubmit={handleSubmit}>
                {renderStepContent()}
                
                {/* Validation Errors */}
                {validationErrors.length > 0 && (
                  <div className="mt-6 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium text-red-900 dark:text-red-100 mb-2">Please complete the following:</h4>
                        <ul className="list-disc list-inside space-y-1 text-sm text-red-800 dark:text-red-200">
                          {validationErrors.map((error, index) => (
                            <li key={index}>{error}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Navigation Buttons */}
                <div className="flex justify-between mt-8 pt-6 border-t">
                  <Button 
                    type="button"
                    variant="outline" 
                    onClick={handlePrevious}
                    disabled={currentStep === 1}
                    className="flex items-center"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>
                  
                  {currentStep === 4 ? (
                    <Button 
                      type="submit"
                      disabled={!formData.agreeToTerms || !formData.agreeToPrivacy || isSubmitting}
                      className="flex items-center"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      {isSubmitting ? 'Submitting...' : 'Submit Request'}
                    </Button>
                  ) : (
                    <Button 
                      type="button"
                      onClick={handleNext}
                      className="flex items-center"
                    >
                      Next
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
      </div>
    </div>
  );
}