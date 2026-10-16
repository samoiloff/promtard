# Template import CSV files

Versioned CSV sources for the admin **Import** tab (`/admin?tab=import`).

## Format

Header (required):

```csv
body,tags,is_public
```

- **body** — prompt template text; use `${paramName}` for parameters (e.g. `${mainIngredientGrams}`, `${vin}`).
- **tags** — at least three comma-separated tags in one cell.
- **is_public** — usually `true` for catalog templates.

Limits: 2 MB per file, 500 data rows. Details: [docs/admin-csv-import.md](../docs/admin-csv-import.md).

## Bundled files

| File | Rows | Description |
|------|------|-------------|
| `reciepies_01.csv` | 100 | Recipe prompts scaled by `${mainIngredientGrams}` |
| `cars_01.csv` | 30 | VIN-based parts lookup prompts (`${vin}`) |

## Regenerate

```bash
pnpm exec tsx scripts/generate-template-import-csv.ts
```

## Import steps

1. Open `/admin` and sign in.
2. Go to the **Import** tab.
3. Choose a CSV from this folder and click **Import**.
