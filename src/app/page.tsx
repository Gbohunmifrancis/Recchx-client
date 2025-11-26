'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Zap, Target, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/glass-card';
import Link from 'next/link';
import Image from 'next/image';

const features = [
  {
    icon: Sparkles,
    title: 'AI-Powered Personalization',
    description: 'Craft personalized emails that resonate with each prospect automatically.',
  },
  {
    icon: Zap,
    title: 'Automated Sequences',
    description: 'Set up multi-step campaigns that run on autopilot.',
  },
  {
    icon: Target,
    title: 'Smart Targeting',
    description: 'Reach the right people at the right time with intelligent targeting.',
  },
  {
    icon: BarChart3,
    title: 'Real-time Analytics',
    description: 'Track opens, clicks, and replies with detailed insights.',
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Hero Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat blur-sm"
          style={{
            backgroundImage: 'url("https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1920&h=1080&fit=crop&q=80")',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/70 via-slate-800/75 to-slate-900/80" />
        {/* Animated gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/10 via-transparent to-blue-500/10" />
      </div>

      {/* Floating decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
        <motion.div
          animate={{ y: [0, -30, 0], rotate: [0, 10, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-20 left-20 w-64 h-64 bg-blue-400/30 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ y: [0, 30, 0], rotate: [0, -10, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-20 right-20 w-80 h-80 bg-emerald-400/30 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ x: [0, 20, 0], y: [0, -20, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/2 left-1/3 w-48 h-48 bg-purple-400/20 rounded-full blur-2xl"
        />
      </div>

      {/* Hero Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        {/* Navigation */}
        <nav className="flex items-center justify-between mb-16">
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-4xl md:text-5xl font-bold text-white drop-shadow-2xl"
          >
            <span className="text-white">Recch</span>
            <span className="text-emerald-400">x</span>
          </motion.h1>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4"
          >
            <Link href="/auth">
              <Button variant="ghost" className="text-white hover:bg-white/20">Sign In</Button>
            </Link>
            <Link href="/auth">
              <Button variant="primary">Get Started</Button>
            </Link>
          </motion.div>
        </nav>

        {/* Hero Content */}
        <div className="text-center max-w-4xl mx-auto space-y-8 mb-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <h2 className="text-5xl md:text-7xl font-bold text-white leading-tight drop-shadow-2xl">
              Transform Your
              <br />
              <span className="text-yellow-300 drop-shadow-lg">Outreach Campaigns</span>
            </h2>
            <p className="text-xl text-white/95 max-w-2xl mx-auto drop-shadow-lg">
              AI-powered cold email platform that helps you connect with prospects,
              automate follow-ups, and close more deals.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/auth">
              <Button variant="primary" size="lg" className="text-lg px-8">
                Start Free Trial
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="secondary" size="lg" className="text-lg px-8">
                View Demo
              </Button>
            </Link>
          </motion.div>
        </div>

        {/* Dashboard Preview */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="relative"
        >
          <GlassCard variant="strong" className="p-4 shadow-2xl">
            <div className="aspect-video bg-gradient-to-br from-sky-100 to-blue-100 rounded-xl overflow-hidden relative">
              <Image
                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=675&fit=crop"
                alt="Dashboard Preview"
                fill
                className="object-cover opacity-80"
                unoptimized
              />
            </div>
          </GlassCard>
          {/* Floating stats */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute -left-8 top-1/4 hidden lg:block"
          >
            <GlassCard className="p-4 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 bg-green-100 text-green-600 rounded-lg flex items-center justify-center">
                  <BarChart3 className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs text-slate-600">Open Rate</p>
                  <p className="text-2xl font-bold text-slate-800">52.3%</p>
                </div>
              </div>
            </GlassCard>
          </motion.div>
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 3.5, repeat: Infinity }}
            className="absolute -right-8 bottom-1/4 hidden lg:block"
          >
            <GlassCard className="p-4 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 bg-sky-100 text-sky-600 rounded-lg flex items-center justify-center">
                  <Target className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs text-slate-600">Replies</p>
                  <p className="text-2xl font-bold text-slate-800">+32</p>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </motion.div>

        {/* Features Grid */}
        <div className="mt-32 mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h3 className="text-4xl font-bold text-white mb-4 drop-shadow-lg">
              Everything You Need to Succeed
            </h3>
            <p className="text-xl text-white/90 drop-shadow-md">
              Powerful features to supercharge your outreach
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <GlassCard className="p-6 h-full hover:scale-105 transition-transform duration-300">
                  <div className="p-3 bg-sky-100 text-sky-600 rounded-xl w-fit mb-4">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h4 className="text-xl font-bold text-slate-800 mb-2">{feature.title}</h4>
                  <p className="text-slate-600">{feature.description}</p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <GlassCard className="p-12 bg-gradient-to-br from-slate-800/90 via-slate-700/90 to-emerald-900/90 text-white border-emerald-500/30 shadow-2xl">
            <h3 className="text-4xl font-bold mb-4">Ready to Get Started?</h3>
            <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
              Join thousands of professionals who are already transforming their outreach with Recchx
            </p>
            <Link href="/auth">
              <Button variant="secondary" size="lg" className="text-lg px-8 bg-emerald-500 text-white hover:bg-emerald-600 border-none shadow-lg shadow-emerald-500/30">
                Start Your Free Trial
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}
