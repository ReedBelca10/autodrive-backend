Write-Host "Registering new test user..." -ForegroundColor Cyan

$registerBody = @{
    fullName = "Test BlogUser"
    email = "testblog@autodrive.local"
    password = "TestPass123!"
} | ConvertTo-Json

$registerResp = Invoke-WebRequest -Uri "http://localhost:3001/auth/register" `
    -Method POST `
    -ContentType "application/json" `
    -Body $registerBody `
    -UseBasicParsing `
    -ErrorAction Continue

Write-Host "Register Status: $($registerResp.StatusCode)"
if ($registerResp.StatusCode -ne 201 -and $registerResp.StatusCode -ne 200) {
    Write-Host "Registration failed!" -ForegroundColor Red
    Write-Host $registerResp.Content -ForegroundColor Red
} else {
    Write-Host "Registration successful!" -ForegroundColor Green
}

Write-Host "`nNow logging in..." -ForegroundColor Cyan

$loginBody = @{
    email = "testblog@autodrive.local"
    password = "TestPass123!"
} | ConvertTo-Json

$cookieContainer = New-Object System.Net.CookieContainer

$loginResp = Invoke-WebRequest -Uri "http://localhost:3001/auth/login" `
    -Method POST `
    -ContentType "application/json" `
    -Body $loginBody `
    -UseBasicParsing `
    -CookieContainer $cookieContainer `
    -ErrorAction Continue

if ($loginResp.StatusCode -ne 200) {
    Write-Host "Login failed!" -ForegroundColor Red
    Write-Host $loginResp.Content -ForegroundColor Red
    exit
}

Write-Host "Login successful! Cookies obtained." -ForegroundColor Green

Write-Host "`nCreating blog post..." -ForegroundColor Cyan

$blogBody = @{
    title = "Guide Complet d'Utilisation d'AutoDrive"
    description = "Découvrez comment utiliser AutoDrive : réservations, profils, paiements et bien plus"
    content = "## Guide Complet d'Utilisation d'AutoDrive

Bienvenue sur AutoDrive, votre plateforme de location de véhicules au Togo!

### Table des matières

1. Pour les Visiteurs
2. Pour les Clients
3. Pour les Gestionnaires d'Agence
4. Questions Fréquemment Posées

### Pour les Visiteurs

Même sans créer de compte, vous pouvez explorer tous les véhicules disponibles.

### Pour les Clients

Créez un compte, réservez des véhicules et gérez vos réservations facilement.

### Pour les Gestionnaires d'Agence

Gérez votre flotte de véhicules, suivez vos réservations et vos statistiques.

Bon voyage!"
    author = "AutoDrive Team"
    imageUrl = "https://images.unsplash.com/photo-1552820728-8ac41f1ce891?w=800"
} | ConvertTo-Json

$headers = @{
    "Content-Type" = "application/json"
}

$blogResp = Invoke-WebRequest -Uri "http://localhost:3001/blog" `
    -Method POST `
    -Headers $headers `
    -Body $blogBody `
    -UseBasicParsing `
    -CookieContainer $cookieContainer `
    -ErrorAction Continue

if ($blogResp.StatusCode -eq 201 -or $blogResp.StatusCode -eq 200) {
    Write-Host "SUCCESS! Blog post created!" -ForegroundColor Green
    Write-Host "`nBlog Post Details:" -ForegroundColor Cyan
    $blogResp.Content | ConvertFrom-Json | ConvertTo-Json -Depth 3
} else {
    Write-Host "Failed to create blog post! Status: $($blogResp.StatusCode)" -ForegroundColor Red
    Write-Host "Response:" -ForegroundColor Yellow
    Write-Host $blogResp.Content
}
