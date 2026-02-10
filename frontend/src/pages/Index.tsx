import { useState, useEffect } from 'react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { HeroSection } from '../components/hero/HeroSection';
import { AuthModal } from '../components/auth/AuthModal';
import { Dashboard } from '../components/dashboard/Dashboard';
import { useAuth } from '../contexts/AuthContext';

const Index = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signup' | 'signin'>('signup');
  const { isLoggedIn, userEmail, username, logout } = useAuth();

  const handleGetStarted = () => {
    setAuthMode('signup');
    setIsAuthModalOpen(true);
  };

  const handleSignIn = () => {
    setAuthMode('signin');
    setIsAuthModalOpen(true);
  };

  const handleAuthSuccess = (email: string) => {
    setIsAuthModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar 
        onGetStarted={handleGetStarted}
        onSignIn={handleSignIn}
        isLoggedIn={isLoggedIn} 
      />
      
      {isLoggedIn ? (
        <Dashboard onLogout={logout} userEmail={userEmail} username={username} />
      ) : (
        <HeroSection onGetStarted={handleGetStarted} />
      )}

      <Footer />

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
        initialMode={authMode}
      />
    </div>
  );
};

export default Index;
