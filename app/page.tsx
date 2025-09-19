import { MarketingLayout } from "@/components/layout/MarketingLayout"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/Tabs"
import { motion } from "framer-motion"
import {
  Building,
  Briefcase,
  Compass,
  Users,
  ArrowRight,
  Search,
  Star,
  Shield,
  Globe,
  MessageSquare
} from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <MarketingLayout>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-background pt-24 pb-32">
        <div className="container relative z-10">
          <div className="mx-auto max-w-3xl text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-4xl font-bold tracking-tight sm:text-6xl"
            >
              Life's Operating System
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mt-6 text-lg leading-8 text-muted-foreground"
            >
              One super-app for lifestyle, property, and networking. Your digital fabric for everyday life.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-10 flex items-center justify-center gap-x-6"
            >
              <Button size="lg" asChild>
                <Link href="/signup">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/about">Learn more</Link>
              </Button>
            </motion.div>
          </div>

          {/* Search Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mx-auto mt-16 max-w-2xl"
          >
            <Tabs defaultValue="properties" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="properties">
                  <Building className="mr-2 h-4 w-4" />
                  Properties
                </TabsTrigger>
                <TabsTrigger value="services">
                  <Briefcase className="mr-2 h-4 w-4" />
                  Services
                </TabsTrigger>
                <TabsTrigger value="leisure">
                  <Compass className="mr-2 h-4 w-4" />
                  Leisure
                </TabsTrigger>
                <TabsTrigger value="connect">
                  <Users className="mr-2 h-4 w-4" />
                  Connect
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="mt-4 flex gap-2">
              <Input
                placeholder="Search properties, services, leisure activities..."
                className="flex-1"
              />
              <Button>
                <Search className="mr-2 h-4 w-4" />
                Search
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Background Elements */}
        <div className="absolute inset-0 -z-10 mx-0 max-w-none overflow-hidden">
          <div className="absolute left-1/2 top-0 ml-[-38rem] h-[25rem] w-[81.25rem] dark:[mask-image:linear-gradient(white,transparent)]">
            <div className="absolute inset-0 bg-gradient-to-r from-[#36b49f] to-[#DBFF75] opacity-40 [mask-image:radial-gradient(farthest-side_at_top,white,transparent)] dark:from-[#36b49f]/30 dark:to-[#DBFF75]/30 dark:opacity-100">
              <svg
                aria-hidden="true"
                className="absolute inset-x-0 inset-y-[-50%] h-[200%] w-full skew-y-[-18deg] fill-black/40 stroke-black/50 mix-blend-overlay dark:fill-white/2.5 dark:stroke-white/5"
              >
                <defs>
                  <pattern
                    id="grid"
                    width="72"
                    height="56"
                    patternUnits="userSpaceOnUse"
                    x="50%"
                    y="100%"
                  >
                    <path d="M.5 56V.5H72" fill="none" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" strokeWidth="0" fill="url(#grid)" />
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 sm:py-32">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Everything you need in one place
            </h2>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">
              GREIA brings together all aspects of modern living into a single, seamless platform.
            </p>
          </div>

          <div className="mx-auto mt-16 max-w-7xl">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {/* Properties */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="relative overflow-hidden rounded-2xl border bg-background p-8"
              >
                <Building className="h-10 w-10 text-primary" />
                <h3 className="mt-4 text-xl font-semibold">Properties</h3>
                <p className="mt-2 text-muted-foreground">
                  Buy, rent, or sell properties with ease. Access our private marketplace for exclusive listings.
                </p>
              </motion.div>

              {/* Services */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="relative overflow-hidden rounded-2xl border bg-background p-8"
              >
                <Briefcase className="h-10 w-10 text-primary" />
                <h3 className="mt-4 text-xl font-semibold">Services</h3>
                <p className="mt-2 text-muted-foreground">
                  Find trusted professionals and trade services. Book and manage appointments seamlessly.
                </p>
              </motion.div>

              {/* Leisure */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="relative overflow-hidden rounded-2xl border bg-background p-8"
              >
                <Compass className="h-10 w-10 text-primary" />
                <h3 className="mt-4 text-xl font-semibold">Leisure</h3>
                <p className="mt-2 text-muted-foreground">
                  Discover and book unique experiences, rentals, and venues for any occasion.
                </p>
              </motion.div>

              {/* Connect */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="relative overflow-hidden rounded-2xl border bg-background p-8"
              >
                <Users className="h-10 w-10 text-primary" />
                <h3 className="mt-4 text-xl font-semibold">Connect</h3>
                <p className="mt-2 text-muted-foreground">
                  Build your network, manage contacts, and join professional groups.
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 sm:py-32 bg-accent/50">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Why choose GREIA?
            </h2>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">
              Experience the benefits of our comprehensive platform.
            </p>
          </div>

          <div className="mx-auto mt-16 max-w-7xl">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {/* Unified Platform */}
              <div className="flex items-start gap-4">
                <Globe className="h-8 w-8 text-primary" />
                <div>
                  <h3 className="text-lg font-semibold">Unified Platform</h3>
                  <p className="mt-2 text-muted-foreground">
                    All your needs in one place - no more juggling multiple apps.
                  </p>
                </div>
              </div>

              {/* Verified Users */}
              <div className="flex items-start gap-4">
                <Shield className="h-8 w-8 text-primary" />
                <div>
                  <h3 className="text-lg font-semibold">Verified Users</h3>
                  <p className="mt-2 text-muted-foreground">
                    Trust and safety with our comprehensive verification system.
                  </p>
                </div>
              </div>

              {/* Smart Matching */}
              <div className="flex items-start gap-4">
                <Star className="h-8 w-8 text-primary" />
                <div>
                  <h3 className="text-lg font-semibold">Smart Matching</h3>
                  <p className="mt-2 text-muted-foreground">
                    Intelligent recommendations based on your preferences.
                  </p>
                </div>
              </div>

              {/* Real-time Updates */}
              <div className="flex items-start gap-4">
                <MessageSquare className="h-8 w-8 text-primary" />
                <div>
                  <h3 className="text-lg font-semibold">Real-time Updates</h3>
                  <p className="mt-2 text-muted-foreground">
                    Stay informed with instant notifications and messages.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 sm:py-32">
        <div className="container">
          <div className="relative isolate overflow-hidden rounded-3xl bg-primary px-6 py-24 text-center shadow-2xl sm:px-24">
            <h2 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Ready to get started?
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-primary-foreground/80">
              Join thousands of users already benefiting from GREIA's comprehensive platform.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/signup">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="bg-transparent text-white border-white hover:bg-white/10" asChild>
                <Link href="/contact">Contact Sales</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </MarketingLayout>
  )
}