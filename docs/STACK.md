# Stack technique

## Vue d'ensemble

| Couche          | Technologie          | Version    |
| --------------- | -------------------- | ---------- |
| Runtime         | Node.js              | >= 20      |
| Package manager | pnpm                 | >= 9       |
| Langage         | TypeScript           | 5.x        |
| API             | Fastify              | 5.x        |
| Validation      | Zod                  | 3.x        |
| Frontend        | React + Vite         | 18.x / 5.x |
| Tests           | Vitest               | 3.x        |
| Lint            | ESLint (flat config) | 9.x        |
| Format          | Prettier             | 3.x        |

## Modules ES (ESM)

Tous les packages déclarent `"type": "module"`. Les imports doivent inclure l'extension `.js` (même depuis des fichiers `.ts`) afin de respecter la résolution NodeNext.

```ts
// ✅ correct
import { computeScore } from "./scoring.js";

// ❌ incorrect
import { computeScore } from "./scoring";
```

## Configuration TypeScript

Deux profils distincts :

### API et Domain — `module: NodeNext`

```json
{
  "module": "NodeNext",
  "moduleResolution": "NodeNext",
  "lib": ["ES2022"]
}
```

Pas de types DOM. Les deux packages compilent vers `dist/` et utilisent les project references TypeScript pour des builds incrémentaux.

### Web — `module: ESNext` + `moduleResolution: Bundler`

```json
{
  "module": "ESNext",
  "moduleResolution": "Bundler",
  "lib": ["ES2022", "DOM", "DOM.Iterable"],
  "jsx": "react-jsx",
  "noEmit": true
}
```

Vite gère la transpilation ; TypeScript ne fait que vérifier les types.

## Convention : aucun DOM dans `domain`

Le package `domain` ne dépend d'aucune API navigateur. Il ne doit importer que la bibliothèque standard ES2022. Conséquence : il peut être utilisé côté serveur et côté client sans adaptation.

## Monorepo pnpm

Les workspaces sont déclarés dans `pnpm-workspace.yaml`. Les dépendances internes utilisent le protocole `workspace:*`.

```yaml
packages:
  - "apps/*"
  - "packages/*"
```

## Tests

- Vitest tourne en environnement `node` (pas de jsdom).
- Les fichiers de test sont colocalisés avec le code source (`*.test.ts`).
- Aucun test dans `packages/domain/src/` ne peut importer depuis `apps/`.

## Formatage

Prettier s'applique à l'ensemble du repo depuis la racine. Configuration dans `.prettierrc` :

- guillemets doubles
- virgules terminales
- largeur 100

```bash
pnpm format        # vérification
pnpm format:write  # correction
```
