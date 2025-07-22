const express = require('express');
const crypto = require('crypto');
const fs = require('fs').promises;
const path = require('path');
const open = require('open');

class MCPAuthManager {
  clientId: string;
  authUrl: string;
  tokenUrl: string;
  redirectUri: string;
  port: number;

  constructor(options: {
    clientId?: string;
    authUrl?: string;
    tokenUrl?: string;
    redirectUri?: string;
    port?: number;
    tokenFile?: string;
    scopes?: string[];
  } = {}) {
    this.clientId = options.clientId || 'your-mcp-client-id';
    this.authUrl = options.authUrl || 'https://auth.baleen.com';
    this.tokenUrl = options.tokenUrl || 'https://auth.baleen.com/token';
    this.redirectUri = options.redirectUri || 'http://localhost:3000/callback';
    this.port = options.port || 3000;

    // Add missing property declarations to avoid TypeScript errors
    (this as any).tokenFile = options.tokenFile || path.join(process.cwd(), '.baleen-token');
    (this as any).scopes = options.scopes || ['api:read', 'api:write'];

    (this as any).server = null;
    (this as any).pendingAuth = null;
  }

  // Génère un code de vérification PKCE
  generatePKCE() {
    const codeVerifier = crypto.randomBytes(32).toString('base64url');
    const codeChallenge = crypto
      .createHash('sha256')
      .update(codeVerifier)
      .digest('base64url');
    
    return { codeVerifier, codeChallenge };
  }

  // Génère un état pour la sécurité
  generateState() {
    return crypto.randomBytes(16).toString('hex');
  }

  // Vérifie si un token valide existe
  async hasValidToken() {
    try {
      const tokenData = await this.loadToken();
      if (!tokenData) return false;
      
      // Vérifier si le token n'est pas expiré
      if (tokenData.expires_at && Date.now() > tokenData.expires_at) {
        console.log('Token expiré, renouvellement nécessaire');
        const refreshed = await this.refreshToken(tokenData.refresh_token);
        return refreshed;
      }

      return true;
    } catch (error) {
      console.error('Erreur lors de la vérification du token:', error);
      return false;
    }
  }

    // Renouvelle le token avec le refresh token
    async refreshToken(refreshToken: any) {
        try {
          const response = await fetch(this.tokenUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
              grant_type: 'refresh_token',
              client_id: this.clientId,
              refresh_token: refreshToken,
            }),
          });
          
          if (!response.ok) {
            throw new Error(`Erreur lors du renouvellement: ${response.status}`);
          }
          
          const tokenData = await response.json();
          await this.saveToken(tokenData);
          
          console.log('✅ Token renouvelé avec succès');
          return true;
        } catch (error) {
          console.error('Erreur lors du renouvellement du token:', error);
          return false;
        }
      }

  // Charge le token depuis le fichier
  async loadToken() {
    try {
      const tokenData = await fs.readFile((this as any).tokenFile, 'utf8');
      return JSON.parse(tokenData);
    } catch (error: any) {
      if (error.code !== 'ENOENT') {
        console.error('Erreur lors du chargement du token:', error);
      }
      return null;
    }
  }

  // Sauvegarde le token dans un fichier
  async saveToken(tokenData: any) {
    try {
      // Ajouter la date d'expiration
      if (tokenData.expires_in) {
        tokenData.expires_at = Date.now() + (tokenData.expires_in * 1000);
      }

      const tokenFile = (this as any).tokenFile;
      await fs.writeFile(tokenFile, JSON.stringify(tokenData, null, 2));

      // Sécuriser le fichier (lecture seule pour le propriétaire)
      await fs.chmod(tokenFile, 0o600);
      console.log('✅ Token sauvegardé avec succès');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du token:', error);
      throw error;
    }
  }

  // Démarre le serveur temporaire pour recevoir le callback
  async startCallbackServer() {
    return new Promise((resolve, reject) => {
      const app = express();
      
      app.get('/callback', async (req, res) => {
        try {
          const { code, state, error } = req.query;
          
          if (error) {
            res.status(400).send(`Erreur d'authentification: ${error}`);
            return reject(new Error(`Erreur d'authentification: ${error}`));
          }
          
          if (!code || state !== this.pendingAuth.state) {
            res.status(400).send('État invalide ou code manquant');
            return reject(new Error('État invalide ou code manquant'));
          }
          
          // Échanger le code contre un token
          const tokenData = await this.exchangeCodeForToken(code);
          await this.saveToken(tokenData);
          
          res.send(`
            <html>
              <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
                <h1 style="color: #4CAF50;">✅ Authentification réussie!</h1>
                <p>Vous pouvez maintenant fermer cette fenêtre.</p>
                <script>setTimeout(() => window.close(), 2000);</script>
              </body>
            </html>
          `);
          
          resolve(tokenData);
        } catch (error) {
          res.status(500).send(`Erreur: ${error.message}`);
          reject(error);
        }
      });
      
      this.server = app.listen(this.port, () => {
        console.log(`🔄 Serveur de callback démarré sur le port ${this.port}`);
      });
    });
  }

    // Échange le code d'autorisation contre un token
    async exchangeCodeForToken(code: any) {
        const response = await fetch(this.tokenUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            grant_type: 'authorization_code',
            client_id: this.clientId,
            code: code,
            redirect_uri: this.redirectUri,
            code_verifier: this.pendingAuth.codeVerifier,
          }),
        });
        
        if (!response.ok) {
          throw new Error(`Erreur lors de l'échange du token: ${response.status}`);
        }
        
        return await response.json();
      }

  // Lance le processus d'authentification complet
  async authenticate() {
    try {
      // Vérifier si un token valide existe déjà
      if (await this.hasValidToken()) {
        console.log('✅ Token valide trouvé, authentification non nécessaire');
        return await this.loadToken();
      }
      
      console.log('🔐 Démarrage de l\'authentification...');
      
      // Générer les paramètres de sécurité
      const { codeVerifier, codeChallenge } = this.generatePKCE();
      const state = this.generateState();
      
      this.pendingAuth = {
        codeVerifier,
        state,
        timestamp: Date.now()
      };
      
      // Construire l'URL d'autorisation
      const authParams = new URLSearchParams({
        response_type: 'code',
        client_id: this.clientId ?? '',
        redirect_uri: this.redirectUri ?? '',
        scope: (this.scopes ?? []).join(' '),
        state: state,
        code_challenge: codeChallenge,
        code_challenge_method: 'S256'
      });
      
      const authorizationUrl = `${this.authUrl}/authorize?${authParams}`;
      
      console.log('🌐 Ouverture du navigateur pour l\'authentification...');
      console.log(`URL: ${authorizationUrl}`);
      
      // Démarrer le serveur de callback
      const serverPromise = this.startCallbackServer();
      
      // Ouvrir le navigateur
      await open(authorizationUrl);
      
      // Attendre la réponse du callback
      const tokenData = await serverPromise;
      
      return tokenData;
    } catch (error) {
      console.error('Erreur lors de l\'authentification:', error);
      throw error;
    } finally {
      // Nettoyer
      if (this.server) {
        this.server.close();
        this.server = null;
      }
      this.pendingAuth = null;
    }
  }

  // Récupère le token d'accès actuel
  async getAccessToken() {
    const tokenData = await this.loadToken();
    if (!tokenData) {
      throw new Error('Aucun token disponible. Veuillez vous authentifier d\'abord.');
    }
    return tokenData.access_token;
  }

  // Révoque le token (déconnexion)
  async revoke() {
    try {
      const tokenData = await this.loadToken();
      if (!tokenData) {
        console.log('Aucun token à révoquer');
        return;
      }
      
      // Tenter de révoquer le token côté serveur
      if (this.revokeUrl) {
        await fetch(this.revokeUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            token: tokenData.access_token,
            client_id: this.clientId,
          }),
        });
      }
      
      // Supprimer le fichier token local
      await fs.unlink(this.tokenFile);
      console.log('✅ Token révoqué et supprimé');
    } catch (error) {
      console.error('Erreur lors de la révocation:', error);
    }
  }
}

// Exemple d'utilisation
async function main() {
  const authManager = new MCPAuthManager({
    clientId: 'your-baleen-client-id',
    authUrl: 'https://auth.baleen.com',
    tokenUrl: 'https://auth.baleen.com/token',
    scopes: ['api:read', 'api:write']
  });
  
  try {
    // Authentification
    const tokenData = await authManager.authenticate();
    console.log('🎉 Authentification réussie!');
    
    // Utiliser le token pour faire des appels API
    const accessToken = await authManager.getAccessToken();
    console.log('Token d\'accès disponible pour les appels API');
    
    // Exemple d'appel API avec le token
    const response = await fetch('https://api.baleen.com/some-endpoint', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Réponse API:', response.status);
    
  } catch (error) {
    console.error('Erreur:', error);
  }
}

module.exports = MCPAuthManager;

// Décommenter pour tester
// main();