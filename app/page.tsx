export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="container mx-auto px-4">
          <h1 className="text-5xl font-bold mb-6">
            GREIA - Life&apos;s Operating System
          </h1>
          <p className="text-xl mb-8">
            One super-app for lifestyle, property, and networking
          </p>
          <div className="flex gap-4">
            <button className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold">
              Get Started
            </button>
            <button className="border-2 border-white px-6 py-3 rounded-lg font-semibold">
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Our Core Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Properties */}
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h3 className="text-xl font-semibold mb-4">Properties</h3>
              <p className="text-gray-600">
                Buy, rent, sell across residential, commercial, and luxury properties
              </p>
            </div>

            {/* Services */}
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h3 className="text-xl font-semibold mb-4">Services</h3>
              <p className="text-gray-600">
                Connect with trades, contractors, and professional services
              </p>
            </div>

            {/* Leisure */}
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h3 className="text-xl font-semibold mb-4">Leisure</h3>
              <p className="text-gray-600">
                Discover rentals, experiences, and cultural activities
              </p>
            </div>

            {/* Connect */}
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h3 className="text-xl font-semibold mb-4">Connect</h3>
              <p className="text-gray-600">
                Social networking and CRM for individuals & businesses
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-xl text-gray-600 mb-8">
            Join GREIA today and experience the future of lifestyle management
          </p>
          <button className="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold">
            Sign Up Now
          </button>
        </div>
      </section>
    </div>
  )
}