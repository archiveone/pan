"use client";

import { ReactNode } from "react";
import Navbar from "./navbar";

interface PageLayoutProps {
  children: ReactNode;
  header?: {
    title: string;
    description?: string;
  };
}

export default function PageLayout({ children, header }: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {header && (
        <div className="glass border-b border-white/20 py-24 mt-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl font-semibold text-gray-900 sm:text-5xl">
                {header.title}
              </h1>
              {header.description && (
                <p className="mt-4 text-xl text-gray-600">
                  {header.description}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {children}
      </div>
    </div>
  );
}