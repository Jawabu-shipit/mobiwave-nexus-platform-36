import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useErrorHandler } from "@/hooks/useErrorHandler";

interface BalanceResponse {
  balance: number;
  status: string;
  currency?: string;
  timestamp?: string;
}

interface BalanceError {
  error: string;
  errorType: string;
  timestamp: string;
  requestId: string;
}

export const useMspaceBalance = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [lastError, setLastError] = useState<BalanceError | null>(null);
  const { handleError, handleRetry } = useErrorHandler();

  const checkBalance = async (): Promise<BalanceResponse> => {
    setIsLoading(true);
    setLastError(null);

    try {
      const balanceOperation = async () => {
        console.log("Checking SMS balance...");

        const response = await supabase.functions.invoke("mspace-balance");
        const { data, error } = response;

        if (error) {
          console.error("Balance check error from Supabase function:", error);
          console.error(
            "Error details:",
            JSON.stringify(
              {
                message: error.message,
                details: error.details,
                hint: error.hint,
                code: error.code,
                stack: error.stack,
                name: error.name,
              },
              null,
              2,
            ),
          );

          // Handle specific error cases
          if (
            error.message?.includes("credentials not available") ||
            error.message?.includes("No user-specific credentials found")
          ) {
            throw new Error(
              "Mspace API credentials not configured. Please set up your credentials in user settings.",
            );
          }

          // Try to parse the error response for more details
          try {
            const errorData = JSON.parse(error.message) as BalanceError;
            setLastError(errorData);
            throw new Error(
              `Balance check failed: ${errorData.error} (${errorData.errorType})`,
            );
          } catch (parseError) {
            // If we can't parse the error, check for common error patterns
            if (error.message?.includes("FunctionsHttpError")) {
              throw new Error(
                "Service temporarily unavailable. Please try again later.",
              );
            }
            throw new Error(`Balance check failed: ${error.message}`);
          }
        }

        if (!data) {
          throw new Error("No data returned from balance check");
        }

        if (typeof data.balance === "undefined") {
          console.error("Invalid balance response format:", data);
          throw new Error("Invalid balance response: missing balance field");
        }

        // Ensure balance is a number
        const balance =
          typeof data.balance === "string"
            ? parseInt(data.balance)
            : data.balance;

        if (isNaN(balance)) {
          throw new Error(`Invalid balance value: ${data.balance}`);
        }

        // Add timestamp if not present
        const result: BalanceResponse = {
          ...data,
          balance,
          timestamp: data.timestamp || new Date().toISOString(),
        };

        console.log("Balance check successful:", result);
        return result;
      };

      return await handleRetry(balanceOperation);
    } catch (error: any) {
      console.error("Balance check error:", error);

      handleError(error, {
        operation: "Check SMS Balance",
        shouldRetry: true,
        retryFn: () => checkBalance(),
      });

      // Create a standardized error response
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      toast.error(`SMS Balance check failed: ${errorMessage}`);

      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    checkBalance,
    isLoading,
    lastError,
  };
};
