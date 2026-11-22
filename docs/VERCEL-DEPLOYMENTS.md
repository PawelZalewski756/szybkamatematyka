# Vercel - limit 10 GB i usuwanie starych deploymentów

## 1. To nie jest Git

Deploymenty Vercel to **buildy i ich pliki**, a nie gałęzie Git. Usunięcie
brancha w GitHubie **nie usuwa** deploymentu z Vercel i nie zwalnia miejsca.
GitHub i Vercel mają osobne limity.

## 2. Ustaw retencję na 7 dni w Vercel

Vercel → wybierz projekt → **Settings** → **Deployment Retention**
(lub Team Settings → **Security & Privacy** → **Deployment Retention Policy**).

Ustaw dla:

- Canceled: 7 dni,
- Errored: 7 dni,
- Pre-Production: 7 dni,
- Production: 7 dni.

Na Hobby maksimum to 30 dni, ale można wybrać krócej. Vercel i tak zawsze
zostawia kilka ostatnich deploymentów (3 produkcje + 3 dowolne) oraz te z
aliasem/aktywnym branchem - tego nie da się usunąć polityką retencji.

## 3. Ręczne usunięcie starych deploymentów

Vercel → projekt → **Deployments** → wybierz stary deployment → menu `...` →
**Delete**. Przy 10/10 GB może być ich dużo; wtedy użyj skryptu.

## 4. Automatyczne usuwanie po 7 dniach (GitHub Actions)

Skrypt: `scripts/pruneVercelDeployments.mjs`.  
Workflow: `.github/workflows/prune-vercel-deployments.yml` (codziennie 03:00 UTC).

W GitHub → Settings → Secrets and variables → Actions dodaj:

- `VERCEL_TOKEN` - Vercel → Account Settings → Tokens,
- `VERCEL_PROJECT_ID` - Vercel → projekt → Settings → General → Project ID,
- `VERCEL_TEAM_ID` - tylko jeśli projekt jest w teamie.

Ręcznie:

```bash
VERCEL_TOKEN=... VERCEL_PROJECT_ID=... KEEP_DAYS=7 \
  node scripts/pruneVercelDeployments.mjs
```

Bez `--apply` skrypt tylko pokazuje, co by usunął. Z `--apply` usuwa.

Skrypt nie usuwa:

- deploymentów z aliasem/domeną,
- 3 najnowszych produkcji i 3 najnowszych deploymentów dowolnego typu,
- niczego nowszego niż `KEEP_DAYS`.

## 5. Gdy 10/10 GB już blokuje deploy

1. Ustaw retencję 7 dni.
2. Uruchom skrypt z `--apply`.
3. Sprawdź **Usage → Deployment Storage**.
4. Jeśli nadal dużo - zmniejsz rozmiar builda (np. mniej prerenderowanych stron,
   lżejsze obrazy) albo usuń stare preview deploymenty ręcznie.

## 6. Szybka diagnostyka

```bash
# ile waży lokalny build
du -sh .next

# czy token i project ID są widoczne
node scripts/pruneVercelDeployments.mjs
```
