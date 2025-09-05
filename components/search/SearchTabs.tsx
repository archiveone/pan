'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { 
  Home,
  Briefcase,
  Ticket,
  Building2,
  MapPin,
  Calendar,
  DollarSign,
  Search as SearchIcon
} from 'lucide-react';

interface SearchTabsProps {
  selectedTab: string;
  onTabChange: (tab: string) => void;
  className?: string;
}

const tabs = [
  {
    id: 'properties',
    label: 'Properties',
    icon: Home,
    placeholder: 'Search properties...',
  },
  {
    id: 'services',
    label: 'Services',
    icon: Briefcase,
    placeholder: 'Search services...',
  },
  {
    id: 'leisure',
    label: 'Leisure',
    icon: Ticket,
    placeholder: 'Search leisure activities...',
  },
];

export function SearchTabs({
  selectedTab,
  onTabChange,
  className
}: SearchTabsProps) {
  return (
    <div className={cn('w-full', className)}>
      {/* Desktop Tabs */}
      <div className="hidden md:flex items-center justify-between border rounded-full p-1 bg-background">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isSelected = selectedTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                'relative flex items-center justify-center w-1/3 py-2.5 text-sm font-medium rounded-full transition-colors',
                isSelected ? 'text-white' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {isSelected && (
                <motion.div
                  layoutId="desktop-tab-background"
                  className="absolute inset-0 bg-blue-600 rounded-full"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className="relative flex items-center">
                <Icon className="w-4 h-4 mr-2" />
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Mobile Tabs */}
      <div className="md:hidden grid grid-cols-3 gap-1 bg-background rounded-lg p-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isSelected = selectedTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                'relative flex flex-col items-center justify-center py-2 px-1 text-xs font-medium rounded-md transition-all',
                isSelected ? 'text-white' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {isSelected && (
                <motion.div
                  layoutId="mobile-tab-background"
                  className="absolute inset-0 bg-blue-600 rounded-md"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className="relative flex flex-col items-center gap-1">
                <Icon className="w-5 h-5" />
                <span className="text-[11px]">{tab.label}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}