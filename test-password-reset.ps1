# Script pour tester la fonctionnalité de réinitialisation de mot de passe

$API_BASE = "http://localhost:3001"
$TEST_EMAIL = "test@example.com"

Write-Host "=== Test de Réinitialisation de Mot de Passe ===" -ForegroundColor Cyan
Write-Host ""

# 1. Demander une réinitialisation
Write-Host "1. Demande de réinitialisation pour $TEST_EMAIL..." -ForegroundColor Yellow

$body = @{
    email = $TEST_EMAIL
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri "$API_BASE/auth/forgot-password" `
    -Method POST `
    -Headers @{"Content-Type"="application/json"} `
    -Body $body -ErrorAction SilentlyContinue

if ($response.StatusCode -eq 200) {
    Write-Host "✓ Demande réussie!" -ForegroundColor Green
    Write-Host ($response.Content | ConvertFrom-Json | ConvertTo-Json -Indent 2) -ForegroundColor Green
} else {
    Write-Host "✗ Erreur: $($response.StatusCode)" -ForegroundColor Red
    Write-Host $response.Content -ForegroundColor Red
}

Write-Host ""
Write-Host "=== Instructions pour tester ===" -ForegroundColor Cyan
Write-Host "1. D'abord, créez un utilisateur avec cet email" -ForegroundColor White
Write-Host "2. Demandez une réinitialisation (déjà effectué ci-dessus)" -ForegroundColor White
Write-Host "3. Consultez les logs du serveur pour voir le token" -ForegroundColor White
Write-Host "4. Testez la réinitialisation avec:" -ForegroundColor White
Write-Host ""
Write-Host "`$body = @{" -ForegroundColor Gray
Write-Host "    token = 'token-du-serveur'" -ForegroundColor Gray
Write-Host "    password = 'nouveau-mot-de-passe'" -ForegroundColor Gray
Write-Host "} | ConvertTo-Json" -ForegroundColor Gray
Write-Host ""
Write-Host "Invoke-WebRequest -Uri '$API_BASE/auth/reset-password' ``" -ForegroundColor Gray
Write-Host "    -Method POST ``" -ForegroundColor Gray
Write-Host "    -Headers @{`"Content-Type`"=`"application/json`"} ``" -ForegroundColor Gray
Write-Host "    -Body `$body" -ForegroundColor Gray
Write-Host ""
