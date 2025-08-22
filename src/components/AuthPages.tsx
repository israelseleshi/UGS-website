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
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../lib/auth';
import { upsertUser } from '../lib/db';
import { auth } from '../lib/firebase';
import { updateProfile, reload } from 'firebase/auth';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './dialog';

interface AuthPagesProps {
  type: 'signin' | 'signup';
  onPageChange: (page: string) => void;
  onAdminLogin?: () => void;
  onUserLogin?: () => void;
}

export function AuthPages({ type, onPageChange, onAdminLogin, onUserLogin }: AuthPagesProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [tosOpen, setTosOpen] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMessage, setForgotMessage] = useState('');
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

  const { signInWithEmail, signUpWithEmail, error: authError, loading: authLoading, resetPassword } = useAuth();

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
        // Basic email validation (and hint for Gmail-only if desired)
        const email = (formData.email || '').trim();
        if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
          throw new Error('Please enter a valid email address.');
        }
        // Ensure passwords match
        if ((formData.password || '').trim() !== (formData.confirmPassword || '').trim()) {
          throw new Error('Passwords do not match.');
        }
        await signUpWithEmail(formData.email, formData.password);
        // Save profile fields to Firestore (users/{uid})
        try {
          const u = auth?.currentUser;
          if (u) {
            // Update Firebase Auth display name so the header shows first name instead of email
            const fullName = `${(formData.firstName || '').trim()} ${(formData.lastName || '').trim()}`.trim();
            if (fullName) {
              try {
                await updateProfile(u, { displayName: fullName });
                try { await reload(u); } catch {}
              } catch {}
            }
            await upsertUser({
              uid: u.uid,
              email: u.email ?? formData.email,
              firstName: formData.firstName?.trim() || undefined,
              lastName: formData.lastName?.trim() || undefined,
              // store concatenated name and phone if provided
              // These are optional in rules and safe for signed-in users
              // Avoid writing role from client
              // Additional custom fields are allowed
              fullName: fullName,
              phone: formData.phone || undefined,
              photoURL: u.photoURL ?? null,
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

  // Removed premium/luxury benefits section for a standard login/signup experience

  return (
    <div className="min-h-screen flex relative overflow-hidden">
      {/* Static Background (animated blobs removed) */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-red-50/30 dark:from-slate-950 dark:via-gray-900 dark:to-red-950/20" />

      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center px-6 sm:px-8 lg:px-12 py-8 relative z-10">
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
                  {type === 'signin' ? 'Welcome back' : 'Create your account'}
                </CardTitle>
                <CardDescription className="text-lg md:text-xl mt-3 text-muted-foreground">
                  {type === 'signin' 
                    ? 'Sign in to access your portal'
                    : 'Create your account to get started'
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

                {/* Core Credentials (signin only) */}
                {type === 'signin' && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm">Email <span className="text-red-500">*</span></Label>
                      <div className="relative">
                        <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="you@company.com"
                          className="pl-10 bg-transparent border-0 border-b rounded-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:border-primary border-gray-400 dark:border-gray-600"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-sm">Password <span className="text-red-500">*</span></Label>
                      <div className="relative">
                        <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <Input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          className="pl-10 pr-10 bg-transparent border-0 border-b rounded-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:border-primary border-gray-400 dark:border-gray-600"
                          value={formData.password}
                          onChange={(e) => handleInputChange('password', e.target.value)}
                          required
                        />
                        <button type="button" aria-label="Toggle password" onClick={() => setShowPassword((v) => !v)} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      <div className="flex justify-end">
                        <Button type="button" onClick={() => setForgotOpen(true)} variant="link" className="px-0 text-xs bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent">Forgot password?</Button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {type === 'signup' && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="space-y-5"
                  >
                    {/* Names (required) */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName" className="text-sm">First name <span className="text-red-500">*</span></Label>
                        <div className="relative">
                          <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                          <Input
                            id="firstName"
                            placeholder="John"
                            className="pl-10 bg-transparent border-0 border-b rounded-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:border-primary border-gray-400 dark:border-gray-600"
                            value={formData.firstName}
                            onChange={(e) => handleInputChange('firstName', e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName" className="text-sm">Last name <span className="text-red-500">*</span></Label>
                        <div className="relative">
                          <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                          <Input
                            id="lastName"
                            placeholder="Doe"
                            className="pl-10 bg-transparent border-0 border-b rounded-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:border-primary border-gray-400 dark:border-gray-600"
                            value={formData.lastName}
                            onChange={(e) => handleInputChange('lastName', e.target.value)}
                            required
                          />
                        </div>
                      </div>
                    </div>

                    {/* Email (required) */}
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm">Email <span className="text-red-500">*</span></Label>
                      <div className="relative">
                        <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="you@company.com"
                          className="pl-10 bg-transparent border-0 border-b rounded-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:border-primary border-gray-400 dark:border-gray-600"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    {/* Password (required) */}
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-sm">Password <span className="text-red-500">*</span></Label>
                      <div className="relative">
                        <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <Input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          className="pl-10 pr-10 bg-transparent border-0 border-b rounded-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:border-primary border-gray-400 dark:border-gray-600"
                          value={formData.password}
                          onChange={(e) => handleInputChange('password', e.target.value)}
                          required
                        />
                        <button type="button" aria-label="Toggle password" onClick={() => setShowPassword((v) => !v)} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Confirm Password (required) */}
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-sm">Confirm password <span className="text-red-500">*</span></Label>
                      <div className="relative">
                        <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          className="pl-10 pr-10 bg-transparent border-0 border-b rounded-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:border-primary border-gray-400 dark:border-gray-600"
                          value={formData.confirmPassword}
                          onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                          required
                        />
                        <button type="button" aria-label="Toggle confirm password" onClick={() => setShowConfirmPassword((v) => !v)} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Phone (optional) */}
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-sm">Phone (optional)</Label>
                      <div className="relative">
                        <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="+1 (555) 000-0000"
                          className="pl-10 bg-transparent border-0 border-b rounded-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:border-primary border-gray-400 dark:border-gray-600"
                          value={formData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
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
                      <div className="flex items-start gap-3">
                        <Checkbox 
                          id="terms" 
                          checked={formData.agreeToTerms}
                          onCheckedChange={(checked) => handleInputChange('agreeToTerms', checked as boolean)}
                          required
                        />
                        <Label htmlFor="terms" className="text-sm leading-relaxed">
                          I agree to UGS's{' '}
                          <button type="button" onClick={() => setTosOpen(true)} className="px-0 text-sm h-auto p-0 bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent underline">
                            Terms of Service
                          </button>{' '}
                          and{' '}
                          <button type="button" onClick={() => setPrivacyOpen(true)} className="px-0 text-sm h-auto p-0 bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent underline">
                            Privacy Policy
                          </button>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Checkbox 
                          id="newsletter" 
                          checked={formData.newsletterOptIn}
                          onCheckedChange={(checked) => handleInputChange('newsletterOptIn', checked as boolean)}
                        />
                        <Label htmlFor="newsletter" className="text-sm">
                          Send me updates and offers
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
                        {type === 'signin' ? 'Sign In' : 'Create Account'}
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
                      {type === 'signin' ? 'Create an account' : 'Sign in to your account'}
                    </Button>
                  </motion.div>
                </motion.div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Right side removed to keep a single centered column layout */}

      {/* Terms of Service Dialog */}
      <Dialog open={tosOpen} onOpenChange={setTosOpen}>
        <DialogContent className="backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle>UGS Terms of Service</DialogTitle>
            <DialogDescription>Sample summary of our services and commitments.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>United Global Services (UGS) provides visa advisory, document preparation, and application concierge services. We are not a government agency and do not guarantee visa approvals.</p>
            <p>By using our services, you authorize UGS to securely handle your documents and submit applications on your behalf where applicable. Fees paid cover service time and platform use.</p>
            <p>Processing times are estimated and subject to consulate schedules. You agree to provide accurate information and acknowledge that false information may result in rejection.</p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Privacy Policy Dialog */}
      <Dialog open={privacyOpen} onOpenChange={setPrivacyOpen}>
        <DialogContent className="backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle>UGS Privacy Policy</DialogTitle>
            <DialogDescription>How we collect, use, and protect your data.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>We collect personal information such as your name, contact details, and travel documents solely to deliver visa and immigration services.</p>
            <p>Your data is encrypted in transit and at rest. We do not sell your data. Limited sharing may occur with consular authorities and trusted partners as required to deliver services.</p>
            <p>You may request deletion of your account or data at any time, subject to legal and regulatory retention requirements.</p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Forgot Password Dialog */}
      <Dialog open={forgotOpen} onOpenChange={setForgotOpen}>
        <DialogContent className="backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle>Reset your password</DialogTitle>
            <DialogDescription>Enter your account email. We'll send you a secure reset link.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {forgotMessage && (
              <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-3 text-sm text-emerald-800 dark:text-emerald-200">
                {forgotMessage}
              </div>
            )}
            {!!loginError && (
              <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-xl p-3 text-sm text-red-800 dark:text-red-200">
                {loginError}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="forgotEmail" className="text-sm">Email</Label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input
                  id="forgotEmail"
                  type="email"
                  placeholder="you@company.com"
                  className="pl-10 bg-transparent border border-gray-400 dark:border-gray-600 rounded-md focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:border-primary"
                  value={forgotEmail}
                  onChange={(e) => { setForgotEmail(e.target.value); setLoginError(''); setForgotMessage(''); }}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setForgotOpen(false)} disabled={forgotLoading}>Cancel</Button>
              <Button
                type="button"
                onClick={async () => {
                  setLoginError('');
                  setForgotMessage('');
                  setForgotLoading(true);
                  try {
                    await resetPassword(forgotEmail);
                    setForgotMessage('If an account exists for this email, a reset link has been sent. Please check your inbox.');
                  } catch (e: any) {
                    setLoginError(e?.message || 'Unable to send reset email.');
                  } finally {
                    setForgotLoading(false);
                  }
                }}
                disabled={forgotLoading}
                className="bg-gradient-to-r from-red-500 to-pink-500"
              >
                {forgotLoading ? 'Sending…' : 'Send reset link'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}