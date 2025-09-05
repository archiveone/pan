"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function VerificationPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const startVerification = async () => {
    if (!session?.user?.id) {
      setError("Please sign in to start verification");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/verification/start", {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to start verification");
      }

      // Redirect to Stripe's verification flow
      router.push(data.url);
    } catch (error: any) {
      setError(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Identity Verification
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Verify your identity to access all features
          </p>
        </div>

        <div className="mt-8 space-y-6">
          <div className="rounded-md shadow-sm -space-y-px">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900">
                What you'll need:
              </h3>
              <ul className="mt-4 space-y-3">
                <li className="flex items-start">
                  <span className="flex-shrink-0">📷</span>
                  <span className="ml-3">A valid government-issued photo ID</span>
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0">📱</span>
                  <span className="ml-3">
                    A device with a camera (for document scanning)
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0">⏰</span>
                  <span className="ml-3">About 5 minutes of your time</span>
                </li>
              </ul>
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}

          <div>
            <button
              onClick={startVerification}
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? "Starting verification..." : "Start Verification"}
            </button>
          </div>

          <div className="text-sm text-center text-gray-600">
            By continuing, you agree to our{" "}
            <a href="/terms" className="text-indigo-600 hover:text-indigo-500">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="/privacy" className="text-indigo-600 hover:text-indigo-500">
              Privacy Policy
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}