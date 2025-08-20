import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card';
import { Input } from './input';
import { Label } from './label';
import { Separator } from './separator';
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

interface AuthPagesProps {
  type: 'signin' | 'signup';
  onPageChange: (page: string) => void;
  onAdminLogin?: () => void;
  onUserLogin?: () => void;
}

export function AuthPages({ type, onPageChange, onAdminLogin, onUserLogin }: AuthPagesProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
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

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (loginError) setLoginError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoading(true);

    // Simulate loading delay for better UX
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (type === 'signin') {
      // Regular user login simulation (no demo accounts)
      if (formData.email && formData.password) {
        console.log('User login successful:', { email: formData.email });
        setIsLoading(false);
        if (onUserLogin) {
          onUserLogin();
        }
      } else {
        setLoginError('Please enter valid credentials');
        setIsLoading(false);
      }
    } else {
      // Sign up logic
      if (formData.agreeToTerms) {
        console.log('User registration:', formData);
        setIsLoading(false);
        onPageChange('signin');
      } else {
        setLoginError('Please agree to the terms and conditions');
        setIsLoading(false);
      }
    }
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

          <Card className="border-0 shadow-2xl bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl">
            <CardHeader className="px-0 pb-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <CardTitle className="text-3xl bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  {type === 'signin' ? 'Welcome back' : 'Join our premium community'}
                </CardTitle>
                <CardDescription className="text-base mt-2">
                  {type === 'signin' 
                    ? 'Sign in to access your luxury visa portal'
                    : 'Experience world-class visa and immigration services'
                  }
                </CardDescription>
              </motion.div>
            </CardHeader>

            <CardContent className="px-0">
              <form onSubmit={handleSubmit} className="space-y-6">

                {/* Error Message */}
                <AnimatePresence>
                  {loginError && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-xl p-4"
                    >
                      <div className="flex items-center space-x-3">
                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                        <p className="text-sm text-red-800 dark:text-red-200">{loginError}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {type === 'signup' && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="grid grid-cols-2 gap-4"
                  >
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <div className="relative">
                        <User className="w-4 h-4 absolute left-3 top-3.5 text-gray-400" />
                        <motion.div whileFocus={{ scale: 1.02 }}>
                          <Input
                            id="firstName"
                            placeholder="John"
                            className="pl-10 bg-white/50 dark:bg-gray-800/50 border-white/20 dark:border-gray-700/20 backdrop-blur-sm"
                            value={formData.firstName}
                            onChange={(e) => handleInputChange('firstName', e.target.value)}
                            required
                          />
                        </motion.div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <div className="relative">
                        <User className="w-4 h-4 absolute left-3 top-3.5 text-gray-400" />
                        <motion.div whileFocus={{ scale: 1.02 }}>
                          <Input
                            id="lastName"
                            placeholder="Doe"
                            className="pl-10 bg-white/50 dark:bg-gray-800/50 border-white/20 dark:border-gray-700/20 backdrop-blur-sm"
                            value={formData.lastName}
                            onChange={(e) => handleInputChange('lastName', e.target.value)}
                            required
                          />
                        </motion.div>
                      </div>
                    </div>
                  </motion.div>
                )}

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: type === 'signup' ? 0.5 : 0.4 }}
                  className="space-y-2"
                >
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-3.5 text-gray-400" />
                    <motion.div whileFocus={{ scale: 1.02 }}>
                      <Input
                        id="email"
                        type="email"
                        placeholder="john@example.com"
                        className="pl-10 bg-white/50 dark:bg-gray-800/50 border-white/20 dark:border-gray-700/20 backdrop-blur-sm"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        required
                      />
                    </motion.div>
                  </div>
                </motion.div>

                {type === 'signup' && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="space-y-2"
                  >
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="relative">
                      <Phone className="w-4 h-4 absolute left-3 top-3.5 text-gray-400" />
                      <motion.div whileFocus={{ scale: 1.02 }}>
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="+1 (555) 000-0000"
                          className="pl-10 bg-white/50 dark:bg-gray-800/50 border-white/20 dark:border-gray-700/20 backdrop-blur-sm"
                          value={formData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                        />
                      </motion.div>
                    </div>
                  </motion.div>
                )}

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: type === 'signup' ? 0.7 : 0.5 }}
                  className="space-y-2"
                >
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-3.5 text-gray-400" />
                    <motion.div whileFocus={{ scale: 1.02 }}>
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        className="pl-10 pr-10 bg-white/50 dark:bg-gray-800/50 border-white/20 dark:border-gray-700/20 backdrop-blur-sm"
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        required
                      />
                    </motion.div>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </motion.button>
                  </div>
                </motion.div>

                {type === 'signup' && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="space-y-2"
                  >
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3 top-3.5 text-gray-400" />
                      <motion.div whileFocus={{ scale: 1.02 }}>
                        <Input
                          id="confirmPassword"
                          type="password"
                          placeholder="••••••••"
                          className="pl-10 bg-white/50 dark:bg-gray-800/50 border-white/20 dark:border-gray-700/20 backdrop-blur-sm"
                          value={formData.confirmPassword}
                          onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                          required
                        />
                      </motion.div>
                    </div>
                  </motion.div>
                )}

                {type === 'signin' && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-2">
                      <Checkbox id="remember" />
                      <Label htmlFor="remember" className="text-sm">Remember me</Label>
                    </div>
                    <motion.div whileHover={{ scale: 1.05 }}>
                      <Button variant="link" className="px-0 text-sm bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent hover:from-red-600 hover:to-pink-600">
                        Forgot password?
                      </Button>
                    </motion.div>
                  </motion.div>
                )}

                {type === 'signup' && (
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
                    disabled={isLoading}
                  >
                    {isLoading ? (
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

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator className="w-full" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white dark:bg-gray-900 px-2 text-gray-500">or continue with</span>
                  </div>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: type === 'signup' ? 1.1 : 0.8 }}
                  className="grid grid-cols-2 gap-4"
                >
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button variant="outline" type="button" className="w-full bg-white/50 dark:bg-gray-800/50 border-white/20 dark:border-gray-700/20 backdrop-blur-sm">
                      <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      Google
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button variant="outline" type="button" className="w-full bg-white/50 dark:bg-gray-800/50 border-white/20 dark:border-gray-700/20 backdrop-blur-sm">
                      <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.024-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.098.118.112.222.083.343-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.748-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.986C24.007 5.367 18.641.001 12.017.001z"/>
                      </svg>
                      LinkedIn
                    </Button>
                  </motion.div>
                </motion.div>

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