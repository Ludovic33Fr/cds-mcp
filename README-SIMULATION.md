# 🔧 Mode Simulation OAuth2 - CDiscount MCP

Ce document explique comment utiliser le mode simulation OAuth2 implémenté dans le projet CDiscount MCP.

## 📋 Vue d'ensemble

Le mode simulation permet de tester le workflow d'authentification OAuth2 sans avoir besoin d'une vraie authentification ADB2C configurée. Il génère un token factice `FakeTokenCDS` et simule toutes les étapes du processus d'authentification.

## 🚀 Utilisation rapide

### 1. Vérifier le mode actuel
```typescript
import { getSimulationMode } from './build/mcp.js';

console.log(getSimulationMode());
// Output: 🔧 Mode simulation actuel: ACTIVÉ
```

### 2. Authentification simulée
```typescript
import { authenticateOAuth } from './build/mcp.js';

const result = await authenticateOAuth('fake_client_id');
console.log(result);
// Output: Token factice "FakeTokenCDS" avec tous les détails
```

### 3. Utiliser le token factice
```typescript
import { getOAuthProtectedCommands } from './build/mcp.js';

const protectedData = await getOAuthProtectedCommands('FakeTokenCDS');
console.log(protectedData);
// Output: Données mockées complètes (profil, commandes, etc.)
```

## 🔧 Contrôle du mode simulation

### Activer le mode simulation
```typescript
import { setSimulationMode } from './build/mcp.js';

setSimulationMode(true);
// Output: 🔧 Mode simulation activé
```

### Désactiver le mode simulation
```typescript
setSimulationMode(false);
// Output: 🔧 Mode simulation désactivé
```

### Vérifier le mode actuel
```typescript
import { getSimulationMode } from './build/mcp.js';

console.log(getSimulationMode());
// Output: 🔧 Mode simulation actuel: ACTIVÉ/DÉSACTIVÉ
```

## 📝 Fonctionnalités du mode simulation

### ✅ Ce qui est simulé :
- **Génération du code d'autorisation** : `fake_auth_code_12345`
- **Échange de token** : Retourne `FakeTokenCDS`
- **Délais d'attente** : Simulation de 2-3 secondes
- **Messages de progression** : Logs détaillés du processus
- **Gestion d'erreurs** : Simulation des cas d'échec

### 🎭 Token factice généré :
```
Access Token: FakeTokenCDS
Token Type: Bearer
Expires In: 3600 secondes (1 heure)
Scope: read write
Refresh Token: FakeRefreshTokenCDS
```

### 📊 Données mockées disponibles :
- **Profil utilisateur** : ID, email, nom, prénom, etc.
- **Historique des commandes** : 5 dernières commandes
- **Liste de souhaits** : Produits favoris
- **Adresses enregistrées** : Adresses de livraison
- **Préférences utilisateur** : Langue, devise, notifications

## 🧪 Tests et démonstrations

### Script de test simple
```bash
node test-simulation.js
```

### Script de test des tokens
```bash
node test-token.js
```

### Démonstration complète
```bash
node demo-complete.js
```

## 🔄 Workflow complet

1. **Vérification du mode** → Mode simulation activé
2. **Authentification simulée** → Génération du token factice
3. **Accès aux données** → Utilisation du token pour récupérer les données mockées
4. **Basculement de mode** → Possibilité de passer en mode réel
5. **Retour au mode simulation** → Réactivation pour les tests

## ⚙️ Configuration

### Variable globale
```typescript
let SIMULATION_MODE = true; // Par défaut activé
```

### Modification du comportement
Pour désactiver définitivement le mode simulation, modifiez la variable dans `src/mcp.ts` :
```typescript
let SIMULATION_MODE = false;
```

## 🚨 Limitations du mode simulation

- **Pas de vraie authentification** : Les tokens ne sont pas valides
- **Données statiques** : Les données mockées ne changent pas
- **Pas d'API réelle** : Aucune communication avec CDiscount
- **Sécurité** : Ne pas utiliser en production

## 🔮 Passage au mode réel

Quand vous serez prêt à implémenter l'authentification ADB2C réelle :

1. **Désactiver le mode simulation** : `setSimulationMode(false)`
2. **Configurer les vraies URLs** : Remplacer les URLs factices
3. **Implémenter l'authentification ADB2C** : Intégrer Azure AD B2C
4. **Tester avec de vrais tokens** : Valider le workflow complet

## 📚 Exemples d'utilisation

### Dans un script MCP
```typescript
import { authenticateOAuth, getOAuthProtectedCommands } from './build/mcp.js';

// Authentification simulée
const authResult = await authenticateOAuth('client_id');
console.log('Token reçu:', authResult);

// Utilisation du token
const userData = await getOAuthProtectedCommands('FakeTokenCDS');
console.log('Données utilisateur:', userData);
```

### Dans une application CLI
```typescript
import { setSimulationMode, authenticateOAuth } from './build/mcp.js';

// Activer le mode simulation pour les tests
setSimulationMode(true);

// Authentification
const token = await authenticateOAuth('test_client');
console.log('Authentification réussie:', token);
```

## 🆘 Dépannage

### Problème : Le mode simulation ne fonctionne pas
- Vérifiez que `SIMULATION_MODE = true`
- Utilisez `getSimulationMode()` pour confirmer
- Redémarrez l'application après modification

### Problème : Erreur de compilation
- Exécutez `npm run build` pour recompiler
- Vérifiez que TypeScript compile sans erreur
- Vérifiez les imports/exports

### Problème : Token non reconnu
- Assurez-vous d'utiliser exactement `FakeTokenCDS`
- Vérifiez que le mode simulation est activé
- Utilisez `getSimulationMode()` pour confirmer

## 📞 Support

Pour toute question sur le mode simulation :
1. Vérifiez ce document
2. Exécutez les scripts de test
3. Consultez les logs de la console
4. Vérifiez la configuration du mode simulation

---

**Note** : Ce mode simulation est conçu pour le développement et les tests. Ne l'utilisez jamais en production.
