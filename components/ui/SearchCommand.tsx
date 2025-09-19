import * as React from "react"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator
} from "@/components/ui/Command"
import {
  Building,
  Briefcase,
  Compass,
  Users,
  Search,
  Settings,
  HelpCircle,
  MessageSquare,
  Bell,
  Home,
  PlusCircle,
  Calendar,
  CreditCard,
  User,
  Lock
} from "lucide-react"

interface SearchCommandProps {
  children: React.ReactNode
}

const searchCategories = [
  {
    title: "Properties",
    icon: Building,
    items: [
      { name: "Search Properties", href: "/properties/search" },
      { name: "My Listings", href: "/properties/my-listings" },
      { name: "Saved Properties", href: "/properties/saved" },
      { name: "Private Market", href: "/properties/private" },
      { name: "Add Property", href: "/properties/create" }
    ]
  },
  {
    title: "Services",
    icon: Briefcase,
    items: [
      { name: "Find Services", href: "/services/find" },
      { name: "My Services", href: "/services/my-services" },
      { name: "Service Bookings", href: "/services/bookings" },
      { name: "Add Service", href: "/services/create" }
    ]
  },
  {
    title: "Leisure",
    icon: Compass,
    items: [
      { name: "Browse Rentals", href: "/leisure/rentals" },
      { name: "Experiences", href: "/leisure/experiences" },
      { name: "My Bookings", href: "/leisure/bookings" },
      { name: "List Space", href: "/leisure/create" }
    ]
  },
  {
    title: "Connect",
    icon: Users,
    items: [
      { name: "My Network", href: "/connect/network" },
      { name: "Groups", href: "/connect/groups" },
      { name: "CRM", href: "/connect/crm" },
      { name: "Add Contact", href: "/connect/add-contact" }
    ]
  }
]

const quickActions = [
  { name: "New Property", icon: Building, href: "/properties/create" },
  { name: "New Service", icon: Briefcase, href: "/services/create" },
  { name: "New Listing", icon: Compass, href: "/leisure/create" },
  { name: "Add Contact", icon: Users, href: "/connect/add-contact" }
]

const commonPages = [
  { name: "Dashboard", icon: Home, href: "/dashboard" },
  { name: "Messages", icon: MessageSquare, href: "/messages" },
  { name: "Notifications", icon: Bell, href: "/notifications" },
  { name: "Calendar", icon: Calendar, href: "/calendar" },
  { name: "Settings", icon: Settings, href: "/settings" },
  { name: "Billing", icon: CreditCard, href: "/billing" },
  { name: "Profile", icon: User, href: "/profile" },
  { name: "Verification", icon: Lock, href: "/verification" },
  { name: "Help", icon: HelpCircle, href: "/help" }
]

export function SearchCommand({ children }: SearchCommandProps) {
  const [open, setOpen] = React.useState(false)
  const router = useRouter()
  const { theme } = useTheme()

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  const runCommand = React.useCallback((command: () => unknown) => {
    setOpen(false)
    command()
  }, [])

  return (
    <>
      <div onClick={() => setOpen(true)}>{children}</div>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="Type a command or search..."
          className="h-12"
        />
        <CommandList className="max-h-[80vh]">
          <CommandEmpty>
            <div className="flex flex-col items-center justify-center py-6">
              <Search className="h-8 w-8 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">
                No results found.
              </p>
            </div>
          </CommandEmpty>

          {/* Quick Actions */}
          <CommandGroup heading="Quick Actions">
            {quickActions.map((action) => (
              <CommandItem
                key={action.href}
                onSelect={() => runCommand(() => router.push(action.href))}
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                <action.icon className="mr-2 h-4 w-4" />
                {action.name}
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandSeparator />

          {/* Main Categories */}
          {searchCategories.map((category) => (
            <CommandGroup key={category.title} heading={category.title}>
              {category.items.map((item) => (
                <CommandItem
                  key={item.href}
                  onSelect={() => runCommand(() => router.push(item.href))}
                >
                  <category.icon className="mr-2 h-4 w-4" />
                  {item.name}
                </CommandItem>
              ))}
            </CommandGroup>
          ))}

          <CommandSeparator />

          {/* Common Pages */}
          <CommandGroup heading="Common Pages">
            {commonPages.map((page) => (
              <CommandItem
                key={page.href}
                onSelect={() => runCommand(() => router.push(page.href))}
              >
                <page.icon className="mr-2 h-4 w-4" />
                {page.name}
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandSeparator />

          {/* Theme Toggle */}
          <CommandGroup heading="Theme">
            <CommandItem
              onSelect={() => runCommand(() => document.body.classList.toggle("dark"))}
            >
              <div className="flex items-center justify-between w-full">
                <span>Toggle Theme</span>
                <span className="text-muted-foreground text-sm">
                  {theme === "dark" ? "Light" : "Dark"}
                </span>
              </div>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}