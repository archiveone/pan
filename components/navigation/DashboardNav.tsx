import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/Button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/Tabs"
import { usePathname } from "next/navigation"
import Link from "next/link"
import {
  ChevronRight,
  Home,
  Building,
  Briefcase,
  Compass,
  Users,
  LayoutDashboard,
  PlusCircle
} from "lucide-react"

interface DashboardNavProps {
  className?: string
}

// Navigation mapping for breadcrumbs and sections
const navigationMap = {
  dashboard: {
    icon: LayoutDashboard,
    label: "Dashboard",
    sections: ["Overview", "Analytics", "Reports"]
  },
  properties: {
    icon: Building,
    label: "Properties",
    sections: ["Listings", "Viewings", "Offers", "Private Market"]
  },
  services: {
    icon: Briefcase,
    label: "Services",
    sections: ["My Services", "Bookings", "Reviews"]
  },
  leisure: {
    icon: Compass,
    label: "Leisure",
    sections: ["My Listings", "Bookings", "Calendar"]
  },
  connect: {
    icon: Users,
    label: "Connect",
    sections: ["Network", "Groups", "CRM"]
  }
}

export function DashboardNav({ className }: DashboardNavProps) {
  const pathname = usePathname()
  const segments = pathname.split("/").filter(Boolean)
  const currentSection = segments[0] || "dashboard"
  const currentSubSection = segments[1] || "overview"

  // Get current section info
  const sectionInfo = navigationMap[currentSection as keyof typeof navigationMap]

  // Quick actions based on current section
  const quickActions = {
    properties: [
      { label: "Add Property", icon: PlusCircle, href: "/properties/create" },
      { label: "Schedule Viewing", icon: PlusCircle, href: "/properties/schedule-viewing" }
    ],
    services: [
      { label: "Add Service", icon: PlusCircle, href: "/services/create" },
      { label: "Create Quote", icon: PlusCircle, href: "/services/create-quote" }
    ],
    leisure: [
      { label: "Add Listing", icon: PlusCircle, href: "/leisure/create" },
      { label: "Create Event", icon: PlusCircle, href: "/leisure/create-event" }
    ],
    connect: [
      { label: "Add Contact", icon: PlusCircle, href: "/connect/add-contact" },
      { label: "Create Group", icon: PlusCircle, href: "/connect/create-group" }
    ]
  }

  const currentQuickActions = quickActions[currentSection as keyof typeof quickActions]

  return (
    <div className={cn("border-b bg-background", className)}>
      <div className="container flex h-16 items-center px-4">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center space-x-2 text-sm">
          <Link
            href="/"
            className="flex items-center text-muted-foreground hover:text-foreground"
          >
            <Home className="h-4 w-4" />
          </Link>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
          {sectionInfo && (
            <Link
              href={`/${currentSection}`}
              className="flex items-center text-muted-foreground hover:text-foreground"
            >
              <sectionInfo.icon className="mr-2 h-4 w-4" />
              {sectionInfo.label}
            </Link>
          )}
          {segments.length > 1 && (
            <>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium text-foreground capitalize">
                {currentSubSection.replace("-", " ")}
              </span>
            </>
          )}
        </nav>

        {/* Section Tabs */}
        {sectionInfo && (
          <Tabs
            value={currentSubSection}
            className="ml-auto"
          >
            <TabsList>
              {sectionInfo.sections.map((section) => (
                <TabsTrigger
                  key={section}
                  value={section.toLowerCase()}
                  asChild
                >
                  <Link href={`/${currentSection}/${section.toLowerCase()}`}>
                    {section}
                  </Link>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        )}

        {/* Quick Actions */}
        {currentQuickActions && (
          <div className="ml-4 flex items-center space-x-2">
            {currentQuickActions.map((action, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                asChild
              >
                <Link href={action.href}>
                  <action.icon className="mr-2 h-4 w-4" />
                  {action.label}
                </Link>
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}