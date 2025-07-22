import { doRequest } from './http.js';

export async function getBestDeliveryInformations(
  productId: string,
  offerId: string,
  postalCode: string,
  longitude: number,
  latitude: number,
  city: string,
  country: string
): Promise<string> {
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
  const json = await res.body.json() as any;

  return `
Product ID      : ${json.productId}
Offer ID        : ${json.offerId}
Free Shipping   : ${json.isFreeShipping ? 'Oui' : 'Non'}
Delivery Msg    : ${json.shippingDelayMessage}
More Info       : ${json.detailUrl}
`.trim();
}

export async function searchByKeyword(searchWord: string): Promise<string> {
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

  const json = await res.body.json() as any;;

  if (!json.offers || json.offers.length === 0) {
    return 'No active tiles for this instance.';
  }

  return json.offers.map((data: any) => {
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

export async function getProductDetails(productId: string): Promise<string> {
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

  const root = await res.body.json() as any;;
  const product = Object.values(root)[0] as any;;

  return `
ProductId: ${product.productId}
ProductName: ${product.title}
Price: ${product.prices?.price?.value ?? '?'} €
StrikedPrice: ${product.strikedPrice ?? 0} €
Brand: ${product.brandName}
CDAV Eligible: ${product.isCdav}
Rating: ${product.ratingAverageOverallRating} / 5 (${product.ratingTotalReviewCount} avis)
Shipping: ${product.freeShipping}
Seller: ${product.sellerName}
CategoryId: ${product.categoryId}
URL: https:${product.url}
Image: ${product.media?.[0]?.url}
Description: ${product.technicalDescription?.fullDescription}
`.trim();
}

export async function authenticateOAuth(
  clientId: string,
  clientSecret?: string,
  redirectUri?: string,
  scope?: string
): Promise<string> {
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
  
  const authorizationUrl = `${authUrl}/oauth/authorize?${authParams.toString()}`;
  
  // Step 2: Open browser for user authentication
  console.log(`\nOuverture du navigateur pour l'authentification...`);
  console.log(`URL d'autorisation: ${authorizationUrl}\n`);
  
  // Try to open browser (cross-platform)
  try {
    await openBrowser(authorizationUrl);
  } catch (error) {
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
  
  const tokenBody: Record<string, string> = {
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
    
    const tokenData = await res.body.json() as any;
    
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
    
  } catch (error) {
    return `Erreur lors de l'échange du token : ${error instanceof Error ? error.message : 'Erreur inconnue'}`;
  }
}

// Helper functions for OAuth2 PKCE flow
import { randomBytes, createHash } from 'crypto';

function generateCodeVerifier(): string {
  const array = randomBytes(32);
  return base64URLEncode(array);
}

async function generateCodeChallenge(codeVerifier: string): Promise<string> {
  const hash = createHash('sha256');
  hash.update(codeVerifier);
  const digest = hash.digest();
  return base64URLEncode(digest);
}

function base64URLEncode(buffer: Uint8Array): string {
  return btoa(String.fromCharCode(...buffer))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

async function openBrowser(url: string): Promise<void> {
  const { exec } = await import('child_process');
  const { promisify } = await import('util');
  const execAsync = promisify(exec);
  
  const platform = process.platform;
  let command: string;
  
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

async function startCallbackServer(redirectUri: string, expectedState: string): Promise<any> {
  const { createServer } = await import('http');
  const { URL } = await import('url');
  
  return new Promise((resolve) => {
    const server = createServer((req, res) => {
      const url = new URL(req.url!, `http://${req.headers.host}`);
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
      } else {
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

async function waitForAuthorizationCode(callbackServer: Promise<any>): Promise<string | null> {
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
  } catch (error) {
    console.log(`Erreur lors de l'attente du callback: ${error}`);
    return null;
  }
}
