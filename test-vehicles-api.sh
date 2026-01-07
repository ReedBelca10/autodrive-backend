#!/bin/bash
# Script pour tester les endpoints des véhicules

API_BASE="http://localhost:3001"

echo "=========================================="
echo "Test des endpoints des véhicules"
echo "=========================================="

# Test 1: Récupérer tous les véhicules
echo ""
echo "1. Récupération de tous les véhicules..."
curl -s "$API_BASE/vehicles" | jq '.' | head -50
echo ""

# Test 2: Récupérer les configurations
echo "2. Récupération des carburants disponibles..."
curl -s "$API_BASE/vehicles/config/fuels" | jq '.'
echo ""

echo "3. Récupération des types de transmission..."
curl -s "$API_BASE/vehicles/config/transmissions" | jq '.'
echo ""

echo "=========================================="
echo "Tests terminés"
echo "=========================================="
