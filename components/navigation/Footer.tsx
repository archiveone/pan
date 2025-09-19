import { cn } from "@/lib/utils"
import Link from "next/link"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import {
  Building,
  Briefcase,
  Compass,
  Users,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  Mail
} from "lucide-react"

interface FooterProps {
  className?: string
}

const mainLinks = [
  {
    title: "Properties",
    icon: Building,
    links: [
      { label: "Buy Property", href: "/properties/buy" },
      { label: "Rent Property", href: "/properties/rent" },
      { label: "Sell Property", href: "/properties/sell" },
      { label: "Let Property", href: "/properties/let" },
      { label: "Private Market", href: "/properties/private" },
      { label: "Property Valuation", href: "/properties/valuation" }
    ]
  },
  {
    title: "Services",
    icon: Briefcase,
    links: [
      { label: "Find Services", href: "/services/find" },
      { label: "Professional Services", href: "/services/professional" },
      { label: "Trades", href: "/services/trades" },
      { label: "Offer Services", href: "/services/offer" },
      { label: "Service Directory", href: "/services/directory" }
    ]
  },
  {
    title: "Leisure",
    icon: Compass,
    links: [
      { label: "Rentals", href: "/leisure/rentals" },
      { label: "Experiences", href: "/leisure/experiences" },
      { label: "List Your Space", href: "/leisure/list" },
      { label: "Book Venue", href: "/leisure/venues" },
      { label: "Events", href: "/leisure/events" }
    ]
  },
  {
    title: "Connect",
    icon: Users,
    links: [
      { label: "Network", href: "/connect/network" },
      { label: "Groups", href: "/connect/groups" },
      { label: "CRM", href: "/connect/crm" },
      { label: "Find Contacts", href: "/connect/find" },
      { label: "Business Directory", href: "/connect/directory" }
    ]
  }
]

const companyLinks = [
  { label: "About Us", href: "/about" },
  { label: "Careers", href: "/careers" },
  { label: "Press", href: "/press" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" }
]

const legalLinks = [
  { label: "Terms", href: "/terms" },
  { label: "Privacy", href: "/privacy" },
  { label: "Cookies", href: "/cookies" },
  { label: "Accessibility", href: "/accessibility" },
  { label: "Sitemap", href: "/sitemap" }
]

const socialLinks = [
  { label: "Facebook", href: "https://facebook.com/greia", icon: Facebook },
  { label: "Twitter", href: "https://twitter.com/greia", icon: Twitter },
  { label: "Instagram", href: "https://instagram.com/greia", icon: Instagram },
  { label: "LinkedIn", href: "https://linkedin.com/company/greia", icon: Linkedin },
  { label: "YouTube", href: "https://youtube.com/greia", icon: Youtube }
]

export function Footer({ className }: FooterProps) {
  return (
    <footer className={cn("bg-background border-t", className)}>
      <div className="container px-4 py-12 md:py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4">
          {mainLinks.map((section, index) => (
            <div key={index}>
              <h3 className="flex items-center text-lg font-semibold mb-4">
                <section.icon className="mr-2 h-5 w-5" />
                {section.title}
              </h3>
              <ul className="space-y-2">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <Link
                      href={link.href}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter Section */}
        <div className="mt-12 border-t pt-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-2">
              <h4 className="text-lg font-semibold">Subscribe to our newsletter</h4>
              <p className="text-muted-foreground">
                Get the latest updates and insights from GREIA
              </p>
            </div>
            <div className="flex w-full md:w-auto gap-2">
              <Input
                type="email"
                placeholder="Enter your email"
                className="max-w-sm"
              />
              <Button>
                <Mail className="mr-2 h-4 w-4" />
                Subscribe
              </Button>
            </div>
          </div>
        </div>

        {/* Secondary Footer */}
        <div className="mt-12 border-t pt-8">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3">
            {/* Company Links */}
            <div>
              <h4 className="text-sm font-semibold mb-4">Company</h4>
              <ul className="space-y-2">
                {companyLinks.map((link, index) => (
                  <li key={index}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal Links */}
            <div>
              <h4 className="text-sm font-semibold mb-4">Legal</h4>
              <ul className="space-y-2">
                {legalLinks.map((link, index) => (
                  <li key={index}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Social Links */}
            <div>
              <h4 className="text-sm font-semibold mb-4">Follow Us</h4>
              <div className="flex space-x-4">
                {socialLinks.map((link, index) => (
                  <Link
                    key={index}
                    href={link.href}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <link.icon className="h-5 w-5" />
                    <span className="sr-only">{link.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 border-t pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center space-x-2">
              <img src="/logo.svg" alt="GREIA" className="h-8 w-8" />
              <span className="font-semibold">GREIA</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} GREIA. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}