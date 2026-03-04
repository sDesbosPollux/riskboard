# Workflow de contribution

## Definition of Done (DoD) — Pull Request

Une PR est prête à merger quand **toutes** ces conditions sont remplies :

- [ ] `pnpm build` passe sans erreur
- [ ] `pnpm typecheck` passe sans erreur
- [ ] `pnpm test` passe sans erreur (nouveaux cas couverts si logique ajoutée)
- [ ] `pnpm lint` passe sans warning
- [ ] `pnpm format` passe (pas de diff de formatage)
- [ ] Le titre du commit/PR suit le format Conventional Commits (voir ci-dessous)

## Commandes à exécuter avant chaque PR

```bash
# 1. Compiler tous les packages
pnpm build

# 2. Vérifier les types
pnpm typecheck

# 3. Lancer les tests
pnpm test

# 4. Vérifier le lint
pnpm lint

# 5. Vérifier le formatage (ou corriger)
pnpm format        # vérification
pnpm format:write  # correction auto
```

## Conventional Commits

Format : `<type>(<scope>): <description>`

| Type       | Usage                                       |
| ---------- | ------------------------------------------- |
| `feat`     | Nouvelle fonctionnalité                     |
| `fix`      | Correction de bug                           |
| `refactor` | Refactoring sans changement de comportement |
| `test`     | Ajout ou modification de tests              |
| `docs`     | Documentation uniquement                    |
| `chore`    | Maintenance (deps, config)                  |

**Scopes disponibles :** `domain`, `api`, `web`, `ci`, `root`

Exemples :

```
feat(domain): ajouter pénalité taux d'endettement > 60%
fix(api): corriger la sérialisation des erreurs Zod
docs(root): ajouter README et docs de base
```

## Scope des modifications

| Où toucher           | Pourquoi                                              |
| -------------------- | ----------------------------------------------------- |
| `packages/domain/`   | Règles métier, types, calculs de score                |
| `apps/api/`          | Routes, validation des entrées, configuration serveur |
| `apps/web/`          | Interface utilisateur, appels API                     |
| `tsconfig.base.json` | Options TypeScript communes                           |
| `.github/workflows/` | Pipeline CI                                           |

**Règle d'isolation :** `packages/domain` ne doit jamais importer depuis `apps/`. Le flux de dépendances est unidirectionnel : `web` → `api` → `domain`.

## CI

Le pipeline GitHub Actions (`ci.yml`) exécute automatiquement build, typecheck, test, lint et format sur chaque push vers `main` et chaque PR. Une PR ne peut pas merger si le CI est rouge.
