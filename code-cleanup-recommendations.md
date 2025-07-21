# Code Cleanup Recommendations

This document identifies potentially redundant or unused files in the codebase that could be removed to improve maintainability.

**Status: Implementation Complete** - See CODE_CLEANUP.md for details on the changes made.

## Redundant Hooks

### SMS Service Hooks
There are multiple hooks with overlapping functionality:

1. **SMS Service Hooks**:
   - `useRealSMSService.ts` - Basic SMS sending functionality
   - `useSMSService.ts` - Wraps `useRealSMSService` with additional functions
   - `useUnifiedSMSService.ts` - Wraps `useSMSService` with campaign functionality

   **Recommendation**: Consolidate these into a single hook. Keep `useUnifiedSMSService` as it has the most complete functionality and remove the others.

2. **SMS Templates Hooks**:
   - `src/hooks/useSMSTemplates.ts`
   - `src/hooks/sms/useSMSTemplates.ts`

   These files have nearly identical functionality but are in different locations.
   
   **Recommendation**: Keep only one version (preferably the one in the `sms` subdirectory for better organization) and remove the other.

### Error Handling Hooks
Multiple error handling hooks with similar functionality:

1. **Error Handlers**:
   - `useErrorHandler.ts` - Basic error handling
   - `useEnhancedErrorHandler.ts` - Extends `useErrorHandler` with additional features
   - `mspace/useMspaceErrorHandler.ts` - Domain-specific error handler

   **Recommendation**: Keep `useEnhancedErrorHandler` as the main error handler and `useMspaceErrorHandler` for domain-specific handling. Remove `useErrorHandler` and update imports to use `useEnhancedErrorHandler` instead.

### API Credential Hooks
Three hooks managing API credentials with overlapping functionality:

1. **API Credential Hooks**:
   - `useApiKeys.ts` - Manages API keys
   - `useSecureApiCredentials.ts` - Manages encrypted API credentials
   - `useAllApiCredentials.ts` - Fetches all API credentials with user information

   **Recommendation**: 
   - Consolidate `useApiKeys` and `useSecureApiCredentials` into a single hook
   - Keep `useAllApiCredentials` for admin functionality
   - Ensure consistent naming and data structures between them

## Files Marked for Deletion

The `TO_DELETE.txt` file mentions:
- `ContactGroupManager.tsx` is now fully merged into `ContactGroupsManager.tsx` and can be deleted.

This file appears to have already been removed from the codebase.

## General Recommendations

1. **Standardize Hook Organization**:
   - Move domain-specific hooks into subdirectories (e.g., `sms`, `mspace`, etc.)
   - Ensure consistent naming patterns for hooks

2. **Consolidate Similar Functionality**:
   - Review all hooks with similar names or purposes
   - Create unified hooks that handle all related functionality
   - Remove deprecated or redundant hooks

3. **Update Import References**:
   - After consolidating hooks, update all import references throughout the codebase
   - Use search tools to find all instances where removed hooks are imported

4. **Add Deprecation Notices**:
   - Before removing hooks, add deprecation notices to help with migration
   - Example: `// @deprecated Use useUnifiedSMSService instead`

5. **Test Thoroughly After Changes**:
   - Ensure all functionality works after removing redundant hooks
   - Run comprehensive tests on affected components

By implementing these recommendations, the codebase will be more maintainable, with fewer redundant files and clearer organization.