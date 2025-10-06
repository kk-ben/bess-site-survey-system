# Vercel Environment Variables Setup Script

$VERCEL_TOKEN = "vck_2iKWpNXhHnxmPwuppODTnEgFHBi5qvwl9kjRPZAw2DmsltBzov3VxdHv"
$PROJECT_NAME = "bess-site-survey-system"

Write-Host "=== Vercel Environment Variables Setup ===" -ForegroundColor Cyan
Write-Host ""

# Get project ID
Write-Host "Getting project information..." -ForegroundColor Yellow
$projects = Invoke-RestMethod -Uri "https://api.vercel.com/v9/projects" `
    -Method GET `
    -Headers @{
        "Authorization" = "Bearer $VERCEL_TOKEN"
    }

$project = $projects.projects | Where-Object { $_.name -eq $PROJECT_NAME }

if (-not $project) {
    Write-Host "Error: Project not found" -ForegroundColor Red
    exit 1
}

$PROJECT_ID = $project.id
Write-Host "Project ID: $PROJECT_ID" -ForegroundColor Green
Write-Host ""

# Environment variables to set
$envVars = @(
    @{
        key = "VITE_API_BASE_URL"
        value = "https://ps-system.jp/api/v2"
        target = @("production", "preview")
    },
    @{
        key = "VITE_SUPABASE_URL"
        value = "https://kcohexmvbccxixyfvjyw.supabase.co"
        target = @("production", "preview")
    },
    @{
        key = "VITE_SUPABASE_ANON_KEY"
        value = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtjb2hleG12YmNjeGl4eWZ2anl3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1MTg0MDEsImV4cCI6MjA3NTA5NDQwMX0.KWt6AlZanxkgcvyqT8iCbomUVzdFGc5NZGOJzcg8k7k"
        target = @("production", "preview")
    }
)

Write-Host "Setting environment variables..." -ForegroundColor Yellow
Write-Host ""

foreach ($env in $envVars) {
    Write-Host "Setting: $($env.key)" -ForegroundColor White
    
    $body = @{
        key = $env.key
        value = $env.value
        target = $env.target
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
        $statusCode = $_.Exception.Response.StatusCode.value__
        if ($statusCode -eq 409) {
            Write-Host "  Already exists (updating...)" -ForegroundColor Yellow
            
            # Get existing env var ID
            $existingEnvs = Invoke-RestMethod -Uri "https://api.vercel.com/v9/projects/$PROJECT_ID/env" `
                -Method GET `
                -Headers @{
                    "Authorization" = "Bearer $VERCEL_TOKEN"
                }
            
            $existingEnv = $existingEnvs.envs | Where-Object { $_.key -eq $env.key }
            
            if ($existingEnv) {
                # Delete old one
                Invoke-RestMethod -Uri "https://api.vercel.com/v9/projects/$PROJECT_ID/env/$($existingEnv.id)" `
                    -Method DELETE `
                    -Headers @{
                        "Authorization" = "Bearer $VERCEL_TOKEN"
                    } | Out-Null
                
                # Create new one
                Invoke-RestMethod -Uri "https://api.vercel.com/v10/projects/$PROJECT_ID/env" `
                    -Method POST `
                    -Headers @{
                        "Authorization" = "Bearer $VERCEL_TOKEN"
                        "Content-Type" = "application/json"
                    } `
                    -Body $body | Out-Null
                
                Write-Host "  Updated!" -ForegroundColor Green
            }
        } else {
            Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
}

Write-Host ""
Write-Host "=== Environment Variables Set Successfully ===" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Trigger a new deployment to apply the changes" -ForegroundColor White
Write-Host "2. Visit: https://vercel.com/dashboard" -ForegroundColor White
Write-Host "3. Or push a commit to trigger auto-deployment" -ForegroundColor White
Write-Host ""
Write-Host "To trigger a redeploy via API:" -ForegroundColor Yellow
Write-Host "  .\scripts\vercel-redeploy.ps1" -ForegroundColor White
