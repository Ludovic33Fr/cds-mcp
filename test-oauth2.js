#!/usr/bin/env node

// Script de test pour le flux OAuth2
import { authenticateOAuth } from './build/mcp.js';

async function testOAuth2() {
  console.log('=== Test du flux OAuth2 ===\n');
  console.log('Ce test va :');
  console.log('1. Générer une URL d\'autorisation avec PKCE (sans client_secret)');
  console.log('2. Ouvrir votre navigateur automatiquement');
  console.log('3. Vous demander de vous connecter avec vos identifiants Peaksys');
  console.log('4. Récupérer le token d\'accès\n');
  console.log('Note: Le client_secret n\'est pas nécessaire grâce au PKCE !\n');
  
  console.log('Appuyez sur Entrée pour commencer...');
  await new Promise(resolve => {
    process.stdin.once('data', resolve);
  });

  try {
    console.log('Démarrage de l\'authentification OAuth2...\n');
    
    const authResult = await authenticateOAuth(
      'ftc78cbA5pb2cmjnHS23QAoU',
      undefined, // clientSecret optionnel - pas nécessaire avec PKCE
      'https://www.oauth.com/playground/authorization-code-with-pkce.html',
      'photo+offline_access'
    );
    
    console.log('\n=== Résultat de l\'authentification ===');
    console.log(authResult);
    
  } catch (error) {
    console.error('Erreur lors du test OAuth2:', error.message);
  }
  
  process.exit(0);
}

testOAuth2(); 