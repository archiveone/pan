"use client";

import { Fragment } from "react";
import { Menu, Transition } from "@headlessui/react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import {
  MagnifyingGlassIcon,
  BellIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import { classNames } from "@/lib/utils";
import { Logo } from "@/components/ui/logo";

const navigation = [
  { name: "Properties", href: "/properties" },
  { name: "Services", href: "/services" },
  { name: "Leisure", href: "/leisure" },
  { name: "Connect", href: "/connect" },
];

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      {/* Main navigation - Apple-style glass effect */}
      <nav className="glass">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <Logo variant="dark" className="h-8 w-auto" />
            </div>

            {/* Center navigation */}
            <div className="hidden lg:flex lg:items-center lg:space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="nav-link"
                >
                  {item.name}
                </Link>
              ))}
            </div>

            {/* Right section */}
            <div className="flex items-center space-x-6">
              {/* Search */}
              <button
                type="button"
                className="text-gray-700 hover:text-gray-900 transition-apple"
              >
                <span className="sr-only">Search</span>
                <MagnifyingGlassIcon className="h-5 w-5" />
              </button>

              {/* Notifications */}
              <button
                type="button"
                className="text-gray-700 hover:text-gray-900 transition-apple"
              >
                <span className="sr-only">Notifications</span>
                <BellIcon className="h-5 w-5" />
              </button>

              {/* Profile dropdown */}
              <Menu as="div" className="relative">
                <Menu.Button className="flex items-center">
                  <span className="sr-only">Open user menu</span>
                  {session?.user?.image ? (
                    <img
                      src={session.user.image}
                      alt=""
                      className="h-8 w-8 rounded-full"
                    />
                  ) : (
                    <UserCircleIcon className="h-8 w-8 text-gray-700" />
                  )}
                </Menu.Button>
                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right rounded-lg bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <Menu.Item>
                      {({ active }) => (
                        <Link
                          href="/profile"
                          className={classNames(
                            active ? "bg-gray-50" : "",
                            "block px-4 py-2 text-sm text-gray-700"
                          )}
                        >
                          Your Profile
                        </Link>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <Link
                          href="/settings"
                          className={classNames(
                            active ? "bg-gray-50" : "",
                            "block px-4 py-2 text-sm text-gray-700"
                          )}
                        >
                          Settings
                        </Link>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={() => signOut()}
                          className={classNames(
                            active ? "bg-gray-50" : "",
                            "block w-full text-left px-4 py-2 text-sm text-gray-700"
                          )}
                        >
                          Sign out
                        </button>
                      )}
                    </Menu.Item>
                  </Menu.Items>
                </Transition>
              </Menu>
            </div>
          </div>
        </div>
      </nav>

      {/* Search bar with glass effect */}
      <div className="glass border-t border-white/20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-12 items-center">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search properties, services, or experiences..."
              className="ml-3 flex-1 border-0 bg-transparent text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-0 sm:text-sm"
            />
          </div>
        </div>
      </div>
    </header>
  );
}