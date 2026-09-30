import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Film,
  Sparkles,
  ArrowRight,
  Play,
  ShieldCheck,
  Zap,
  Target,
  Users,
  Compass,
  CheckCircle2,
  ChevronDown,
  Layers,
  Award,
  Video,
  Menu,
  X,
  ExternalLink,
  Lock,
  TrendingUp,
  DollarSign,
  Package,
  Crown,
  Star,
  Rocket,
  ArrowUpRight
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Landing() {
  const { user, profile } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [openFaq, setOpenFaq] = useState(null)

  // Floating background shapes similar to Login aesthetic
  const floatingShapes = [
    { w: 320, h: 320, top: '5%', left: '-5%', rx: 8, ry: 6, dur: 12, delay: 0 },
    { w: 220, h: 220, top: '45%', right: '-3%', rx: -7, ry: 9, dur: 14, delay: 1 },
    { w: 160, h: 160, top: '75%', left: '8%', rx: 6, ry: -8, dur: 10, delay: 2 },
  ]

  const stats = [
    { value: '50+', label: 'Curated Niches', icon: Target },
    { value: '120+', label: 'Masterclass Modules', icon: Video },
    { value: '99.8%', label: 'Member Satisfaction', icon: Award },
    { value: '24/7', label: 'Priority Creator Support', icon: Zap },
  ]

  const features = [
    {
      icon: Target,
      tag: 'Niche Intelligence',
      title: 'High-Demand, Low-Competition Niches',
      description: 'Stop guessing what works. Get verified niche blueprints with real-world monetization roadmaps and research-backed data.',
    },
    {
      icon: Video,
      tag: 'Cinema-Grade Training',
      title: 'Step-by-Step Production Courses',
      description: 'Master storytelling, editing frameworks, and algorithmic engagement tactics built specifically for modern content creators.',
    },
    {
      icon: ShieldCheck,
      tag: 'Curated Secrets',
      title: 'Exclusive Playbooks & Guidelines',
      description: 'Access proprietary prompt templates, workflow guidelines, and retention hacks kept confidential from public forums.',
    },
    {
      icon: Zap,
      tag: 'Lightning Delivery',
      title: 'Actionable & Zero Fluff',
      description: 'Every resource is trimmed down to immediate execution. Implement systems in hours instead of watching weeks of theory.',
    },
    {
      icon: Layers,
      tag: 'Dynamic Progress Tracking',
      title: 'Track Modules & Level Up',
      description: 'Keep your momentum with integrated lesson tracking, downloadable assets, and structured step milestones.',
    },
    {
      icon: Users,
      tag: 'Vetted Inner Circle',
      title: 'Private Creator Ecosystem',
      description: 'A platform built for serious creators. Invitation & admin-managed access ensure unmatched signal-to-noise ratio.',
    },
    {
      icon: Compass,
      tag: 'Creator Admin Mode',
      title: 'Build & Sell Your Own Courses',
      description: 'Not just a student — become a Creator Admin. Launch your own branded niches, video courses, guidelines, and announcements within your own private workspace.',
    },
  ]

  const faqs = [
    {
      q: 'What is Azein Studio?',
      a: 'Azein Studio is a dedicated creator acceleration platform providing deep-dive niche blueprints, video production training, actionable guidelines, and creator resources in one unified hub.',
    },
    {
      q: 'How do I get an account to access the platform?',
      a: 'Accounts are provisioned directly by the Azein Studio administration. If you have been invited or enrolled in the course, use the login credentials provided to you to access your dashboard.',
    },
    {
      q: 'Is the platform accessible on smartphones and tablets?',
      a: 'Yes, 100%. Azein Studio is engineered to be fully responsive. You can watch lessons, read niche blueprints, and monitor announcements smoothly across phones, tablets, and desktops.',
    },
    {
      q: 'What kind of niches and training are covered?',
      a: 'From faceless content channels, digital product businesses, and TikTok/Reels algorithms to advanced editing styles and high-ticket monetization mechanics.',
    },
    {
      q: 'Can I create and sell my own courses on this platform?',
      a: 'Absolutely! As a Creator Admin, you get your own isolated workspace to build branded niches, upload video courses, publish guidelines, and manage your own student roster — all within the same powerful platform.',
    },
  ]

  const previewTabs = [
    {
      title: 'Niche Matrix',
      tag: 'Validated Blueprints',
      desc: 'Browse curated niches categorized by profitability, competition level, and target monetization models.',
    },
    {
      title: 'Video Modules',
      tag: 'Full HD Lessons',
      desc: 'Crystal-clear video player with complete topic breakdown, chapter marks, and attached cheat-sheets.',
    },
    {
      title: 'Tips & Guidelines',
      tag: 'Actionable Cheatsheets',
      desc: 'Proven hooks, retention formulas, algorithm survival tips, and direct downloadable reference assets.',
    },
  ]

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-void text-text-primary selection:bg-orange-500/30 selection:text-orange-400">
      {/* Background Ambience */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        {floatingShapes.map((s, idx) => (
          <motion.div
            key={idx}
            style={{
              position: 'absolute',
              top: s.top,
              left: s.left,
              right: s.right,
              width: s.w,
              height: s.h,
              borderRadius: '24%',
              background: 'radial-gradient(circle at 40% 40%, rgba(255,106,26,0.18), rgba(224,83,15,0.06), transparent 70%)',
              filter: 'blur(35px)',
            }}
            animate={{
              x: [0, s.rx * 5, 0],
              y: [0, s.ry * 5, 0],
              rotate: [0, 15, 0],
            }}
            transition={{
              duration: s.dur,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: s.delay,
            }}
          />
        ))}

        {/* Global ambient glow */}
        <div className="absolute -top-32 left-1/2 h-[45rem] w-[50rem] -translate-x-1/2 rounded-full bg-gradient-to-b from-orange-500/15 via-orange-600/5 to-transparent blur-3xl pointer-events-none" />
      </div>

      {/* Navigation Bar */}
      <header className="sticky top-0 z-50 w-full border-b border-border-soft bg-void/80 backdrop-blur-xl transition-all">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link to="/" className="group flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 via-orange-600 to-amber-glow shadow-md shadow-orange-500/25 transition-transform duration-200 group-hover:scale-105">
              <Film size={20} className="text-void" strokeWidth={2.5} />
            </div>
            <div>
              <span className="font-display text-lg font-bold tracking-tight text-text-primary transition-colors group-hover:text-orange-400">
                Azein Studio
              </span>
              <span className="hidden sm:inline-block ml-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-orange-400">
                Pro
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-text-muted">
            <a href="#features" className="transition-colors hover:text-text-primary">
              Features
            </a>
            <a href="#preview" className="transition-colors hover:text-text-primary">
              Curriculum
            </a>
            <a href="#faq" className="transition-colors hover:text-text-primary">
              FAQ
            </a>
            <a href="#fba-coaches" className="transition-colors hover:text-orange-400 font-semibold">
              For Coaches
            </a>
          </nav>

          {/* Auth CTA */}
          <div className="hidden sm:flex items-center gap-3">
            {user ? (
              <Link
                to={profile?.role === 'admin' ? '/admin' : '/dashboard'}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-2 text-sm font-semibold text-void shadow-lg shadow-orange-500/20 transition-all duration-200 hover:brightness-110 active:scale-95"
              >
                Go to Dashboard
                <ArrowRight size={15} />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="rounded-xl border border-border px-4 py-2 text-sm font-medium text-text-primary transition-all duration-200 hover:border-orange-500/50 hover:bg-surface-2"
                >
                  Sign in
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-2 text-sm font-semibold text-void shadow-lg shadow-orange-500/25 transition-all duration-200 hover:shadow-orange-500/40 active:scale-95"
                >
                  Access Hub
                  <ArrowRight size={15} />
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Navigation"
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-border-soft bg-surface-2 text-text-muted transition-colors hover:text-text-primary md:hidden"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="border-b border-border bg-surface px-4 py-5 md:hidden"
            >
              <div className="flex flex-col space-y-4">
                <a
                  href="#features"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-sm font-medium text-text-muted hover:text-text-primary"
                >
                  Features
                </a>
                <a
                  href="#preview"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-sm font-medium text-text-muted hover:text-text-primary"
                >
                  Curriculum
                </a>
                <a
                  href="#faq"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-sm font-medium text-text-muted hover:text-text-primary"
                >
                  FAQ
                </a>
                <a
                  href="#fba-coaches"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-sm font-semibold text-orange-400 hover:text-orange-300"
                >
                  🚀 For FBA Coaches
                </a>
                <div className="pt-2 border-t border-border-soft flex flex-col gap-2.5">
                  {user ? (
                    <Link
                      to={profile?.role === 'admin' ? '/admin' : '/dashboard'}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-2.5 text-sm font-semibold text-void"
                    >
                      Go to Dashboard
                      <ArrowRight size={15} />
                    </Link>
                  ) : (
                    <Link
                      to="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-2.5 text-sm font-semibold text-void"
                    >
                      Sign In to Platform
                      <ArrowRight size={15} />
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 mx-auto max-w-7xl px-4 pt-16 pb-20 sm:px-6 sm:pt-24 sm:pb-28 lg:px-8">
        <div className="flex flex-col items-center text-center">
          {/* Eyebrow badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-1.5 backdrop-blur-md"
          >
            <span className="pulse-dot" />
            <span className="font-mono text-xs font-semibold uppercase tracking-wider text-orange-400">
              The Private Niche & Creator Academy
            </span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="max-w-4xl font-display text-4xl font-extrabold tracking-tight sm:text-6xl sm:leading-[1.1] md:text-7xl"
          >
            Dominate Content Creation With{' '}
            <span className="text-gradient-flame">Battle-Tested Niches</span> & Systems.
          </motion.h1>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6 max-w-2xl text-base text-text-muted sm:text-lg md:text-xl"
          >
            Stop wasting months on saturated topics. Azein Studio equips serious creators with
            verified high-yield niches, cinematic video courses, and step-by-step monetization
            blueprints.
          </motion.p>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-8 flex flex-col sm:flex-row w-full sm:w-auto items-stretch sm:items-center justify-center gap-3 sm:gap-4"
          >
            <Link
              to={user ? (profile?.role === 'admin' ? '/admin' : '/dashboard') : '/login'}
              className="flex items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-orange-500 via-orange-600 to-amber-glow px-7 py-3.5 text-base font-bold text-void shadow-xl shadow-orange-500/25 transition-all duration-200 hover:shadow-orange-500/40 hover:scale-[1.02] active:scale-95"
            >
              {user ? 'Enter Platform' : 'Access Member Portal'}
              <ArrowRight size={18} />
            </Link>
            <a
              href="#preview"
              className="flex items-center justify-center gap-2 rounded-xl border border-border bg-surface-2/80 px-6 py-3.5 text-base font-medium text-text-primary backdrop-blur-md transition-all duration-200 hover:border-orange-500/40 hover:bg-surface-2 active:scale-95"
            >
              <Play size={16} className="text-orange-500 fill-orange-500" />
              Explore Curriculum
            </a>
          </motion.div>

          {/* Hero Badges / Assurance */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-text-faint"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 size={15} className="text-orange-500" />
              <span>Invite & Admin Verified</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={15} className="text-orange-500" />
              <span>Full HD Video Lessons</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={15} className="text-orange-500" />
              <span>Cross-Platform Responsive</span>
            </div>
          </motion.div>
        </div>

        {/* Hero Interactive App Mockup Preview */}
        <motion.div
          initial={{ opacity: 0, y: 35 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.35 }}
          className="relative mt-14 sm:mt-18"
        >
          {/* Glowing Aura around frame */}
          <div className="absolute -inset-1 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-orange-500/30 via-amber-glow/20 to-orange-700/30 blur-xl opacity-70" />

          <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-border bg-surface shadow-2xl">
            {/* Top Browser / App chrome bar */}
            <div className="flex items-center justify-between border-b border-border-soft bg-surface-2/80 px-4 py-3 backdrop-blur-md">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-danger/80" />
                <span className="h-3 w-3 rounded-full bg-amber-400/80" />
                <span className="h-3 w-3 rounded-full bg-success/80" />
                <span className="ml-3 font-mono text-[11px] text-text-faint hidden sm:inline">
                  azeinstudio.app/dashboard
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-orange-500/10 px-2.5 py-0.5 font-mono text-[10px] text-orange-400">
                  LIVE PORTAL
                </span>
              </div>
            </div>

            {/* Inner App Dashboard Mockup Showcase */}
            <div className="p-4 sm:p-7 grid grid-cols-1 lg:grid-cols-12 gap-6 bg-gradient-to-b from-surface to-surface-2/40">
              {/* Left Column: Sample Niche Spotlight */}
              <div className="lg:col-span-8 flex flex-col gap-4">
                <div className="flame-border rounded-2xl border border-border bg-surface-2 p-5 sm:p-6">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="rounded-md bg-orange-500/20 px-2 py-0.5 font-mono text-[11px] text-orange-400">
                        FEATURED MASTERCLASS
                      </span>
                      <span className="text-xs text-text-faint">• 12 Lessons</span>
                    </div>
                    <span className="font-mono text-xs text-orange-400">85% Complete</span>
                  </div>

                  <h3 className="mt-3 font-display text-xl sm:text-2xl font-bold text-text-primary">
                    Faceless Cinematic Storytelling & Viral Retention
                  </h3>
                  <p className="mt-2 text-sm text-text-muted leading-relaxed">
                    How top creators architect high-retention video hooks, edit seamless B-roll sequences, and convert attention into five-figure sponsorship contracts.
                  </p>

                  <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t border-border/60 pt-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-500/20 text-orange-400">
                        <Play size={18} fill="currentColor" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-text-primary">Module 04: Pacing & Cut Theory</p>
                        <p className="text-[11px] text-text-faint">Next video • 18m 45s</p>
                      </div>
                    </div>
                    <Link
                      to="/login"
                      className="inline-flex items-center gap-1.5 rounded-lg bg-surface-3 px-3.5 py-2 text-xs font-medium text-orange-400 transition-colors hover:bg-orange-500/20"
                    >
                      Resume Lesson
                      <ArrowRight size={13} />
                    </Link>
                  </div>
                </div>

                {/* Sub-cards row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="rounded-xl border border-border bg-surface-2/60 p-4 transition-all hover:border-orange-500/40">
                    <div className="flex items-center gap-2 text-xs font-mono text-orange-400 mb-1">
                      <Target size={14} />
                      NICHE BLUEPRINT
                    </div>
                    <h4 className="font-display font-semibold text-text-primary text-sm">
                      AI Automation Micro-SaaS
                    </h4>
                    <p className="mt-1 text-xs text-text-muted">
                      Difficulty: Medium • Monetization: High CPM & Affiliates
                    </p>
                  </div>

                  <div className="rounded-xl border border-border bg-surface-2/60 p-4 transition-all hover:border-orange-500/40">
                    <div className="flex items-center gap-2 text-xs font-mono text-orange-400 mb-1">
                      <Sparkles size={14} />
                      CREATOR GUIDELINE
                    </div>
                    <h4 className="font-display font-semibold text-text-primary text-sm">
                      The 3-Second Retention Loop
                    </h4>
                    <p className="mt-1 text-xs text-text-muted">
                      Full breakdown of visual patterns and auditory triggers.
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Column: Platform stats & Quick Access */}
              <div className="lg:col-span-4 flex flex-col gap-4">
                <div className="rounded-2xl border border-border bg-surface-2/70 p-5">
                  <h4 className="font-display font-semibold text-sm text-text-primary flex items-center justify-between">
                    <span>Recent Updates</span>
                    <span className="pulse-dot" />
                  </h4>
                  <div className="mt-4 space-y-3.5">
                    <div className="rounded-lg bg-surface-3/50 p-3 border border-border-soft">
                      <p className="text-xs font-medium text-text-primary">Q3 Monetization Playbook Added</p>
                      <p className="text-[10px] font-mono text-text-faint mt-1">2 hours ago</p>
                    </div>
                    <div className="rounded-lg bg-surface-3/50 p-3 border border-border-soft">
                      <p className="text-xs font-medium text-text-primary">New Niche: Deep-Tech Documentaries</p>
                      <p className="text-[10px] font-mono text-text-faint mt-1">Yesterday</p>
                    </div>
                  </div>
                  <Link
                    to="/login"
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 py-2.5 text-xs font-bold text-void transition-opacity hover:opacity-90"
                  >
                    View All Hub Content
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Stats Counter Bar */}
      <section className="relative z-10 border-y border-border-soft bg-surface/50 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {stats.map((item, i) => {
              const Icon = item.icon
              return (
                <div key={i} className="flex flex-col items-center text-center p-2">
                  <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-orange-500/10 text-orange-400">
                    <Icon size={18} />
                  </div>
                  <span className="font-display text-2xl sm:text-3xl font-bold text-text-primary">
                    {item.value}
                  </span>
                  <span className="mt-1 text-xs text-text-muted font-medium">{item.label}</span>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Feature Pillar Grid */}
      <section id="features" className="relative z-10 mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="font-mono text-xs uppercase tracking-wider text-orange-400 mb-2">
            Why Azein Studio
          </p>
          <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-text-primary">
            Engineered For Creators Who Play To Win
          </h2>
          <p className="mt-3 text-sm sm:text-base text-text-muted">
            Everything inside the platform is built to shave months off your learning curve and eliminate guesswork.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, idx) => {
            const Icon = feat.icon
            return (
              <motion.div
                key={idx}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
                className="flame-border flex flex-col justify-between rounded-2xl border border-border bg-surface p-6 sm:p-7 shadow-lg"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-500/10 text-orange-400">
                      <Icon size={22} />
                    </div>
                    <span className="font-mono text-[10px] uppercase tracking-wider text-orange-400/90 rounded-full border border-orange-500/20 bg-orange-500/5 px-2.5 py-1">
                      {feat.tag}
                    </span>
                  </div>
                  <h3 className="mt-5 font-display text-lg font-semibold text-text-primary">
                    {feat.title}
                  </h3>
                  <p className="mt-2 text-sm text-text-muted leading-relaxed">
                    {feat.description}
                  </p>
                </div>
              </motion.div>
            )
          })}
        </div>
      </section>

      {/* Creator Admin CTA Section */}
      <section className="relative z-10 border-t border-border-soft bg-gradient-to-b from-surface-2/40 via-surface/60 to-surface-2/30 py-20 overflow-hidden">
        {/* Background accent */}
        <div className="absolute top-0 right-0 h-80 w-80 rounded-full bg-orange-500/8 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 h-60 w-60 rounded-full bg-amber-400/6 blur-3xl pointer-events-none" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
            {/* Left Text */}
            <div className="flex-1 text-center lg:text-left">
              <span className="inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-3.5 py-1 font-mono text-[11px] uppercase tracking-wider text-orange-400 mb-5">
                <Compass size={13} />
                For Creator Admins
              </span>
              <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-text-primary">
                Launch <span className="text-gradient-flame">Your Own</span> Creator Academy
              </h2>
              <p className="mt-4 max-w-xl text-sm sm:text-base text-text-muted leading-relaxed">
                Azein Studio isn't just a course platform — it's your white-label creator business engine.
                As a Creator Admin, you get a fully isolated workspace to build niches, publish video courses,
                write guidelines, manage announcements, and onboard your own students.
              </p>

              <div className="mt-6 space-y-3">
                {[
                  'Create unlimited niches & video courses under your brand',
                  'Manage your own student roster with private access',
                  'Publish tips, guidelines & announcements to your audience',
                  'Fully isolated — your content, your students, your business',
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-orange-500" />
                    <span className="text-sm text-text-muted">{item}</span>
                  </div>
                ))}
              </div>

              <div className="mt-8">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2.5 rounded-xl bg-gradient-to-r from-orange-500 via-orange-600 to-amber-glow px-7 py-3.5 text-base font-bold text-void shadow-xl shadow-orange-500/25 transition-all duration-200 hover:shadow-orange-500/40 hover:scale-[1.02] active:scale-95"
                >
                  Get Started as Creator Admin
                  <ArrowRight size={18} />
                </Link>
              </div>
            </div>

            {/* Right Visual Card */}
            <div className="flex-1 w-full max-w-md lg:max-w-lg">
              <div className="relative">
                <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-orange-500/25 via-amber-glow/15 to-orange-700/25 blur-lg opacity-70" />
                <div className="relative rounded-2xl border border-border bg-surface p-6 sm:p-7 shadow-2xl">
                  <div className="flex items-center gap-2 mb-5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-500/15 text-orange-400">
                      <Compass size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-text-primary">Creator Admin Workspace</p>
                      <p className="text-[11px] text-text-faint font-mono">Your private control panel</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {[
                      { label: 'My Niches', count: '8 Published', icon: Target },
                      { label: 'Video Courses', count: '24 Modules', icon: Video },
                      { label: 'My Students', count: '156 Active', icon: Users },
                      { label: 'Announcements', count: '3 This Week', icon: Zap },
                    ].map((row, i) => {
                      const RowIcon = row.icon
                      return (
                        <div key={i} className="flex items-center justify-between rounded-xl border border-border-soft bg-surface-2/60 p-3.5 transition-all hover:border-orange-500/30">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/10 text-orange-400">
                              <RowIcon size={15} />
                            </div>
                            <span className="text-sm font-medium text-text-primary">{row.label}</span>
                          </div>
                          <span className="font-mono text-xs text-text-faint">{row.count}</span>
                        </div>
                      )
                    })}
                  </div>

                  <div className="mt-5 rounded-xl bg-gradient-to-r from-orange-500/10 to-amber-400/5 border border-orange-500/20 p-3.5 text-center">
                    <p className="text-xs text-orange-400 font-semibold">Your brand. Your students. Your revenue.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Curriculum / Preview Section */}
      <section id="preview" className="relative z-10 border-t border-border-soft bg-surface-2/30 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 mb-12">
            <div>
              <p className="font-mono text-xs uppercase tracking-wider text-orange-400 mb-2">
                Curriculum Breakdown
              </p>
              <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-text-primary">
                A Look Inside The Member Vault
              </h2>
            </div>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-xl bg-surface-2 border border-border px-5 py-2.5 text-sm font-medium text-text-primary transition-colors hover:border-orange-500/40"
            >
              Log in to View Full Library
              <ExternalLink size={15} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {previewTabs.map((tab, idx) => (
              <div
                key={idx}
                className="relative overflow-hidden rounded-2xl border border-border bg-surface p-6 sm:p-7 transition-all duration-300 hover:border-orange-500/50"
              >
                <div className="mb-4 inline-block font-mono text-xs font-semibold text-orange-400">
                  {tab.tag}
                </div>
                <h3 className="font-display text-xl font-bold text-text-primary">{tab.title}</h3>
                <p className="mt-2.5 text-sm text-text-muted leading-relaxed">{tab.desc}</p>
                <div className="mt-6 flex items-center gap-2 text-xs font-semibold text-orange-400">
                  <span>Protected Access</span>
                  <Lock size={13} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="relative z-10 mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <p className="font-mono text-xs uppercase tracking-wider text-orange-400 mb-2">
            Got Questions?
          </p>
          <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-text-primary">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx
            return (
              <div
                key={idx}
                className="overflow-hidden rounded-xl border border-border bg-surface transition-colors"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="flex w-full items-center justify-between p-5 text-left text-sm sm:text-base font-medium text-text-primary transition-colors hover:text-orange-400"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    size={18}
                    className={`shrink-0 transition-transform duration-200 text-text-muted ${
                      isOpen ? 'rotate-180 text-orange-400' : ''
                    }`}
                  />
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="border-t border-border-soft px-5 pb-5 pt-3 text-sm text-text-muted leading-relaxed"
                    >
                      {faq.a}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>
      </section>

      {/* FBA Coach Promotion Section */}
      <section id="fba-coaches" className="relative z-10 py-20 overflow-hidden">
        {/* Full-width animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-950/40 via-void to-amber-950/30" />
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-orange-500/10 blur-[100px] animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 h-72 w-72 rounded-full bg-amber-400/8 blur-[80px] animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Ad Badge */}
          <div className="text-center mb-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-500/20 to-amber-500/20 border border-orange-500/40 px-5 py-2 backdrop-blur-md"
            >
              <Crown size={15} className="text-amber-400" />
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-amber-400">
                Exclusive for FBA Coaches & Amazon Mentors
              </span>
              <Crown size={15} className="text-amber-400" />
            </motion.div>
          </div>

          {/* Main Promo Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            {/* Animated border glow */}
            <div className="absolute -inset-[2px] rounded-3xl bg-gradient-to-r from-orange-500 via-amber-400 to-orange-600 opacity-60 blur-sm" />
            <div className="absolute -inset-[1px] rounded-3xl bg-gradient-to-r from-orange-500 via-amber-400 to-orange-600 opacity-80" />

            <div className="relative rounded-3xl bg-gradient-to-b from-surface via-surface-2/95 to-surface overflow-hidden">
              {/* Inner background patterns */}
              <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-orange-500/5 to-transparent pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-orange-500/5 blur-3xl pointer-events-none" />

              <div className="relative p-8 sm:p-12 md:p-16">
                <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-center">
                  {/* Left: Promo Copy */}
                  <div className="flex-1 text-center lg:text-left">
                    <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-text-primary leading-[1.15]">
                      Are You an{' '}
                      <span className="relative inline-block">
                        <span className="text-gradient-flame">FBA Coach?</span>
                        <svg className="absolute -bottom-1 left-0 w-full" height="6" viewBox="0 0 200 6" fill="none">
                          <path d="M0 3C50 0.5 150 5.5 200 3" stroke="url(#underline-grad)" strokeWidth="2.5" strokeLinecap="round" />
                          <defs>
                            <linearGradient id="underline-grad" x1="0" y1="0" x2="200" y2="0">
                              <stop stopColor="#f97316" />
                              <stop offset="1" stopColor="#f59e0b" />
                            </linearGradient>
                          </defs>
                        </svg>
                      </span>
                      <br />
                      <span className="text-text-muted text-2xl sm:text-3xl md:text-4xl font-bold mt-1 block">
                        Stop building from scratch.
                      </span>
                    </h2>

                    <p className="mt-5 max-w-xl text-base sm:text-lg text-text-muted leading-relaxed">
                      You've already cracked the Amazon code. Now give your students a <strong className="text-text-primary">premium, branded learning platform</strong> without
                      spending months on development. Azein Studio gives you a ready-made coaching hub.
                    </p>

                    <div className="mt-7 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[
                        { icon: Package, text: 'Upload your FBA courses & SOPs instantly' },
                        { icon: Target, text: 'Create niche blueprints for product research' },
                        { icon: Users, text: 'Onboard students with private, secure access' },
                        { icon: DollarSign, text: 'Monetize your expertise with your own academy' },
                        { icon: ShieldCheck, text: 'Fully isolated — competitors can\'t see your content' },
                        { icon: Rocket, text: 'Launch in minutes, not months' },
                      ].map((item, i) => {
                        const ItemIcon = item.icon
                        return (
                          <div key={i} className="flex items-start gap-2.5 text-left">
                            <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-orange-500/15 text-orange-400">
                              <ItemIcon size={13} />
                            </div>
                            <span className="text-sm text-text-muted">{item.text}</span>
                          </div>
                        )
                      })}
                    </div>

                    {/* CTA Buttons */}
                    <div className="mt-8 flex flex-col sm:flex-row items-center lg:items-start gap-3">
                      <Link
                        to="/login"
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 px-8 py-4 text-base font-extrabold text-void shadow-2xl shadow-orange-500/30 transition-all duration-200 hover:shadow-orange-500/50 hover:scale-[1.03] active:scale-95"
                      >
                        <Rocket size={18} />
                        Start Your Coaching Platform
                        <ArrowUpRight size={18} />
                      </Link>
                    </div>

                    {/* Trust line */}
                    <p className="mt-4 text-xs text-text-faint flex items-center gap-1.5 justify-center lg:justify-start">
                      <ShieldCheck size={13} className="text-orange-400" />
                      Trusted by Amazon FBA coaches worldwide • Set up in under 10 minutes
                    </p>
                  </div>

                  {/* Right: Social Proof / Stats Card */}
                  <div className="flex-shrink-0 w-full max-w-sm">
                    <div className="rounded-2xl border border-orange-500/30 bg-surface-2/80 p-6 shadow-xl backdrop-blur-md">
                      {/* Header */}
                      <div className="flex items-center gap-3 mb-5 pb-4 border-b border-border-soft">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 shadow-md shadow-orange-500/30">
                          <TrendingUp size={20} className="text-void" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-text-primary">Why Coaches Choose Us</p>
                          <p className="text-[11px] text-text-faint font-mono">Real results from real coaches</p>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="space-y-4">
                        {[
                          { stat: '10x', label: 'Faster than building your own platform', color: 'from-orange-500 to-amber-500' },
                          { stat: '₱0', label: 'Development cost — zero coding needed', color: 'from-amber-400 to-orange-500' },
                          { stat: '100%', label: 'Your brand, your pricing, your students', color: 'from-orange-600 to-amber-400' },
                        ].map((item, i) => (
                          <div key={i} className="flex items-center gap-4">
                            <div className={`flex h-12 w-16 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${item.color} shadow-md`}>
                              <span className="font-display text-sm font-extrabold text-void">{item.stat}</span>
                            </div>
                            <p className="text-sm text-text-muted leading-snug">{item.label}</p>
                          </div>
                        ))}
                      </div>

                      {/* Testimonial-style quote */}
                      <div className="mt-5 rounded-xl bg-gradient-to-r from-orange-500/10 to-amber-400/5 border border-orange-500/20 p-4">
                        <div className="flex gap-1 mb-2">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} size={12} className="text-amber-400 fill-amber-400" />
                          ))}
                        </div>
                        <p className="text-xs text-text-muted italic leading-relaxed">
                          "I was spending ₱50K+ on a custom platform. With Azein Studio, I launched my FBA coaching academy in one afternoon."
                        </p>
                        <p className="mt-2 text-[11px] font-semibold text-orange-400">— FBA Coach, 7-Figure Seller</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Bottom floating badges */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-4 sm:gap-6"
          >
            {[
              'Product Research Courses',
              'Supplier Negotiation SOPs',
              'PPC Ads Training',
              'Launch Strategy Playbooks',
              'Student Progress Tracking',
            ].map((tag, i) => (
              <span
                key={i}
                className="rounded-full border border-orange-500/25 bg-orange-500/8 px-3.5 py-1.5 text-xs font-medium text-orange-400/90 backdrop-blur-sm"
              >
                {tag}
              </span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="relative z-10 mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-b from-surface-2 to-surface p-8 sm:p-12 md:p-16 text-center">
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 h-48 w-96 rounded-full bg-orange-500/20 blur-3xl pointer-events-none" />

          <span className="font-mono text-xs uppercase tracking-wider text-orange-400">
            Ready to Build Your Channel?
          </span>
          <h2 className="mt-3 font-display text-3xl sm:text-4xl md:text-5xl font-extrabold text-text-primary tracking-tight">
            Step Into Your Creator Dashboard
          </h2>
          <p className="mt-4 mx-auto max-w-xl text-sm sm:text-base text-text-muted">
            Access training courses, curated niche databases, retention checklists, and priority support anytime, anywhere.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 px-8 py-3.5 text-base font-bold text-void shadow-lg shadow-orange-500/25 transition-transform hover:scale-105 active:scale-95"
            >
              Launch Member Sign In
              <ArrowRight size={17} />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border-soft bg-void px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-text-faint">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-500 text-void">
              <Film size={14} strokeWidth={2.5} />
            </div>
            <span className="font-display font-semibold text-text-primary text-sm">
              Azein Studio
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <a href="#features" className="hover:text-text-primary transition-colors">
              Features
            </a>
            <a href="#preview" className="hover:text-text-primary transition-colors">
              Curriculum
            </a>
            <a href="#faq" className="hover:text-text-primary transition-colors">
              FAQ
            </a>
            <a href="#fba-coaches" className="hover:text-orange-400 transition-colors font-medium">
              For Coaches
            </a>
            <Link to="/login" className="hover:text-orange-400 transition-colors">
              Member Sign In
            </Link>
          </div>

          <p>© {new Date().getFullYear()} Azein Studio. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
