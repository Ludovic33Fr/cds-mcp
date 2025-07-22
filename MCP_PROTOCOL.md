# Protocole MCP (Model Context Protocol) - CDiscount Server

## Vue d'ensemble

Le protocole MCP (Model Context Protocol) est un standard pour permettre aux modèles d'IA d'interagir avec des outils et des données externes de manière sécurisée et structurée.

## Structure des méthodes MCP

Chaque méthode MCP dans notre serveur CDiscount suit cette structure :

```typescript
server.tool(
  "NomDeLaMethode",           // Nom unique de la méthode
  "Description détaillée...",  // Description claire de ce que fait la méthode
  {
    // Définition des paramètres avec validation Zod
    param1: z.string().describe("Description du paramètre"),
    param2: z.number().describe("Description du paramètre"),
  },
  async ({ param1, param2 }) => {
    // Implémentation de la méthode
    const result = await maFonction(param1, param2);
    return {
      content: [{ type: "text", text: result }]
    };
  }
);
```

## Méthodes disponibles

### 1. GetBestDeliveryInformations

**Description :** Get the best delivery information for a specific product and location from CDiscount. This method returns shipping details including free shipping status, delivery delays, and pricing information.

**Paramètres :**
- `productId` (string) : The unique identifier of the product on CDiscount
- `offerId` (string) : The unique identifier of the specific offer for this product
- `postalCode` (string) : The postal code of the delivery address
- `longitude` (number) : The longitude coordinate of the delivery location (e.g., -0.7007206 for Paris)
- `latitude` (number) : The latitude coordinate of the delivery location (e.g., 44.8996853 for Paris)
- `city` (string) : The name of the city for delivery
- `country` (string) : The country code for delivery (e.g., FR for France, BE for Belgium)

**Retour :** Informations détaillées de livraison (gratuité, délais, prix)

### 2. SearchByKeyWord

**Description :** Search for products on CDiscount using keywords. This method returns a list of products matching the search criteria with details including product name, price, rating, and availability.

**Paramètres :**
- `searchWord` (string) : The keyword or search term to find products (e.g., 'smartphone', 'laptop', 'headphones')

**Retour :** Liste des produits correspondants avec leurs détails

### 3. GetProductDetails

**Description :** Get comprehensive product details from CDiscount including price, brand, description, ratings, shipping information, and technical specifications.

**Paramètres :**
- `productId` (string) : The unique identifier of the product on CDiscount (e.g., 'aaalm03538')

**Retour :** Détails complets du produit (prix, marque, description, etc.)

### 4. AuthenticateOAuth

**Description :** Authenticate using OAuth2 flow with PKCE (Proof Key for Code Exchange) and return an authentication token. This method opens a browser for user login and handles the complete OAuth2 authorization flow securely.

**Paramètres :**
- `clientId` (string) : The OAuth client ID registered with the authentication provider
- `clientSecret` (string, optionnel) : The OAuth client secret (optional - PKCE provides security without requiring a secret)
- `redirectUri` (string, optionnel) : The redirect URI for OAuth callback (default: http://localhost:3000/callback)
- `scope` (string, optionnel) : The OAuth scope defining the permissions requested (default: 'read write')

**Retour :** Token d'authentification et informations de session

## Bonnes pratiques pour les descriptions MCP

### 1. Description de la méthode
- **Claire et concise** : Expliquer ce que fait la méthode en une phrase
- **Contexte** : Mentionner le service (CDiscount) et le type de données
- **Fonctionnalité** : Décrire le résultat attendu

### 2. Description des paramètres
- **Type de données** : Spécifier le type (string, number, boolean)
- **Exemples** : Fournir des exemples concrets quand c'est utile
- **Format** : Indiquer le format attendu (e.g., coordonnées GPS, codes pays)
- **Obligatoire/Optionnel** : Préciser si le paramètre est requis

### 3. Gestion des erreurs
- **Validation** : Utiliser Zod pour valider les paramètres
- **Messages d'erreur** : Retourner des messages clairs et informatifs
- **Fallback** : Gérer les cas d'erreur gracieusement

## Exemple d'utilisation

```javascript
// Exemple d'appel MCP
const result = await mcpClient.callTool("SearchByKeyWord", {
  searchWord: "smartphone"
});

console.log(result.content[0].text);
```

## Sécurité

- **Validation des entrées** : Tous les paramètres sont validés avec Zod
- **Gestion des erreurs** : Les erreurs sont capturées et retournées de manière sécurisée
- **OAuth2 PKCE** : Authentification sécurisée sans nécessiter de secrets clients
- **Headers appropriés** : Simulation d'une requête mobile pour CDiscount 