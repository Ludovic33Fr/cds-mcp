import { doRequest } from './http.js';
export async function getBestDeliveryInformations(productId, offerId, postalCode, longitude, latitude, city, country) {
    const body = {
        productId,
        offerId,
        geoloc: { postalCode, longitude, latitude, city, country }
    };
    const headers = {
        'x-cds-context-devicetype': 'mobile',
        'x-cds-context-features': '{newTechnicalDescription=true}',
        'x-cds-context-pro-enabled': 'false',
        'x-cds-context-siteid': '206',
        'x-requested-with': 'XMLHttpRequest',
        'content-type': 'application/json'
    };
    const res = await doRequest('https://bffmobilesite.cdiscount.com/shipping/bestDeliveryInformation', {
        method: 'POST',
        headers,
        body: JSON.stringify(body)
    });
    // const json = await res.body.json();
    const json = await res.body.json();
    return `
Product ID      : ${json.productId}
Offer ID        : ${json.offerId}
Free Shipping   : ${json.isFreeShipping ? 'Oui' : 'Non'}
Delivery Msg    : ${json.shippingDelayMessage}
More Info       : ${json.detailUrl}
`.trim();
}
export async function searchByKeyword(searchWord) {
    const url = 'https://bffmobilesite.cdiscount.com/search?context=search';
    const body = {
        departmentId: '10',
        extendedPropertyKeys: ['DesactivateH1'],
        filterIds: ['navigation/"07/0703/070302"'],
        isDidYouMeanSelected: false,
        isQuickFacetsImageButtonActive: false,
        isRerankingSdxEnabled: null,
        isSwordEnabled: true,
        mediaSizes: [
            [140, 210],
            [140, 140],
            [300, 300]
        ],
        page: 2,
        pageType: 'SEARCH_AJAX',
        perPage: 47,
        searchWord,
        siteMapNodeId: null,
        sort: 'relevance',
        sortDir: 'desc',
        uniqueVisitId: '250616095109LVQBOXQV',
        url: `https://www.cdiscount.com/search/10/${encodeURIComponent(searchWord)}.html?page=2`
    };
    const headers = {
        'x-cds-context-devicetype': 'mobile',
        'x-cds-context-features': '{newTechnicalDescription=true}',
        'x-cds-context-pro-enabled': 'false',
        'x-cds-context-siteid': '206',
        'x-requested-with': 'XMLHttpRequest',
        'content-type': 'application/json'
    };
    const res = await doRequest(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(body)
    });
    if (res.statusCode !== 200) {
        return `Erreur HTTP : ${res.statusCode}`;
    }
    let json;
    try {
        json = await res.body.json();
    }
    catch (error) {
        return `Erreur de parsing JSON : ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
    if (!json || !json.offers || json.offers.length === 0) {
        return 'No active tiles for this instance.';
    }
    return json.offers.map((data) => {
        const productName = data.productName || data.name || '';
        const productUrl = data.productUrl || data.url || '';
        const ratingRate = data.ratingRate || '';
        return `
Id: ${data.id}
CategoryId: ${data.categoryId}
MinQuantity: ${data.minQuantity}
ProductId: ${data.productId}
ProductName: ${productName}
ProductUrl: ${productUrl}
RatingRate: ${ratingRate}
Price: ${data.prices?.price?.value ?? '?'} €
OfferId: ${data.prices?.offerId}
`.trim();
    }).join('\n--\n');
}
export async function getProductDetails(productId) {
    const url = 'https://bffmobilesite.cdiscount.com/product-sheets/' + productId;
    const headers = {
        'X-CDS-Context-DeviceType': 'unknown',
        'X-CDS-Context-Features': '{newTechnicalDescription=true}',
        'X-CDS-Context-SiteId': '206',
        'X-Requested-With': 'XMLHttpRequest'
    };
    const res = await doRequest(url, {
        method: 'GET',
        headers
    });
    if (res.statusCode !== 200) {
        return `Erreur HTTP : ${res.statusCode}`;
    }
    let root;
    try {
        root = await res.body.json();
    }
    catch (error) {
        return `Erreur de parsing JSON : ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
    if (!root || Object.keys(root).length === 0) {
        return 'Aucun produit trouvé avec cet ID.';
    }
    const product = Object.values(root)[0];
    if (!product) {
        return 'Aucun produit trouvé avec cet ID.';
    }
    return `
ProductId: ${product.productId || 'N/A'}
ProductName: ${product.title || 'N/A'}
Price: ${product.prices?.price?.value ?? '?'} €
StrikedPrice: ${product.strikedPrice ?? 0} €
Brand: ${product.brandName || 'N/A'}
CDAV Eligible: ${product.isCdav || false}
Rating: ${product.ratingAverageOverallRating || 0} / 5 (${product.ratingTotalReviewCount || 0} avis)
Shipping: ${product.freeShipping || false}
Seller: ${product.sellerName || 'N/A'}
CategoryId: ${product.categoryId || 'N/A'}
URL: https:${product.url || ''}
Image: ${product.media?.[0]?.url || 'N/A'}
Description: ${product.technicalDescription?.fullDescription || 'Aucune description disponible'}
`.trim();
}
// Variable globale pour activer/désactiver le mode simulation
let SIMULATION_MODE = true;
// Fonction pour basculer le mode simulation
export function setSimulationMode(enabled) {
    SIMULATION_MODE = enabled;
    return `🔧 Mode simulation ${enabled ? 'activé' : 'désactivé'}`;
}
// Fonction pour vérifier le mode simulation actuel
export function getSimulationMode() {
    return `🔧 Mode simulation actuel: ${SIMULATION_MODE ? 'ACTIVÉ' : 'DÉSACTIVÉ'}`;
}
export async function authenticateOAuth(clientId, clientSecret, redirectUri, scope) {
    const authUrl = 'https://auth.peaksys.com';
    const defaultRedirectUri = redirectUri || 'http://localhost:3000/callback';
    const defaultScope = scope || 'read write';
    // Generate PKCE challenge
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = await generateCodeChallenge(codeVerifier);
    // Generate state for security
    const state = Math.random().toString(36).substring(7);
    // Step 1: Generate authorization URL with PKCE
    const authParams = new URLSearchParams({
        client_id: clientId,
        response_type: 'code',
        redirect_uri: defaultRedirectUri,
        scope: defaultScope,
        state: state,
        code_challenge: codeChallenge,
        code_challenge_method: 'S256'
    });
    // const authorizationUrl = `${authUrl}/oauth/authorize?${authParams.toString()}`;
    const authorizationUrl = `https://www.oauth.com/playground/auth-dialog.html?${authParams.toString()}`;
    if (SIMULATION_MODE) {
        console.log(`\n🔧 MODE SIMULATION ACTIVÉ`);
        console.log(`📝 Simulation de l'authentification OAuth2...`);
        console.log(`⏳ Attente simulée de 3 secondes...\n`);
        // Simulation d'attente
        await new Promise(resolve => setTimeout(resolve, 3000));
        console.log(`✅ Authentification simulée réussie !`);
        console.log(`🎭 Retour du token factice...\n`);
        return `
🔧 AUTHENTIFICATION OAUTH2 SIMULÉE

✅ Authentification réussie (simulation) !

Access Token: FakeTokenCDS
Token Type: Bearer
Expires In: 3600 secondes (1 heure)
Scope: ${defaultScope}
Refresh Token: FakeRefreshTokenCDS

📝 Note: Ce token est factice et généré en mode simulation.
   L'authentification ADB2C réelle n'a pas été effectuée.
   
🔧 Pour désactiver le mode simulation, modifiez SIMULATION_MODE = false
`.trim();
    }
    // Step 2: Open browser for user authentication
    console.log(`\nOuverture du navigateur pour l'authentification...`);
    console.log(`URL d'autorisation: ${authorizationUrl}\n`);
    // Try to open browser (cross-platform)
    try {
        await openBrowser(authorizationUrl);
    }
    catch (error) {
        console.log(`Impossible d'ouvrir automatiquement le navigateur.`);
        console.log(`Veuillez copier et coller cette URL dans votre navigateur:\n${authorizationUrl}\n`);
    }
    // Step 3: Start local server to handle callback
    const callbackServer = await startCallbackServer(defaultRedirectUri, state);
    // Step 4: Wait for authorization code
    const authCode = await waitForAuthorizationCode(callbackServer);
    if (!authCode) {
        return `Authentification annulée ou expirée.`;
    }
    // Step 5: Exchange authorization code for token
    const tokenUrl = `${authUrl}/oauth/token`;
    const tokenBody = {
        grant_type: 'authorization_code',
        client_id: clientId,
        code: authCode,
        redirect_uri: defaultRedirectUri,
        code_verifier: codeVerifier
    };
    // Add client_secret only if provided (for confidential clients)
    if (clientSecret) {
        tokenBody.client_secret = clientSecret;
    }
    const headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
    };
    try {
        const res = await doRequest(tokenUrl, {
            method: 'POST',
            headers,
            body: new URLSearchParams(tokenBody).toString()
        });
        if (res.statusCode !== 200) {
            return `Erreur d'authentification OAuth : ${res.statusCode}`;
        }
        const tokenData = await res.body.json();
        return `
Authentification OAuth2 réussie !

Access Token: ${tokenData.access_token || 'Non disponible'}
Token Type: ${tokenData.token_type || 'Bearer'}
Expires In: ${tokenData.expires_in || 'Non spécifié'} secondes
Scope: ${tokenData.scope || defaultScope}
Refresh Token: ${tokenData.refresh_token || 'Non disponible'}

URL d'autorisation utilisée: ${authorizationUrl}
Code d'autorisation échangé avec succès
`.trim();
    }
    catch (error) {
        return `Erreur lors de l'échange du code d'autorisation : ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
}
// Helper functions for OAuth2 PKCE flow
import { randomBytes, createHash } from 'crypto';
function generateCodeVerifier() {
    const array = randomBytes(32);
    return base64URLEncode(array);
}
async function generateCodeChallenge(codeVerifier) {
    const hash = createHash('sha256');
    hash.update(codeVerifier);
    const digest = hash.digest();
    return base64URLEncode(digest);
}
function base64URLEncode(buffer) {
    return btoa(String.fromCharCode(...buffer))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
}
async function openBrowser(url) {
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);
    const platform = process.platform;
    let command;
    switch (platform) {
        case 'win32':
            // Sur Windows, on doit échapper l'URL avec des guillemets
            command = `start "" "${url}"`;
            break;
        case 'darwin':
            command = `open "${url}"`;
            break;
        default:
            command = `xdg-open "${url}"`;
            break;
    }
    await execAsync(command);
}
async function startCallbackServer(redirectUri, expectedState) {
    const { createServer } = await import('http');
    const { URL } = await import('url');
    return new Promise((resolve) => {
        const server = createServer((req, res) => {
            const url = new URL(req.url, `http://${req.headers.host}`);
            const code = url.searchParams.get('code');
            const state = url.searchParams.get('state');
            const error = url.searchParams.get('error');
            if (error) {
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(`
          <html>
            <body>
              <h1>Erreur d'authentification</h1>
              <p>Erreur: ${error}</p>
              <p>Vous pouvez fermer cette fenêtre.</p>
            </body>
          </html>
        `);
                server.close();
                resolve({ code: null, error });
                return;
            }
            if (code && state === expectedState) {
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(`
          <html>
            <body>
              <h1>Authentification réussie !</h1>
              <p>Vous pouvez fermer cette fenêtre.</p>
            </body>
          </html>
        `);
                server.close();
                resolve({ code, error: null });
            }
            else {
                res.writeHead(400, { 'Content-Type': 'text/html' });
                res.end(`
          <html>
            <body>
              <h1>Erreur de validation</h1>
              <p>État invalide ou code manquant.</p>
            </body>
          </html>
        `);
                server.close();
                resolve({ code: null, error: 'invalid_state' });
            }
        });
        const port = new URL(redirectUri).port || 3000;
        server.listen(port, () => {
            console.log(`Serveur de callback démarré sur le port ${port}`);
        });
    });
}
async function waitForAuthorizationCode(callbackServer) {
    if (SIMULATION_MODE) {
        console.log('🔧 Mode simulation: génération d\'un code d\'autorisation factice...');
        await new Promise(resolve => setTimeout(resolve, 2000)); // Simulation d'attente
        console.log('✅ Code d\'autorisation factice généré !');
        return 'fake_auth_code_12345';
    }
    console.log('En attente de l\'authentification utilisateur...');
    console.log('Veuillez vous connecter dans le navigateur qui s\'est ouvert.\n');
    try {
        const result = await callbackServer;
        if (result.error) {
            console.log(`Erreur d'authentification: ${result.error}`);
            return null;
        }
        console.log('Code d\'autorisation reçu !');
        return result.code;
    }
    catch (error) {
        console.log(`Erreur lors de l'attente du callback: ${error}`);
        return null;
    }
}
export async function getOAuthProtectedCommands(accessToken) {
    // Simuler une vérification du token
    if (!accessToken) {
        return `
🔒 COMMANDES PROTÉGÉES PAR OAUTH2

❌ Token d'accès manquant
⚠️  Vous devez d'abord vous authentifier avec la méthode AuthenticateOAuth

📋 Commandes disponibles (nécessitent un token valide) :
• getUserProfile() - Récupérer le profil utilisateur
• getUserOrders() - Récupérer l'historique des commandes
• getUserWishlist() - Récupérer la liste de souhaits
• getUserAddresses() - Récupérer les adresses enregistrées
• getUserPreferences() - Récupérer les préférences utilisateur
• createOrder() - Créer une nouvelle commande
• updateUserProfile() - Mettre à jour le profil utilisateur
• deleteUserAddress() - Supprimer une adresse
• addToWishlist() - Ajouter un produit à la liste de souhaits
• removeFromWishlist() - Retirer un produit de la liste de souhaits

🔐 Pour obtenir un token d'accès :
1. Utilisez la méthode AuthenticateOAuth
2. Suivez le processus d'authentification dans le navigateur
3. Récupérez le token d'accès depuis la réponse
4. Utilisez ce token pour accéder aux commandes protégées
`.trim();
    }
    // Simuler des données mockées avec un token valide
    return `
🔓 COMMANDES PROTÉGÉES PAR OAUTH2

✅ Token d'accès valide détecté
🎯 Données mockées disponibles :

👤 PROFIL UTILISATEUR :
• ID: user_12345
• Email: utilisateur@example.com
• Nom: Jean Dupont
• Prénom: Jean
• Date de naissance: 15/03/1985
• Téléphone: +33 6 12 34 56 78
• Statut: Actif
• Date d'inscription: 2023-01-15

📦 HISTORIQUE DES COMMANDES (dernières 5) :
1. Commande #CDS-2024-001234 (15/01/2024)
   - iPhone 14 Pro 256GB - 899,99€
   - Statut: Livré
   
2. Commande #CDS-2024-001156 (10/01/2024)
   - Samsung Galaxy S24 - 799,99€
   - Statut: En cours de livraison
   
3. Commande #CDS-2023-009876 (28/12/2023)
   - AirPods Pro 2 - 249,99€
   - Statut: Livré
   
4. Commande #CDS-2023-009543 (20/12/2023)
   - iPad Air 64GB - 649,99€
   - Statut: Livré
   
5. Commande #CDS-2023-009123 (15/12/2023)
   - MacBook Air M2 - 1299,99€
   - Statut: Livré

💝 LISTE DE SOUHAITS :
• iPhone 15 Pro Max 256GB - 1199,99€
• Apple Watch Series 9 - 399,99€
• AirPods Max - 549,99€
• iPad Pro 12.9" M2 - 1099,99€
• MacBook Pro 14" M3 - 1999,99€

🏠 ADRESSES ENREGISTRÉES :
1. Adresse principale :
   - 123 Rue de la Paix
   - 75001 Paris, France
   - Tél: +33 1 23 45 67 89
   
2. Adresse de livraison :
   - 456 Avenue des Champs
   - 69001 Lyon, France
   - Tél: +33 4 56 78 90 12

⚙️ PRÉFÉRENCES UTILISATEUR :
• Langue: Français
• Devise: EUR
• Notifications email: Activées
• Notifications push: Activées
• Newsletter: Désactivée
• Mode sombre: Activé
• Taille de police: Moyenne

🔧 COMMANDES DISPONIBLES :
• getUserProfile() - ✅ Disponible
• getUserOrders() - ✅ Disponible  
• getUserWishlist() - ✅ Disponible
• getUserAddresses() - ✅ Disponible
• getUserPreferences() - ✅ Disponible
• createOrder() - ✅ Disponible
• updateUserProfile() - ✅ Disponible
• deleteUserAddress() - ✅ Disponible
• addToWishlist() - ✅ Disponible
• removeFromWishlist() - ✅ Disponible

💡 Note: Ces données sont mockées pour la démonstration.
   En production, elles seraient récupérées depuis l'API CDiscount
   en utilisant le token d'accès OAuth2.
`.trim();
}
