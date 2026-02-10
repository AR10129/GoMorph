import { Github, Linkedin } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative border-t border-white/10 bg-gradient-to-b from-transparent to-black/20 mt-auto">
      <div className="container mx-auto px-6 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-3">
          <div className="inline-flex items-center gap-2">
            <img src="/gomorph_logo.jpg" alt="goMorph logo" className="w-6 h-6 rounded-md object-cover" />
            <span className="text-sm text-muted-foreground">
              © {currentYear} goMorph. All rights reserved.
            </span>
          </div>
          <div className="flex gap-4">
            <a 
              href="https://github.com/AR10129" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="GitHub"
            >
              <Github className="w-5 h-5" />
            </a>
            <a 
              href="https://www.linkedin.com/in/ayushi-raj-94bb43271" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="LinkedIn"
            >
              <Linkedin className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
