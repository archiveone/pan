'use client'

import { useAuth } from '@/providers/auth-provider'

export default function DashboardPage() {
  const { user } = useAuth()

  const stats = [
    { name: 'Total Properties', value: '12' },
    { name: 'Active Listings', value: '8' },
    { name: 'Property Views', value: '245' },
    { name: 'New Leads', value: '15' },
  ]

  const recentActivity = [
    {
      id: 1,
      type: 'property_view',
      title: 'New property view',
      description: 'Someone viewed your property at 123 Main St',
      time: '2 hours ago',
    },
    {
      id: 2,
      type: 'lead',
      title: 'New lead received',
      description: 'John Doe is interested in your services',
      time: '5 hours ago',
    },
    {
      id: 3,
      type: 'message',
      title: 'New message',
      description: 'Sarah Smith sent you a message about property viewing',
      time: '1 day ago',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h1 className="text-2xl font-semibold">Welcome back, {user?.name}</h1>
        <p className="text-gray-600 mt-1">Here's what's happening with your account</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="bg-white rounded-lg p-6 shadow-sm"
          >
            <dt className="text-sm font-medium text-gray-500 truncate">
              {stat.name}
            </dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">
              {stat.value}
            </dd>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
            Add Property
          </button>
          <button className="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
            Create Service
          </button>
          <button className="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
            Add Listing
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
        <div className="space-y-4">
          {recentActivity.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg"
            >
              <div className="flex-1">
                <h3 className="text-sm font-medium text-gray-900">
                  {activity.title}
                </h3>
                <p className="text-sm text-gray-500">{activity.description}</p>
                <span className="text-xs text-gray-400">{activity.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming Tasks */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Upcoming Tasks</h2>
        <div className="space-y-2">
          <div className="flex items-center p-3 bg-gray-50 rounded-lg">
            <input type="checkbox" className="mr-3" />
            <span>Follow up with potential client</span>
            <span className="ml-auto text-sm text-gray-500">Today</span>
          </div>
          <div className="flex items-center p-3 bg-gray-50 rounded-lg">
            <input type="checkbox" className="mr-3" />
            <span>Update property listing photos</span>
            <span className="ml-auto text-sm text-gray-500">Tomorrow</span>
          </div>
          <div className="flex items-center p-3 bg-gray-50 rounded-lg">
            <input type="checkbox" className="mr-3" />
            <span>Schedule property viewing</span>
            <span className="ml-auto text-sm text-gray-500">Next Week</span>
          </div>
        </div>
      </div>
    </div>
  )
}