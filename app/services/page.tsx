export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-white py-12 border-b">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">Professional Services</h1>
          <p className="text-xl text-gray-600">
            Connect with trusted trades and professional service providers
          </p>
        </div>
      </section>

      {/* Service Categories */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Trades */}
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h2 className="text-2xl font-semibold mb-4">Trades</h2>
              <p className="text-gray-600 mb-4">
                Find reliable tradespeople for your property maintenance and improvements
              </p>
              <button className="text-blue-600 font-semibold">
                Find Trades →
              </button>
            </div>

            {/* Professional Services */}
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h2 className="text-2xl font-semibold mb-4">Professional Services</h2>
              <p className="text-gray-600 mb-4">
                Connect with accountants, lawyers, and other professional service providers
              </p>
              <button className="text-blue-600 font-semibold">
                Browse Services →
              </button>
            </div>

            {/* List Your Services */}
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h2 className="text-2xl font-semibold mb-4">List Your Services</h2>
              <p className="text-gray-600 mb-4">
                Are you a professional? List your services and connect with clients
              </p>
              <button className="text-blue-600 font-semibold">
                Start Listing →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Service Providers */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8">Featured Service Providers</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Service Provider Cards will be dynamically rendered here */}
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white border rounded-xl overflow-hidden">
                <div className="p-4">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 rounded-full bg-gray-200 mr-4" />
                    <div>
                      <h3 className="text-xl font-semibold">Provider Name</h3>
                      <p className="text-gray-600">Service Category</p>
                    </div>
                  </div>
                  <p className="text-gray-600 mb-4">
                    Brief description of services offered and expertise...
                  </p>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <span className="text-yellow-400">★★★★★</span>
                      <span className="ml-2 text-gray-600">(50 reviews)</span>
                    </div>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg">
                      Contact
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Verification CTA */}
      <section className="py-12 bg-blue-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Get Verified</h2>
          <p className="text-xl text-gray-600 mb-8">
            Stand out from the crowd with our professional verification system
          </p>
          <button className="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold">
            Start Verification
          </button>
        </div>
      </section>
    </div>
  )
}