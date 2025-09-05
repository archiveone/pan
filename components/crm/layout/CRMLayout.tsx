'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutGrid,
  Users,
  ListTodo,
  Target,
  DollarSign,
  Settings,
  ChevronDown,
  Plus,
  Search,
  Bell,
  Menu,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface CRMLayoutProps {
  children: React.ReactNode;
}

const navigation = [
  {
    name: 'Dashboard',
    href: '/crm/dashboard',
    icon: LayoutGrid,
  },
  {
    name: 'Leads',
    href: '/crm/leads',
    icon: Target,
  },
  {
    name: 'Tasks',
    href: '/crm/tasks',
    icon: ListTodo,
  },
  {
    name: 'Contacts',
    href: '/crm/contacts',
    icon: Users,
  },
  {
    name: 'Deals',
    href: '/crm/deals',
    icon: DollarSign,
  },
  {
    name: 'Settings',
    href: '/crm/settings',
    icon: Settings,
  },
];

const quickActions = [
  { name: 'New Lead', href: '/crm/leads/new' },
  { name: 'New Task', href: '/crm/tasks/new' },
  { name: 'New Contact', href: '/crm/contacts/new' },
  { name: 'New Deal', href: '/crm/deals/new' },
];

export function CRMLayout({ children }: CRMLayoutProps) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentWorkspace, setCurrentWorkspace] = useState('Main Workspace');

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-white border-r">
        {/* Workspace Selector */}
        <div className="px-4 py-6 border-b">
          <Select value={currentWorkspace} onValueChange={setCurrentWorkspace}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select workspace" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Main Workspace">Main Workspace</SelectItem>
              <SelectItem value="Sales">Sales</SelectItem>
              <SelectItem value="Marketing">Marketing</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-4 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'group flex items-center px-3 py-2 text-sm font-medium rounded-md',
                  isActive
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                )}
              >
                <item.icon
                  className={cn(
                    'mr-3 h-5 w-5',
                    isActive ? 'text-gray-500' : 'text-gray-400 group-hover:text-gray-500'
                  )}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Workspace Stats */}
        <div className="p-4 border-t">
          <div className="space-y-4">
            <div>
              <div className="text-xs font-medium text-gray-500">Active Leads</div>
              <div className="text-2xl font-semibold">24</div>
            </div>
            <div>
              <div className="text-xs font-medium text-gray-500">Tasks Due Today</div>
              <div className="text-2xl font-semibold">8</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <SheetHeader className="px-4 py-6 border-b">
            <SheetTitle>
              <Select value={currentWorkspace} onValueChange={setCurrentWorkspace}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select workspace" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Main Workspace">Main Workspace</SelectItem>
                  <SelectItem value="Sales">Sales</SelectItem>
                  <SelectItem value="Marketing">Marketing</SelectItem>
                </SelectContent>
              </Select>
            </SheetTitle>
          </SheetHeader>
          <nav className="flex-1 px-2 py-4 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'group flex items-center px-3 py-2 text-sm font-medium rounded-md',
                    isActive
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  )}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon
                    className={cn(
                      'mr-3 h-5 w-5',
                      isActive ? 'text-gray-500' : 'text-gray-400 group-hover:text-gray-500'
                    )}
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="lg:pl-64 flex flex-col flex-1">
        {/* Top Navigation */}
        <header className="bg-white shadow">
          <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200 sm:px-6 lg:px-8">
            <div className="flex items-center flex-1">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-6 w-6" />
              </Button>
              <div className="flex items-center flex-1 px-2 lg:px-0">
                <div className="max-w-2xl w-full lg:max-w-md">
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center">
                      <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <Input
                      type="search"
                      placeholder="Search..."
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Quick Actions */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    New
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {quickActions.map((action) => (
                    <DropdownMenuItem key={action.name} asChild>
                      <Link href={action.href}>{action.name}</Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Notifications */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0">
                      3
                    </Badge>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {/* Add notification items here */}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar>
                      <AvatarImage src={session?.user?.image || ''} />
                      <AvatarFallback>
                        {session?.user?.name?.charAt(0) || '?'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Profile</DropdownMenuItem>
                  <DropdownMenuItem>Settings</DropdownMenuItem>
                  <DropdownMenuItem>Sign out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Breadcrumbs */}
          <div className="px-4 py-4 sm:px-6 lg:px-8">
            <nav className="flex" aria-label="Breadcrumb">
              {/* Add breadcrumbs based on current route */}
            </nav>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 pb-8">
          <div className="px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-white border-t">
          <div className="px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                © 2025 GREIA CRM. All rights reserved.
              </div>
              <div className="flex space-x-6">
                <Link href="/help" className="text-sm text-gray-500 hover:text-gray-900">
                  Help Center
                </Link>
                <Link href="/privacy" className="text-sm text-gray-500 hover:text-gray-900">
                  Privacy
                </Link>
                <Link href="/terms" className="text-sm text-gray-500 hover:text-gray-900">
                  Terms
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}