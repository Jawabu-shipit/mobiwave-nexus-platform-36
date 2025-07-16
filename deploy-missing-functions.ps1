#!/usr/bin/env pwsh

# Deploy missing functions to Supabase
Write-Host "Deploying missing functions..." -ForegroundColor Green

$missingFunctions = @(
    "admin-contacts",
    "bulk-contact-operations", 
    "contact-validation",
    "notifications",
    "sub-users"
)

foreach ($func in $missingFunctions) {
    Write-Host "Deploying $func..." -ForegroundColor Yellow
    
    try {
        supabase functions deploy $func --project-ref bhnjecmsalnqxgociwuk
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ $func deployed successfully!" -ForegroundColor Green
        } else {
            Write-Host "❌ Failed to deploy $func" -ForegroundColor Red
        }
    } catch {
        Write-Host "❌ Error deploying $func : $($_.Exception.Message)" -ForegroundColor Red
    }
    
    Start-Sleep -Seconds 2
}

Write-Host "Deployment complete!" -ForegroundColor Green