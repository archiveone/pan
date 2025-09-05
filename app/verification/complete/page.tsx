"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";

export default function VerificationCompletePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const [status, setStatus] = useState<string>("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    const checkStatus = async () => {
      if (!session?.user?.id) {
        setError("Please sign in to view verification status");
        return;
      }

      try {
        const response = await fetch("/api/verification/status");
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to get verification status");
        }

        setStatus(data.status);

        // If verification is complete, redirect to dashboard after a delay
        if (data.status === "VERIFIED") {
          setTimeout(() => {
            router.push("/dashboard");
          }, 5000);
        }
      } catch (error: any) {
        setError(error.message || "Something went wrong");
      }
    };

    checkStatus();
  }, [session, router]);

  const getStatusMessage = () => {
    switch (status) {
      case "VERIFIED":
        return {
          title: "Verification Complete!",
          message:
            "Your identity has been verified. You will be redirected to your dashboard.",
          icon: "✅",
        };
      case "PENDING":
        return {
          title: "Verification in Progress",
          message: "We're reviewing your submitted documents.",
          icon: "⏳",
        };
      case "UNVERIFIED":
        return {
          title: "Verification Required",
          message: "Please complete the verification process.",
          icon: "❌",
        };
      default:
        return {
          title: "Checking Status",
          message: "Please wait while we check your verification status.",
          icon: "🔄",
        };
    }
  };

  const statusInfo = getStatusMessage();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="text-center text-6xl mb-4">{statusInfo.icon}</div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {statusInfo.title}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {statusInfo.message}
          </p>
        </div>

        {error && (
          <div className="text-red-500 text-sm text-center">{error}</div>
        )}

        <div className="mt-6 text-center">
          <button
            onClick={() => router.push("/dashboard")}
            className="text-indigo-600 hover:text-indigo-500"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}