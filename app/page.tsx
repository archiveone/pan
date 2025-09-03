import Link from 'next/link'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold text-center mb-8">
          Welcome to GREIA - Life&apos;s Operating System
        </h1>
        
        {/* Core Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="p-6 border rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Properties</h2>
            <p>Buy, rent, sell residential & commercial properties</p>
          </div>
          
          <div className="p-6 border rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Services</h2>
            <p>Connect with trades & professional services</p>
          </div>
          
          <div className="p-6 border rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Leisure</h2>
            <p>Discover rentals, experiences & activities</p>
          </div>
          
          <div className="p-6 border rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Connect</h2>
            <p>Network, manage contacts & grow communities</p>
          </div>
        </div>

        {/* Key Features */}
        <div className="space-y-6">
          <div className="p-6 border rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Landlord Lead Generation</h3>
            <p>Upload properties and connect with verified agents - 5% commission routing</p>
          </div>
          
          <div className="p-6 border rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Property Valuation Marketplace</h3>
            <p>Get instant valuations from local verified agents</p>
          </div>
          
          <div className="p-6 border rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Built-in CRM</h3>
            <p>Manage listings, contacts & schedules in one place</p>
          </div>
          
          <div className="p-6 border rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Agent Referral Programme</h3>
            <p>20% commission split for agent referrals</p>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-12 text-center">
          <Link 
            href="/auth/signup"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Get Started
          </Link>
        </div>
      </div>
    </main>
  )
}