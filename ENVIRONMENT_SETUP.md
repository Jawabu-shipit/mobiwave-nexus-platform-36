# Environment Variables Setup

## Security Best Practices

API credentials should be stored as environment variables or Supabase secrets, NOT in the database for security reasons.

## Local Development Setup

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Fill in your actual API credentials in the `.env` file:
   ```
   MSPACE_API_KEY=your_actual_mspace_api_key
   MSPACE_USERNAME=your_actual_mspace_username
   ```

## Production Setup (Supabase)

For production, set these as Supabase secrets using the Supabase CLI:

```bash
# Set MSpace API credentials as secrets
supabase secrets set MSPACE_API_KEY=your_actual_mspace_api_key
supabase secrets set MSPACE_USERNAME=your_actual_mspace_username
```

Or through the Supabase Dashboard:
1. Go to your project dashboard
2. Navigate to Settings > Edge Functions
3. Add the environment variables in the "Environment Variables" section

## Edge Functions Configuration

The Edge Functions will automatically access these environment variables:

- `mspace-accounts` function
- `mspace-sms` function  
- `mspace-balance` function

Note: Supabase Edge Functions automatically have access to environment variables set as secrets, so no additional configuration in `config.toml` is needed.

## Fallback to Database

If environment variables are not set, the system will fall back to looking for credentials in the `api_credentials` table. However, this is less secure and should only be used for development or when user-specific credentials are required.

## Testing

After setting up the environment variables, restart your Supabase local development server:

```bash
supabase stop
supabase start
```

Then test the MSpace functions to ensure they can access the API credentials properly.