import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { FileText, Image, Music, Video, Archive } from 'lucide-react';

const categories = [
  { icon: FileText, label: 'Documents', formats: ['PDF', 'DOCX', 'TXT', 'RTF'], color: 'primary' },
  { icon: Image, label: 'Images', formats: ['PNG', 'JPG', 'WEBP', 'GIF'], color: 'accent' },
  { icon: Music, label: 'Audio', formats: ['MP3', 'WAV', 'FLAC', 'AAC'], color: 'primary' },
  { icon: Video, label: 'Video', formats: ['MP4', 'AVI', 'MOV', 'MKV'], color: 'accent' },
  { icon: Archive, label: 'Archives', formats: ['ZIP', 'RAR', '7Z', 'TAR'], color: 'primary' },
];

export function CategoryPanel() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const icons = container.querySelectorAll('.category-icon-item');
    
    icons.forEach((icon, index) => {
      gsap.to(icon, {
        y: -6,
        duration: 2.5 + index * 0.3,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
        delay: index * 0.15,
      });
    });
  }, []);

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="premium-card p-6 rounded-2xl h-fit"
    >
      <h3 className="text-sm font-semibold text-muted-foreground mb-6 uppercase tracking-wider">
        Supported Formats
      </h3>

      <div className="space-y-5">
        {categories.map((category, index) => {
          const Icon = category.icon;
          
          return (
            <div
              key={category.label}
              className="category-icon-item group cursor-pointer"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`p-2.5 rounded-xl bg-${category.color}/10 group-hover:bg-${category.color}/20 transition-all duration-300`}>
                  <Icon className={`w-5 h-5 text-${category.color}`} />
                </div>
                <span className="text-sm font-medium group-hover:text-foreground transition-colors">
                  {category.label}
                </span>
              </div>
              
              <div className="flex flex-wrap gap-1.5 ml-11">
                {category.formats.map((format) => (
                  <span
                    key={format}
                    className="text-xs px-2.5 py-1 rounded-md bg-secondary/80 text-muted-foreground group-hover:bg-secondary group-hover:text-foreground/80 transition-colors"
                  >
                    {format}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
