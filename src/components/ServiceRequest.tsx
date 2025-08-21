import React, { useState } from 'react';
import { Button } from './button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card';
import { Input } from './input';
import { Label } from './label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { Textarea } from './textarea';
import { Checkbox } from './checkbox';
import { RadioGroup, RadioGroupItem } from './radio-group';
import { Progress } from './progress';
import { Badge } from './badge';
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
import { useAuth } from '../lib/auth';
import { submitVisaApplication } from '../lib/db';
import { toast } from 'sonner';

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

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
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
      
      // Redirect to client dashboard or confirmation page
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
      price: 'From $199', 
      time: '5-10 days',
      description: 'For leisure and tourism purposes'
    },
    { 
      id: 'business', 
      title: 'Business Visa', 
      price: 'From $299', 
      time: '7-15 days',
      description: 'For business meetings and conferences'
    },
    { 
      id: 'student', 
      title: 'Student Visa', 
      price: 'From $499', 
      time: '2-8 weeks',
      description: 'For educational purposes'
    },
    { 
      id: 'work', 
      title: 'Work Visa', 
      price: 'From $799', 
      time: '4-12 weeks',
      description: 'For employment opportunities'
    },
    { 
      id: 'immigration', 
      title: 'Immigration Services', 
      price: 'From $1299', 
      time: '6+ months',
      description: 'For permanent residency'
    },
    { 
      id: 'other', 
      title: 'Other Services', 
      price: 'Custom Quote', 
      time: 'Varies',
      description: 'Specialized visa services'
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

            <div className="grid md:grid-cols-2 gap-4">
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
                  <User className="w-4 h-4 absolute left-3 top-3.5 text-muted-foreground" />
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
                  <Mail className="w-4 h-4 absolute left-3 top-3.5 text-muted-foreground" />
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
                  <Phone className="w-4 h-4 absolute left-3 top-3.5 text-muted-foreground" />
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
                  <Calendar className="w-4 h-4 absolute left-3 top-3.5 text-muted-foreground" />
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
                  <FileText className="w-4 h-4 absolute left-3 top-3.5 text-muted-foreground" />
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
                  <MapPin className="w-4 h-4 absolute left-3 top-3.5 text-muted-foreground" />
                  <Select onValueChange={(value) => handleInputChange('destinationCountry', value)}>
                    <SelectTrigger className="pl-10">
                      <SelectValue placeholder="Select destination" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="us">United States</SelectItem>
                      <SelectItem value="ca">Canada</SelectItem>
                      <SelectItem value="uk">United Kingdom</SelectItem>
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
                  <Plane className="w-4 h-4 absolute left-3 top-3.5 text-muted-foreground" />
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
                  <Plane className="w-4 h-4 absolute left-3 top-3.5 text-muted-foreground rotate-180" />
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
                    <Badge variant="outline">+$199</Badge>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value="priority" id="priority" />
                      <div>
                        <Label htmlFor="priority" className="font-medium">Priority Processing</Label>
                        <p className="text-sm text-muted-foreground">Fastest available processing</p>
                      </div>
                    </div>
                    <Badge variant="outline">+$399</Badge>
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
                  <Badge variant="outline">+$99</Badge>
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
                  <Badge variant="outline">+$149</Badge>
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
                  <span className="font-medium">{formData.destinationCountry || 'Not specified'}</span>
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
                    <span className="text-primary">$199 - $799+</span>
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
                  I agree to UGS's Terms of Service and understand that visa approval is not guaranteed.
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
                  I consent to the processing of my personal data for visa application purposes and agree to the Privacy Policy.
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
    <div className="min-h-screen no-hscroll bg-gradient-to-br from-red-50 via-background to-orange-50/30 dark:from-red-950/10 dark:via-background dark:to-orange-950/5">
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
  );
}