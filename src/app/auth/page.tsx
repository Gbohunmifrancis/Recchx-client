'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Loader2 } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/auth-context';
import Image from 'next/image';

export default function AuthPage() {
  const { login, signup } = useAuth();
  const [isLogin, setIsLogin] = React.useState(true);
  const [showPassword, setShowPassword] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [apiError, setApiError] = React.useState('');
  const [formData, setFormData] = React.useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const passwordRules = [
    { rule: 'At least 8 characters', test: (pwd: string) => pwd.length >= 8 },
    { rule: 'One uppercase letter', test: (pwd: string) => /[A-Z]/.test(pwd) },
    { rule: 'One number', test: (pwd: string) => /\d/.test(pwd) },
  ];

  const validatePassword = (password: string) => {
    const failedRules = passwordRules.filter(r => !r.test(password));
    if (failedRules.length > 0) {
      return `Password must contain: ${failedRules.map(r => r.rule).join(', ')}`;
    }
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError('');
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (!isLogin) {
      const passwordError = validatePassword(formData.password);
      if (passwordError) newErrors.password = passwordError;
    }

    if (!isLogin) {
      if (!formData.firstName) newErrors.firstName = 'First name is required';
      if (!formData.lastName) newErrors.lastName = 'Last name is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);

    try {
      if (isLogin) {
        await login({
          email: formData.email,
          password: formData.password,
        });
      } else {
        await signup({
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          password: formData.password,
        });
      }
    } catch (error: any) {
      
      // Extract error message from various possible error structures
      let errorMessage = `${isLogin ? 'Login' : 'Registration'} failed. Please try again.`;
      
      if (error.response?.data) {
        // Check for different error response formats
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (error.response.data.detail) {
          // ProblemDetails format
          errorMessage = error.response.data.detail;
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.data.title) {
          errorMessage = error.response.data.title;
        } else if (error.response.data.error) {
          errorMessage = error.response.data.error;
        } else if (error.response.data.errors) {
          // Handle validation errors
          const errors = error.response.data.errors;
          const firstErrorKey = Object.keys(errors)[0];
          const firstError = errors[firstErrorKey];
          if (Array.isArray(firstError) && firstError.length > 0) {
            errorMessage = firstError[0] as string;
          } else if (typeof firstError === 'string') {
            errorMessage = firstError;
          } else {
            errorMessage = error.response.data.title || JSON.stringify(errors);
          }
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      // Handle specific HTTP status codes
      if (error.response?.status === 409) {
        errorMessage = 'An account with this email already exists. Please login instead.';
      } else if (error.response?.status === 400) {
        // Keep the extracted error message for 400 errors
        if (errorMessage.toLowerCase().includes('email') && (errorMessage.toLowerCase().includes('exist') || errorMessage.toLowerCase().includes('already') || errorMessage.toLowerCase().includes('taken'))) {
          errorMessage = 'An account with this email already exists. Please login instead.';
        }
      } else if (error.response?.status === 401 && errorMessage.toLowerCase().includes('invalid')) {
        errorMessage = 'Invalid email or password. Please try again.';
      } else if (!error.response) {
        errorMessage = 'Network error. Please check your connection and try again.';
      }
      
      setApiError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setErrors({});
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 overflow-hidden relative">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat blur-sm"
          style={{
            backgroundImage: 'url("https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1920&h=1080&fit=crop&q=80")',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/70 via-slate-800/75 to-slate-900/80" />
      </div>

      {/* Floating decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
        <motion.div
          animate={{ y: [0, -20, 0], rotate: [0, 5, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-20 left-10 w-32 h-32 bg-emerald-300/30 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ y: [0, 20, 0], rotate: [0, -5, 0], scale: [1.1, 1, 1.1] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-20 right-10 w-40 h-40 bg-teal-300/30 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ y: [0, -15, 0], x: [0, 10, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/2 right-1/4 w-24 h-24 bg-blue-300/30 rounded-full blur-2xl"
        />
        <motion.div
          animate={{ x: [-10, 10, -10], y: [10, -10, 10] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-1/3 left-1/4 w-36 h-36 bg-cyan-300/20 rounded-full blur-3xl"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative z-10"
      >
        <GlassCard variant="strong" className="p-8 space-y-6">
          {/* Logo / Brand */}
          <div className="text-center space-y-2">
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
              className="flex justify-center mb-4"
            >
              <div className="text-5xl font-bold">
                <span className="text-slate-700">Recch</span>
                <span className="text-emerald-500">X</span>
              </div>
            </motion.div>
            <p className="text-slate-600">AI-Powered Recruitment Outreach</p>
          </div>

          {/* Toggle Tabs */}
          <div className="flex gap-2 p-1 glass rounded-xl">
            <button
              onClick={() => isLogin || toggleMode()}
              className={`flex-1 py-2.5 rounded-lg font-medium transition-all duration-300 ${
                isLogin
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => !isLogin || toggleMode()}
              className={`flex-1 py-2.5 rounded-lg font-medium transition-all duration-300 ${
                !isLogin
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              Register
            </button>
          </div>

          {/* Error Message */}
          {apiError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm"
            >
              {apiError}
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="grid grid-cols-2 gap-3"
              >
                <div>
                  <Input
                    placeholder="First Name"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    error={errors.firstName}
                  />
                </div>
                <div>
                  <Input
                    placeholder="Last Name"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    error={errors.lastName}
                  />
                </div>
              </motion.div>
            )}

            <div>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`w-full pl-11 pr-4 py-2.5 rounded-xl glass-strong text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all ${
                    errors.email ? 'ring-2 ring-red-400' : ''
                  }`}
                />
              </div>
              {errors.email && <p className="mt-1.5 text-sm text-red-500">{errors.email}</p>}
            </div>

            <div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className={`w-full pl-11 pr-11 py-2.5 rounded-xl glass-strong text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all ${
                    errors.password ? 'ring-2 ring-red-400' : ''
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && <p className="mt-1.5 text-sm text-red-500">{errors.password}</p>}
            </div>

            {/* Password Requirements (only for Register) */}
            {!isLogin && formData.password && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-2"
              >
                <p className="text-xs text-slate-600 font-medium">Password Requirements:</p>
                <div className="space-y-1">
                  {passwordRules.map((rule, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs">
                      <div
                        className={`h-1.5 w-1.5 rounded-full ${
                          rule.test(formData.password) ? 'bg-green-500' : 'bg-slate-300'
                        }`}
                      />
                      <span
                        className={
                          rule.test(formData.password) ? 'text-green-600' : 'text-slate-500'
                        }
                      >
                        {rule.rule}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {isLogin && (
              <div className="text-right">
                <a href="#" className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">
                  Forgot password?
                </a>
              </div>
            )}

            <Button 
              type="submit" 
              variant="primary" 
              size="lg" 
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  {isLogin ? 'Signing in...' : 'Creating account...'}
                </>
              ) : (
                <>
                  {isLogin ? 'Sign In' : 'Create Account'}
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </Button>
          </form>
        </GlassCard>

        {/* Footer */}
        <p className="text-center mt-6 text-sm text-slate-600">
          By continuing, you agree to our{' '}
          <a href="#" className="text-emerald-600 hover:text-emerald-700 font-medium">
            Terms
          </a>{' '}
          and{' '}
          <a href="#" className="text-emerald-600 hover:text-emerald-700 font-medium">
            Privacy Policy
          </a>
        </p>
      </motion.div>
    </div>
  );
}
