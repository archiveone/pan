"use client";

import { Fragment } from "react";
import { Menu, Transition } from "@headlessui/react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import {
  Bars3Icon,
  BellIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import { classNames } from "@/lib/utils";
import { Logo } from "@/components/ui/logo";

interface NavbarProps {
  onMenuClick: () => void;
}

export default function Navbar({ onMenuClick }: NavbarProps) {
  const { data: session } = useSession();

  const userNavigation = [
    { name: "Your Profile", href: "/profile" },
    { name: "Settings", href: "/settings" },
    {
      name: "Sign out",
      href: "#",
      onClick: () => signOut({ callbackUrl: "/" }),
    },
  ];

  return (
    <header className="sticky top-0 z-40">
      {/* Main header with gradient */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-blue-400 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <button
                type="button"
                className="lg:hidden -m-2.5 p-2.5 text-white"
                onClick={onMenuClick}
              >
                <span className="sr-only">Open sidebar</span>
                <Bars3Icon className="h-6 w-6" aria-hidden="true" />
              </button>
              <div className="lg:ml-0 ml-4">
                <Logo variant="light" />
              </div>
            </div>
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              {/* Notifications */}
              <button
                type="button"
                className="-m-2.5 p-2.5 text-white hover:text-gray-100"
              >
                <span className="sr-only">View notifications</span>
                <BellIcon className="h-6 w-6" aria-hidden="true" />
              </button>

              {/* Profile dropdown */}
              <Menu as="div" className="relative">
                <Menu.Button className="-m-1.5 flex items-center p-1.5">
                  <span className="sr-only">Open user menu</span>
                  {session?.user?.image ? (
                    <img
                      className="h-8 w-8 rounded-full border-2 border-white"
                      src={session.user.image}
                      alt=""
                    />
                  ) : (
                    <UserCircleIcon
                      className="h-8 w-8 text-white"
                      aria-hidden="true"
                    />
                  )}
                  <span className="hidden lg:flex lg:items-center">
                    <span
                      className="ml-4 text-sm font-medium text-white"
                      aria-hidden="true"
                    >
                      {session?.user?.name}
                    </span>
                  </span>
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
                  <Menu.Items className="absolute right-0 z-10 mt-2.5 w-32 origin-top-right rounded-md bg-white py-2 shadow-lg ring-1 ring-gray-900/5 focus:outline-none">
                    {userNavigation.map((item) => (
                      <Menu.Item key={item.name}>
                        {({ active }) => (
                          <Link
                            href={item.href}
                            onClick={item.onClick}
                            className={classNames(
                              active ? "bg-gray-50" : "",
                              "block px-3 py-1 text-sm leading-6 text-gray-900"
                            )}
                          >
                            {item.name}
                          </Link>
                        )}
                      </Menu.Item>
                    ))}
                  </Menu.Items>
                </Transition>
              </Menu>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary navigation bar (optional) */}
      <nav className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-12 items-center justify-between">
            {/* Add any secondary navigation items here */}
          </div>
        </div>
      </nav>
    </header>
  );
}