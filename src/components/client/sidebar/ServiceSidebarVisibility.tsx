
import { useServiceAccess } from "@/hooks/useServiceAccess";

/**
 * Returns a set of service_types that the user has access to based on their plan and subscriptions.
 */
export function useActivatedServiceTypes() {
  const { serviceAccess, isLoading } = useServiceAccess();
  
  const activatedTypes = new Set<string>();
  Object.entries(serviceAccess).forEach(([serviceType, hasAccess]) => {
    if (hasAccess) {
      activatedTypes.add(serviceType);
    }
  });

  return { activatedTypes, isLoading };
}
