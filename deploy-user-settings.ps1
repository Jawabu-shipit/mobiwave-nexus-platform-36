#!/usr/bin/env pwsh

# Deploy user-settings function to Supabase
Write-Host "Deploying user-settings function..." -ForegroundColor Green

try {
    # Deploy the function
    supabase functions deploy user-settings --project-ref bhnjecmsalnqxgociwuk
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ user-settings function deployed successfully!" -ForegroundColor Green
        
        # Test the function with OPTIONS request
        Write-Host "Testing CORS preflight request..." -ForegroundColor Yellow
        $response = Invoke-WebRequest -Uri "https://bhnjecmsalnqxgociwuk.supabase.co/functions/v1/user-settings" -Method OPTIONS -Headers @{"Origin"="http://localhost:8080"} -ErrorAction SilentlyContinue
        
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ CORS preflight test passed!" -ForegroundColor Green
            Write-Host "The function should now work from your frontend." -ForegroundColor Green
        } else {
            Write-Host "❌ CORS preflight test failed with status: $($response.StatusCode)" -ForegroundColor Red
        }
    } else {
        Write-Host "❌ Function deployment failed!" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Error during deployment: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}