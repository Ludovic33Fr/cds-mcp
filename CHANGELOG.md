# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2024-12-19

### 🆕 Added
- **Mode simulation OAuth2** : Nouveau système de simulation pour tester l'authentification sans configuration ADB2C réelle
- **Token factice "FakeTokenCDS"** : Génération automatique d'un token de test
- **Fonctions de contrôle du mode simulation** : `setSimulationMode()` et `getSimulationMode()`
- **Données mockées complètes** : Profil utilisateur, historique des commandes, liste de souhaits, adresses, préférences
- **Simulation du workflow OAuth2 complet** : Délais, messages de progression, gestion d'erreurs
- **Documentation complète** : README-SIMULATION.md avec exemples d'utilisation et dépannage

### 🔧 Enhanced
- **Authentification OAuth2** : Support du mode simulation et du mode réel
- **Gestion des tokens** : Vérification et validation des tokens d'accès
- **Interface utilisateur** : Messages et logs améliorés avec emojis et formatage
- **Flexibilité** : Basculement facile entre mode simulation et mode réel

### 📚 Documentation
- **README-SIMULATION.md** : Guide complet du mode simulation
- **Exemples d'utilisation** : Scripts de test et démonstrations
- **Workflow détaillé** : Processus d'authentification étape par étape
- **Guide de migration** : Instructions pour passer du mode simulation au mode réel

### 🎯 Use Cases
- **Développement** : Test du workflow OAuth2 sans configuration complexe
- **Prototypage** : Validation des fonctionnalités avant intégration ADB2C
- **Tests** : Vérification du comportement avec des données mockées
- **Formation** : Apprentissage du processus d'authentification OAuth2

## [1.0.3] - 2024-12-18

### 🆕 Added
- **Authentification OAuth2** : Support complet du flux PKCE
- **Recherche de produits** : API de recherche par mot-clé
- **Détails des produits** : Informations complètes sur les produits
- **Informations de livraison** : Calcul des meilleures options de livraison
- **Support MCP** : Intégration avec le protocole Model Context Protocol

### 🔧 Technical
- **TypeScript** : Code entièrement typé
- **PKCE Flow** : Implémentation sécurisée du flux OAuth2
- **Gestion des erreurs** : Gestion robuste des erreurs HTTP et d'authentification
- **Cross-platform** : Support Windows, macOS et Linux

---

## Notes de version

### Version 1.1.0
Cette version introduit un **mode simulation OAuth2** révolutionnaire qui permet de développer et tester l'authentification sans attendre la configuration complète d'Azure AD B2C. Le mode simulation génère un token factice "FakeTokenCDS" et fournit des données mockées complètes pour accélérer le développement.

### Migration depuis la version 1.0.3
- **Aucun changement breaking** : Toutes les fonctionnalités existantes sont préservées
- **Mode simulation activé par défaut** : Pour une expérience de développement optimale
- **Fonctions de contrôle** : Utilisez `setSimulationMode(false)` pour passer au mode réel
- **Documentation étendue** : Consultez README-SIMULATION.md pour les nouvelles fonctionnalités
