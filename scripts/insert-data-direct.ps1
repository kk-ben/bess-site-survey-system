# Supabase直接データ投入スクリプト

$SUPABASE_URL = "https://kcohexmvbccxixyfvjyw.supabase.co"
$SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtjb2hleG12YmNjeGl4eWZ2anl3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTUxODQwMSwiZXhwIjoyMDc1MDk0NDAxfQ.CSUPZBrUNadTwxi3pmCorovhSmf8uogbrkpyQowj0N0"

$headers = @{
    "apikey" = $SERVICE_KEY
    "Authorization" = "Bearer $SERVICE_KEY"
    "Content-Type" = "application/json"
    "Prefer" = "return=representation"
}

Write-Host "Test data insertion started..." -ForegroundColor Cyan

# Site 1
Write-Host "1. Ibaraki Tsukuba Industrial Site" -ForegroundColor Yellow
$site1 = @{
    name = "茨城県つくば市 工業団地跡地"
    latitude = 36.0839
    longitude = 140.0764
    address = "茨城県つくば市東光台5-19"
    capacity_mw = 15.5
    status = "approved"
    created_by = "admin@example.com"
} | ConvertTo-Json

try {
    $result1 = Invoke-RestMethod -Uri "$SUPABASE_URL/rest/v1/sites" -Method Post -Headers $headers -Body $site1
    Write-Host "Site 1 inserted successfully" -ForegroundColor Green
} catch {
    Write-Host "Site 1 error: $($_.Exception.Message)" -ForegroundColor Yellow
}

# Site 2
Write-Host "2. Chiba Ichihara Landfill" -ForegroundColor Yellow
$site2 = @{
    name = "千葉県市原市 埋立地"
    latitude = 35.4980
    longitude = 140.1156
    address = "千葉県市原市五井南海岸1-1"
    capacity_mw = 12.0
    status = "approved"
    created_by = "admin@example.com"
} | ConvertTo-Json

try {
    $result2 = Invoke-RestMethod -Uri "$SUPABASE_URL/rest/v1/sites" -Method Post -Headers $headers -Body $site2
    Write-Host "Site 2 inserted successfully" -ForegroundColor Green
} catch {
    Write-Host "Site 2 error: $($_.Exception.Message)" -ForegroundColor Yellow
}

# Site 3
Write-Host "3. Osaka Sakai Coastal Industrial Zone" -ForegroundColor Yellow
$site3 = @{
    name = "大阪府堺市 臨海工業地帯"
    latitude = 34.5833
    longitude = 135.4297
    address = "大阪府堺市西区築港新町1-5-1"
    capacity_mw = 25.0
    status = "evaluated"
    created_by = "admin@example.com"
} | ConvertTo-Json

try {
    $result3 = Invoke-RestMethod -Uri "$SUPABASE_URL/rest/v1/sites" -Method Post -Headers $headers -Body $site3
    Write-Host "Site 3 inserted successfully" -ForegroundColor Green
} catch {
    Write-Host "Site 3 error: $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Test data insertion completed!" -ForegroundColor Green
Write-Host ""
Write-Host "Verifying data..." -ForegroundColor Cyan

# Verify data
try {
    $sites = Invoke-RestMethod -Uri "$SUPABASE_URL/rest/v1/sites?select=*" -Method Get -Headers $headers
    Write-Host "Total sites inserted: $($sites.Count)" -ForegroundColor Green
    $sites | ForEach-Object {
        Write-Host "  - $($_.name)" -ForegroundColor White
    }
} catch {
    Write-Host "Data verification error: $($_.Exception.Message)" -ForegroundColor Yellow
}
