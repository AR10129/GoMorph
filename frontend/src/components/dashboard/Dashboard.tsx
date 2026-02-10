import { motion } from 'framer-motion';
import { ConversionWorkspace } from './ConversionWorkspace';
import { Button } from '../ui/button';
import { LogOut, User, History, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

interface DashboardProps {
  onLogout: () => void;
  userEmail: string;
  username: string;
}

export function Dashboard({ onLogout, userEmail, username }: DashboardProps) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen pt-24 pb-12 relative">
      {/* Background gradient */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className="abstract-blob abstract-blob-primary w-[600px] h-[600px] -top-40 -right-60"
          style={{ opacity: 0.3 }}
        />
      </div>

      <div className="container mx-auto px-6 relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-2xl font-bold">Conversion Workspace</h1>
            <p className="text-muted-foreground">Upload and convert your files instantly</p>
          </div>
          <div className="flex items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-3 px-4 py-2.5 premium-card rounded-xl h-auto">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-sm font-medium">{username || userEmail}</span>
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/history')} className="cursor-pointer">
                  <History className="w-4 h-4 mr-2" />
                  Conversion History
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onLogout} className="cursor-pointer text-red-600">
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </motion.div>

        {/* Main content */}
        <ConversionWorkspace />
      </div>
    </div>
  );
}
