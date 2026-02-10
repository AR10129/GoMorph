import { motion } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

interface CategoryVisualProps {
  category: 'documents' | 'audio' | 'images' | 'video' | 'archives';
  isActive?: boolean;
}

export function CategoryVisual({ category, isActive = false }: CategoryVisualProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const elements = containerRef.current.querySelectorAll('.float-element');
    
    elements.forEach((el, i) => {
      gsap.to(el, {
        y: -10 - i * 2,
        rotation: i % 2 === 0 ? 3 : -3,
        duration: 3 + i * 0.5,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
        delay: i * 0.2,
      });
    });
  }, []);

  const getVisual = () => {
    switch (category) {
      case 'documents':
        return <DocumentVisual />;
      case 'audio':
        return <AudioVisual />;
      case 'images':
        return <ImageVisual />;
      case 'video':
        return <VideoVisual />;
      case 'archives':
        return <ArchiveVisual />;
      default:
        return null;
    }
  };

  return (
    <motion.div
      ref={containerRef}
      className="relative w-full h-full flex items-center justify-center"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* Background glow */}
      <div 
        className={`absolute w-64 h-64 rounded-full transition-all duration-700 ${
          isActive ? 'opacity-100 scale-110' : 'opacity-50 scale-100'
        }`}
        style={{
          background: 'radial-gradient(circle, hsl(var(--primary) / 0.15) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />
      
      {getVisual()}
    </motion.div>
  );
}

function DocumentVisual() {
  return (
    <div className="relative w-48 h-64">
      {/* Main document */}
      <div className="float-element absolute inset-0 premium-card-elevated rounded-lg overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-card to-background" />
        
        {/* Folded corner */}
        <div className="absolute -top-1 -right-1 w-10 h-10">
          <div 
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(135deg, hsl(var(--primary) / 0.3) 0%, hsl(var(--card)) 50%)',
              clipPath: 'polygon(100% 0, 0 100%, 100% 100%)',
            }}
          />
        </div>

        {/* Document lines */}
        <div className="p-6 pt-8 space-y-3">
          {[1, 0.7, 0.85, 0.6, 0.75, 0.5].map((width, i) => (
            <div 
              key={i}
              className="h-2 rounded-full bg-border/60"
              style={{ width: `${width * 100}%` }}
            />
          ))}
        </div>
      </div>

      {/* Secondary document (behind) */}
      <div 
        className="float-element absolute -bottom-4 -right-4 w-40 h-52 premium-card rounded-lg opacity-50"
        style={{ transform: 'rotate(6deg)' }}
      />
    </div>
  );
}

function AudioVisual() {
  return (
    <div className="relative w-64 h-48 flex items-center justify-center">
      {/* Microphone base */}
      <div className="float-element relative">
        <div className="w-20 h-32 premium-card-elevated rounded-full flex items-center justify-center">
          <div className="w-16 h-28 rounded-full bg-gradient-to-b from-primary/20 to-accent/10 border border-primary/30" />
        </div>
        
        {/* Stand */}
        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-2 h-8 bg-border rounded-full" />
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-12 h-2 bg-border rounded-full" />
      </div>

      {/* Waveform */}
      <div className="absolute right-4 flex items-center gap-1 h-24">
        {[0.4, 0.7, 1, 0.6, 0.9, 0.5, 0.8, 0.3, 0.6, 0.4].map((height, i) => (
          <motion.div
            key={i}
            className="w-1.5 rounded-full bg-gradient-to-t from-primary to-accent"
            initial={{ scaleY: 0.3 }}
            animate={{ scaleY: height }}
            transition={{
              duration: 0.5,
              delay: i * 0.08,
              repeat: Infinity,
              repeatType: 'reverse',
              ease: 'easeInOut',
            }}
            style={{ 
              height: '100%',
              transformOrigin: 'center',
            }}
          />
        ))}
      </div>
    </div>
  );
}

function ImageVisual() {
  return (
    <div className="relative w-56 h-48">
      {/* Main photo frame */}
      <div className="float-element absolute inset-0 premium-card-elevated rounded-xl overflow-hidden">
        {/* Photo content simulation */}
        <div className="absolute inset-2 rounded-lg overflow-hidden">
          <div 
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(135deg, hsl(var(--gradient-cyan) / 0.3) 0%, hsl(var(--gradient-violet) / 0.3) 50%, hsl(var(--gradient-pink) / 0.2) 100%)',
            }}
          />
          
          {/* Mountain shapes */}
          <div 
            className="absolute bottom-0 left-0 right-0 h-1/2"
            style={{
              background: 'linear-gradient(135deg, hsl(220 30% 15%) 0%, hsl(220 30% 20%) 100%)',
              clipPath: 'polygon(0 60%, 30% 20%, 50% 50%, 70% 10%, 100% 40%, 100% 100%, 0 100%)',
            }}
          />
          
          {/* Sun */}
          <div 
            className="absolute top-4 right-4 w-8 h-8 rounded-full"
            style={{
              background: 'radial-gradient(circle, hsl(var(--primary)) 0%, hsl(var(--primary) / 0) 70%)',
            }}
          />
        </div>
      </div>

      {/* Secondary frame (behind) */}
      <div 
        className="float-element absolute -bottom-6 -left-6 w-44 h-36 premium-card rounded-xl opacity-40"
        style={{ transform: 'rotate(-8deg)' }}
      />
    </div>
  );
}

function VideoVisual() {
  return (
    <div className="relative w-56 h-44">
      {/* Video player frame */}
      <div className="float-element absolute inset-0 premium-card-elevated rounded-xl overflow-hidden">
        {/* Screen */}
        <div className="absolute inset-2 rounded-lg bg-background/80 flex items-center justify-center">
          {/* Play button */}
          <motion.div 
            className="w-14 h-14 rounded-full flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--accent)) 100%)',
            }}
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div 
              className="w-0 h-0 ml-1"
              style={{
                borderTop: '8px solid transparent',
                borderBottom: '8px solid transparent',
                borderLeft: '14px solid hsl(var(--primary-foreground))',
              }}
            />
          </motion.div>
        </div>

        {/* Progress bar */}
        <div className="absolute bottom-3 left-3 right-3 h-1 bg-border rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-primary rounded-full"
            initial={{ width: '0%' }}
            animate={{ width: '40%' }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>
      </div>

      {/* Camera accent */}
      <div className="float-element absolute -top-3 -right-3 w-8 h-6 premium-card rounded-md flex items-center justify-center">
        <div className="w-3 h-3 rounded-full border-2 border-primary" />
      </div>
    </div>
  );
}

function ArchiveVisual() {
  return (
    <div className="relative w-48 h-48 flex items-center justify-center">
      {/* Main box */}
      <div className="float-element relative w-40 h-36 premium-card-elevated rounded-xl overflow-hidden">
        {/* Box lid */}
        <div 
          className="absolute top-0 left-0 right-0 h-8 border-b border-border"
          style={{
            background: 'linear-gradient(180deg, hsl(var(--card)) 0%, hsl(var(--secondary)) 100%)',
          }}
        />
        
        {/* Zipper stripe */}
        <div className="absolute top-8 bottom-4 left-1/2 -translate-x-1/2 w-6">
          {[...Array(6)].map((_, i) => (
            <div 
              key={i}
              className="w-full h-3 mb-1 rounded-sm"
              style={{
                background: i % 2 === 0 
                  ? 'hsl(var(--primary) / 0.3)' 
                  : 'hsl(var(--border))',
              }}
            />
          ))}
        </div>
      </div>

      {/* Floating compression particles */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-sm bg-primary/40"
          initial={{ 
            x: Math.cos(i * 1.2) * 60,
            y: Math.sin(i * 1.2) * 60,
            opacity: 0,
          }}
          animate={{ 
            x: 0,
            y: 0,
            opacity: [0, 0.6, 0],
          }}
          transition={{
            duration: 2,
            delay: i * 0.3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}
