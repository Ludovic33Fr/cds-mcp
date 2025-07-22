# CDiscount MCP Server

Un serveur MCP (Model Context Protocol) pour interagir avec l'API CDiscount et le système d'authentification Peaksys.

## Installation

```bash
npm install
npm run build
```

## Utilisation

### Démarrer le serveur MCP

```bash
npm start
```

Ou en mode développement :

```bash
npm run dev
```

## Méthodes disponibles

### 1. Authentification OAuth2

Authentification via le flux OAuth2 avec PKCE (Proof Key for Code Exchange) sur `https://auth.peaksys.com`.

**Fonctionnement :**
1. Génération d'une URL d'autorisation avec PKCE
2. Ouverture automatique du navigateur pour l'authentification utilisateur
3. L'utilisateur saisit ses identifiants (login/mot de passe) sur la page Peaksys
4. Récupération du code d'autorisation via un serveur de callback local
5. Échange du code contre un token d'accès

**Paramètres :**
- `clientId` (string) : L'ID client OAuth
- `clientSecret` (string, optionnel) : Le secret client OAuth (non nécessaire avec PKCE)
- `redirectUri` (string, optionnel) : L'URI de redirection (défaut: `http://localhost:3000/callback`)
- `scope` (string, optionnel) : Le scope OAuth (défaut: `read write`)

**Retour :** Token d'authentification et informations de session

**Sécurité :** Utilise PKCE pour sécuriser le flux d'authentification sans nécessiter de client_secret

### 2. Recherche de produits

Recherche de produits par mot-clé.

**Paramètres :**
- `searchWord` (string) : Le mot-clé de recherche

**Retour :** Liste des produits correspondants avec leurs détails

### 3. Détails d'un produit

Récupération des détails complets d'un produit.

**Paramètres :**
- `productId` (string) : L'ID du produit

**Retour :** Détails complets du produit (prix, marque, description, etc.)

### 4. Informations de livraison

Récupération des meilleures informations de livraison pour un produit.

**Paramètres :**
- `productId` (string) : L'ID du produit
- `offerId` (string) : L'ID de l'offre
- `postalCode` (string) : Code postal
- `longitude` (number) : Longitude
- `latitude` (number) : Latitude
- `city` (string) : Ville
- `country` (string) : Code pays (ex: FR)

**Retour :** Informations de livraison (gratuité, délais, etc.)

## Configuration MCP

Pour utiliser ce serveur avec un client MCP, ajoutez la configuration suivante :

```json
{
  "mcpServers": {
    "cdiscount": {
      "command": "node",
      "args": ["/path/to/your/dist/index.js"],
      "env": {}
    }
  }
}
```

## Exemple d'utilisation

### Authentification OAuth2

```javascript
// Exemple d'appel pour l'authentification OAuth2 (sans client_secret)
const authResult = await authenticateOAuth(
  "your-client-id",
  undefined, // client_secret optionnel - PKCE sécurise le flux
  "http://localhost:3000/callback",
  "read write"
);

// Le navigateur s'ouvrira automatiquement pour l'authentification
// L'utilisateur devra saisir ses identifiants sur la page Peaksys
```

### Recherche de produits

```javascript
// Exemple d'appel pour la recherche
const searchResult = await searchByKeyword("smartphone");
```

## Développement

### Structure du projet

- `src/index.ts` : Serveur MCP principal
- `src/mcp.ts` : Implémentation des méthodes CDiscount et OAuth
- `src/http.ts` : Utilitaires pour les requêtes HTTP
- `src/cli.ts` : Interface en ligne de commande

### Tests

```bash
npm test
```

## Notes importantes

- L'authentification OAuth2 utilise le flux d'autorisation avec PKCE pour une sécurité maximale
- **Le client_secret n'est pas nécessaire** grâce au PKCE qui sécurise le flux sans secret
- Le navigateur s'ouvre automatiquement pour l'authentification utilisateur
- Un serveur de callback local est démarré temporairement pour récupérer le code d'autorisation
- Toutes les requêtes CDiscount utilisent les headers appropriés pour simuler une requête mobile
- Les erreurs sont gérées et retournées de manière formatée

## Licence

ISC