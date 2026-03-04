# Décisions d'architecture

## 1. Domain pur sans dépendances runtime

**Décision :** `packages/domain` n'a aucune dépendance runtime (section `dependencies` vide). Seul Vitest et TypeScript sont en `devDependencies`.

**Raison :** Le moteur de scoring est de la logique métier pure — des fonctions qui transforment des données. Ajouter un framework introduirait du couplage sans valeur. Un domain sans dépendances est testable en isolation, portable (serveur, edge, navigateur) et sans risque de conflit de versions.

**Conséquence :** Toute intégration externe (HTTP, base de données, validation des entrées) appartient à `apps/api`, pas à `domain`.

---

## 2. API fine — Fastify comme couche de transport

**Décision :** `apps/api` est une fine couche HTTP. Elle valide les entrées (Zod), appelle `computeScore()` depuis `domain`, et sérialise la réponse. Elle ne contient pas de logique métier.

**Raison :** Séparer transport et logique métier permet de changer de framework (Fastify → Hono, Express…) sans toucher aux règles de scoring. Cela simplifie aussi les tests : `domain` se teste en unitaire pur, `api` se teste via les routes HTTP.

**Conséquence :** Si une règle de scoring change, seul `packages/domain` est modifié. Si le schéma d'entrée change, seul `apps/api` est modifié.

---

## 3. UI cliente — React sans SSR

**Décision :** `apps/web` est une SPA React servie par Vite. Elle appelle l'API directement depuis le navigateur (`http://localhost:3000`).

**Raison :** Pour un outil interne de démonstration, une SPA suffit. Pas de besoin de SEO, de rendu serveur, ni de routing complexe. Vite offre un DX rapide (HMR) sans configuration lourde.

**Conséquence :** Le frontend ne contient aucune logique de scoring. Il affiche ce que l'API retourne. Si l'API évolue (nouveau champ, nouveau code HTTP), le frontend doit s'adapter.

---

## 4. ESM partout avec NodeNext

**Décision :** Tous les packages utilisent `"type": "module"` et TypeScript est configuré avec `module: NodeNext` côté serveur.

**Raison :** Node.js 20 supporte nativement ESM. Utiliser CommonJS en 2024+ crée de la dette technique et des problèmes d'interopérabilité. NodeNext force l'écriture d'imports corrects (avec extension `.js`) dès le développement.

**Conséquence :** Les imports doivent toujours inclure l'extension `.js`. Les outils qui ne supportent pas ESM ne peuvent pas être ajoutés sans migration.

---

## 5. Monorepo pnpm avec project references TypeScript

**Décision :** pnpm workspaces + TypeScript `composite: true` + project references.

**Raison :** Les project references permettent à TypeScript de construire les packages dans le bon ordre et de ne recompiler que ce qui a changé (`incremental: true`). pnpm résout les dépendances workspace sans hoisting problématique.

**Conséquence :** Toujours builder dans le bon ordre (`pnpm build` à la racine gère cela). Ne pas bypasser `tsc -b` avec des imports directs dans les sources.
