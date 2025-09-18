export default function ConnectPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-white py-12 border-b">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">Connect & Network</h1>
          <p className="text-xl text-gray-600">
            Your professional network and CRM in one place
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Social Network */}
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h2 className="text-2xl font-semibold mb-4">Social Network</h2>
              <p className="text-gray-600 mb-4">
                Connect with professionals, share updates, and grow your network
              </p>
              <button className="text-blue-600 font-semibold">
                View Network →
              </button>
            </div>

            {/* CRM */}
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h2 className="text-2xl font-semibold mb-4">Built-in CRM</h2>
              <p className="text-gray-600 mb-4">
                Manage contacts, track leads, and organize your business relationships
              </p>
              <button className="text-blue-600 font-semibold">
                Open CRM →
              </button>
            </div>

            {/* Groups */}
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h2 className="text-2xl font-semibold mb-4">Professional Groups</h2>
              <p className="text-gray-600 mb-4">
                Join industry groups, share knowledge, and collaborate with peers
              </p>
              <button className="text-blue-600 font-semibold">
                Explore Groups →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CRM Dashboard Preview */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8">Your CRM Dashboard</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Stats Cards */}
            <div className="bg-blue-50 p-6 rounded-xl">
              <h3 className="text-lg font-semibold text-gray-600">Total Contacts</h3>
              <p className="text-3xl font-bold">250</p>
            </div>
            <div className="bg-green-50 p-6 rounded-xl">
              <h3 className="text-lg font-semibold text-gray-600">Active Leads</h3>
              <p className="text-3xl font-bold">45</p>
            </div>
            <div className="bg-yellow-50 p-6 rounded-xl">
              <h3 className="text-lg font-semibold text-gray-600">Tasks Due</h3>
              <p className="text-3xl font-bold">12</p>
            </div>
            <div className="bg-purple-50 p-6 rounded-xl">
              <h3 className="text-lg font-semibold text-gray-600">Deals Won</h3>
              <p className="text-3xl font-bold">28</p>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Activity */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8">Recent Activity</h2>
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="divide-y">
              {/* Activity Items */}
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-4 hover:bg-gray-50">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-gray-200 mr-4" />
                    <div>
                      <p className="font-semibold">Activity Title</p>
                      <p className="text-sm text-gray-600">2 hours ago</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Professional Groups */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8">Professional Groups</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Group Cards */}
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white border rounded-xl overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 rounded-lg bg-gray-200 mr-4" />
                    <div>
                      <h3 className="text-xl font-semibold">Group Name</h3>
                      <p className="text-gray-600">500 members</p>
                    </div>
                  </div>
                  <p className="text-gray-600 mb-4">
                    Group description and focus area...
                  </p>
                  <button className="w-full bg-blue-600 text-white py-2 rounded-lg">
                    Join Group
                  </button>
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
            Build trust with a verified professional profile
          </p>
          <button className="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold">
            Verify Profile
          </button>
        </div>
      </section>
    </div>
  )
}