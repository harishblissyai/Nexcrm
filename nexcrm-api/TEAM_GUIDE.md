# NexCRM Team Guide

## Wave Execution Checklist

| Wave | Description | Status |
|------|-------------|--------|
| 1    | Spec + folder scaffolding | ✅ Done |
| 2    | Backend + Frontend implementation | ✅ Done |
| 3    | UX Review + fixes | ✅ Done |
| 4    | Backend unit tests (pytest) | ✅ Done — 48 tests, 98% coverage |
| 5    | E2E tests (Playwright) | ✅ Done |

---

## Repo Setup

```bash
# Clone both repos
git clone https://github.com/harishblissyai/nexcrm-api
git clone https://github.com/harishblissyai/nexcrm-web
```

---

## Local Dev — Backend (nexcrm-api)

```bash
cd nexcrm-api
python -m venv .venv

# Windows
.venv\Scripts\activate
# Mac/Linux
source .venv/bin/activate

pip install -r requirements.txt
cp .env.example .env          # edit SECRET_KEY in .env
mkdir -p data
uvicorn app.main:app --reload --port 8000
```

API available at: http://localhost:8000
Swagger docs: http://localhost:8000/docs

---

## Local Dev — Frontend (nexcrm-web)

```bash
cd nexcrm-web
npm install
cp .env.example .env          # set VITE_API_BASE_URL=http://localhost:8000
npm run dev
```

App available at: http://localhost:3000

---

## Running Together via Docker Compose

```bash
# From root directory (where docker-compose.yml lives)
docker compose up --build
```

- Frontend → http://localhost:3000
- Backend API → http://localhost:8000
- API Docs → http://localhost:8000/docs

To stop:
```bash
docker compose down
```

To wipe data:
```bash
docker compose down -v
```

---

## Running Tests

### Backend (pytest)
```bash
cd nexcrm-api
.venv\Scripts\activate         # Windows
pytest tests/unit/ -v --cov=app --cov-report=term-missing
```

### Frontend (Playwright E2E)
```bash
cd nexcrm-web

# First install browsers (once)
npx playwright install chromium

# Run E2E (requires backend running on :8000 and frontend on :3000)
npm run test:e2e

# Or headless:
npx playwright test --headed
```

---

## Definition of Done per Wave

### Wave 1
- [x] SPEC.md exists with arch diagram, data models, API contract, folder trees
- [x] Both repo directories created with full structure

### Wave 2
- [x] All FastAPI routers functional (auth, contacts, leads, activities, dashboard, search)
- [x] SQLAlchemy models defined with correct relationships
- [x] React app builds without errors (`npm run build`)
- [x] All pages render without errors (Login, Dashboard, Contacts, Leads, Activities)
- [x] Dockerfiles present in both repos
- [x] Root `docker-compose.yml` working

### Wave 3
- [x] UX_REVIEW.md documents all issues + fixes
- [x] Form validation (client-side) on all forms
- [x] Toast notifications on all CRUD actions
- [x] Modal keyboard accessibility (Escape key)
- [x] ARIA attributes on modal

### Wave 4
- [x] ≥ 80% test coverage (achieved 98%)
- [x] Tests for all routers: auth, contacts, leads, activities, dashboard, search
- [x] Tests for auth failure cases (401, 403, 400)
- [x] All 48 tests pass

### Wave 5
- [x] E2E tests cover: login, register, logout
- [x] E2E tests cover: create/edit/search contacts
- [x] E2E tests cover: create/filter/detail leads
- [x] E2E tests cover: log/delete activities
- [x] E2E tests cover: dashboard stats + global search

---

## Branch Strategy

```
main       — stable, deployable
develop    — active development
feature/*  — one branch per wave / feature
```

---

## Environment Variables

### nexcrm-api (.env)
```
DATABASE_URL=sqlite:///./data/nexcrm.db
SECRET_KEY=<generate with: python -c "import secrets; print(secrets.token_hex(32))">
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
CORS_ORIGINS=http://localhost:3000
```

### nexcrm-web (.env)
```
VITE_API_BASE_URL=http://localhost:8000
```
