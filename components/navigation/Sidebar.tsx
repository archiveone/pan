import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/Button"
import { ScrollArea } from "@/components/ui/ScrollArea"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/Sheet"
import { usePathname } from "next/navigation"
import Link from "next/link"
import {
  Home,
  Building,
  Briefcase,
  Compass,
  Users,
  LayoutDashboard,
  MessageSquare,
  Bell,
  Settings,
  PlusCircle,
  Lock,
  LineChart,
  Wallet,
  X
} from "lucide-react"

interface SidebarProps {
  className?: string
  open?: boolean
  onClose?: () => void
}

const sidebarItems = [
  {
    title: "Home",
    icon: Home,
    href: "/",
    variant: "default" as const
  },
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
    variant: "default" as const
  },
  {
    title: "Properties",
    icon: Building,
    href: "/properties",
    variant: "default" as const,
    items: [
      { title: "Browse", href: "/properties/browse" },
      { title: "My Listings", href: "/properties/my-listings" },
      { title: "Saved", href: "/properties/saved" },
      { title: "Private Market", href: "/properties/private" }
    ]
  },
  {
    title: "Services",
    icon: Briefcase,
    href: "/services",
    variant: "default" as const,
    items: [
      { title: "Find Services", href: "/services/find" },
      { title: "My Services", href: "/services/my-services" },
      { title: "Bookings", href: "/services/bookings" }
    ]
  },
  {
    title: "Leisure",
    icon: Compass,
    href: "/leisure",
    variant: "default" as const,
    items: [
      { title: "Rentals", href: "/leisure/rentals" },
      { title: "Experiences", href: "/leisure/experiences" },
      { title: "My Bookings", href: "/leisure/bookings" }
    ]
  },
  {
    title: "Connect",
    icon: Users,
    href: "/connect",
    variant: "default" as const,
    items: [
      { title: "Network", href: "/connect/network" },
      { title: "Groups", href: "/connect/groups" },
      { title: "CRM", href: "/connect/crm" }
    ]
  },
  {
    title: "Messages",
    icon: MessageSquare,
    href: "/messages",
    variant: "default" as const
  },
  {
    title: "Notifications",
    icon: Bell,
    href: "/notifications",
    variant: "default" as const
  },
  {
    title: "Analytics",
    icon: LineChart,
    href: "/analytics",
    variant: "default" as const
  },
  {
    title: "Verification",
    icon: Lock,
    href: "/verification",
    variant: "ghost" as const
  },
  {
    title: "Billing",
    icon: Wallet,
    href: "/billing",
    variant: "ghost" as const
  },
  {
    title: "Settings",
    icon: Settings,
    href: "/settings",
    variant: "ghost" as const
  }
]

export function Sidebar({ className, open, onClose }: SidebarProps) {
  const pathname = usePathname()

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent
        side="left"
        className={cn(
          "fixed top-0 left-0 z-40 h-full w-64 border-r bg-background p-0",
          className
        )}
      >
        <div className="flex h-16 items-center border-b px-6">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.svg" alt="GREIA" className="h-6 w-6" />
            <span className="font-bold">GREIA</span>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto lg:hidden"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <ScrollArea className="h-[calc(100vh-4rem)] pb-10">
          <div className="space-y-4 py-4">
            {/* Create New Button */}
            <div className="px-3">
              <Button className="w-full justify-start" size="sm">
                <PlusCircle className="mr-2 h-4 w-4" />
                Create New
              </Button>
            </div>

            {/* Navigation Items */}
            <div className="px-3 py-2">
              <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
                Overview
              </h2>
              <div className="space-y-1">
                {sidebarItems.map((item, index) => {
                  const isActive = pathname === item.href
                  
                  return (
                    <div key={index}>
                      <Button
                        asChild
                        variant={item.variant}
                        size="sm"
                        className={cn(
                          "w-full justify-start",
                          isActive && "bg-accent"
                        )}
                      >
                        <Link href={item.href}>
                          <item.icon className="mr-2 h-4 w-4" />
                          {item.title}
                        </Link>
                      </Button>
                      
                      {item.items && (
                        <div className="ml-4 mt-1 space-y-1">
                          {item.items.map((subItem, subIndex) => {
                            const isSubActive = pathname === subItem.href
                            
                            return (
                              <Button
                                key={subIndex}
                                asChild
                                variant="ghost"
                                size="sm"
                                className={cn(
                                  "w-full justify-start",
                                  isSubActive && "bg-accent"
                                )}
                              >
                                <Link href={subItem.href}>
                                  {subItem.title}
                                </Link>
                              </Button>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}