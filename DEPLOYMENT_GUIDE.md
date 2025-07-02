# Supabase Edge Functions Deployment Guide

## Current Status
✅ **Environment Variables**: Set correctly in Supabase secrets
✅ **Functions Code**: Available in `supabase/functions/` directory
✅ **Supabase Connection**: Working perfectly
❌ **Functions Deployment**: Functions need to be deployed

## Available Functions to Deploy
1. `mspace-accounts` - Handles sub users and reseller clients queries
2. `mspace-balance` - Checks MSpace account balance
3. `mspace-sms` - Sends SMS messages
4. `mspace-delivery` - Checks delivery reports
5. `test-env` - Tests environment variables access

## Deployment Options

### Option 1: Install Supabase CLI (Recommended)

#### For Windows (using Scoop):
```powershell
# Install Scoop if not already installed
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
irm get.scoop.sh | iex

# Install Supabase CLI
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

#### For Windows (using Chocolatey):
```powershell
# Install Chocolatey if not already installed
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Install Supabase CLI
choco install supabase
```

#### After Installation:
```bash
# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref bhnjecmsalnqxgociwuk

# Deploy all functions
supabase functions deploy

# Or deploy individual functions
supabase functions deploy mspace-accounts
supabase functions deploy mspace-balance
supabase functions deploy test-env
```

### Option 2: Manual Deployment via Supabase Dashboard

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/bhnjecmsalnqxgociwuk
2. Navigate to **Edge Functions** section
3. Click **"New Function"**
4. Copy and paste the code from each function file
5. Set the function name (e.g., `mspace-accounts`)
6. Deploy the function

### Option 3: Use GitHub Integration

1. Push your code to a GitHub repository
2. In Supabase Dashboard, go to **Settings** → **Integrations**
3. Connect your GitHub repository
4. Set up automatic deployment from your repository

## Testing After Deployment

Once functions are deployed, test them using:

```javascript
// Test environment variables
const response = await fetch('https://bhnjecmsalnqxgociwuk.supabase.co/functions/v1/test-env', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_ANON_KEY',
    'Content-Type': 'application/json',
  }
});

// Test MSpace accounts
const accountsResponse = await fetch('https://bhnjecmsalnqxgociwuk.supabase.co/functions/v1/mspace-accounts', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_ANON_KEY',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ operation: 'querysubs' })
});
```

## Environment Variables Verification

Your environment variables are already set in Supabase secrets:
- ✅ `MSPACE_API_KEY`
- ✅ `MSPACE_USERNAME`

These will be automatically available to all deployed functions via `Deno.env.get()`.

## Next Steps

1. Choose one of the deployment options above
2. Deploy the functions
3. Test the functions using the test scripts provided
4. Verify that MSpace integration works in your application

## Troubleshooting

If you encounter issues:
1. Check function logs in Supabase Dashboard → Edge Functions → Logs
2. Verify environment variables are set correctly
3. Test individual functions using the test scripts
4. Check network connectivity to MSpace API endpoints