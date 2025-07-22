#!/usr/bin/env node

// Exemple d'utilisation de l'authentification OAuth2 sans client_secret
import { authenticateOAuth } from './build/mcp.js';

async function exampleOAuth2NoSecret() {
  console.log('=== Exemple OAuth2 sans client_secret ===\n');
  
  try {
    // Authentification OAuth2 avec seulement le clientId
    const result = await authenticateOAuth(
      'your-client-id',           // Seul paramètre obligatoire
      undefined,                   // client_secret optionnel - pas nécessaire avec PKCE
      'http://localhost:3000/callback',
      'read write'
    );
    
    console.log('Résultat:', result);
    
  } catch (error) {
    console.error('Erreur:', error.message);
  }
}

exampleOAuth2NoSecret(); 