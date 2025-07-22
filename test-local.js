#!/usr/bin/env node

// Test simple des méthodes MCP en local
import { searchByKeyword, getProductDetails, authenticateOAuth } from './build/mcp.js';

async function testLocal() {
  console.log('=== Test local des méthodes MCP ===\n');
  
  try {
    // Test 1: Recherche de produits
    console.log('1. Test de la recherche de produits...');
    const searchResult = await searchByKeyword('smartphone');
    console.log('Résultat:', searchResult.substring(0, 300) + '...\n');
    
    // Test 2: Détails d'un produit (si on a un ID)
    console.log('2. Test des détails d\'un produit...');
    try {
      const productResult = await getProductDetails('aaalm03538');
      console.log('Résultat:', productResult.substring(0, 300) + '...\n');
    } catch (error) {
      console.log('Erreur produit:', error.message, '\n');
    }
    
    // Test 3: Authentification OAuth2
    console.log('3. Test de l\'authentification OAuth2...');
    const authResult = await authenticateOAuth(
      'ftc78cbA5pb2cmjnHS23QAoU',
      undefined,
      'https://www.oauth.com/playground/authorization-code-with-pkce.html',
      'photo'
    );
    console.log('Résultat:', authResult.substring(0, 300) + '...\n');
    
    console.log('✅ Tous les tests locaux terminés !');
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

testLocal(); 