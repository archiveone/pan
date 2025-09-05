'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Sun,
  Moon,
  Palette,
  Bell,
  Globe,
  Lock,
  User,
  Shield,
  ChevronRight,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useTheme } from 'next-themes';

type GradientTheme = 'blue' | 'sunset';

interface SettingsSection {
  title: string;
  icon: any;
  description: string;
  href: string;
}

const settingsSections: SettingsSection[] = [
  {
    title: 'Profile',
    icon: User,
    description: 'Manage your personal information',
    href: '/settings/profile',
  },
  {
    title: 'Notifications',
    icon: Bell,
    description: 'Configure your notification preferences',
    href: '/settings/notifications',
  },
  {
    title: 'Language',
    icon: Globe,
    description: 'Change your language settings',
    href: '/settings/language',
  },
  {
    title: 'Privacy',
    icon: Lock,
    description: 'Control your privacy settings',
    href: '/settings/privacy',
  },
  {
    title: 'Security',
    icon: Shield,
    description: 'Manage your security preferences',
    href: '/settings/security',
  },
];

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const [gradientTheme, setGradientTheme] = useState<GradientTheme>('blue');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Load saved gradient theme from localStorage
    const savedGradient = localStorage.getItem('gradientTheme');
    if (savedGradient) {
      setGradientTheme(savedGradient as GradientTheme);
    }
  }, []);

  const handleGradientChange = (value: GradientTheme) => {
    setGradientTheme(value);
    localStorage.setItem('gradientTheme', value);
    // Update root element class for global styling
    document.documentElement.classList.remove('gradient-blue', 'gradient-sunset');
    document.documentElement.classList.add(`gradient-${value}`);
  };

  if (!mounted) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>

      <div className="grid gap-8">
        {/* Theme Settings */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Palette className="w-5 h-5" />
            Appearance
          </h2>

          <div className="space-y-6">
            {/* Dark Mode Toggle */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  {theme === 'dark' ? (
                    <Moon className="w-4 h-4" />
                  ) : (
                    <Sun className="w-4 h-4" />
                  )}
                  <Label>Dark Mode</Label>
                </div>
                <p className="text-sm text-muted-foreground">
                  Switch between light and dark themes
                </p>
              </div>
              <Switch
                checked={theme === 'dark'}
                onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
              />
            </div>

            {/* Gradient Theme Selection */}
            <div className="space-y-4">
              <Label>Gradient Theme</Label>
              <RadioGroup
                value={gradientTheme}
                onValueChange={(value: GradientTheme) => handleGradientChange(value)}
                className="grid gap-4"
              >
                <div className={cn(
                  "flex items-center space-x-4 p-4 border rounded-lg cursor-pointer",
                  gradientTheme === 'blue' && "border-primary"
                )}>
                  <RadioGroupItem value="blue" id="blue" />
                  <div className="flex-1">
                    <Label htmlFor="blue">Blue Gradient</Label>
                    <div className="h-2 w-full rounded-full greia-gradient-blue mt-2" />
                  </div>
                </div>

                <div className={cn(
                  "flex items-center space-x-4 p-4 border rounded-lg cursor-pointer",
                  gradientTheme === 'sunset' && "border-primary"
                )}>
                  <RadioGroupItem value="sunset" id="sunset" />
                  <div className="flex-1">
                    <Label htmlFor="sunset">Sunset Gradient</Label>
                    <div className="h-2 w-full rounded-full greia-gradient-sunset mt-2" />
                  </div>
                </div>
              </RadioGroup>
            </div>
          </div>
        </Card>

        {/* Other Settings Sections */}
        <div className="grid gap-4">
          {settingsSections.map((section, index) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-4 hover:bg-muted/50 transition-colors cursor-pointer">
                <div className="flex items-center">
                  <div className="p-2 rounded-full bg-primary/10 mr-4">
                    <section.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{section.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {section.description}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}