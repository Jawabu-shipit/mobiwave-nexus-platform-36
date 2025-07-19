import React from "react";
import { MspaceSystemSetup } from "./MspaceSystemSetup";
import { useAuth } from "@/hooks/useAuth";

export function MspaceUserManagementSimple() {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();

  if (!isAuthLoading && !isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[200px]">
        <div className="text-xl font-semibold text-red-600 mb-2">
          You must be logged in to access Mspace User Management.
        </div>
        <div className="text-gray-600">
          Please log in as an admin to continue.
        </div>
      </div>
    );
  }

  return <MspaceSystemSetup />;
}
