# Vercel Complete Setup Script - Get Team/Project ID and Set Environment Variables

$VERCEL_TOKEN = "vck_2iKWpNXhHnxmPwuppODTnEgFHBi5qvwl9kjRPZAw2DmsltBzov3VxdHv"
$TEAM_SLUG = "kk-bens-projects"
$PROJECT_NAME = "bess-site-survey-system"

Write-Host "=== Vercel Complete Setup ===" -ForegroundColor Cyan
Write-Host ""

# Step 1: Get Team ID
Write-Host "Step 1: Getting Team ID..." -ForegroundColor Yellow
try {
    $teams = Invoke-RestMethod -Uri "https://api.vercel.com/v2/teams" `
        -Method GET `
        -Headers @{
            "Authorization" = "Bearer $VERCEL_TOKEN"
        }
    
    $team = $teams.teams | Where-Object { $_.slug -eq $TEAM_SLUG }
    
    if (-not $team) {
        Write-Host "Error: Team not found" -ForegroundColor Red
        exit 1
    }
    
    $TEAM_ID = $team.id
    Write-Host "Team ID: $TEAM_ID" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "Error getting team: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Step 2: Get Project ID
Write-Host "Step 2: Getting Project ID..." -ForegroundColor Yellow
try {
    $projects = Invoke-RestMethod -Uri "https://api.vercel.com/v9/projects?teamId=$TEAM_ID" `
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
} catch {
    Write-Host "Error getting project: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Step 3: Set Environment Variables
Write-Host "Step 3: Setting Environment Variables..." -ForegroundColor Yellow
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
        $response = Invoke-RestMethod -Uri "https://api.vercel.com/v10/projects/$PROJECT_ID/env?teamId=$TEAM_ID" `
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
            Write-Host "  Already exists - Updating..." -ForegroundColor Yellow
            
            # Get existing env vars
            $existingEnvs = Invoke-RestMethod -Uri "https://api.vercel.com/v9/projects/$PROJECT_ID/env?teamId=$TEAM_ID" `
                -Method GET `
                -Headers @{
                    "Authorization" = "Bearer $VERCEL_TOKEN"
                }
            
            $existingEnv = $existingEnvs.envs | Where-Object { $_.key -eq $env.key }
            
            if ($existingEnv) {
                # Delete old one
                Invoke-RestMethod -Uri "https://api.vercel.com/v9/projects/$PROJECT_ID/env/$($existingEnv.id)?teamId=$TEAM_ID" `
                    -Method DELETE `
                    -Headers @{
                        "Authorization" = "Bearer $VERCEL_TOKEN"
                    } | Out-Null
                
                # Create new one
                Invoke-RestMethod -Uri "https://api.vercel.com/v10/projects/$PROJECT_ID/env?teamId=$TEAM_ID" `
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
Write-Host "=== Setup Complete! ===" -ForegroundColor Green
Write-Host ""
Write-Host "Environment variables have been set." -ForegroundColor White
Write-Host "Triggering a new deployment to apply changes..." -ForegroundColor Yellow
Write-Host ""

# Step 4: Trigger Redeploy
try {
    $latestDeployment = Invoke-RestMethod -Uri "https://api.vercel.com/v6/deployments?projectId=$PROJECT_ID&teamId=$TEAM_ID&limit=1" `
        -Method GET `
        -Headers @{
            "Authorization" = "Bearer $VERCEL_TOKEN"
        }
    
    if ($latestDeployment.deployments.Count -gt 0) {
        $deploymentId = $latestDeployment.deployments[0].uid
        
        $redeployBody = @{
            deploymentId = $deploymentId
            name = $PROJECT_NAME
            target = "production"
        } | ConvertTo-Json
        
        $newDeployment = Invoke-RestMethod -Uri "https://api.vercel.com/v13/deployments?teamId=$TEAM_ID" `
            -Method POST `
            -Headers @{
                "Authorization" = "Bearer $VERCEL_TOKEN"
                "Content-Type" = "application/json"
            } `
            -Body $redeployBody
        
        Write-Host "Deployment triggered successfully!" -ForegroundColor Green
        Write-Host "Deployment URL: https://vercel.com/$TEAM_SLUG/$PROJECT_NAME" -ForegroundColor Cyan
        Write-Host "Live URL: https://$PROJECT_NAME.vercel.app" -ForegroundColor Cyan
    }
} catch {
    Write-Host "Could not trigger automatic deployment." -ForegroundColor Yellow
    Write-Host "Please manually trigger a deployment from Vercel dashboard." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Done!" -ForegroundColor Green
