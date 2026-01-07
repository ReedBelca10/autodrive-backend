# Script de test d'upload de médias pour Windows
# Usage: .\test-upload.ps1 -JwtToken "your-token" -ImagePath "path/to/image.jpg"

param(
    [Parameter(Mandatory=$true)]
    [string]$JwtToken,
    
    [Parameter(Mandatory=$false)]
    [string]$VehicleId,
    
    [Parameter(Mandatory=$false)]
    [string]$ImagePath = "./test-image.jpg"
)

$ApiBase = "http://localhost:3001/api"

Write-Host "=== Upload Media Test ===" -ForegroundColor Cyan
Write-Host ""

# Validation des paramètres
if (-not (Test-Path $ImagePath)) {
    Write-Host "❌ Error: File not found: $ImagePath" -ForegroundColor Red
    exit 1
}

$FileSize = (Get-Item $ImagePath).Length
Write-Host "Configuration:" -ForegroundColor Yellow
Write-Host "  API Base: $ApiBase"
Write-Host "  JWT Token: $($JwtToken.Substring(0, 20))..."
Write-Host "  Image Path: $ImagePath"
Write-Host "  File Size: $FileSize bytes"
Write-Host ""

# Test 1: Upload de fichier
Write-Host "1️⃣ Testing File Upload..." -ForegroundColor Cyan

$form = @{
    file = Get-Item -Path $ImagePath
}

try {
    $UploadResponse = Invoke-WebRequest `
        -Uri "$ApiBase/vehicles/upload/media" `
        -Method POST `
        -Headers @{
            Authorization = "Bearer $JwtToken"
        } `
        -Form $form `
        -ErrorAction Continue

    $HttpCode = $UploadResponse.StatusCode
    $Body = $UploadResponse.Content | ConvertFrom-Json

    Write-Host "HTTP Code: $HttpCode"
    Write-Host "Response:"
    $Body | ConvertTo-Json | Write-Host

    if ($HttpCode -eq 201 -or $HttpCode -eq 200) {
        Write-Host "✅ Upload successful" -ForegroundColor Green
        Write-Host ""
        
        $PublicUrl = $Body.publicUrl
        $FileName = $Body.fileName

        if ($PublicUrl) {
            Write-Host "✅ Public URL generated:" -ForegroundColor Green
            Write-Host "  $PublicUrl"
            
            # Test 2: Vérifier que l'URL est accessible
            Write-Host ""
            Write-Host "2️⃣ Testing URL Accessibility..." -ForegroundColor Cyan
            
            try {
                $UrlResponse = Invoke-WebRequest -Uri $PublicUrl -Method Head -ErrorAction Continue
                $UrlHttpCode = $UrlResponse.StatusCode
                
                if ($UrlHttpCode -eq 200) {
                    Write-Host "✅ URL is accessible" -ForegroundColor Green
                } else {
                    Write-Host "❌ URL not accessible (HTTP $UrlHttpCode)" -ForegroundColor Red
                }
            } catch {
                Write-Host "❌ Failed to check URL: $_" -ForegroundColor Red
            }
            
            # Test 3: Ajouter à un véhicule (si vehicle-id fourni)
            if ($VehicleId) {
                Write-Host ""
                Write-Host "3️⃣ Adding Media to Vehicle..." -ForegroundColor Cyan
                
                try {
                    $AddResponse = Invoke-WebRequest `
                        -Uri "$ApiBase/vehicles/$VehicleId/add-media" `
                        -Method POST `
                        -Headers @{
                            Authorization = "Bearer $JwtToken"
                            "Content-Type" = "application/json"
                        } `
                        -Body (@{ mediaUrl = $PublicUrl } | ConvertTo-Json) `
                        -ErrorAction Continue

                    $AddHttpCode = $AddResponse.StatusCode
                    $AddBody = $AddResponse.Content | ConvertFrom-Json

                    Write-Host "HTTP Code: $AddHttpCode"
                    Write-Host "Response:"
                    $AddBody | ConvertTo-Json | Write-Host

                    if ($AddHttpCode -eq 200 -or $AddHttpCode -eq 201) {
                        Write-Host "✅ Media added to vehicle" -ForegroundColor Green
                    } else {
                        Write-Host "❌ Failed to add media to vehicle" -ForegroundColor Red
                    }
                } catch {
                    Write-Host "❌ Error: $_" -ForegroundColor Red
                }
            }
        } else {
            Write-Host "❌ No public URL in response" -ForegroundColor Red
        }
    } else {
        Write-Host "❌ Upload failed (HTTP $HttpCode)" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Error: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✅ All tests completed" -ForegroundColor Green
