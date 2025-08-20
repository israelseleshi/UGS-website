import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card';
import { Input } from './input';
import { Label } from './label';
import { Checkbox } from './checkbox';
import { ImageWithFallback } from './ImageWithFallback';
import { 
  Globe, 
  Mail, 
  Lock, 
  User, 
  Phone, 
  ArrowRight, 
  Eye, 
  EyeOff,
  CheckCircle,
  AlertCircle,
  Shield,
  Sparkles,
  Crown,
  Star
} from 'lucide-react';
import { useAuth } from '../lib/auth';
import { upsertUser } from '../lib/db';
import { auth } from '../lib/firebase';

interface AuthPagesProps {
  type: 'signin' | 'signup';
  onPageChange: (page: string) => void;
  onAdminLogin?: () => void;
  onUserLogin?: () => void;
}

export function AuthPages({ type, onPageChange, onAdminLogin, onUserLogin }: AuthPagesProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
    newsletterOptIn: false
  });

  const { signInWithEmail, signUpWithEmail, error: authError, loading: authLoading } = useAuth();

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (loginError) setLoginError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setInfoMessage('');
    setIsLoading(true);

    try {
      if (type === 'signin') {
        if (!formData.email || !formData.password) throw new Error('Please enter valid credentials');
        await signInWithEmail(formData.email, formData.password);
        // App.tsx will auto-route based on verification and role claims
      } else {
        if (!formData.agreeToTerms) throw new Error('Please agree to the terms and conditions');
        await signUpWithEmail(formData.email, formData.password);
        // Save profile fields to Firestore (users/{uid})
        try {
          const u = auth?.currentUser;
          if (u) {
            await upsertUser({
              uid: u.uid,
              email: u.email ?? formData.email,
              // store concatenated name and phone if provided
              // These are optional in rules and safe for signed-in users
              // Avoid writing role from client
              // Additional custom fields are allowed
              fullName: `${formData.firstName} ${formData.lastName}`.trim(),
              phone: formData.phone || undefined,
            } as any);
          }
        } catch {}
        // Guide user to OTP verification page
        onPageChange('verify-email');
      }
    } catch (err: any) {
      setLoginError(err?.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setInfoMessage('');
    setLoginError('');
    // Send user to the OTP page to manage resends/verification there
    onPageChange('verify-email');
  };

  const benefits = [
    'Priority visa processing',
    'Dedicated premium support',
    'Document management system',
    'Real-time application tracking',
    'Expert consultation calls',
    'Global concierge services'
  ];

  return (
    <div className="min-h-screen flex relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-red-50/30 dark:from-slate-950 dark:via-gray-900 dark:to-red-950/20">
        <div className="absolute inset-0">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-32 h-32 bg-gradient-to-r from-red-500/10 to-pink-500/10 rounded-full blur-xl"
              animate={{
                x: [0, 100, -100, 0],
                y: [0, -100, 100, 0],
                scale: [1, 1.2, 0.8, 1],
              }}
              transition={{
                duration: 10 + i * 2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.5,
              }}
              style={{
                left: `${20 + i * 15}%`,
                top: `${10 + i * 10}%`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          {/* Logo */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center space-x-3 mb-8"
          >
            <motion.div 
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.8 }}
              className="w-12 h-12 bg-gradient-to-br from-red-500 via-pink-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-xl"
            >
              <Globe className="w-7 h-7 text-white" />
            </motion.div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                United Global Services
              </h1>
              <p className="text-sm bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent font-medium">
                inspiring borderless thinking
              </p>
            </div>
          </motion.div>

          <Card className="border-0 shadow-none bg-transparent backdrop-blur-0">
            <CardHeader className="px-0 pb-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <CardTitle className="text-4xl md:text-5xl tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  {type === 'signin' ? 'Welcome back' : 'Join our premium community'}
                </CardTitle>
                <CardDescription className="text-lg md:text-xl mt-3 text-muted-foreground">
                  {type === 'signin' 
                    ? 'Sign in to access your luxury visa portal'
                    : 'Experience world-class visa and immigration services'
                  }
                </CardDescription>
              </motion.div>
            </CardHeader>

            <CardContent className="px-0">
              <form onSubmit={handleSubmit} className="space-y-7">

                {/* Error Message */}
                <AnimatePresence>
                  {(loginError || authError) && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-xl p-4"
                    >
                      <div className="flex items-center space-x-3">
                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                        <p className="text-sm text-red-800 dark:text-red-200">{loginError || authError}</p>
                      </div>
                      {/* Resend verification helper */}
                      {type === 'signin' && (loginError.toLowerCase().includes('verify your email')) && (
                        <div className="mt-3 flex items-center justify-between">
                          <p className="text-xs text-red-700 dark:text-red-300">Haven't received the email?</p>
                          <Button type="button" variant="outline" size="sm" className="border-red-300 text-red-700 dark:text-red-300" onClick={handleResendVerification} disabled={isLoading || authLoading}>
                            Resend verification
                          </Button>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {infoMessage && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4"
                    >
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                        <p className="text-sm text-emerald-800 dark:text-emerald-200">{infoMessage}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Core Credentials */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm">Email</Label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@company.com"
                        className="pl-10 bg-transparent border-0 border-b border-black/10 dark:border-white/10 rounded-none focus-visible:ring-0"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm">Password</Label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        className="pl-10 pr-10 bg-transparent border-0 border-b border-black/10 dark:border-white/10 rounded-none focus-visible:ring-0"
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        required
                      />
                      <button type="button" aria-label="Toggle password" onClick={() => setShowPassword((v) => !v)} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {type === 'signin' && (
                      <div className="flex justify-end">
                        <Button variant="link" className="px-0 text-xs bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent">Forgot password?</Button>
                      </div>
                    )}
                  </div>
                </motion.div>

                {type === 'signup' && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="space-y-5"
                  >
                    {/* Names */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName" className="text-sm">First name</Label>
                        <div className="relative">
                          <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                          <Input
                            id="firstName"
                            placeholder="John"
                            className="pl-10 bg-transparent border-0 border-b border-black/10 dark:border-white/10 rounded-none focus-visible:ring-0"
                            value={formData.firstName}
                            onChange={(e) => handleInputChange('firstName', e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName" className="text-sm">Last name</Label>
                        <div className="relative">
                          <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                          <Input
                            id="lastName"
                            placeholder="Doe"
                            className="pl-10 bg-transparent border-0 border-b border-black/10 dark:border-white/10 rounded-none focus-visible:ring-0"
                            value={formData.lastName}
                            onChange={(e) => handleInputChange('lastName', e.target.value)}
                            required
                          />
                        </div>
                      </div>
                    </div>

                    {/* Phone */}
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-sm">Phone (optional)</Label>
                      <div className="relative">
                        <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="+1 (555) 000-0000"
                          className="pl-10 bg-transparent border-0 border-b border-black/10 dark:border-white/10 rounded-none focus-visible:ring-0"
                          value={formData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Confirm Password */}
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-sm">Confirm password</Label>
                      <div className="relative">
                        <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <Input
                          id="confirmPassword"
                          type="password"
                          placeholder="••••••••"
                          className="pl-10 bg-transparent border-0 border-b border-black/10 dark:border-white/10 rounded-none focus-visible:ring-0"
                          value={formData.confirmPassword}
                          onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    {/* Agreements */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.9 }}
                      className="space-y-4"
                    >
                      <div className="flex items-start space-x-3">
                        <Checkbox 
                          id="terms" 
                          checked={formData.agreeToTerms}
                          onCheckedChange={(checked) => handleInputChange('agreeToTerms', checked as boolean)}
                          required
                        />
                        <Label htmlFor="terms" className="text-sm leading-relaxed">
                          I agree to UGS's{' '}
                          <Button variant="link" className="px-0 text-sm h-auto p-0 bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent">
                            Terms of Service
                          </Button>{' '}
                          and{' '}
                          <Button variant="link" className="px-0 text-sm h-auto p-0 bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent">
                            Privacy Policy
                          </Button>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Checkbox 
                          id="newsletter" 
                          checked={formData.newsletterOptIn}
                          onCheckedChange={(checked) => handleInputChange('newsletterOptIn', checked as boolean)}
                        />
                        <Label htmlFor="newsletter" className="text-sm">
                          Send me premium updates and exclusive offers
                        </Label>
                      </div>
                    </motion.div>
                  </motion.div>
                )}

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: type === 'signup' ? 1.0 : 0.7 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 shadow-lg" 
                    size="lg"
                    disabled={isLoading || authLoading}
                  >
                    {isLoading || authLoading ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                      />
                    ) : (
                      <>
                        {type === 'signin' ? 'Sign In to Portal' : 'Join Premium Community'}
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </>
                    )}
                  </Button>
                </motion.div>

                {/* Removed social sign-in to enforce Gmail-only email/password + OTP flow */}

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: type === 'signup' ? 1.2 : 0.9 }}
                  className="text-center text-sm text-gray-600 dark:text-gray-400"
                >
                  {type === 'signin' ? "Don't have an account? " : 'Already have an account? '}
                  <motion.div whileHover={{ scale: 1.05 }}>
                    <Button 
                      variant="link" 
                      className="px-0 text-sm h-auto p-0 bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent font-semibold"
                      onClick={() => onPageChange(type === 'signin' ? 'signup' : 'signin')}
                    >
                      {type === 'signin' ? 'Join our premium community' : 'Sign in to your account'}
                    </Button>
                  </motion.div>
                </motion.div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Right side - Luxury Benefits */}
      <motion.div 
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="hidden lg:flex flex-1 bg-gradient-to-br from-red-500/5 via-pink-50/80 to-orange-50/60 dark:from-red-950/10 dark:via-pink-950/20 dark:to-orange-950/10 items-center justify-center p-8 relative"
      >
        <div className="max-w-md space-y-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-6"
          >
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-xl">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  {type === 'signin' ? 'Welcome Back' : 'Join the Elite'}
                </h2>
                <p className="text-gray-600 dark:text-gray-400">Premium visa services await</p>
              </div>
            </div>
            
            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
              {type === 'signin' 
                ? 'Access your personalized luxury dashboard with premium features and white-glove service.'
                : 'Experience world-class visa services with our exclusive premium community benefits.'
              }
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="space-y-4"
          >
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
              <Sparkles className="w-5 h-5 mr-2 text-yellow-500" />
              Premium Benefits
            </h3>
            <div className="space-y-3">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  className="flex items-center space-x-3"
                >
                  <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-gray-700 dark:text-gray-300">{benefit}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
            className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-800/20 shadow-2xl"
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">Enterprise Security</h4>
                <p className="text-xs text-gray-600 dark:text-gray-400">Bank-level encryption</p>
              </div>
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Your personal information is protected with military-grade encryption and never shared with third parties.
            </p>
          </motion.div>
        </div>

        {/* Floating Elements */}
        <motion.div
          animate={{ 
            y: [0, -20, 0],
            rotate: [0, 5, 0] 
          }}
          transition={{ 
            duration: 6, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
          className="absolute top-20 right-20 w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-2xl opacity-20 blur-sm"
        />
        <motion.div
          animate={{ 
            y: [0, 20, 0],
            rotate: [0, -5, 0] 
          }}
          transition={{ 
            duration: 8, 
            repeat: Infinity, 
            ease: "easeInOut",
            delay: 2 
          }}
          className="absolute bottom-32 left-16 w-12 h-12 bg-gradient-to-r from-purple-400 to-indigo-400 rounded-full opacity-20 blur-sm"
        />
      </motion.div>
    </div>
  );
}