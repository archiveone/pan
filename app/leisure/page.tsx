export default function LeisurePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-white py-12 border-b">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">Leisure & Experiences</h1>
          <p className="text-xl text-gray-600">
            Discover rentals, experiences, and cultural activities
          </p>
        </div>
      </section>

      {/* Leisure Categories */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Rentals */}
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h2 className="text-2xl font-semibold mb-4">Rentals</h2>
              <p className="text-gray-600 mb-4">
                Find cars, boats, venues, and more for your next adventure
              </p>
              <button className="text-blue-600 font-semibold">
                Browse Rentals →
              </button>
            </div>

            {/* Experiences */}
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h2 className="text-2xl font-semibold mb-4">Experiences</h2>
              <p className="text-gray-600 mb-4">
                Discover local events, tours, exhibitions, and dining experiences
              </p>
              <button className="text-blue-600 font-semibold">
                Find Experiences →
              </button>
            </div>

            {/* List Your Offering */}
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h2 className="text-2xl font-semibold mb-4">List Your Offering</h2>
              <p className="text-gray-600 mb-4">
                Share your rental property or unique experience with our community
              </p>
              <button className="text-blue-600 font-semibold">
                Start Listing →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Experiences */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8">Featured Experiences</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Experience Cards will be dynamically rendered here */}
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white border rounded-xl overflow-hidden">
                <div className="aspect-video bg-gray-200" />
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-semibold">Experience Title</h3>
                    <span className="text-lg font-bold">£99</span>
                  </div>
                  <p className="text-gray-600 mb-4">Location</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-yellow-400">★★★★★</span>
                      <span className="ml-2 text-gray-600">(25 reviews)</span>
                    </div>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg">
                      Book Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Rentals */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8">Featured Rentals</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Rental Cards will be dynamically rendered here */}
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white border rounded-xl overflow-hidden shadow-md">
                <div className="aspect-video bg-gray-200" />
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-semibold">Rental Title</h3>
                    <span className="text-lg font-bold">£150/day</span>
                  </div>
                  <p className="text-gray-600 mb-4">Category • Location</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-yellow-400">★★★★★</span>
                      <span className="ml-2 text-gray-600">(30 reviews)</span>
                    </div>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg">
                      Reserve
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Host CTA */}
      <section className="py-12 bg-blue-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Become a Host</h2>
          <p className="text-xl text-gray-600 mb-8">
            Share your unique experiences or rental properties with our community
          </p>
          <button className="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold">
            Start Hosting
          </button>
        </div>
      </section>
    </div>
  )
}