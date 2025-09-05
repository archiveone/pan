"use client";

import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import {
  HomeIcon,
  BuildingOfficeIcon,
  WrenchIcon,
  TicketIcon,
  UsersIcon,
  ChartBarIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { classNames } from "@/lib/utils";
import { Logo } from "@/components/ui/logo";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: HomeIcon },
  {
    name: "Properties",
    href: "/properties",
    icon: BuildingOfficeIcon,
    children: [
      { name: "Browse", href: "/properties" },
      { name: "My Listings", href: "/properties/my-listings" },
      { name: "Saved", href: "/properties/saved" },
      { name: "Add Property", href: "/properties/new" },
    ],
  },
  {
    name: "Services",
    href: "/services",
    icon: WrenchIcon,
    children: [
      { name: "Find Services", href: "/services" },
      { name: "My Services", href: "/services/my-services" },
      { name: "Bookings", href: "/services/bookings" },
      { name: "Add Service", href: "/services/new" },
    ],
  },
  {
    name: "Leisure",
    href: "/leisure",
    icon: TicketIcon,
    children: [
      { name: "Experiences", href: "/leisure/experiences" },
      { name: "Rentals", href: "/leisure/rentals" },
      { name: "My Bookings", href: "/leisure/my-bookings" },
      { name: "Add Listing", href: "/leisure/new" },
    ],
  },
  {
    name: "Connect",
    href: "/connect",
    icon: UsersIcon,
    children: [
      { name: "Feed", href: "/connect/feed" },
      { name: "Network", href: "/connect/network" },
      { name: "Messages", href: "/connect/messages" },
      { name: "CRM", href: "/connect/crm" },
    ],
  },
];

const bottomNavigation = [
  { name: "Analytics", href: "/analytics", icon: ChartBarIcon },
  { name: "Settings", href: "/settings", icon: Cog6ToothIcon },
];

interface SidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export default function Sidebar({ open, setOpen }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile sidebar */}
      <Transition.Root show={open} as={Fragment}>
        <Dialog as="div" className="relative z-50 lg:hidden" onClose={setOpen}>
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-900/80" />
          </Transition.Child>

          <div className="fixed inset-0 flex">
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
                <Transition.Child
                  as={Fragment}
                  enter="ease-in-out duration-300"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="ease-in-out duration-300"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                    <button
                      type="button"
                      className="-m-2.5 p-2.5"
                      onClick={() => setOpen(false)}
                    >
                      <span className="sr-only">Close sidebar</span>
                      <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
                    </button>
                  </div>
                </Transition.Child>
                <SidebarContent pathname={pathname} />
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <SidebarContent pathname={pathname} />
      </div>
    </>
  );
}

function SidebarContent({ pathname }: { pathname: string }) {
  return (
    <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white border-r border-gray-200 px-6 pb-4">
      <div className="flex h-16 shrink-0 items-center">
        <Logo variant="dark" />
      </div>
      <nav className="flex flex-1 flex-col">
        <ul role="list" className="flex flex-1 flex-col gap-y-7">
          <li>
            <ul role="list" className="-mx-2 space-y-1">
              {navigation.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={classNames(
                      pathname === item.href
                        ? "bg-gray-100 text-gray-900"
                        : "text-gray-700 hover:text-gray-900 hover:bg-gray-50",
                      "group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-medium"
                    )}
                  >
                    <item.icon
                      className={classNames(
                        pathname === item.href
                          ? "text-gray-900"
                          : "text-gray-400 group-hover:text-gray-900",
                        "h-5 w-5 shrink-0"
                      )}
                      aria-hidden="true"
                    />
                    {item.name}
                  </Link>
                  {item.children && (
                    <ul role="list" className="mt-1 px-8 space-y-1">
                      {item.children.map((child) => (
                        <li key={child.name}>
                          <Link
                            href={child.href}
                            className={classNames(
                              pathname === child.href
                                ? "bg-gray-100 text-gray-900"
                                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50",
                              "block rounded-md py-2 pr-2 text-sm leading-6"
                            )}
                          >
                            {child.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </li>
          <li className="mt-auto">
            <ul role="list" className="-mx-2 space-y-1">
              {bottomNavigation.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={classNames(
                      pathname === item.href
                        ? "bg-gray-100 text-gray-900"
                        : "text-gray-700 hover:text-gray-900 hover:bg-gray-50",
                      "group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-medium"
                    )}
                  >
                    <item.icon
                      className={classNames(
                        pathname === item.href
                          ? "text-gray-900"
                          : "text-gray-400 group-hover:text-gray-900",
                        "h-5 w-5 shrink-0"
                      )}
                      aria-hidden="true"
                    />
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </li>
        </ul>
      </nav>
    </div>
  );
}