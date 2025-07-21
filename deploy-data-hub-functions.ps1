#!/usr/bin/env pwsh

Write-Host "Deploying Data Hub Functions..." -ForegroundColor Green

# Deploy data-hub-api function
Write-Host "Deploying data-hub-api function..." -ForegroundColor Yellow
try {
    supabase functions deploy data-hub-api --no-verify-jwt
    Write-Host "✅ data-hub-api deployed successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to deploy data-hub-api: $_" -ForegroundColor Red
}

# Deploy import-worker function
Write-Host "Deploying import-worker function..." -ForegroundColor Yellow
try {
    supabase functions deploy import-worker --no-verify-jwt
    Write-Host "✅ import-worker deployed successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to deploy import-worker: $_" -ForegroundColor Red
}

# Deploy campaign-api function
Write-Host "Deploying campaign-api function..." -ForegroundColor Yellow
try {
    supabase functions deploy campaign-api --no-verify-jwt
    Write-Host "✅ campaign-api deployed successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to deploy campaign-api: $_" -ForegroundColor Red
}

Write-Host "Data Hub Functions deployment completed!" -ForegroundColor Green
Write-Host ""
Write-Host "Available endpoints:" -ForegroundColor Cyan
Write-Host "- /data-hub-api/models (GET, POST)" -ForegroundColor White
Write-Host "- /data-hub-api/models/{id} (GET, PUT, DELETE)" -ForegroundColor White
Write-Host "- /data-hub-api/records (GET, POST)" -ForegroundColor White
Write-Host "- /data-hub-api/records/{id} (PUT, DELETE)" -ForegroundColor White
Write-Host "- /data-hub-api/import (POST)" -ForegroundColor White
Write-Host "- /import-worker/jobs (GET, POST)" -ForegroundColor White
Write-Host "- /import-worker/jobs/{id} (GET)" -ForegroundColor White
Write-Host "- /campaign-api/campaigns (GET, POST)" -ForegroundColor White
Write-Host "- /campaign-api/campaigns/{id} (GET, PUT, DELETE)" -ForegroundColor White
Write-Host "- /campaign-api/campaigns/send (POST)" -ForegroundColor White
Write-Host "- /campaign-api/recipients (GET)" -ForegroundColor White