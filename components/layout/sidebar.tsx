"use client";

import { Fragment } from "react";
import { Dialog, Transition, Disclosure } from "@headlessui/react";
import { XMarkIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { classNames } from "@/lib/utils";

const categories = [
  {
    name: "Property Type",
    options: [
      { value: "house", label: "House", count: 152 },
      { value: "apartment", label: "Apartment", count: 89 },
      { value: "condo", label: "Condo", count: 47 },
      { value: "townhouse", label: "Townhouse", count: 36 },
    ],
  },
  {
    name: "Price Range",
    options: [
      { value: "0-100000", label: "Under €100,000", count: 24 },
      { value: "100000-200000", label: "€100,000 - €200,000", count: 56 },
      { value: "200000-300000", label: "€200,000 - €300,000", count: 78 },
      { value: "300000+", label: "€300,000+", count: 143 },
    ],
  },
  {
    name: "Bedrooms",
    options: [
      { value: "1", label: "1 Bedroom", count: 43 },
      { value: "2", label: "2 Bedrooms", count: 87 },
      { value: "3", label: "3 Bedrooms", count: 124 },
      { value: "4+", label: "4+ Bedrooms", count: 69 },
    ],
  },
  {
    name: "Location",
    options: [
      { value: "dublin", label: "Dublin", count: 156 },
      { value: "cork", label: "Cork", count: 87 },
      { value: "galway", label: "Galway", count: 65 },
      { value: "limerick", label: "Limerick", count: 43 },
    ],
  },
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
                <SidebarContent />
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <SidebarContent />
      </div>
    </>
  );
}

function SidebarContent() {
  return (
    <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-4">
      <div className="flex h-16 shrink-0 items-center">
        {/* Optional: Add any content at the top of sidebar */}
      </div>

      <nav className="flex flex-1 flex-col">
        <div className="space-y-6">
          {categories.map((category) => (
            <Disclosure as="div" key={category.name} className="border-b border-gray-200 py-6">
              {({ open }) => (
                <>
                  <h3 className="-my-3 flow-root">
                    <Disclosure.Button className="flex w-full items-center justify-between bg-white py-3 text-sm text-gray-400 hover:text-gray-500">
                      <span className="font-medium text-gray-900">{category.name}</span>
                      <span className="ml-6 flex items-center">
                        <ChevronDownIcon
                          className={classNames(open ? "-rotate-180" : "rotate-0", "h-5 w-5 transform")}
                          aria-hidden="true"
                        />
                      </span>
                    </Disclosure.Button>
                  </h3>
                  <Disclosure.Panel className="pt-6">
                    <div className="space-y-4">
                      {category.options.map((option, optionIdx) => (
                        <div key={option.value} className="flex items-center">
                          <input
                            id={`filter-${category.name}-${optionIdx}`}
                            name={`${category.name}[]`}
                            defaultValue={option.value}
                            type="checkbox"
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <label
                            htmlFor={`filter-${category.name}-${optionIdx}`}
                            className="ml-3 text-sm text-gray-600"
                          >
                            {option.label} ({option.count})
                          </label>
                        </div>
                      ))}
                    </div>
                  </Disclosure.Panel>
                </>
              )}
            </Disclosure>
          ))}
        </div>
      </nav>
    </div>
  );
}