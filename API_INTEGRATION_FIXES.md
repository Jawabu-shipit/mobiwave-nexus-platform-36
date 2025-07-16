# API Integration Fixes for 505 Errors

This document outlines the changes needed to fix the 505 errors occurring with the Mspace API integration, particularly for the balance and reseller clients endpoints.

## Root Causes Identified

1. **Inconsistent URL Formats**: Different parts of the code use different URL formats for the same API endpoints.
2. **Missing XML Support**: The API may require XML format for some requests, but our code only uses JSON.
3. **Inconsistent Credential Management**: Some parts of the code use the encrypted API key from the database, while others use plaintext from additional_config.
4. **Limited Error Handling**: The error handling doesn't provide enough diagnostic information.
5. **Lack of Retry Logic**: Some API calls don't have proper retry mechanisms.

## Implementation Steps

### 1. Update Frontend API Hooks

The `useMspaceApi.ts` hook has been updated to:
- Remove direct API key access from the frontend
- Add a `getResellerClients` function to centralize all API calls
- Add a `checkCredentialsExist` function to verify credentials
- Improve error handling and logging

### 2. Simplify `useMspaceResellerClients.ts`

The `useMspaceResellerClients.ts` hook has been simplified to use the centralized API hook:
- Remove duplicate API call logic
- Use the `getResellerClients` function from `useMspaceApi.ts`

### 3. Enhance Backend Functions

The `mspace-accounts/index.ts` function has been updated to:
- Add a `checkCredentials` operation
- Improve error handling and logging
- Ensure all operations use the encrypted API key

The `mspace-balance/index.ts` function has been updated to:
- Add XML support for 505 errors
- Implement comprehensive retry logic with multiple formats
- Improve error handling and logging

### 4. How to Apply These Changes

1. Replace `src/hooks/useMspaceApi.ts` with the updated version
2. Replace `src/hooks/useMspaceResellerClients.ts` with the updated version
3. Update `supabase/functions/mspace-accounts/index.ts` with the new `checkCredentials` operation
4. Replace `supabase/functions/mspace-balance/index.ts` with `supabase/functions/mspace-balance/index.updated.ts`

### 5. Testing the Changes

After applying these changes, test the following scenarios:

1. **Balance Check**: Verify that the balance check works correctly
   - Test with valid credentials
   - Test with invalid credentials
   - Test with the API returning different response formats

2. **Reseller Clients**: Verify that the reseller clients list loads correctly
   - Test with valid credentials
   - Test with invalid credentials
   - Test with the API returning different response formats

3. **Error Handling**: Verify that errors are properly handled and displayed
   - Check console logs for detailed error information
   - Verify that user-friendly error messages are displayed

## Additional Recommendations

1. **API Documentation**: Update the API documentation to clearly specify the supported URL formats and response formats.

2. **Monitoring**: Add monitoring to track API call success rates and response times.

3. **Credential Management**: Consider implementing a credential rotation mechanism to periodically update API keys.

4. **Rate Limiting**: Implement rate limiting to prevent API abuse and avoid hitting API rate limits.

5. **Circuit Breaker**: Consider implementing a circuit breaker pattern to prevent cascading failures when the API is down.