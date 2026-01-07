#!/bin/bash

# Script de test d'upload de médias
# Usage: ./test-upload.sh <jwt-token> <vehicle-id> <image-path>

set -e

API_BASE="http://localhost:3001/api"
JWT_TOKEN="${1:-}"
VEHICLE_ID="${2:-}"
IMAGE_PATH="${3:-}"

# Couleurs pour l'output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Upload Media Test ===${NC}\n"

# Validation des paramètres
if [ -z "$JWT_TOKEN" ]; then
    echo -e "${RED}❌ Error: JWT token required${NC}"
    echo "Usage: $0 <jwt-token> [vehicle-id] [image-path]"
    exit 1
fi

if [ -z "$IMAGE_PATH" ]; then
    IMAGE_PATH="./test-image.jpg"
fi

if [ ! -f "$IMAGE_PATH" ]; then
    echo -e "${RED}❌ Error: File not found: $IMAGE_PATH${NC}"
    exit 1
fi

echo -e "${YELLOW}Configuration:${NC}"
echo "  API Base: $API_BASE"
echo "  JWT Token: ${JWT_TOKEN:0:20}..."
echo "  Image Path: $IMAGE_PATH"
echo "  File Size: $(stat -f%z "$IMAGE_PATH" 2>/dev/null || stat -c%s "$IMAGE_PATH") bytes"
echo ""

# Test 1: Upload de fichier
echo -e "${BLUE}1️⃣ Testing File Upload...${NC}"
UPLOAD_RESPONSE=$(curl -s -X POST \
  "$API_BASE/vehicles/upload/media" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -F "file=@$IMAGE_PATH" \
  -w "\n%{http_code}")

HTTP_CODE=$(echo "$UPLOAD_RESPONSE" | tail -n1)
BODY=$(echo "$UPLOAD_RESPONSE" | head -n-1)

echo "HTTP Code: $HTTP_CODE"
echo "Response:"
echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"

if [ "$HTTP_CODE" = "201" ] || [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ Upload successful${NC}\n"
    PUBLIC_URL=$(echo "$BODY" | jq -r '.publicUrl' 2>/dev/null)
    FILE_NAME=$(echo "$BODY" | jq -r '.fileName' 2>/dev/null)
    
    if [ ! -z "$PUBLIC_URL" ] && [ "$PUBLIC_URL" != "null" ]; then
        echo -e "${GREEN}✅ Public URL generated:${NC}"
        echo "  $PUBLIC_URL"
        
        # Test 2: Vérifier que l'URL est accessible
        echo -e "\n${BLUE}2️⃣ Testing URL Accessibility...${NC}"
        URL_HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$PUBLIC_URL")
        
        if [ "$URL_HTTP_CODE" = "200" ]; then
            echo -e "${GREEN}✅ URL is accessible${NC}"
        else
            echo -e "${RED}❌ URL not accessible (HTTP $URL_HTTP_CODE)${NC}"
        fi
        
        # Test 3: Ajouter à un véhicule (si vehicle-id fourni)
        if [ ! -z "$VEHICLE_ID" ]; then
            echo -e "\n${BLUE}3️⃣ Adding Media to Vehicle...${NC}"
            ADD_RESPONSE=$(curl -s -X POST \
              "$API_BASE/vehicles/$VEHICLE_ID/add-media" \
              -H "Authorization: Bearer $JWT_TOKEN" \
              -H "Content-Type: application/json" \
              -d "{\"mediaUrl\": \"$PUBLIC_URL\"}" \
              -w "\n%{http_code}")
            
            ADD_HTTP_CODE=$(echo "$ADD_RESPONSE" | tail -n1)
            ADD_BODY=$(echo "$ADD_RESPONSE" | head -n-1)
            
            echo "HTTP Code: $ADD_HTTP_CODE"
            echo "Response:"
            echo "$ADD_BODY" | jq '.' 2>/dev/null || echo "$ADD_BODY"
            
            if [ "$ADD_HTTP_CODE" = "200" ] || [ "$ADD_HTTP_CODE" = "201" ]; then
                echo -e "${GREEN}✅ Media added to vehicle${NC}"
            else
                echo -e "${RED}❌ Failed to add media to vehicle${NC}"
            fi
        fi
    else
        echo -e "${RED}❌ No public URL in response${NC}"
    fi
else
    echo -e "${RED}❌ Upload failed (HTTP $HTTP_CODE)${NC}"
    exit 1
fi

echo -e "\n${GREEN}✅ All tests completed${NC}"
