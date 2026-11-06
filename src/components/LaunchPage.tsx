import { useState, useEffect, MouseEvent, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  PawPrint, 
  Home, 
  Heart, 
  Dna, 
  Box, 
  BarChart3, 
  TrendingUp, 
  Pencil, 
  Clipboard, 
  CheckCircle, 
  Phone, 
  Mail, 
  MapPin, 
  Facebook, 
  Instagram, 
  Youtube, 
  Play,
  ArrowRight,
  Sun,
  Moon,
  X,
  Menu,
  Building,
  MessageSquare,
  User,
  Leaf,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface LaunchPageProps {
  onLoginClick: () => void;
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
}

export default function LaunchPage({ onLoginClick, isDarkMode, setIsDarkMode }: LaunchPageProps) {
  const [activeSection, setActiveSection] = useState('home');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [subscribedEmail, setSubscribedEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  
  // Mobile responsiveness & Collaboration modal states
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showCollabModal, setShowCollabModal] = useState(false);
  const [collabForm, setCollabForm] = useState({
    name: '',
    email: '',
    organization: '',
    type: 'Partnership',
    message: ''
  });
  const [isCollabSubmitted, setIsCollabSubmitted] = useState(false);
  const [submittedRefId, setSubmittedRefId] = useState('');

  const handleCollabSubmit = (e: FormEvent) => {
    e.preventDefault();
    const refId = 'FRN-COLLAB-' + Math.floor(100000 + Math.random() * 900000);
    setSubmittedRefId(refId);
    setIsCollabSubmitted(true);
    
    try {
      const existing = localStorage.getItem('feronia_collab_requests');
      const list = existing ? JSON.parse(existing) : [];
      list.push({
        refId,
        ...collabForm,
        timestamp: new Date().toISOString()
      });
      localStorage.setItem('feronia_collab_requests', JSON.stringify(list));
    } catch (err) {
      console.error("Error storing collaboration request:", err);
    }
  };

  const wildlifeSlides = [
    {
      id: 'bearded-dragon',
      name: 'Bearded Dragon',
      species: 'Pogona vitticeps',
      url: '/assets/hero/hero_bg_bearded_dragon.png',
      alt: 'Central Bearded Dragon perched on sanctuary rocks'
    },
    {
      id: 'tarantula',
      name: 'Redknee Tarantula',
      species: 'Brachypelma hamorii',
      url: '/assets/hero/hero_bg_tarantula.png',
      alt: 'Mexican Redknee Tarantula resting in rainforest habitat'
    },
    {
      id: 'sugar-glider',
      name: 'Sugar Glider',
      species: 'Petaurus breviceps',
      url: '/assets/hero/hero_bg_sugar_glider.png',
      alt: 'Arboreal Sugar Glider climbing on green woodland branch'
    },
    {
      id: 'crocodile',
      name: 'Crocodile',
      species: 'Crocodylus moreletii',
      url: '/assets/hero/hero_bg_crocodile.png',
      alt: "Morelet's Crocodile resting along shallow sanctuary water"
    },
    {
      id: 'ball-python',
      name: 'Ball Python',
      species: 'Python regius',
      url: '/assets/hero/hero_bg_ball_python.png',
      alt: 'Royal Ball Python coiled elegantly on habitat stone'
    }
  ];

  // Auto-rotate the five animal backgrounds every 6 seconds with smooth crossfade
  useEffect(() => {
    const slideInterval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % wildlifeSlides.length);
    }, 6000);
    return () => clearInterval(slideInterval);
  }, [wildlifeSlides.length]);

  // Track active section on scroll or intersection
  useEffect(() => {
    const handleScroll = () => {
      const sections = ['home', 'features', 'about', 'overview', 'contact'];
      // Use mid-viewport threshold so active section precisely reflects what's in the screen
      const scrollPosition = window.scrollY + window.innerHeight * 0.4;

      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (id: string, e: MouseEvent) => {
    e.preventDefault();
    setActiveSection(id);
    if (id === 'home') {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
      return;
    }
    const el = document.getElementById(id);
    if (el) {
      const navbarHeight = 72; // 72px fixed navbar height
      const elementPosition = el.getBoundingClientRect().top + window.scrollY;
      const offsetPosition = elementPosition - navbarHeight;

      window.scrollTo({
        top: Math.max(0, offsetPosition),
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className={`min-h-screen font-sans antialiased overflow-x-hidden pt-[72px] transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-[#05160E] text-slate-100 selection:bg-emerald-800 selection:text-white' 
        : 'bg-[#F4F7F5] text-slate-800 selection:bg-emerald-100 selection:text-[#113C24]'
    }`}>
      
      {/* Navbar - Fixed top, sleek height (72px) for optimal vertical space */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 backdrop-blur-md border-b shadow-xs ${
        isDarkMode 
          ? 'bg-[#05160E]/90 border-emerald-950/60 text-white' 
          : 'bg-[#FAF7EE]/95 border-[#E6E1D1] text-slate-800'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[72px] flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={(e) => handleNavClick('home', e as unknown as MouseEvent)}>
            <div className={isDarkMode ? 'text-emerald-400' : 'text-[#113C24]'}>
              <PawPrint className="w-8 h-8" fill="currentColor" />
            </div>
            <div>
              <span className={`font-extrabold text-xl sm:text-2xl tracking-tight block leading-none ${isDarkMode ? 'text-white' : 'text-[#113C24]'}`}>FERONIA</span>
              <span className={`text-[8.5px] font-bold tracking-wider uppercase mt-0.5 block ${isDarkMode ? 'text-emerald-400/80' : 'text-[#113C24]/80'}`}>
                WILDLIFE FACILITY MANAGEMENT SYSTEM
              </span>
            </div>
          </div>

          <nav className="hidden md:flex space-x-8 text-sm font-bold">
            {[
              { id: 'home', label: 'Home' },
              { id: 'features', label: 'Features' },
              { id: 'about', label: 'About Us' },
              { id: 'overview', label: 'System Overview' },
              { id: 'contact', label: 'Contact Us' }
            ].map((tab) => (
              <a
                key={tab.id}
                href={`#${tab.id}`}
                onClick={(e) => handleNavClick(tab.id, e)}
                className={`relative pb-1.5 transition-all duration-200 cursor-pointer ${
                  activeSection === tab.id 
                    ? (isDarkMode ? 'text-emerald-400 font-extrabold' : 'text-[#113C24] font-extrabold') 
                    : (isDarkMode ? 'text-slate-300 hover:text-white' : 'text-slate-800 hover:text-[#113C24]')
                }`}
              >
                <span>{tab.label}</span>
                {activeSection === tab.id && (
                  <motion.div
                    layoutId="activeTabIndicator"
                    className={`absolute bottom-0 left-0 right-0 h-0.5 ${isDarkMode ? 'bg-emerald-400' : 'bg-[#113C24]'}`}
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </a>
            ))}
          </nav>

          <div className="flex items-center space-x-3">
            {/* Desktop-only Login Button */}
            <button
              onClick={onLoginClick}
              className={`hidden md:flex px-5 py-2.5 text-xs font-bold rounded-full shadow-sm hover:shadow-md transition-all items-center space-x-1.5 cursor-pointer ${
                isDarkMode 
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white' 
                  : 'bg-[#113C24] hover:bg-[#1B5234] text-white'
              }`}
            >
              <span>Login</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Mobile-only Hamburger Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`md:hidden p-2 rounded-full transition-all cursor-pointer border ${
                isDarkMode 
                  ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/30 hover:bg-emerald-900/45' 
                  : 'bg-emerald-50 text-[#113C24] border-emerald-100 hover:bg-emerald-100'
              }`}
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className={`md:hidden border-t overflow-hidden transition-colors duration-300 ${
                isDarkMode 
                  ? 'bg-[#05160E] border-emerald-950/60 text-white' 
                  : 'bg-white border-slate-100 text-slate-800'
              }`}
            >
              <div className="px-4 py-6 space-y-3 flex flex-col font-bold text-sm">
                {[
                  { id: 'home', label: 'Home' },
                  { id: 'features', label: 'Features' },
                  { id: 'about', label: 'About Us' },
                  { id: 'overview', label: 'System Overview' },
                  { id: 'contact', label: 'Contact Us' }
                ].map((tab) => (
                  <a
                    key={tab.id}
                    href={`#${tab.id}`}
                    onClick={(e) => {
                      setIsMobileMenuOpen(false);
                      handleNavClick(tab.id, e);
                    }}
                    className={`px-3 py-2.5 rounded-xl transition-all duration-200 ${
                      activeSection === tab.id 
                        ? (isDarkMode ? 'bg-emerald-950/60 text-emerald-400 font-extrabold' : 'bg-emerald-50 text-[#113C24]') 
                        : (isDarkMode ? 'text-slate-400 hover:text-white hover:bg-emerald-950/20' : 'text-slate-600 hover:text-[#113C24] hover:bg-slate-50')
                    }`}
                  >
                    {tab.label}
                  </a>
                ))}
                
                {/* Mobile-only Login Button inside drawer */}
                <div className="pt-3 border-t border-dashed border-slate-200/50 dark:border-emerald-950/40">
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onLoginClick();
                    }}
                    className={`w-full py-3 text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
                      isDarkMode 
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white' 
                        : 'bg-[#113C24] hover:bg-[#1B5234] text-white'
                    }`}
                  >
                    <span>Login to System</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Hero Section matching FERONIA reference design exactly with interchangeable wildlife scenes */}
      <section id="home" className={`relative min-h-[calc(100vh-72px)] lg:h-[calc(100vh-72px)] flex items-center overflow-hidden transition-colors duration-300 scroll-mt-[72px] ${
        isDarkMode ? 'bg-[#06180E]' : 'bg-[#FAF7EE]'
      }`}>
        {/* Full Wildlife Scene Slideshow - Smoothly crossfading between reference scenes */}
        <div className="absolute inset-0 z-0">
          <AnimatePresence>
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, ease: "easeInOut" }}
              className="absolute inset-0 w-full h-full"
            >
              <img
                src={wildlifeSlides[currentSlide].url}
                alt={wildlifeSlides[currentSlide].alt}
                className="w-full h-full object-cover object-right lg:object-center select-none opacity-80"
                referrerPolicy="no-referrer"
              />
            </motion.div>
          </AnimatePresence>

          {/* Subtle warm cream gradient overlay: stronger on the LEFT and gradually fading toward the RIGHT */}
          <div 
            className="absolute inset-0 z-10 pointer-events-none transition-colors duration-300"
            style={{
              background: isDarkMode
                ? 'linear-gradient(to right, rgba(6, 24, 14, 0.92) 0%, rgba(6, 24, 14, 0.65) 35%, rgba(6, 24, 14, 0.20) 65%, transparent 100%)'
                : 'linear-gradient(to right, rgba(250, 247, 238, 0.88) 0%, rgba(250, 247, 238, 0.60) 35%, rgba(250, 247, 238, 0.20) 65%, transparent 100%)'
            }}
          />
        </div>

        {/* Foreground Content: High-contrast, completely static text and action buttons */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 w-full py-8 lg:py-12">
          <div className="max-w-xl lg:max-w-2xl space-y-5 sm:space-y-6">
            
            {/* Badge: Smart. Organized. Efficient. */}
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className={`inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full text-[11px] font-extrabold tracking-wider uppercase transition-colors duration-300 w-fit ${
                isDarkMode 
                  ? 'bg-emerald-950/80 border border-emerald-800/40 text-emerald-300' 
                  : 'bg-[#E5EFE4] border border-[#C5DAC3] text-[#0B3A23] shadow-xs'
              }`}
            >
              <Leaf className="w-3.5 h-3.5 fill-current" />
              <span>Smart. Organized. Efficient.</span>
            </motion.div>
            
            {/* Headline with Curved Underline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.15, ease: "easeOut" }}
              className={`text-4xl sm:text-5xl lg:text-[54px] xl:text-[62px] font-black tracking-tight leading-[1.08] transition-colors duration-300 ${
                isDarkMode ? 'text-white' : 'text-[#0B3A23]'
              }`}
            >
              Manage Wildlife.<br />
              <span className="relative inline-block text-[#935824] dark:text-[#E09B58]">
                Care Better.
                {/* Organic Curved Green Underline Swoosh */}
                <svg
                  className="absolute -bottom-2 sm:-bottom-2.5 left-0 w-full h-3 sm:h-3.5 text-[#2E6C42] dark:text-emerald-400 pointer-events-none"
                  viewBox="0 0 240 16"
                  fill="none"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M 2 8 C 65 17, 175 16, 238 6 C 175 11.5, 65 11.5, 2 8 Z"
                    fill="currentColor"
                  />
                </svg>
              </span>
            </motion.h1>
            
            {/* Description Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.3, ease: "easeOut" }}
              className={`text-sm sm:text-base leading-relaxed font-semibold transition-colors duration-300 max-w-xl ${
                isDarkMode ? 'text-slate-300' : 'text-slate-700'
              }`}
            >
              FERONIA is an all-in-one management system that helps wildlife facilities streamline animal care, manage daily operations, records, and resources in one centralized platform.
            </motion.p>
            
            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.45, ease: "easeOut" }}
              className="flex flex-wrap gap-3.5 pt-1 items-center"
            >
              <a
                href="#features"
                onClick={(e) => handleNavClick('features', e)}
                className="px-7 py-3 text-xs sm:text-sm font-bold rounded-full text-center shadow-md hover:shadow-lg hover:scale-102 transition-all flex items-center justify-center space-x-2 bg-[#0B3A23] hover:bg-[#134E2E] text-white cursor-pointer"
              >
                <span>Explore Features</span>
                <ArrowRight className="w-4 h-4" />
              </a>
              <button
                onClick={() => setShowVideoModal(true)}
                className={`px-6 py-2.5 text-xs sm:text-sm font-bold rounded-full text-center border-2 transition-all flex items-center justify-center space-x-2.5 cursor-pointer shadow-xs ${
                  isDarkMode 
                    ? 'bg-emerald-950/45 text-emerald-300 border-emerald-800/50 hover:bg-emerald-900/40 hover:border-emerald-600' 
                    : 'bg-[#FAF7EE] hover:bg-white text-[#0B3A23] border-[#D9D3C3] hover:border-[#0B3A23]'
                }`}
              >
                <span>Watch Demo</span>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs transition-colors duration-300 ${
                  isDarkMode ? 'bg-emerald-900 text-emerald-300' : 'bg-[#0B3A23] text-white'
                }`}>
                  <Play className="w-2.5 h-2.5 ml-0.5 fill-current" />
                </div>
              </button>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Features Grid - Streamlined, balanced 3x2 layout fitting cleanly within viewport */}
      <section id="features" className={`min-h-[calc(100vh-72px)] flex flex-col justify-center py-6 sm:py-8 lg:py-7 transition-colors duration-300 relative overflow-hidden w-full max-w-full scroll-mt-[72px] ${
        isDarkMode ? 'bg-[#06180E]' : 'bg-[#FAF7EE]'
      }`}>
        {/* Decorative corner elements - strictly z-0 behind content */}
        {/* Top-Right Hanging Tropical Canopy - Blended naturally into background with zero rectangular seams */}
        <div className="absolute top-0 right-0 w-44 sm:w-56 md:w-68 lg:w-76 pointer-events-none select-none z-0 overflow-hidden">
          <img 
            src="/assets/decorations/features_leaves_top_right.png" 
            alt="" 
            className="w-full h-auto object-contain object-top-right select-none opacity-85 dark:opacity-30 [mask-image:linear-gradient(to_bottom_left,black_65%,transparent_98%)]"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Soft rolling sage hills in background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 opacity-40 dark:opacity-20">
          <svg viewBox="0 0 1440 700" fill="none" preserveAspectRatio="none" className="w-full h-full">
            <path d="M0,260 C380,320 740,200 1100,280 C1280,320 1380,260 1440,250 L1440,700 L0,700 Z" fill="#E6EFE0" />
            <path d="M0,380 C440,440 860,340 1200,400 C1340,430 1410,390 1440,380 L1440,700 L0,700 Z" fill="#DEEBD6" />
          </svg>
        </div>

        {/* Bottom Curved Dark-Green Wave with Gold Ribbon */}
        <div className="absolute bottom-0 left-0 right-0 pointer-events-none overflow-hidden h-12 sm:h-14 z-0">
          <svg viewBox="0 0 1440 70" fill="none" preserveAspectRatio="none" className="w-full h-full">
            <path d="M0,38 C340,62 720,18 1100,42 C1270,52 1380,38 1440,32 L1440,70 L0,70 Z" fill="#D38C3B" />
            <path d="M0,44 C340,68 720,24 1100,48 C1270,58 1380,44 1440,38 L1440,70 L0,70 Z" fill="#0B3A23" />
          </svg>
        </div>

        {/* Bottom-Left Tropical Leaves */}
        <div className="absolute bottom-0 left-0 w-32 sm:w-44 lg:w-52 pointer-events-none select-none z-0">
          <img 
            src="/assets/decorations/features_leaves_bottom_left.png" 
            alt="" 
            className="w-full h-auto object-contain opacity-90 dark:opacity-35"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Bottom-Right Habitat Rock & Palm Leaves */}
        <div className="absolute bottom-0 right-0 w-36 sm:w-48 lg:w-56 pointer-events-none select-none z-0">
          <img 
            src="/assets/decorations/features_leaves_bottom_right.png" 
            alt="" 
            className="w-full h-auto object-contain opacity-90 dark:opacity-35"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Main Content Container - Elevated at z-10 above background graphics */}
        <div className="max-w-6xl xl:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full my-auto">
          {/* Centered Heading Block */}
          <div className="text-center max-w-3xl mx-auto mb-4 sm:mb-5">
            {/* Small green label above heading */}
            <div className={`inline-flex items-center space-x-1.5 px-3 py-0.5 rounded-full text-[11px] font-black tracking-wider uppercase mb-2 transition-colors duration-300 shadow-2xs ${
              isDarkMode 
                ? 'bg-emerald-950/80 border border-emerald-800/50 text-emerald-300' 
                : 'bg-[#D5E8BA] border border-[#BFDB9E] text-[#134426]'
            }`}>
              <Leaf className="w-3 h-3 fill-current" />
              <span>SYSTEM MODULES</span>
            </div>

            {/* Main Section Heading with curved underline */}
            <h2 className={`text-xl sm:text-2xl lg:text-3xl font-black tracking-tight leading-tight transition-colors duration-300 ${
              isDarkMode ? 'text-white' : 'text-[#0B3A23]'
            }`}>
              Powerful modules built to{' '}
              <span className="relative inline-block">
                elevate wildlife care
                {/* Organic Curved Green Underline Swoosh */}
                <svg
                  className="absolute -bottom-1.5 left-0 w-full h-2.5 sm:h-3 text-[#2E6C42] dark:text-emerald-400 pointer-events-none"
                  viewBox="0 0 240 16"
                  fill="none"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M 2 8 C 65 17, 175 16, 238 6 C 175 11.5, 65 11.5, 2 8 Z"
                    fill="currentColor"
                  />
                </svg>
              </span>
            </h2>

            {/* Short Subtitle Description */}
            <p className={`font-semibold text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed transition-colors duration-300 mt-2 ${
              isDarkMode ? 'text-slate-300' : 'text-slate-700'
            }`}>
              FERONIA integrates key facility operations in one platform, helping you manage animal records, enclosures, breeding, tasks, inventory, and veterinary health with ease.
            </p>
          </div>

          {/* Clean, Balanced 3-Column by 2-Row Modules Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4 lg:gap-4.5 max-w-5xl xl:max-w-6xl mx-auto">
            {[
              {
                id: 'animal-management',
                title: 'Animal Management',
                description: 'Maintain complete animal records, including profiles, history, and movement.',
                image: '/assets/modules/module_animal_management.png',
                alt: 'Central Bearded Dragon - Animal Management'
              },
              {
                id: 'enclosures',
                title: 'Enclosures',
                description: 'Manage enclosure information, conditions, capacity, and maintenance.',
                image: '/assets/modules/module_enclosures.png',
                alt: 'Natural Habitat Vivarium - Enclosures'
              },
              {
                id: 'breeding',
                title: 'Breeding',
                description: 'Track breeding plans, pairings, requirements, and breeding records.',
                image: '/assets/modules/module_breeding.png',
                alt: 'Pair of Bearded Dragons - Breeding & Lineage'
              },
              {
                id: 'tasks',
                title: 'Tasks',
                description: 'Assign, monitor, and track daily and routine tasks (e.g., animal care, feeding, cleaning).',
                image: '/assets/modules/module_tasks.png',
                alt: 'Care Checklist & Daily Routine - Tasks'
              },
              {
                id: 'inventory',
                title: 'Inventory',
                description: 'Manage supplies, feeds, medicines, and other facility resources.',
                image: '/assets/modules/module_inventory.png',
                alt: 'Food Pellets & Facility Resources - Inventory'
              },
              {
                id: 'veterinary-health',
                title: 'Veterinary Health',
                description: 'Record health monitoring, treatments, diagnoses, vaccinations, and medical history.',
                image: '/assets/modules/module_veterinary_health.png',
                alt: 'Tortoise Stethoscope Examination - Veterinary Health'
              }
            ].map((module) => (
              <div
                key={module.id}
                className={`rounded-2xl border transition-all duration-300 flex flex-col justify-between overflow-hidden relative group shadow-xs hover:shadow-md hover:-translate-y-0.5 h-full min-w-0 ${
                  isDarkMode
                    ? 'bg-[#082618] border-emerald-900/60 hover:border-emerald-600/50'
                    : 'bg-white border-[#D4D7B1] hover:border-[#8FA36B]'
                }`}
              >
                {/* Wide Photographic Image at Top */}
                <div className="relative w-full h-20 sm:h-22 overflow-hidden bg-[#FAF7EE] dark:bg-[#06180E] border-b border-[#D4D7B1]/30 dark:border-emerald-900/40 shrink-0">
                  <img
                    src={module.image}
                    alt={module.alt}
                    className="w-full h-full object-cover object-center group-hover:scale-102 transition-transform duration-500 select-none"
                    referrerPolicy="no-referrer"
                  />
                </div>

                {/* Card Content */}
                <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between relative z-10 space-y-2.5">
                  <div className="space-y-1">
                    <h3 className={`text-sm sm:text-base font-black tracking-tight transition-colors line-clamp-1 ${
                      isDarkMode ? 'text-white group-hover:text-emerald-300' : 'text-[#0B3A23] group-hover:text-[#185333]'
                    }`}>
                      {module.title}
                    </h3>
                    <p className={`text-xs leading-relaxed font-semibold min-h-[2.25rem] line-clamp-2 ${
                      isDarkMode ? 'text-slate-300' : 'text-slate-600'
                    }`}>
                      {module.description}
                    </p>
                  </div>

                  {/* Bottom Action Row: Open Module Button & Arrow */}
                  <div className="pt-1.5 flex items-center justify-between relative">
                    <button
                      onClick={onLoginClick}
                      className={`px-3.5 py-1 text-[11px] font-bold rounded-full border transition-all cursor-pointer shadow-2xs relative z-10 ${
                        isDarkMode 
                          ? 'bg-emerald-950/70 text-emerald-300 border-emerald-800/60 hover:bg-emerald-900/60 hover:border-emerald-500' 
                          : 'bg-[#FAF4E4] hover:bg-white text-[#1C462B] border-[#D7DCBF] hover:border-[#0B3A23]'
                      }`}
                    >
                      Open Module
                    </button>

                    <button
                      onClick={onLoginClick}
                      aria-label={`Open ${module.title}`}
                      className={`w-6 h-6 rounded-full flex items-center justify-center transition-transform group-hover:translate-x-1 duration-300 cursor-pointer relative z-10 ${
                        isDarkMode ? 'text-emerald-400' : 'text-[#0B3A23]'
                      }`}
                    >
                      <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                    </button>
                  </div>
                </div>

                {/* Organic Corner Wave Graphic in Bottom-Right */}
                <div className="absolute -bottom-0.5 -right-0.5 w-20 h-14 pointer-events-none overflow-hidden rounded-br-2xl z-0">
                  <svg viewBox="0 0 100 64" fill="none" preserveAspectRatio="none" className="w-full h-full">
                    <path
                      d="M100,0 C75,32 40,36 0,64 L100,64 Z"
                      className={isDarkMode ? 'fill-emerald-900/35' : 'fill-[#E8EFD0]'}
                    />
                  </svg>
                </div>
              </div>
            ))}
          </div>

          {/* Centered "See All System Modules" Button */}
          <div className="text-center mt-5 sm:mt-6 relative z-10">
            <button
              onClick={onLoginClick}
              className={`px-7 py-2.5 rounded-full font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all cursor-pointer inline-flex items-center space-x-2 ${
                isDarkMode 
                  ? 'bg-emerald-600 hover:bg-emerald-500 hover:shadow-emerald-950/40 text-white' 
                  : 'bg-[#0B3A23] hover:bg-[#134E2E] text-white hover:scale-102'
              }`}
            >
              <span>See All System Modules</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* About Us Support Section - Structured to fit within one frame */}
      <section id="about" className={`min-h-[calc(100vh-72px)] flex flex-col justify-center py-6 sm:py-8 lg:py-6 transition-colors duration-300 relative overflow-hidden scroll-mt-[72px] ${
        isDarkMode ? 'bg-[#031309]' : 'bg-[#F4F7F5]'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full my-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center">
            {/* Left Column Content */}
            <div className="lg:col-span-6 space-y-4 sm:space-y-5">
              <span className={`text-[10px] font-extrabold tracking-widest uppercase flex items-center space-x-1.5 transition-colors duration-300 ${isDarkMode ? 'text-emerald-400' : 'text-[#113C24]'}`}>
                <span>🍃</span>
                <span>ABOUT US</span>
                <span>🍃</span>
              </span>
              <h2 className={`text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                Built to support wildlife care and daily operations
              </h2>
              <p className={`leading-relaxed text-xs sm:text-sm font-semibold transition-colors duration-300 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                FERONIA was designed for wildlife facilities of all sizes. From animal management to daily tasks and reporting, everything is organized in one easy-to-use system.
              </p>
              <ul className="space-y-2.5 pt-1">
                <li className="flex items-start space-x-2.5">
                  <span className={`${isDarkMode ? 'text-emerald-400' : 'text-[#113C24]'} font-bold text-base leading-none`}>✓</span>
                  <span className={`font-bold text-xs sm:text-sm transition-colors duration-300 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Easy to use for every team member</span>
                </li>
                <li className="flex items-start space-x-2.5">
                  <span className={`${isDarkMode ? 'text-emerald-400' : 'text-[#113C24]'} font-bold text-base leading-none`}>✓</span>
                  <span className={`font-bold text-xs sm:text-sm transition-colors duration-300 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Secure and reliable data management</span>
                </li>
                <li className="flex items-start space-x-2.5">
                  <span className={`${isDarkMode ? 'text-emerald-400' : 'text-[#113C24]'} font-bold text-base leading-none`}>✓</span>
                  <span className={`font-bold text-xs sm:text-sm transition-colors duration-300 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Accessible anytime, anywhere</span>
                </li>
              </ul>
              <div className="pt-2">
                <button
                  onClick={onLoginClick}
                  className={`px-7 py-3 font-bold text-xs rounded-full transition-all cursor-pointer inline-flex items-center space-x-2 shadow-sm ${
                    isDarkMode 
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white' 
                      : 'bg-[#113C24] hover:bg-[#1B5234] text-white'
                  }`}
                >
                  <span>Learn More About Us</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Right Column Grid Layout of Images and Mission */}
            <div className="lg:col-span-6 grid grid-cols-2 sm:grid-cols-12 gap-3 sm:gap-4 items-stretch">
              <div className="col-span-2 sm:col-span-6 flex flex-col gap-3">
                <div className={`aspect-[4/3] rounded-xl overflow-hidden border-2 shadow-xs transition-colors duration-300 ${isDarkMode ? 'border-emerald-900/40' : 'border-white'}`}>
                  <img
                    src="https://images.unsplash.com/photo-1576201836106-db1758fd1c97?auto=format&fit=crop&q=80&w=600"
                    alt="Veterinary keeper examining wildlife"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className={`p-3.5 rounded-xl border flex items-start space-x-3 shadow-2xs transition-all duration-300 ${
                  isDarkMode 
                    ? 'bg-[#062414] border-emerald-900/40 text-emerald-100' 
                    : 'bg-[#EBF2EE] text-[#113C24] border-white shadow-emerald-950/5'
                }`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-2xs ${isDarkMode ? 'bg-emerald-950 text-emerald-400 border border-emerald-900/35' : 'bg-white text-[#113C24]'}`}>
                    <PawPrint className="w-4 h-4" fill="currentColor" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className={`font-extrabold text-[11px] uppercase tracking-wider mb-0.5 ${isDarkMode ? 'text-emerald-400' : 'text-[#113C24]'}`}>Our Mission</h4>
                    <p className={`text-[10px] leading-relaxed font-bold ${isDarkMode ? 'text-slate-200' : 'text-[#113C24]/90'}`}>
                      To simplify wildlife facility management and improve animal care through technology and organization.
                    </p>
                  </div>
                </div>
              </div>

              <div className="col-span-2 sm:col-span-6 flex flex-col gap-3">
                <div className={`aspect-[4/3] rounded-xl overflow-hidden border-2 shadow-xs transition-colors duration-300 ${isDarkMode ? 'border-emerald-900/40' : 'border-white'}`}>
                  <img
                    src="https://images.unsplash.com/photo-1437622368342-7a3d73a34c8f?auto=format&fit=crop&q=80&w=600"
                    alt="Hands holding tortoise"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className={`aspect-[4/3] rounded-xl overflow-hidden border-2 shadow-xs transition-colors duration-300 ${isDarkMode ? 'border-emerald-900/40' : 'border-white'}`}>
                  <img
                    src="https://images.unsplash.com/photo-1504450874802-0ba2bcd9b5ae?auto=format&fit=crop&q=80&w=600"
                    alt="Bearded dragon on log"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* System Overview Section - Contained and fits gracefully in one frame */}
      <section id="overview" className={`min-h-[calc(100vh-72px)] flex flex-col justify-center py-6 sm:py-8 lg:py-6 transition-colors duration-300 relative overflow-hidden scroll-mt-[72px] ${
        isDarkMode 
          ? 'bg-gradient-to-b from-[#031309] via-[#092918] to-[#05160E]' 
          : 'bg-gradient-to-b from-[#F4F7F5] via-[#D5E5DC] to-white'
      }`}>
        <div className="absolute top-1/2 left-1/4 w-80 h-80 bg-emerald-300/40 rounded-full blur-3xl -translate-y-1/2 pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-teal-200/30 rounded-full blur-3xl -translate-y-1/2 pointer-events-none" />
        <div className="absolute bottom-10 left-1/3 w-72 h-72 bg-amber-200/30 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full my-auto">
          <div className="text-center max-w-3xl mx-auto mb-4 sm:mb-6 space-y-1.5">
            <span className={`text-[10px] font-extrabold tracking-widest uppercase flex items-center justify-center space-x-1.5 px-3 py-0.5 rounded-full w-max mx-auto border transition-colors duration-300 ${
              isDarkMode 
                ? 'text-emerald-400 bg-emerald-950/60 border-emerald-900/50' 
                : 'text-[#113C24] bg-emerald-100/60 border-emerald-200/50'
            }`}>
              <span>🍃</span>
              <span>SYSTEM OVERVIEW</span>
              <span>🍃</span>
            </span>
            <h2 className={`text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              All your facility operations in one system
            </h2>
            <p className={`font-semibold text-xs max-w-xl mx-auto transition-colors duration-300 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
              FERONIA connects your data, teams, and daily tasks in a seamless workflow.
            </p>
          </div>

          <div className={`backdrop-blur-2xl rounded-2xl p-5 sm:p-6 lg:p-7 border shadow-xl transition-all duration-300 space-y-6 relative overflow-hidden ${
            isDarkMode 
              ? 'bg-[#092417]/45 border-emerald-900/40 shadow-black/30' 
              : 'bg-white/45 border-white/70 shadow-emerald-950/10'
          }`}>
            <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-white/30 pointer-events-none" />
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 relative z-10">
              
              {/* Step 1 */}
              <div className={`flex flex-col items-center text-center relative group backdrop-blur-md p-3.5 sm:p-4 rounded-xl border hover:-translate-y-1 transition-all duration-300 shadow-xs hover:shadow-md ${
                isDarkMode 
                  ? 'bg-[#092215]/60 hover:bg-[#0c311e]/85 border-emerald-950 hover:border-emerald-500/40' 
                  : 'bg-white/90 hover:bg-white border-slate-200/90 hover:border-emerald-400'
              }`}>
                <span className="absolute top-2.5 right-2.5 text-[10px] font-black text-amber-700/50 tracking-wider">01</span>
                <div className="w-10 h-10 bg-gradient-to-br from-amber-50 to-white rounded-full flex items-center justify-center text-amber-800 shadow-xs mb-2.5 border border-amber-200 transition-transform duration-300 group-hover:scale-110">
                  <Pencil className="w-4 h-4 text-amber-800" />
                </div>
                <h4 className={`font-extrabold text-[11px] mb-1 uppercase tracking-wide transition-colors duration-300 ${isDarkMode ? 'text-emerald-300' : 'text-[#113C24]'}`}>1. Add Records</h4>
                <p className={`text-[10px] leading-relaxed font-bold transition-colors duration-300 ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>
                  Add animals, enclosures, resources, and staff information.
                </p>
                <div className={`hidden lg:block absolute top-9 left-[calc(50%+1.8rem)] w-[calc(100%-3.6rem)] border-t-2 border-dashed ${isDarkMode ? 'border-emerald-500/10' : 'border-emerald-800/20'}`} />
              </div>

              {/* Step 2 */}
              <div className={`flex flex-col items-center text-center relative group backdrop-blur-md p-3.5 sm:p-4 rounded-xl border hover:-translate-y-1 transition-all duration-300 shadow-xs hover:shadow-md ${
                isDarkMode 
                  ? 'bg-[#092215]/60 hover:bg-[#0c311e]/85 border-emerald-950 hover:border-emerald-500/40' 
                  : 'bg-white/90 hover:bg-white border-slate-200/90 hover:border-emerald-400'
              }`}>
                <span className="absolute top-2.5 right-2.5 text-[10px] font-black text-blue-700/50 tracking-wider">02</span>
                <div className="w-10 h-10 bg-gradient-to-br from-blue-50 to-white rounded-full flex items-center justify-center text-blue-800 shadow-xs mb-2.5 border border-blue-200 transition-transform duration-300 group-hover:scale-110">
                  <Clipboard className="w-4 h-4 text-blue-800" />
                </div>
                <h4 className={`font-extrabold text-[11px] mb-1 uppercase tracking-wide transition-colors duration-300 ${isDarkMode ? 'text-emerald-300' : 'text-[#113C24]'}`}>2. Plan & Schedule</h4>
                <p className={`text-[10px] leading-relaxed font-bold transition-colors duration-300 ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>
                  Set tasks, feeding, cleaning, and medical schedules.
                </p>
                <div className={`hidden lg:block absolute top-9 left-[calc(50%+1.8rem)] w-[calc(100%-3.6rem)] border-t-2 border-dashed ${isDarkMode ? 'border-emerald-500/10' : 'border-emerald-800/20'}`} />
              </div>

              {/* Step 3 */}
              <div className={`flex flex-col items-center text-center relative group backdrop-blur-md p-3.5 sm:p-4 rounded-xl border hover:-translate-y-1 transition-all duration-300 shadow-xs hover:shadow-md ${
                isDarkMode 
                  ? 'bg-[#092215]/60 hover:bg-[#0c311e]/85 border-emerald-950 hover:border-emerald-500/40' 
                  : 'bg-white/90 hover:bg-white border-slate-200/90 hover:border-emerald-400'
              }`}>
                <span className="absolute top-2.5 right-2.5 text-[10px] font-black text-emerald-700/50 tracking-wider">03</span>
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-50 to-white rounded-full flex items-center justify-center text-emerald-700 shadow-xs mb-2.5 border border-emerald-200 transition-transform duration-300 group-hover:scale-110">
                  <CheckCircle className="w-4 h-4 text-emerald-700" />
                </div>
                <h4 className={`font-extrabold text-[11px] mb-1 uppercase tracking-wide transition-colors duration-300 ${isDarkMode ? 'text-emerald-300' : 'text-[#113C24]'}`}>3. Daily Ops</h4>
                <p className={`text-[10px] leading-relaxed font-bold transition-colors duration-300 ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>
                  Keepers and vets complete tasks and log records.
                </p>
                <div className={`hidden lg:block absolute top-9 left-[calc(50%+1.8rem)] w-[calc(100%-3.6rem)] border-t-2 border-dashed ${isDarkMode ? 'border-emerald-500/10' : 'border-emerald-800/20'}`} />
              </div>

              {/* Step 4 */}
              <div className={`flex flex-col items-center text-center relative group backdrop-blur-md p-3.5 sm:p-4 rounded-xl border hover:-translate-y-1 transition-all duration-300 shadow-xs hover:shadow-md ${
                isDarkMode 
                  ? 'bg-[#092215]/60 hover:bg-[#0c311e]/85 border-emerald-950 hover:border-emerald-500/40' 
                  : 'bg-white/90 hover:bg-white border-slate-200/90 hover:border-emerald-400'
              }`}>
                <span className="absolute top-2.5 right-2.5 text-[10px] font-black text-indigo-700/50 tracking-wider">04</span>
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-50 to-white rounded-full flex items-center justify-center text-indigo-800 shadow-xs mb-2.5 border border-indigo-200 transition-transform duration-300 group-hover:scale-110">
                  <BarChart3 className="w-4 h-4 text-indigo-800" />
                </div>
                <h4 className={`font-extrabold text-[11px] mb-1 uppercase tracking-wide transition-colors duration-300 ${isDarkMode ? 'text-emerald-300' : 'text-[#113C24]'}`}>4. Monitor</h4>
                <p className={`text-[10px] leading-relaxed font-bold transition-colors duration-300 ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>
                  Monitor health, inventory, and facility status in real-time.
                </p>
                <div className={`hidden lg:block absolute top-9 left-[calc(50%+1.8rem)] w-[calc(100%-3.6rem)] border-t-2 border-dashed ${isDarkMode ? 'border-emerald-500/10' : 'border-emerald-800/20'}`} />
              </div>

              {/* Step 5 */}
              <div className={`flex flex-col items-center text-center relative group backdrop-blur-md p-3.5 sm:p-4 rounded-xl border hover:-translate-y-1 transition-all duration-300 shadow-xs hover:shadow-md ${
                isDarkMode 
                  ? 'bg-[#092215]/60 hover:bg-[#0c311e]/85 border-emerald-950 hover:border-emerald-500/40' 
                  : 'bg-white/90 hover:bg-white border-slate-200/90 hover:border-emerald-400'
              }`}>
                <span className="absolute top-2.5 right-2.5 text-[10px] font-black text-rose-700/50 tracking-wider">05</span>
                <div className="w-10 h-10 bg-gradient-to-br from-rose-50 to-white rounded-full flex items-center justify-center text-rose-800 shadow-xs mb-2.5 border border-rose-200 transition-transform duration-300 group-hover:scale-110">
                  <Clipboard className="w-4 h-4 text-rose-800" />
                </div>
                <h4 className={`font-extrabold text-[11px] mb-1 uppercase tracking-wide transition-colors duration-300 ${isDarkMode ? 'text-emerald-300' : 'text-[#113C24]'}`}>5. Reports</h4>
                <p className={`text-[10px] leading-relaxed font-bold transition-colors duration-300 ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>
                  Create reports easily for management and record keeping.
                </p>
                <div className={`hidden lg:block absolute top-9 left-[calc(50%+1.8rem)] w-[calc(100%-3.6rem)] border-t-2 border-dashed ${isDarkMode ? 'border-emerald-500/10' : 'border-emerald-800/20'}`} />
              </div>

              {/* Step 6 */}
              <div className={`flex flex-col items-center text-center relative group backdrop-blur-md p-3.5 sm:p-4 rounded-xl border hover:-translate-y-1 transition-all duration-300 shadow-xs hover:shadow-md ${
                isDarkMode 
                  ? 'bg-[#092215]/60 hover:bg-[#0c311e]/85 border-emerald-950 hover:border-emerald-500/40' 
                  : 'bg-white/90 hover:bg-white border-slate-200/90 hover:border-emerald-400'
              }`}>
                <span className="absolute top-2.5 right-2.5 text-[10px] font-black text-teal-700/50 tracking-wider">06</span>
                <div className="w-10 h-10 bg-gradient-to-br from-teal-50 to-white rounded-full flex items-center justify-center text-teal-700 shadow-xs mb-2.5 border border-teal-200 transition-transform duration-300 group-hover:scale-110">
                  <TrendingUp className="w-4 h-4 text-teal-700" />
                </div>
                <h4 className={`font-extrabold text-[11px] mb-1 uppercase tracking-wide transition-colors duration-300 ${isDarkMode ? 'text-emerald-300' : 'text-[#113C24]'}`}>6. Decide</h4>
                <p className={`text-[10px] leading-relaxed font-bold transition-colors duration-300 ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>
                  Use accurate data and insights to make better decisions.
                </p>
              </div>

            </div>

            <div className="text-center relative z-10 pt-1">
              <button
                onClick={onLoginClick}
                className={`px-7 py-2.5 font-bold text-xs rounded-full transition-all inline-flex items-center space-x-2 cursor-pointer shadow-sm ${
                  isDarkMode 
                    ? 'bg-emerald-600 hover:bg-emerald-500 hover:shadow-emerald-950/40 text-white' 
                    : 'bg-gradient-to-r from-[#113C24] to-[#1B5234] hover:shadow-lg text-white'
                }`}
              >
                <span>View All Modules</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>

        </div>
      </section>

      {/* Contact Section + Integrated Footer - Structured to fit within a single frame */}
      <section id="contact" className={`min-h-[calc(100vh-72px)] flex flex-col justify-between pt-6 sm:pt-8 pb-3 transition-colors duration-300 relative overflow-hidden scroll-mt-[72px] ${
        isDarkMode ? 'bg-[#04160E]' : 'bg-[#F9FBFA]'
      }`}>
        {/* Subtle decorative nature watermark on the top right */}
        <div className="absolute top-0 right-0 w-[42%] h-[65%] pointer-events-none select-none z-0 hidden lg:block overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&q=80&w=1200"
            alt="Green leaves decoration"
            className="w-full h-full object-cover object-left opacity-30"
            referrerPolicy="no-referrer"
          />
          <div className={`absolute inset-0 bg-gradient-to-l transition-colors duration-300 ${
            isDarkMode ? 'from-transparent via-[#04160E]/70 to-[#04160E]' : 'from-transparent via-[#F9FBFA]/80 to-[#F9FBFA]'
          }`} />
          <div className={`absolute inset-0 bg-gradient-to-t transition-colors duration-300 ${
            isDarkMode ? 'from-[#04160E] to-transparent' : 'from-[#F9FBFA] to-transparent'
          }`} />
        </div>

        {/* Contact Content (Upper Area of Frame) */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full my-auto py-2">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            
            {/* Left Col: Contact heading & callout */}
            <div className="lg:col-span-7 space-y-3">
              <div className={`inline-flex items-center space-x-1.5 text-[10px] font-extrabold tracking-widest uppercase px-3 py-0.5 rounded-full border transition-colors duration-300 ${
                isDarkMode 
                  ? 'text-emerald-400 bg-emerald-950/60 border-emerald-900/50' 
                  : 'text-[#113C24] bg-emerald-50 border-emerald-100'
              }`}>
                <span>CONTACT US</span>
                <span>🌿</span>
              </div>
              
              <h2 className={`text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight transition-colors duration-300 ${
                isDarkMode ? 'text-white' : 'text-slate-900'
              }`}>
                We're here to help elevate your facility
              </h2>
              
              <p className={`font-semibold text-xs sm:text-sm max-w-xl leading-relaxed transition-colors duration-300 ${
                isDarkMode ? 'text-slate-300' : 'text-slate-800'
              }`}>
                Have questions or want to collaborate? Reach out to our wildlife team or request a personalized walkthrough.
              </p>
              
              <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-1">
                {/* Phone */}
                <div className="flex items-center space-x-2.5">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-900/40' : 'bg-emerald-100 text-[#113C24]'}`}>
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <span className={`block text-[10px] font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-700'}`}>Phone</span>
                    <span className={`text-xs font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>+63 928 054 3536</span>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-center space-x-2.5">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-900/40' : 'bg-emerald-100 text-[#113C24]'}`}>
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <span className={`block text-[10px] font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-700'}`}>Email</span>
                    <span className={`text-xs font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>info@feronia.com</span>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-center space-x-2.5">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-rose-950/60 text-rose-400 border border-rose-900/40' : 'bg-rose-100 text-rose-700'}`}>
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <span className={`block text-[10px] font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-700'}`}>Location</span>
                    <span className={`text-xs font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Philippines</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Col: Quick Collaboration Box */}
            <div className="lg:col-span-5">
              <div className={`p-4 sm:p-5 rounded-2xl border shadow-md transition-all duration-300 ${
                isDarkMode 
                  ? 'bg-[#062414]/80 border-emerald-900/50 backdrop-blur-md' 
                  : 'bg-white border-slate-200/90 shadow-emerald-950/5'
              }`}>
                <div className="flex items-center space-x-2 mb-2">
                  <PawPrint className={`w-4 h-4 ${isDarkMode ? 'text-emerald-400' : 'text-[#113C24]'}`} fill="currentColor" />
                  <h4 className={`text-xs font-extrabold uppercase tracking-wider ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    Partner With FERONIA
                  </h4>
                </div>
                <p className={`text-[11px] font-semibold leading-relaxed mb-3 ${isDarkMode ? 'text-slate-300' : 'text-slate-800'}`}>
                  Join wildlife sanctuaries, rescue centers, and conservation facilities worldwide leveraging FERONIA for seamless daily care.
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setCollabForm({
                        name: '',
                        email: '',
                        organization: '',
                        type: 'Partnership',
                        message: ''
                      });
                      setIsCollabSubmitted(false);
                      setShowCollabModal(true);
                    }}
                    className={`flex-1 px-5 py-2.5 font-bold text-xs rounded-full shadow-xs hover:shadow-md transition-all inline-flex items-center justify-center space-x-2 cursor-pointer ${
                      isDarkMode 
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white' 
                        : 'bg-[#113C24] hover:bg-[#1B5234] text-white'
                    }`}
                  >
                    <span>Request Collaboration</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={onLoginClick}
                    className={`px-4 py-2.5 font-bold text-xs rounded-full transition-all border cursor-pointer ${
                      isDarkMode
                        ? 'border-emerald-800 text-emerald-300 hover:bg-emerald-950/50'
                        : 'border-slate-300 text-slate-800 hover:bg-slate-50'
                    }`}
                  >
                    Log In
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Integrated Footer (Bottom Area of Frame) */}
        <footer className="w-full bg-[#05140C] text-emerald-100 pt-4 pb-3 sm:pb-4 px-4 sm:px-6 lg:px-8 border-t border-emerald-950/60 shrink-0">
          <div className="max-w-7xl mx-auto space-y-3">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-start text-xs">
              
              {/* Col 1: Brand */}
              <div className="col-span-2 sm:col-span-1 space-y-1.5">
                <div className="flex items-center space-x-2 text-white">
                  <PawPrint className="w-5 h-5 text-emerald-400" fill="currentColor" />
                  <span className="font-extrabold text-base tracking-tight">FERONIA</span>
                </div>
                <p className="text-[8px] text-emerald-300 font-bold tracking-wider uppercase leading-tight">
                  WILDLIFE FACILITY MANAGEMENT
                </p>
                <div className="flex space-x-2 pt-1">
                  <span className="w-6 h-6 rounded-full border border-emerald-800/40 bg-white/5 flex items-center justify-center hover:bg-emerald-950 transition-colors cursor-pointer text-emerald-300">
                    <Facebook className="w-3 h-3" />
                  </span>
                  <span className="w-6 h-6 rounded-full border border-emerald-800/40 bg-white/5 flex items-center justify-center hover:bg-emerald-950 transition-colors cursor-pointer text-emerald-300">
                    <Instagram className="w-3 h-3" />
                  </span>
                  <span className="w-6 h-6 rounded-full border border-emerald-800/40 bg-white/5 flex items-center justify-center hover:bg-emerald-950 transition-colors cursor-pointer text-emerald-300">
                    <Youtube className="w-3 h-3" />
                  </span>
                </div>
              </div>

              {/* Col 2: Modules */}
              <div>
                <h4 className="text-white text-[11px] font-extrabold tracking-wider uppercase mb-1.5">Modules</h4>
                <ul className="space-y-1 text-[10px] text-emerald-200/80 font-medium">
                  <li>Animal & Medical Care</li>
                  <li>Enclosure & Habitat</li>
                  <li>Breeding & Incubation</li>
                  <li>Inventory & Reports</li>
                </ul>
              </div>

              {/* Col 3: Support */}
              <div>
                <h4 className="text-white text-[11px] font-extrabold tracking-wider uppercase mb-1.5">Support</h4>
                <ul className="space-y-1 text-[10px] text-emerald-200/80 font-medium">
                  <li>Help Center & Docs</li>
                  <li>User Guides</li>
                  <li>Privacy Policy</li>
                  <li>Terms of Service</li>
                </ul>
              </div>

              {/* Col 4: Newsletter */}
              <div className="col-span-2 sm:col-span-1 space-y-1.5">
                <h4 className="text-white text-[11px] font-extrabold tracking-wider uppercase mb-1">Stay Updated</h4>
                {isSubscribed ? (
                  <div className="bg-emerald-950/80 border border-emerald-500/30 text-emerald-200 text-[10px] px-3 py-1.5 rounded-lg flex items-center space-x-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="font-semibold truncate">Subscribed: {subscribedEmail}</span>
                  </div>
                ) : (
                  <form 
                    className="flex gap-1.5 w-full" 
                    onSubmit={(e) => { 
                      e.preventDefault(); 
                      setIsSubscribed(true); 
                    }}
                  >
                    <input
                      type="email"
                      placeholder="Your email"
                      value={subscribedEmail}
                      onChange={(e) => setSubscribedEmail(e.target.value)}
                      className="px-3 py-1.5 bg-white text-slate-800 text-[10px] rounded-full focus:outline-none focus:ring-1 focus:ring-emerald-500 flex-1 min-w-0 placeholder-slate-400 font-medium"
                      required
                    />
                    <button 
                      type="submit" 
                      className="px-3.5 py-1.5 bg-[#1B5234] hover:bg-[#236842] text-white text-[10px] font-bold rounded-full transition-colors cursor-pointer shrink-0"
                    >
                      Join
                    </button>
                  </form>
                )}
              </div>
            </div>

            <div className="border-t border-emerald-950/80 pt-2 flex items-center justify-between text-[9px] text-emerald-200/50 font-medium">
              <p>© 2026 FERONIA Wildlife Facility Management System.</p>
              <p>All rights reserved.</p>
            </div>
          </div>
        </footer>
      </section>

      {/* Video Demo Modal & Collaboration Request Modal Overlay */}
      <AnimatePresence>
        {showVideoModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4"
            onClick={() => setShowVideoModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className={`relative w-full max-w-4xl aspect-video rounded-3xl overflow-hidden border shadow-2xl ${
                isDarkMode ? 'border-emerald-500/30 bg-neutral-950' : 'border-white/20 bg-neutral-900'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowVideoModal(false)}
                className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-black/75 hover:bg-black text-white hover:text-emerald-400 flex items-center justify-center transition-all border border-white/10 cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>

              <iframe
                className="w-full h-full"
                src="https://www.youtube.com/embed/9No-FiEInLA?autoplay=1"
                title="FERONIA Wildlife Demo Video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </motion.div>
          </motion.div>
        )}

        {showCollabModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto"
            onClick={() => setShowCollabModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className={`relative w-full max-w-lg rounded-3xl p-6 md:p-8 border shadow-2xl transition-all ${
                isDarkMode 
                  ? 'border-emerald-900/60 bg-[#06180F] text-white shadow-black/50' 
                  : 'border-white bg-white text-slate-800 shadow-emerald-950/10'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowCollabModal(false)}
                className={`absolute top-4 right-4 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all border cursor-pointer ${
                  isDarkMode 
                    ? 'bg-emerald-950/60 border-emerald-900/60 hover:bg-emerald-900 text-emerald-400' 
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-500'
                }`}
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>

              {!isCollabSubmitted ? (
                <form onSubmit={handleCollabSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <span className={`text-[9px] font-extrabold tracking-widest uppercase px-2.5 py-0.5 rounded-full border inline-block ${
                      isDarkMode 
                        ? 'text-emerald-400 bg-emerald-950/50 border-emerald-900/40' 
                        : 'text-[#113C24] bg-emerald-50 border-emerald-100/60'
                    }`}>
                      🤝 Partner with FERONIA
                    </span>
                    <h3 className={`text-xl font-extrabold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-950'}`}>
                      Request Collaboration
                    </h3>
                    <p className={`text-[11px] font-medium leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>
                      Connect your wildlife organization, research lab, or conservation group with our team to start working together.
                    </p>
                  </div>

                  <div className="space-y-3.5">
                    <div className="space-y-1">
                      <label className={`block text-[9px] font-extrabold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        Full Name <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <User className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${isDarkMode ? 'text-emerald-500/60' : 'text-slate-400'}`} />
                        <input
                          type="text"
                          required
                          value={collabForm.name}
                          onChange={(e) => setCollabForm({ ...collabForm, name: e.target.value })}
                          placeholder="Juan Dela Cruz"
                          className={`w-full pl-10 pr-4 py-2 text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium ${
                            isDarkMode 
                              ? 'bg-[#092216] border-emerald-950 text-white placeholder-slate-500' 
                              : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400'
                          }`}
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className={`block text-[9px] font-extrabold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        Email Address <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Mail className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${isDarkMode ? 'text-emerald-500/60' : 'text-slate-400'}`} />
                        <input
                          type="email"
                          required
                          value={collabForm.email}
                          onChange={(e) => setCollabForm({ ...collabForm, email: e.target.value })}
                          placeholder="juan@organization.org"
                          className={`w-full pl-10 pr-4 py-2 text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium ${
                            isDarkMode 
                              ? 'bg-[#092216] border-emerald-950 text-white placeholder-slate-500' 
                              : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400'
                          }`}
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className={`block text-[9px] font-extrabold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        Organization / Facility <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Building className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${isDarkMode ? 'text-emerald-500/60' : 'text-slate-400'}`} />
                        <input
                          type="text"
                          required
                          value={collabForm.organization}
                          onChange={(e) => setCollabForm({ ...collabForm, organization: e.target.value })}
                          placeholder="Wildlife Conservation Philippines"
                          className={`w-full pl-10 pr-4 py-2 text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium ${
                            isDarkMode 
                              ? 'bg-[#092216] border-emerald-950 text-white placeholder-slate-500' 
                              : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400'
                          }`}
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className={`block text-[9px] font-extrabold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        Type of Collaboration <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={collabForm.type}
                        onChange={(e) => setCollabForm({ ...collabForm, type: e.target.value })}
                        className={`w-full px-4 py-2.5 text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-semibold ${
                          isDarkMode 
                            ? 'bg-[#092216] border-emerald-950 text-white' 
                            : 'bg-slate-50 border-slate-200 text-slate-800'
                        }`}
                      >
                        <option value="Partnership">Wildlife Care & Conservation Partnership</option>
                        <option value="Research">Academic & Scientific Research</option>
                        <option value="Funding">Sponsorship / Funding Support</option>
                        <option value="Volunteering">Volunteer Program Coordination</option>
                        <option value="Other">Other Initiatives</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className={`block text-[9px] font-extrabold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        Brief Description / Proposal <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <MessageSquare className={`absolute left-3.5 top-3 w-4 h-4 ${isDarkMode ? 'text-emerald-500/60' : 'text-slate-400'}`} />
                        <textarea
                          required
                          rows={3}
                          value={collabForm.message}
                          onChange={(e) => setCollabForm({ ...collabForm, message: e.target.value })}
                          placeholder="Tell us about your proposal, goals, and how you'd like to work together..."
                          className={`w-full pl-10 pr-4 py-2 text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium ${
                            isDarkMode 
                              ? 'bg-[#092216] border-emerald-950 text-white placeholder-slate-500' 
                              : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400'
                          }`}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowCollabModal(false)}
                      className={`flex-1 py-3 text-xs font-bold rounded-xl border transition-all text-center cursor-pointer ${
                        isDarkMode 
                          ? 'border-emerald-950 text-slate-300 hover:bg-emerald-950/40' 
                          : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                      }`}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className={`flex-1 py-3 text-xs font-bold text-white rounded-xl shadow-sm hover:shadow-md transition-all text-center cursor-pointer ${
                        isDarkMode 
                          ? 'bg-emerald-600 hover:bg-emerald-500' 
                          : 'bg-[#113C24] hover:bg-[#1B5234]'
                      }`}
                    >
                      Submit Proposal
                    </button>
                  </div>
                </form>
              ) : (
                <div className="text-center py-4 space-y-4 animate-fade-in">
                  <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-950/80 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400 mx-auto shadow-xs">
                    <CheckCircle className="w-8 h-8" />
                  </div>
                  
                  <div className="space-y-1.5">
                    <h3 className={`text-lg font-extrabold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-950'}`}>
                      Proposal Submitted!
                    </h3>
                    <p className={`text-xs leading-relaxed font-semibold ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                      Thank you, <span className="font-bold text-emerald-500">{collabForm.name}</span>. We've received your request. Our partnerships team will review the proposal and reach out to you at <span className="font-bold underline">{collabForm.email}</span>.
                    </p>
                  </div>

                  <div className={`p-4 rounded-2xl border text-left space-y-2 max-w-sm mx-auto ${
                    isDarkMode 
                      ? 'bg-[#092216]/85 border-emerald-950 text-slate-200' 
                      : 'bg-emerald-50/50 border-emerald-100 text-slate-800'
                  }`}>
                    <div className="flex justify-between items-center text-[9px] font-extrabold tracking-wider uppercase text-slate-500 dark:text-slate-400">
                      <span>Request Summary</span>
                      <span className="text-emerald-600 dark:text-emerald-400">Reference ID</span>
                    </div>
                    
                    <div className="flex justify-between items-center font-bold text-xs pt-1">
                      <span className={isDarkMode ? 'text-slate-300' : 'text-slate-700'}>Reference Code:</span>
                      <span className="font-mono text-emerald-600 dark:text-emerald-400 bg-white dark:bg-emerald-950 px-2.5 py-0.5 rounded border border-emerald-100 dark:border-emerald-900/60 text-[11px]">
                        {submittedRefId}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-xs font-semibold pt-1">
                      <span className={isDarkMode ? 'text-slate-400' : 'text-slate-500'}>Organization:</span>
                      <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{collabForm.organization}</span>
                    </div>

                    <div className="flex justify-between items-center text-xs font-semibold">
                      <span className={isDarkMode ? 'text-slate-400' : 'text-slate-500'}>Partnership Type:</span>
                      <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-400 rounded-full text-[9px] font-extrabold uppercase">
                        {collabForm.type}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => setShowCollabModal(false)}
                      className={`px-8 py-3 text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer ${
                        isDarkMode 
                          ? 'bg-emerald-950 border border-emerald-900 hover:bg-emerald-900 text-emerald-300' 
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      Close Window
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
