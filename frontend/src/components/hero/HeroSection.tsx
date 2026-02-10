import { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { motion } from 'framer-motion';
import { Button } from '../ui/button';
import { ArrowRight, Play } from 'lucide-react';
import { CategoryVisual } from '../3d/CategoryVisual';

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

const categories = [
  { 
    id: 'documents' as const,
    name: 'Document Conversion', 
    description: 'Transform documents between formats while preserving formatting and layout.',
    formats: 'PDF, DOCX, TXT, RTF, ODT',
  },
  { 
    id: 'audio' as const,
    name: 'Audio Conversion', 
    description: 'Convert audio files to your preferred format while maintaining sound quality.',
    formats: 'MP3, WAV, FLAC, AAC, OGG',
  },
  { 
    id: 'images' as const,
    name: 'Image Conversion', 
    description: 'Transform images with precise quality control and format optimization.',
    formats: 'PNG, JPG, WEBP, GIF, SVG',
  },
  { 
    id: 'video' as const,
    name: 'Video Conversion', 
    description: 'Convert videos for any platform with customizable compression settings.',
    formats: 'MP4, AVI, MOV, MKV, WEBM',
  },
  { 
    id: 'archives' as const,
    name: 'Archive Conversion', 
    description: 'Compress and extract archives with support for all major formats.',
    formats: 'ZIP, RAR, 7Z, TAR, GZIP',
  },
];

interface HeroSectionProps {
  onGetStarted: () => void;
}

export function HeroSection({ onGetStarted }: HeroSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const categoriesRef = useRef<HTMLDivElement>(null);
  const [activeCategory, setActiveCategory] = useState(0);

  const scrollToFeatures = () => {
    const featuresSection = document.getElementById('features-section');
    if (featuresSection) {
      gsap.to(window, {
        duration: 1,
        scrollTo: { y: featuresSection, offsetY: 0 },
        ease: 'power3.inOut',
      });
    }
  };

  useEffect(() => {
    const categoriesEl = categoriesRef.current;
    if (!categoriesEl) return;

    const categoryElements = categoriesEl.querySelectorAll('.category-section');
    
    categoryElements.forEach((el, index) => {
      const direction = index % 2 === 0 ? 80 : -80;
      
      gsap.fromTo(el, 
        { 
          x: direction,
          opacity: 0,
        },
        {
          x: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 75%',
            end: 'top 40%',
            toggleActions: 'play none none reverse',
            onEnter: () => setActiveCategory(index),
            onEnterBack: () => setActiveCategory(index),
          },
        }
      );
    });

    return () => {
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);

  return (
    <section ref={sectionRef} className="relative layered-bg min-h-screen">
      {/* Fluid abstract wave backgrounds */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Large organic blob - top right */}
        <div 
          className="organic-blob organic-blob-teal animate-morph w-[700px] h-[600px] -top-20 -right-32"
          style={{ opacity: 0.7 }}
        />
        
        {/* Coral/orange flowing shape - right side */}
        <div 
          className="fluid-wave fluid-wave-2 animate-drift w-[800px] h-[700px] top-1/4 -right-40"
          style={{ 
            opacity: 0.85,
            borderRadius: '40% 60% 55% 45% / 50% 40% 60% 50%',
          }}
        />

        {/* Purple wave - left side */}
        <div 
          className="organic-blob organic-blob-purple animate-morph w-[500px] h-[450px] top-1/3 -left-40"
          style={{ 
            opacity: 0.8,
            animationDelay: '-5s',
          }}
        />

        {/* Teal accent curve - bottom */}
        <div 
          className="fluid-wave fluid-wave-3 w-[600px] h-[400px] bottom-20 left-1/4 animate-drift"
          style={{ 
            opacity: 0.6,
            borderRadius: '55% 45% 50% 50% / 45% 55% 45% 55%',
            animationDelay: '-10s',
          }}
        />

        {/* Floating decorative orbs */}
        <div 
          className="floating-orb floating-orb-gradient w-16 h-16 top-32 right-1/3 animate-float-gentle"
          style={{ boxShadow: '0 4px 20px hsl(var(--gradient-orange) / 0.4)' }}
        />
        <div 
          className="floating-orb floating-orb-solid w-10 h-10 top-48 right-1/4 animate-float-subtle"
          style={{ animationDelay: '-2s' }}
        />
        <div 
          className="floating-orb floating-orb-teal w-12 h-12 bottom-1/3 left-1/3 animate-float-gentle"
          style={{ animationDelay: '-4s' }}
        />
        <div 
          className="floating-orb floating-orb-gradient w-8 h-8 top-2/3 right-1/2 animate-float-subtle"
          style={{ opacity: 0.8, animationDelay: '-3s' }}
        />

        {/* Wave layers at bottom */}
        <div className="wave-layer wave-layer-back bottom-0" style={{ opacity: 0.9 }} />
        <div className="wave-layer wave-layer-mid bottom-0" style={{ opacity: 0.95 }} />
        <div className="wave-layer wave-layer-front bottom-0" />
      </div>

      {/* Hero content */}
      <div className="relative container mx-auto px-6 pt-32 pb-24">
        <div className="grid lg:grid-cols-2 gap-16 items-center min-h-[80vh]">
          {/* Left content */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-8"
          >
            

            {/* Heading */}
            <h1 className="heading-display text-balance">
              <span className="block text-foreground">Transform any file</span>
              <span className="gradient-text">seamlessly.</span>
            </h1>

            {/* Description */}
            <p className="text-lg text-muted-foreground max-w-lg leading-relaxed">
              Professional-grade conversion for documents, images, audio, video, and archives. 
              Lightning fast, secure, and designed for the modern web.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4 pt-4">
              <Button 
                size="lg" 
                onClick={onGetStarted}
                className="btn-premium glow-primary h-12 px-8 text-base"
              >
                Get Started
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={scrollToFeatures}
                className="h-12 px-8 text-base border-border hover:bg-secondary/50"
              >
                <Play className="mr-2 w-4 h-4" />
                View Features
              </Button>
            </div>

            {/* Stats */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="flex gap-12 pt-8"
            >
              {[
                { value: '15+', label: 'Formats' },
                { value: 'Free', label: 'Forever' },
                { value: 'Fast', label: 'Conversion' },
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="text-3xl font-bold gradient-text">{stat.value}</div>
                  <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right - Hero Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="relative h-[500px] hidden lg:flex items-center justify-center"
          >
            <CategoryVisual 
              category={categories[activeCategory].id}
              isActive={true}
            />
          </motion.div>
        </div>
      </div>

      {/* Section divider */}
      <div className="section-divider" />

      {/* Features section */}
      <div id="features-section" ref={categoriesRef} className="relative section-spacing-lg">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="container mx-auto px-6 text-center mb-24"
        >
          <h2 className="heading-section mb-4">
            Everything you need to
            <span className="gradient-text block mt-2">convert any file</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Professional-grade conversion tools for every file type, 
            built with speed and quality in mind.
          </p>
        </motion.div>

        {/* Category sections */}
        <div className="container mx-auto px-6 space-y-32">
          {categories.map((category, index) => {
            const isEven = index % 2 === 0;
            
            return (
              <div
                key={category.id}
                className={`category-section flex flex-col lg:flex-row items-center gap-12 lg:gap-20 ${
                  !isEven ? 'lg:flex-row-reverse' : ''
                }`}
              >
                {/* Visual */}
                <div className="flex-1 flex justify-center">
                  <div className="relative w-80 h-72">
                    <CategoryVisual 
                      category={category.id}
                      isActive={activeCategory === index}
                    />
                  </div>
                </div>

                {/* Content */}
                <div className={`flex-1 ${isEven ? 'lg:pr-8' : 'lg:pl-8'}`}>
                  <div className={`max-w-md ${!isEven ? 'lg:ml-auto' : ''}`}>
                    <span className="text-sm font-medium text-primary uppercase tracking-wider mb-4 block">
                      {category.id}
                    </span>
                    <h3 className="text-3xl md:text-4xl font-bold mb-4">
                      {category.name}
                    </h3>
                    <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                      {category.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {category.formats.split(', ').map((format) => (
                        <span 
                          key={format}
                          className="px-3 py-1.5 text-sm rounded-lg bg-secondary border border-border"
                        >
                          {format}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom CTA section */}
      <div className="relative section-spacing">
        <div className="container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="premium-card-elevated max-w-3xl mx-auto p-12 md:p-16 rounded-3xl"
          >
            <h2 className="heading-section mb-4">Ready to convert?</h2>
            <p className="text-muted-foreground text-lg mb-8 max-w-lg mx-auto">
              Start converting your files in seconds. No credit card required.
            </p>
            <Button 
              size="lg" 
              onClick={onGetStarted}
              className="btn-premium glow-primary h-12 px-10 text-base"
            >
              Get Started Free
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}