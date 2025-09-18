export default function PropertiesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-white py-12 border-b">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">Properties</h1>
          <p className="text-xl text-gray-600">
            Find your perfect property or list your own
          </p>
        </div>
      </section>

      {/* Property Categories */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Buy */}
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h2 className="text-2xl font-semibold mb-4">Buy</h2>
              <p className="text-gray-600 mb-4">
                Browse properties for sale across residential, commercial, and luxury segments
              </p>
              <button className="text-blue-600 font-semibold">
                Browse Properties →
              </button>
            </div>

            {/* Rent */}
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h2 className="text-2xl font-semibold mb-4">Rent</h2>
              <p className="text-gray-600 mb-4">
                Find your next rental property from verified landlords and agents
              </p>
              <button className="text-blue-600 font-semibold">
                View Rentals →
              </button>
            </div>

            {/* List */}
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h2 className="text-2xl font-semibold mb-4">List</h2>
              <p className="text-gray-600 mb-4">
                List your property and connect with verified real estate agents
              </p>
              <button className="text-blue-600 font-semibold">
                Start Listing →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8">Featured Properties</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Property Cards will be dynamically rendered here */}
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white border rounded-xl overflow-hidden">
                <div className="aspect-video bg-gray-200" />
                <div className="p-4">
                  <h3 className="text-xl font-semibold mb-2">Property Title</h3>
                  <p className="text-gray-600">Location</p>
                  <div className="mt-4 flex justify-between items-center">
                    <span className="text-lg font-bold">£1,000,000</span>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg">
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Valuation CTA */}
      <section className="py-12 bg-blue-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Get a Property Valuation</h2>
          <p className="text-xl text-gray-600 mb-8">
            Connect with verified agents to get an accurate valuation of your property
          </p>
          <button className="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold">
            Request Valuation
          </button>
        </div>
      </section>
    </div>
  )
}