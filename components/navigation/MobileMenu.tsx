import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/Button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/Sheet"
import { ScrollArea } from "@/components/ui/ScrollArea"
import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Menu,
  X,
  Home,
  Building,
  Briefcase,
  Compass,
  Users,
  MessageSquare,
  Bell,
  Settings,
  PlusCircle,
  ChevronRight,
  ChevronDown
} from "lucide-react"

interface MobileMenuProps {
  className?: string
}

const menuItems = [
  {
    title: "Home",
    icon: Home,
    href: "/",
  },
  {
    title: "Properties",
    icon: Building,
    href: "/properties",
    submenu: [
      { title: "Buy", href: "/properties/buy" },
      { title: "Rent", href: "/properties/rent" },
      { title: "Sell", href: "/properties/sell" },
      { title: "Let", href: "/properties/let" },
      { title: "Private Market", href: "/properties/private" }
    ]
  },
  {
    title: "Services",
    icon: Briefcase,
    href: "/services",
    submenu: [
      { title: "Find Services", href: "/services/find" },
      { title: "Professional Services", href: "/services/professional" },
      { title: "Trades", href: "/services/trades" },
      { title: "Offer Services", href: "/services/offer" }
    ]
  },
  {
    title: "Leisure",
    icon: Compass,
    href: "/leisure",
    submenu: [
      { title: "Rentals", href: "/leisure/rentals" },
      { title: "Experiences", href: "/leisure/experiences" },
      { title: "List Your Space", href: "/leisure/list" }
    ]
  },
  {
    title: "Connect",
    icon: Users,
    href: "/connect",
    submenu: [
      { title: "Network", href: "/connect/network" },
      { title: "Groups", href: "/connect/groups" },
      { title: "CRM", href: "/connect/crm" },
      { title: "Find Contacts", href: "/connect/find" }
    ]
  },
  {
    title: "Messages",
    icon: MessageSquare,
    href: "/messages"
  },
  {
    title: "Notifications",
    icon: Bell,
    href: "/notifications"
  },
  {
    title: "Settings",
    icon: Settings,
    href: "/settings"
  }
]

export function MobileMenu({ className }: MobileMenuProps) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [expandedMenus, setExpandedMenus] = useState<string[]>([])

  const toggleSubmenu = (title: string) => {
    setExpandedMenus(prev => 
      prev.includes(title)
        ? prev.filter(item => item !== title)
        : [...prev, title]
    )
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className={className}>
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-full sm:w-80 p-0">
        <div className="flex h-16 items-center border-b px-6">
          <Link href="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
            <img src="/logo.svg" alt="GREIA" className="h-6 w-6" />
            <span className="font-bold">GREIA</span>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto"
            onClick={() => setOpen(false)}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close menu</span>
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
              <div className="space-y-1">
                {menuItems.map((item, index) => {
                  const isActive = pathname === item.href
                  const isExpanded = expandedMenus.includes(item.title)
                  
                  return (
                    <div key={index}>
                      <div className="flex items-center">
                        {item.submenu ? (
                          <Button
                            variant={isActive ? "secondary" : "ghost"}
                            size="sm"
                            className="w-full justify-between"
                            onClick={() => toggleSubmenu(item.title)}
                          >
                            <span className="flex items-center">
                              <item.icon className="mr-2 h-4 w-4" />
                              {item.title}
                            </span>
                            {isExpanded ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </Button>
                        ) : (
                          <Button
                            asChild
                            variant={isActive ? "secondary" : "ghost"}
                            size="sm"
                            className="w-full justify-start"
                            onClick={() => setOpen(false)}
                          >
                            <Link href={item.href}>
                              <item.icon className="mr-2 h-4 w-4" />
                              {item.title}
                            </Link>
                          </Button>
                        )}
                      </div>

                      {/* Submenu */}
                      {item.submenu && isExpanded && (
                        <div className="ml-4 mt-1 space-y-1">
                          {item.submenu.map((subItem, subIndex) => {
                            const isSubActive = pathname === subItem.href
                            
                            return (
                              <Button
                                key={subIndex}
                                asChild
                                variant={isSubActive ? "secondary" : "ghost"}
                                size="sm"
                                className="w-full justify-start"
                                onClick={() => setOpen(false)}
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