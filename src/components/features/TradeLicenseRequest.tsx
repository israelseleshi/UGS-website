import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { Progress } from '../ui/progress';
import { 
  Building, 
  Globe, 
  Users, 
  FileText, 
  CreditCard, 
  CheckCircle, 
  ArrowLeft, 
  ArrowRight,
  Star,
  Crown,
  Sparkles,
  Zap,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { createTradeLicenseApplication } from '../../lib/db';
import { toast } from 'sonner';

interface TradeLicenseRequestProps {
  onPageChange: (page: string) => void;
}

interface FormData {
  // Business Information
  businessName: string;
  businessType: string;
  industry: string;
  businessDescription: string;
  
  // Location & Jurisdiction
  preferredCountry: string;
  preferredCity: string;
  businessAddress: string;
  
  // Ownership & Management
  ownershipStructure: string;
  numberOfPartners: string;
  authorizedCapital: string;
  paidUpCapital: string;
  
  // Contact Information
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  
  // Additional Services
  bankingAssistance: boolean;
  taxCompliance: boolean;
  ongoingCompliance: boolean;
  corporateGovernance: boolean;
  
  // Service Preferences
  processingSpeed: string;
  
  // Legal Agreements
  termsAccepted: boolean;
  privacyAccepted: boolean;
}

const businessTypes = [
  'Limited Liability Company (LLC)',
  'Corporation',
  'Partnership',
  'Sole Proprietorship',
  'Joint Venture',
  'Branch Office',
  'Representative Office',
  'Free Zone Company'
];

const industries = [
  'Technology & Software',
  'Trading & Import/Export',
  'Manufacturing',
  'Consulting Services',
  'Real Estate',
  'Healthcare',
  'Education',
  'Tourism & Hospitality',
  'Financial Services',
  'Construction',
  'Retail & E-commerce',
  'Food & Beverage',
  'Other'
];

const ownershipStructures = [
  'Single Owner',
  '2 Partners',
  '3-5 Partners',
  '6-10 Partners',
  'More than 10 Partners',
  'Corporate Ownership'
];

const countries = [
  'United Arab Emirates',
  'Saudi Arabia',
  'Qatar',
  'Kuwait',
  'Bahrain',
  'Oman',
  'Singapore',
  'Hong Kong',
  'United Kingdom',
  'United States',
  'Canada',
  'Australia',
  'Germany',
  'Netherlands',
  'Other'
];

export function TradeLicenseRequest({ onPageChange }: TradeLicenseRequestProps) {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  
  const [formData, setFormData] = useState<FormData>({
    businessName: '',
    businessType: '',
    industry: '',
    businessDescription: '',
    preferredCountry: '',
    preferredCity: '',
    businessAddress: '',
    ownershipStructure: '',
    numberOfPartners: '',
    authorizedCapital: '',
    paidUpCapital: '',
    contactPerson: '',
    contactEmail: user?.email || '',
    contactPhone: '',
    bankingAssistance: false,
    taxCompliance: false,
    ongoingCompliance: false,
    corporateGovernance: false,
    processingSpeed: '',
    termsAccepted: false,
    privacyAccepted: false
  });

  const updateFormData = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear validation errors when user starts typing
    if (validationErrors.length > 0) {
      setValidationErrors([]);
    }
  };

  const validateStep = (step: number): boolean => {
    const errors: string[] = [];
    
    switch (step) {
      case 1: // Business Information
        if (!formData.businessName.trim()) errors.push('Business name is required');
        if (!formData.businessType) errors.push('Business type is required');
        if (!formData.industry) errors.push('Industry is required');
        if (!formData.businessDescription.trim()) errors.push('Business description is required');
        break;
        
      case 2: // Location & Jurisdiction
        if (!formData.preferredCountry) errors.push('Preferred country is required');
        if (!formData.preferredCity.trim()) errors.push('Preferred city is required');
        if (!formData.businessAddress.trim()) errors.push('Business address is required');
        break;
        
      case 3: // Ownership & Management
        if (!formData.ownershipStructure) errors.push('Ownership structure is required');
        if (!formData.authorizedCapital.trim()) errors.push('Authorized capital is required');
        if (!formData.paidUpCapital.trim()) errors.push('Paid-up capital is required');
        break;
        
      case 4: // Contact & Service Preferences
        if (!formData.contactPerson.trim()) errors.push('Contact person is required');
        if (!formData.contactEmail.trim()) errors.push('Contact email is required');
        if (!formData.contactPhone.trim()) errors.push('Contact phone is required');
        if (!formData.processingSpeed) errors.push('Processing speed is required');
        if (!formData.termsAccepted) errors.push('You must accept the terms and conditions');
        if (!formData.privacyAccepted) errors.push('You must accept the privacy policy');
        
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (formData.contactEmail && !emailRegex.test(formData.contactEmail)) {
          errors.push('Please enter a valid email address');
        }
        break;
    }
    
    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    } else {
      toast.error('Please complete all required fields before proceeding');
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(4)) {
      toast.error('Please complete all required fields');
      return;
    }

    if (!user) {
      toast.error('Please sign in to submit your application');
      onPageChange('signin');
      return;
    }

    setIsSubmitting(true);
    
    try {
      await createTradeLicenseApplication(user.uid, {
        businessName: formData.businessName,
        businessType: formData.businessType,
        industry: formData.industry,
        businessDescription: formData.businessDescription,
        preferredCountry: formData.preferredCountry,
        preferredCity: formData.preferredCity,
        businessAddress: formData.businessAddress,
        ownershipStructure: formData.ownershipStructure,
        numberOfPartners: formData.numberOfPartners,
        authorizedCapital: formData.authorizedCapital,
        paidUpCapital: formData.paidUpCapital,
        contactPerson: formData.contactPerson,
        contactEmail: formData.contactEmail,
        contactPhone: formData.contactPhone,
        additionalServices: {
          bankingAssistance: formData.bankingAssistance,
          taxCompliance: formData.taxCompliance,
          ongoingCompliance: formData.ongoingCompliance,
          corporateGovernance: formData.corporateGovernance
        },
        processingSpeed: formData.processingSpeed,
        status: 'pending',
        submittedAt: new Date()
      });

      toast.success('Trade license application submitted successfully!');
      onPageChange('client-dashboard');
    } catch (error) {
      console.error('Error submitting trade license application:', error);
      toast.error('Failed to submit application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { number: 1, title: 'Business Information', icon: Building },
    { number: 2, title: 'Location & Jurisdiction', icon: Globe },
    { number: 3, title: 'Ownership & Management', icon: Users },
    { number: 4, title: 'Contact & Preferences', icon: FileText }
  ];

  const renderProgressIndicator = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm font-medium">Step {currentStep} of 4</div>
        <div className="text-sm text-muted-foreground">
          {currentStep === 1 && 'Business Information'}
          {currentStep === 2 && 'Location & Jurisdiction'}
          {currentStep === 3 && 'Ownership & Management'}
          {currentStep === 4 && 'Contact & Preferences'}
        </div>
      </div>
      <Progress value={(currentStep / 4) * 100} className="h-2" />
    </div>
  );

  const renderStep1 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">Business Information</h2>
        <p className="text-muted-foreground">Tell us about your business venture</p>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="businessName">Business Name *</Label>
          <Input
            id="businessName"
            value={formData.businessName}
            onChange={(e) => updateFormData('businessName', e.target.value)}
            placeholder="Enter your business name"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="businessType">Business Type *</Label>
            <Select value={formData.businessType} onValueChange={(value) => updateFormData('businessType', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select business type" />
              </SelectTrigger>
              <SelectContent>
                {businessTypes.map((type) => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="industry">Industry *</Label>
            <Select value={formData.industry} onValueChange={(value) => updateFormData('industry', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select industry" />
              </SelectTrigger>
              <SelectContent>
                {industries.map((industry) => (
                  <SelectItem key={industry} value={industry}>{industry}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="businessDescription">Business Description *</Label>
          <Textarea
            id="businessDescription"
            value={formData.businessDescription}
            onChange={(e) => updateFormData('businessDescription', e.target.value)}
            placeholder="Describe your business activities and objectives"
            className="mt-1 min-h-[100px]"
          />
        </div>
      </div>
    </motion.div>
  );

  const renderStep2 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">Location & Jurisdiction</h2>
        <p className="text-muted-foreground">Choose where to establish your business</p>
      </div>

      <div className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="preferredCountry">Preferred Country *</Label>
            <Select value={formData.preferredCountry} onValueChange={(value) => updateFormData('preferredCountry', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                {countries.map((country) => (
                  <SelectItem key={country} value={country}>{country}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="preferredCity">Preferred City *</Label>
            <Input
              id="preferredCity"
              value={formData.preferredCity}
              onChange={(e) => updateFormData('preferredCity', e.target.value)}
              placeholder="Enter preferred city"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="businessAddress">Business Address *</Label>
          <Textarea
            id="businessAddress"
            value={formData.businessAddress}
            onChange={(e) => updateFormData('businessAddress', e.target.value)}
            placeholder="Enter complete business address"
            className="min-h-[80px]"
          />
        </div>
      </div>
    </motion.div>
  );

  const renderStep3 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">Ownership & Management</h2>
        <p className="text-muted-foreground">Define your business structure and capital</p>
      </div>

      <div className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="ownershipStructure">Ownership Structure *</Label>
            <Select value={formData.ownershipStructure} onValueChange={(value) => updateFormData('ownershipStructure', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select ownership structure" />
              </SelectTrigger>
              <SelectContent>
                {ownershipStructures.map((structure) => (
                  <SelectItem key={structure} value={structure}>{structure}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="numberOfPartners">Number of Partners (if applicable)</Label>
            <Input
              id="numberOfPartners"
              value={formData.numberOfPartners}
              onChange={(e) => updateFormData('numberOfPartners', e.target.value)}
              placeholder="Enter number of partners"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="authorizedCapital">Authorized Capital *</Label>
            <Input
              id="authorizedCapital"
              value={formData.authorizedCapital}
              onChange={(e) => updateFormData('authorizedCapital', e.target.value)}
              placeholder="e.g., USD 100,000"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="paidUpCapital">Paid-up Capital *</Label>
            <Input
              id="paidUpCapital"
              value={formData.paidUpCapital}
              onChange={(e) => updateFormData('paidUpCapital', e.target.value)}
              placeholder="e.g., USD 50,000"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );

  const renderStep4 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">Contact & Preferences</h2>
        <p className="text-muted-foreground">Final details and service preferences</p>
      </div>

      <div className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="contactPerson">Contact Person *</Label>
            <Input
              id="contactPerson"
              value={formData.contactPerson}
              onChange={(e) => updateFormData('contactPerson', e.target.value)}
              placeholder="Full name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactPhone">Contact Phone *</Label>
            <Input
              id="contactPhone"
              value={formData.contactPhone}
              onChange={(e) => updateFormData('contactPhone', e.target.value)}
              placeholder="+1 (555) 123-4567"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="contactEmail">Contact Email *</Label>
          <Input
            id="contactEmail"
            type="email"
            value={formData.contactEmail}
            onChange={(e) => updateFormData('contactEmail', e.target.value)}
            placeholder="your@email.com"
          />
        </div>

        <div className="space-y-4">
          <Label className="text-base font-medium">Additional Services</Label>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { key: 'bankingAssistance', label: 'Banking Setup Assistance', icon: CreditCard },
              { key: 'taxCompliance', label: 'Tax Compliance Guidance', icon: FileText },
              { key: 'ongoingCompliance', label: 'Ongoing Compliance Management', icon: CheckCircle },
              { key: 'corporateGovernance', label: 'Corporate Governance Support', icon: Users }
            ].map((service) => (
              <div key={service.key} className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors">
                <Checkbox
                  id={service.key}
                  checked={formData[service.key as keyof FormData] as boolean}
                  onCheckedChange={(checked) => updateFormData(service.key as keyof FormData, checked)}
                />
                <div className="flex items-center space-x-2">
                  <service.icon className="w-4 h-4 text-primary" />
                  <Label htmlFor={service.key} className="text-sm cursor-pointer">{service.label}</Label>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="processingSpeed">Processing Speed *</Label>
          <Select value={formData.processingSpeed} onValueChange={(value) => updateFormData('processingSpeed', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select processing speed" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="standard">Standard (4-6 weeks) - $2,500</SelectItem>
              <SelectItem value="express">Express (2-3 weeks) - $3,500</SelectItem>
              <SelectItem value="premium">Premium (1-2 weeks) - $5,000</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-4 pt-4 border-t border-border">
          <div className="flex items-start space-x-3">
            <Checkbox
              id="termsAccepted"
              checked={formData.termsAccepted}
              onCheckedChange={(checked) => updateFormData('termsAccepted', checked)}
            />
            <Label htmlFor="termsAccepted" className="text-sm leading-relaxed cursor-pointer">
              I agree to the <span className="text-primary underline">Terms and Conditions</span> and understand the service fees and processing timelines *
            </Label>
          </div>

          <div className="flex items-start space-x-3">
            <Checkbox
              id="privacyAccepted"
              checked={formData.privacyAccepted}
              onCheckedChange={(checked) => updateFormData('privacyAccepted', checked)}
            />
            <Label htmlFor="privacyAccepted" className="text-sm leading-relaxed cursor-pointer">
              I agree to the <span className="text-primary underline">Privacy Policy</span> and consent to data processing for business setup services *
            </Label>
          </div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      <div className="site-container site-max py-6 md:py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-6 md:mb-8 space-y-4 md:space-y-0">
          <Button
            variant="ghost"
            onClick={() => onPageChange('services')}
            className="flex items-center space-x-2 self-start"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Services</span>
          </Button>
          
          <div className="text-center flex-1">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent">
              International Trade License
            </h1>
            <p className="text-muted-foreground mt-2 text-sm md:text-base">Complete business setup and trade license formation</p>
          </div>
          
          <div className="w-24 hidden md:block" /> {/* Spacer for centering */}
        </div>
        
        {/* Form Content */}
        <div className="max-w-4xl mx-auto">
          <Card className="shadow-2xl border-0 bg-card/95 backdrop-blur-sm">
            <CardContent className="p-6 md:p-8">
              {renderProgressIndicator()}

              {/* Validation Errors */}
              {validationErrors.length > 0 && (
                <Alert className="mb-6 border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/50">
                  <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                  <AlertDescription className="text-red-700 dark:text-red-300">
                    <div className="font-medium mb-1">Please correct the following errors:</div>
                    <ul className="list-disc list-inside space-y-1">
                      {validationErrors.map((error, index) => (
                        <li key={index} className="text-sm">{error}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {/* Step Content */}
              <AnimatePresence mode="wait">
                {currentStep === 1 && renderStep1()}
                {currentStep === 2 && renderStep2()}
                {currentStep === 3 && renderStep3()}
                {currentStep === 4 && renderStep4()}
              </AnimatePresence>

              {/* Navigation Buttons */}
              <div className="flex justify-between items-center mt-8 pt-6 border-t border-border">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentStep === 1}
                  className="flex items-center space-x-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Previous</span>
                </Button>

                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">
                    Step {currentStep} of {steps.length}
                  </span>
                </div>

                {currentStep < 4 ? (
                  <Button
                    onClick={handleNext}
                    className="flex items-center space-x-2 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600"
                  >
                    <span>Next</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                  >
                    {isSubmitting ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        >
                          <Zap className="w-4 h-4" />
                        </motion.div>
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        <span>Submit Application</span>
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}