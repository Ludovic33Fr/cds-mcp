#!/usr/bin/env node

// Point d'entrée pour npx @ludovicl33/cds-mcp
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Chemin vers le fichier compilé
const serverPath = join(__dirname, '..', 'build', 'index.js');

// Démarrer le serveur MCP
const server = spawn('node', [serverPath], {
  stdio: ['inherit', 'inherit', 'inherit']
});

server.on('error', (error) => {
  console.error('Erreur lors du démarrage du serveur MCP:', error);
  process.exit(1);
});

server.on('exit', (code) => {
  process.exit(code);
});

// Gérer les signaux pour arrêter proprement le serveur
process.on('SIGINT', () => {
  server.kill('SIGINT');
});

process.on('SIGTERM', () => {
  server.kill('SIGTERM');
}); 