#!/bin/bash

# Script pour tester la fonctionnalité de réinitialisation de mot de passe

API_BASE="http://localhost:3001"
TEST_EMAIL="test@example.com"

echo "=== Test de Réinitialisation de Mot de Passe ==="
echo ""

# 1. Demander une réinitialisation
echo "1. Demande de réinitialisation pour $TEST_EMAIL..."
RESPONSE=$(curl -s -X POST "$API_BASE/auth/forgot-password" \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"$TEST_EMAIL\"}")

echo "Réponse: $RESPONSE"
echo ""

# Note: En production, vous devriez:
# 1. Créer d'abord un utilisateur de test
# 2. Consulter les logs du serveur pour obtenir le token
# 3. Tester la réinitialisation avec ce token

echo "=== Instructions pour tester ==="
echo "1. D'abord, créez un utilisateur avec cet email"
echo "2. Demandez une réinitialisation"
echo "3. Consultez les logs du serveur pour voir le token"
echo "4. Testez la réinitialisation avec:"
echo ""
echo "curl -X POST $API_BASE/auth/reset-password \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{\"token\": \"token-du-serveur\", \"password\": \"nouveau-mot-de-passe\"}'"
echo ""
