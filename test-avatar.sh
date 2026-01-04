#!/bin/bash

# Script de test manuel pour la fonctionnalité d'upload d'avatar
# Ce script teste les endpoints backend de l'API Avatar

# Configuration
API_BASE="http://localhost:3000"
COOKIES_FILE="./cookies.txt"
TEST_IMAGE="./test-avatar.jpg"

echo "=== Test d'Avatar Upload ==="
echo ""

# 1. Créer une image de test simple
echo "1️⃣ Création d'une image de test..."
if [ ! -f "$TEST_IMAGE" ]; then
  # Créer un fichier image de test (1x1 pixel JPEG)
  python3 << 'EOF'
from PIL import Image
img = Image.new('RGB', (200, 200), color='red')
img.save('test-avatar.jpg')
print("✓ Image de test créée: test-avatar.jpg")
EOF
else
  echo "✓ Image de test existante utilisée"
fi
echo ""

# 2. Login
echo "2️⃣ Connexion à l'application..."
read -p "Entrez votre email: " EMAIL
read -sp "Entrez votre mot de passe: " PASSWORD
echo ""

LOGIN_RESPONSE=$(curl -s -c "$COOKIES_FILE" -X POST "$API_BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")

if echo "$LOGIN_RESPONSE" | grep -q "message"; then
  echo "✓ Connexion réussie"
else
  echo "✗ Erreur de connexion"
  echo "$LOGIN_RESPONSE"
  exit 1
fi
echo ""

# 3. Récupérer le profil avant upload
echo "3️⃣ Récupération du profil actuel..."
PROFILE_BEFORE=$(curl -s -b "$COOKIES_FILE" "$API_BASE/auth/profile")
echo "Profil actuel: $PROFILE_BEFORE"
echo ""

# 4. Upload l'avatar
echo "4️⃣ Upload de l'avatar..."
UPLOAD_RESPONSE=$(curl -s -b "$COOKIES_FILE" -X POST "$API_BASE/users/avatar" \
  -F "file=@$TEST_IMAGE")

echo "Réponse du serveur:"
echo "$UPLOAD_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$UPLOAD_RESPONSE"
echo ""

# 5. Vérifier que l'avatar a été mis à jour
echo "5️⃣ Vérification du profil après upload..."
PROFILE_AFTER=$(curl -s -b "$COOKIES_FILE" "$API_BASE/auth/profile")
echo "Profil mis à jour:"
echo "$PROFILE_AFTER" | python3 -m json.tool 2>/dev/null || echo "$PROFILE_AFTER"
echo ""

# 6. Récupérer l'avatar
echo "6️⃣ Téléchargement de l'avatar..."
AVATAR_URL=$(echo "$UPLOAD_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin).get('avatarUrl', ''))" 2>/dev/null)

if [ -z "$AVATAR_URL" ]; then
  echo "✗ Impossible d'obtenir l'URL de l'avatar"
else
  echo "✓ URL de l'avatar obtenue: $AVATAR_URL"
  
  # Télécharger et vérifier l'avatar via le proxy
  AVATAR_GET=$(curl -s -b "$COOKIES_FILE" -o /dev/null -w "%{http_code}" "$API_BASE/users/avatar")
  if [ "$AVATAR_GET" = "200" ]; then
    echo "✓ Avatar accessible via le proxy GET /users/avatar"
  else
    echo "✗ Erreur lors de l'accès au proxy avatar (Code: $AVATAR_GET)"
  fi
fi
echo ""

# Nettoyage
rm -f "$COOKIES_FILE" "$TEST_IMAGE"
echo "✓ Test terminé - Fichiers temporaires supprimés"
