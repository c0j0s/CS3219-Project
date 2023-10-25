// Default error page used by NextJS for any runtime errors

"use client"; // Error components must be Client Components

import PeerPrepLogo from "@/components/common/PeerPrepLogo";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex h-screen w-screen bg-background items-center justify-center space-x-5">
      <PeerPrepLogo width="15%" />
      <div className="flex flex-col space-y-2">
        <p className="text-3xl font-bold">Internal Server Error</p>
        <p className="text-l font-light">
          Please contact the admins or try again later.
        </p>
      </div>
    </div>
  );
}
