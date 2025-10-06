# Vercel Setup for Personal Account

$VERCEL_TOKEN = "vck_2iKWpNXhHnxmPwuppODTnEgFHBi5qvwl9kjRPZAw2DmsltBzov3VxdHv"
$PROJECT_NAME = "bess-site-survey-system"

Write-Host "=== Vercel Setup (Personal Account) ===" -ForegroundColor Cyan
Write-Host ""

# Get Project ID
Write-Host "Getting Project ID..." -ForegroundColor Yellow
try {
    $projects = Invoke-RestMethod -Uri "https://api.vercel.com/v9/projects" `
        -Method GET `
        -Headers @{
            "Authorization" = "Bearer $VERCEL_TOKEN"
        }
    
    Write-Host "Found $($projects.projects.Count) projects" -ForegroundColor White
    
    $project = $projects.projects | Where-Object { $_.name -eq $PROJECT_NAME }
    
    if (-not $project) {
        Write-Host "Project '$PROJECT_NAME' not found in personal account" -ForegroundColor Red
        Write-Host ""
        Write-Host "Available projects:" -ForegroundColor Yellow
        $projects.projects | ForEach-Object {
            Write-Host "  - $($_.name)" -ForegroundColor White
        }
        exit 1
    }
    
    $PROJECT_ID = $project.id
    Write-Host "Project ID: $PROJECT_ID" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Set Environment Variables
Write-Host "Setting Environment Variables..." -ForegroundColor Yellow
Write-Host ""

$envVars = @(
    @{
        key = "VITE_API_BASE_URL"
        value = "https://ps-system.jp/api/v2"
    },
    @{
        key = "VITE_SUPABASE_URL"
        value = "https://kcohexmvbccxixyfvjyw.supabase.co"
    },
    @{
        key = "VITE_SUPABASE_ANON_KEY"
        value = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtjb2hleG12YmNjeGl4eWZ2anl3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1MTg0MDEsImV4cCI6MjA3NTA5NDQwMX0.KWt6AlZanxkgcvyqT8iCbomUVzdFGc5NZGOJzcg8k7k"
    }
)

foreach ($env in $envVars) {
    Write-Host "Setting: $($env.key)" -ForegroundColor White
    
    $body = @{
        key = $env.key
        value = $env.value
        target = @("production", "preview")
        type = "plain"
    } | ConvertTo-Json
    
    try {
        $response = Invoke-RestMethod -Uri "https://api.vercel.com/v10/projects/$PROJECT_ID/env" `
            -Method POST `
            -Headers @{
                "Authorization" = "Bearer $VERCEL_TOKEN"
                "Content-Type" = "application/json"
            } `
            -Body $body
        
        Write-Host "  Success!" -ForegroundColor Green
    } catch {
        Write-Host "  Error or already exists" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "=== Setup Complete! ===" -ForegroundColor Green
Write-Host ""
Write-Host "Next: Visit https://vercel.com/dashboard to trigger a new deployment" -ForegroundColor Cyan
