#!/usr/bin/env node

// Client MCP simple pour tester le serveur local
import { spawn } from 'child_process';
import { McpClient } from '@modelcontextprotocol/sdk/client/mcp.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

async function testMCPClient() {
  console.log('=== Test du client MCP ===\n');
  
  try {
    // Démarrer le serveur MCP
    const serverProcess = spawn('node', ['build/index.js'], {
      stdio: ['pipe', 'pipe', 'pipe']
    });
    
    // Créer le transport et le client
    const transport = new StdioClientTransport(serverProcess.stdin, serverProcess.stdout);
    const client = new McpClient();
    
    // Se connecter au serveur
    await client.connect(transport);
    
    console.log('✅ Connecté au serveur MCP\n');
    
    // Lister les outils disponibles
    const tools = await client.listTools();
    console.log('🔧 Outils disponibles:');
    tools.tools.forEach(tool => {
      console.log(`  - ${tool.name}: ${tool.description}`);
    });
    console.log();
    
    // Test de la recherche
    console.log('🔍 Test de la recherche de produits...');
    const searchResult = await client.callTool('SearchByKeyWord', {
      searchWord: 'smartphone'
    });
    console.log('Résultat de la recherche:');
    console.log(searchResult.content[0].text.substring(0, 200) + '...\n');
    
    // Test de l'authentification OAuth2
    console.log('🔐 Test de l\'authentification OAuth2...');
    const authResult = await client.callTool('AuthenticateOAuth', {});
    console.log('Résultat de l\'authentification:');
    console.log(authResult.content[0].text.substring(0, 200) + '...\n');
    
    // Fermer la connexion
    await client.close();
    serverProcess.kill();
    
    console.log('✅ Tests terminés avec succès !');
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
  }
}

testMCPClient(); 