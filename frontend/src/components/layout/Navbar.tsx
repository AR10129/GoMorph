import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../ui/button';
import { Menu, X } from 'lucide-react';

interface NavbarProps {
  onGetStarted: () => void;
  onSignIn: () => void;
  isLoggedIn: boolean;
}

export function Navbar({ onGetStarted, onSignIn, isLoggedIn }: NavbarProps) {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'navbar-premium' : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button 
            onClick={() => navigate('/')} 
            className="flex items-center gap-2.5 group cursor-pointer bg-transparent border-none"
          >
            <img src="/gomorph_logo.jpg" alt="goMorph logo" className="w-9 h-9 rounded-md object-cover" />
            <span className="text-xl font-bold">
              go<span className="gradient-text">Morph</span>
            </span>
          </button>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-4 ml-auto">
            {!isLoggedIn ? (
              <>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={onSignIn}
                  className="text-muted-foreground hover:text-foreground"
                >
                  Sign In
                </Button>
                <Button onClick={onGetStarted} size="sm" className="btn-premium glow-primary">
                  Get Started
                </Button>
              </>
            ) : null}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 hover:bg-secondary/50 rounded-lg transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden py-4 border-t border-border"
          >
            <div className="flex flex-col gap-4">
              {!isLoggedIn && (
                <>
                  <Button 
                    variant="ghost" 
                    onClick={onSignIn}
                    className="text-muted-foreground hover:text-foreground w-full"
                  >
                    Sign In
                  </Button>
                  <Button onClick={onGetStarted} className="btn-premium glow-primary w-full">
                    Get Started
                  </Button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </motion.nav>
  );
}
