"use client";

import { useSession } from "next-auth/react";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Card } from "@/components/ui/card";
import {
  BuildingOfficeIcon,
  WrenchIcon,
  TicketIcon,
  UsersIcon,
  ChartBarIcon,
  BellIcon,
} from "@heroicons/react/24/outline";

const stats = [
  {
    name: "Properties",
    value: "12",
    change: "+2.1%",
    changeType: "positive",
    icon: BuildingOfficeIcon,
  },
  {
    name: "Services",
    value: "24",
    change: "+5.4%",
    changeType: "positive",
    icon: WrenchIcon,
  },
  {
    name: "Leisure",
    value: "8",
    change: "+3.2%",
    changeType: "positive",
    icon: TicketIcon,
  },
  {
    name: "Connections",
    value: "156",
    change: "+12.5%",
    changeType: "positive",
    icon: UsersIcon,
  },
];

const recentActivity = [
  {
    id: 1,
    type: "property_view",
    title: "Someone viewed your property listing",
    description: "3-bed apartment in Downtown",
    time: "5 minutes ago",
  },
  {
    id: 2,
    type: "service_booking",
    title: "New service booking request",
    description: "Plumbing service - Emergency repair",
    time: "1 hour ago",
  },
  {
    id: 3,
    type: "leisure_inquiry",
    title: "New inquiry for your leisure listing",
    description: "Yacht rental - Weekend package",
    time: "2 hours ago",
  },
  {
    id: 4,
    type: "connection_request",
    title: "New connection request",
    description: "John Smith wants to connect",
    time: "3 hours ago",
  },
];

export default function DashboardPage() {
  const { data: session } = useSession();

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Welcome section */}
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Welcome back, {session?.user?.name}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Here's what's happening with your GREIA account today.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.name} className="px-4 py-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <stat.icon
                    className="h-6 w-6 text-gray-400"
                    aria-hidden="true"
                  />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {stat.name}
                    </dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900">
                        {stat.value}
                      </div>
                      <div
                        className={`inline-flex items-baseline text-sm font-semibold ${
                          stat.changeType === "positive"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {stat.change}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Recent Activity */}
        <div>
          <h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
          <div className="mt-6 flow-root">
            <ul role="list" className="-my-5 divide-y divide-gray-200">
              {recentActivity.map((activity) => (
                <li key={activity.id} className="py-5">
                  <div className="relative focus-within:ring-2 focus-within:ring-indigo-500">
                    <h3 className="text-sm font-semibold text-gray-800">
                      <span className="absolute inset-0" aria-hidden="true" />
                      {activity.title}
                    </h3>
                    <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                      {activity.description}
                    </p>
                    <p className="mt-1 text-sm text-gray-500">{activity.time}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-6">
            <a
              href="#"
              className="flex items-center justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
            >
              View all activity
            </a>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}