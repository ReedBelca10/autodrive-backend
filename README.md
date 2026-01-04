# AutoDrive-Backend
Le backend NestJS du projet AutoDrive (application web de location de véhicule).

## Authentification et Rôles Utilisateur

### Système de rôles
Le système supporte 3 rôles utilisateur :
- **admin** : Accès au dashboard administrateur (`/admin`)
- **manager** : Accès au dashboard manager (`/manager`)
- **client** : Utilisateur standard (accueil `/`)

### Flux d'authentification avec redirection automatique

1. **Utilisateur se connecte** : POST `/auth/login` avec email/password
2. **Backend génère JWT** : Token contient l'email, l'ID et le **rôle** utilisateur
3. **Token stocké en cookie HttpOnly** : `autodrive_token` (sécurisé, inaccessible au JavaScript)
4. **Frontend récupère le profil** : GET `/auth/profile` pour obtenir le rôle
5. **Redirection automatique** :
   - Admin → `/admin` (protégé par middleware + AdminGuard backend)
   - Manager → `/manager` (protégé par middleware + ManagerGuard backend)
   - Client → `/` (pas de protection)

### Protection des routes

**Frontend** : Middleware Next.js (`middleware.ts`)
- Vérifie le rôle en appelant `/auth/profile`
- Redirige vers `/login` si non authentifié
- Redirige vers `/` si rôle insuffisant

**Backend** : Guards NestJS
- `AdminGuard` : Vérifie `role === 'admin'`
- `ManagerGuard` : Vérifie `role === 'manager'` ou `'admin'`
- Lecture du token depuis cookies HttpOnly (`request.cookies.autodrive_token`) avec fallback sur Authorization header

### Endpoints clés

| Endpoint | Méthode | Auth | Description |
|----------|---------|------|-------------|
| `/auth/login` | POST | ❌ | Se connecter |
| `/auth/register` | POST | ❌ | S'inscrire |
| `/auth/profile` | GET | ✅ JWT | Récupérer le profil actuel avec rôle |
| `/auth/logout` | POST | ✅ JWT | Se déconnecter |
| `/auth/refresh` | POST | ✅ JWT | Renouveler le token |
| `/admin/dashboard/stats` | GET | ✅ AdminGuard | Statistiques (admin uniquement) |
| `/admin/dashboard/users` | GET | ✅ AdminGuard | Liste des utilisateurs (admin uniquement) |

### Variables d'environnement requises

```env
# JWT
JWT_SECRET=votre_secret_jwt_tres_long_et_complexe

# MongoDB
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/autodrive

# Frontend
FRONTEND_ORIGIN=http://localhost:3000

# Supabase (optionnel, pour les avatars)
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_KEY=votre_service_key
SUPABASE_BUCKET=avatars
```

## Testing avatar upload (local dev)

This project exposes an authenticated endpoint to upload user avatars to Supabase Storage and returns either a public URL or a signed URL. The examples below show how I tested the full flow locally (register -> profile -> upload -> profile) using PowerShell and curl.

Prerequisites
- Ensure `.env` contains these variables:
	- `MONGODB_URI` — your MongoDB connection string
	- `JWT_SECRET` — JWT secret for signing tokens
	- `FRONTEND_ORIGIN` — e.g. `http://localhost:3000`
	- `SUPABASE_URL` and `SUPABASE_KEY` — supabase project url and service key
	- `SUPABASE_BUCKET` — (optional) bucket name (default: `avatars`)

Start the dev server (this repository defaults to port `3001`):
```powershell
cd 'C:\Users\ReedBelca\Documents\Projets\AutoDrive-Backend'
$env:PORT=3001
npm run start:dev
```

PowerShell test (register -> get profile -> upload tiny PNG -> get profile):
```powershell
# create a tiny 1x1 PNG file from base64
$base64='iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAAWgmWQ0AAAAASUVORK5CYII='
[System.Convert]::FromBase64String($base64) | Set-Content -Encoding Byte test-avatar.png

# register and keep cookies in a session
$rand=Get-Random -Maximum 999999
$email="local_test_$rand@example.com"
$json=@{ fullName='Local Test'; email=$email; password='Password123!' } | ConvertTo-Json
$session = New-Object Microsoft.PowerShell.Commands.WebRequestSession
Invoke-RestMethod -Uri 'http://localhost:3001/auth/register' -Method Post -Body $json -ContentType 'application/json' -WebSession $session

# view profile (should return user object)
Invoke-RestMethod -Uri 'http://localhost:3001/auth/profile' -Method Get -WebSession $session

# build multipart body and upload file (PowerShell 5.1 does not support -Form on Invoke-WebRequest)
$boundary = [System.Guid]::NewGuid().ToString()
$LF = "`r`n"
$start = "--$boundary$LFContent-Disposition: form-data; name=\"file\"; filename=\"test-avatar.png\"$LFContent-Type: image/png$LF$LF"
$startBytes=[System.Text.Encoding]::UTF8.GetBytes($start)
$fileBytes = [System.IO.File]::ReadAllBytes('test-avatar.png')
$end = "$LF--$boundary--$LF"
$endBytes=[System.Text.Encoding]::UTF8.GetBytes($end)
$ms = New-Object System.IO.MemoryStream
$ms.Write($startBytes,0,$startBytes.Length)
$ms.Write($fileBytes,0,$fileBytes.Length)
$ms.Write($endBytes,0,$endBytes.Length)
$bodyBytes = $ms.ToArray()
$contentType = "multipart/form-data; boundary=$boundary"
Invoke-RestMethod -Uri 'http://localhost:3001/users/avatar' -Method Post -Body $bodyBytes -ContentType $contentType -WebSession $session

# re-check profile (avatarUrl and avatarPath should be present)
Invoke-RestMethod -Uri 'http://localhost:3001/auth/profile' -Method Get -WebSession $session
```

curl test (Windows):
```powershell
# Prepare JSON payload file first (avoid quoting issues in PowerShell)
$payload = @{ fullName='Curl Test'; email='curl_test@example.com'; password='Password123!' } | ConvertTo-Json
$payload | Out-File -Encoding utf8 payload.json

# register and save cookies to a cookie jar
curl.exe -i -c cookies.txt -X POST 'http://localhost:3001/auth/register' -H 'Content-Type: application/json' --data-binary @payload.json

# upload using cookie jar (curl -F handles multipart upload)
curl.exe -i -b cookies.txt -X POST 'http://localhost:3001/users/avatar' -F "file=@test-avatar.png"

# fetch profile using saved cookies
curl.exe -i -b cookies.txt 'http://localhost:3001/auth/profile'
```

Notes
- The backend will store `avatarPath` in MongoDB and update `avatarUrl` with a public URL when the bucket is public. If the bucket is private the `/auth/profile` endpoint will generate a signed URL valid for 1 hour.
- I added verbose console logs around upload and signed-url generation in `src/users/users.controller.ts` and `src/auth/auth.controller.ts` to help debugging.
- If you prefer the app to listen on a different port, set `PORT` in your environment or change `src/main.ts`.

If you want, I can add server-side file validation (size, mime-type) or generate thumbnails automatically — tell me which you'd like next.
