> ⚠️ AI contributors must read `AGENTS.md` before implementing any change.

# RiskBoard

Mini moteur de scoring crédit. Prend un profil d'emprunteur en entrée, retourne un score (0–100), une décision (`ACCEPT` / `REVIEW` / `REJECT`) et les raisons des pénalités.

## Architecture

```
riskboard/
├── apps/
│   ├── api/       — Serveur HTTP Fastify (port 3000)
│   └── web/       — Interface React / Vite (port 5173)
└── packages/
    └── domain/    — Moteur de scoring pur TypeScript (aucune dépendance runtime)
```

Le package `domain` est importé par `api` via workspace (`@riskboard/domain`). Le frontend appelle l'API directement.

## Prérequis

- Node.js >= 20
- pnpm >= 9

## Installation

```bash
pnpm i
```

## Lancement en développement

```bash
pnpm dev
```

Lance en parallèle :

- API sur <http://localhost:3000>
- Web sur <http://localhost:5173>

## Commandes qualité

| Commande            | Description                        |
| ------------------- | ---------------------------------- |
| `pnpm build`        | Compile tous les packages          |
| `pnpm typecheck`    | Vérifie les types sans émettre     |
| `pnpm test`         | Lance Vitest sur `api` et `domain` |
| `pnpm lint`         | ESLint (flat config)               |
| `pnpm format`       | Vérifie le formatage Prettier      |
| `pnpm format:write` | Applique le formatage Prettier     |

## Test manuel

```bash
curl -s -X POST http://localhost:3000/score \
  -H "Content-Type: application/json" \
  -d '{
    "incomeMonthly": 3000,
    "expensesMonthly": 1200,
    "requestedAmount": 10000,
    "existingDebt": 0,
    "employmentType": "CDI",
    "age": 30
  }' | jq
```

Réponse attendue :

```json
{
  "score": 100,
  "decision": "ACCEPT",
  "reasons": []
}
```

## Structure d'une demande (`POST /score`)

| Champ             | Type                            | Description                   |
| ----------------- | ------------------------------- | ----------------------------- |
| `incomeMonthly`   | `number`                        | Revenu mensuel net (€)        |
| `expensesMonthly` | `number`                        | Charges mensuelles (€)        |
| `requestedAmount` | `number`                        | Montant emprunté demandé (€)  |
| `existingDebt`    | `number`                        | Encours de dette existant (€) |
| `employmentType`  | `"CDI" \| "CDD" \| "FREELANCE"` | Type de contrat               |
| `age`             | `number`                        | Âge de l'emprunteur           |

## Documentation

- [`docs/STACK.md`](docs/STACK.md) — Stack technique et conventions
- [`docs/WORKFLOW.md`](docs/WORKFLOW.md) — Processus de contribution et DoD
- [`docs/DECISIONS.md`](docs/DECISIONS.md) — Choix d'architecture
- [`AGENTS.md`](AGENTS.md) — Règles pour les contributions IA
