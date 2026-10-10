# Expiry — Private Food Inventory & Attention Management

Expiry is a food inventory tracking system focused on strict data integrity, attention management (FIFO/expiry urgency tracking), and seamless food package scanning without bloated AI/ML infrastructure.

## Architecture Overview

This repository is structured as a **Monorepo** adhering to the approved **Hybrid Architecture** (Node.js Modular Monolith + Independent Python Scan Service + MySQL 8.4):

```text
expiry/
├── apps/
│   ├── web/                    # React 19 + Vite 8 + Tailwind CSS v4 Frontend
│   └── api/                    # Node.js + Express Modular Monolith API (/api/v1)
│       └── src/
│           ├── modules/
│           │   ├── inventory/  # Food entries, movements, recounts, trash
│           │   ├── expiry/     # Attention policies, lead days, preferences
│           │   └── scan/       # Client adapter for Python Scan Service
│           └── shared/         # Domain models, MySQL connection pool, repository, middleware
├── services/
│   └── python-scan/            # Lightweight Python FastAPI image & OCR scan service
│       ├── app/
│       │   ├── routes/         # /health and /scan
│       │   ├── schemas/        # Pydantic models matching scan-api.yaml
│       │   └── scanner/        # Deterministic regex date parser & preprocessor
│       ├── tests/              # Scanner unit tests
│       ├── requirements.txt
│       └── Dockerfile
├── database/
│   └── mysql/                  # MySQL schema migrations, seeds, workbench tools
│       ├── migrations/         # 001_initial_schema.sql (InnoDB, versioned schema)
│       ├── seed.sql            # Seed dataset
│       ├── scripts/            # Database management & env generation scripts
│       └── compose.yaml        # Standalone MySQL development container
├── contracts/
│   ├── public-api.yaml         # OpenAPI 3.1.1 Public API Specification
│   ├── scan-api.yaml           # OpenAPI 3.1.0 Internal Scan Service Specification
│   └── openapi.json            # Compiled OpenAPI JSON
├── docs/                       # Architecture decisions, ERDs, requirements & user flows
├── compose.yaml                # Monorepo full-stack Docker Compose definition
└── package.json                # NPM workspaces configuration
```

## Architectural Boundaries

1. **Frontend (`apps/web`)**:
   - Single-page application presenting inventory cards, urgency badges, stock movements, and package scan interfaces.
   - Communicates exclusively with the Node.js API over `/api/v1`.
2. **Backend API (`apps/api`)**:
   - Sole authority for business rules, optimistic concurrency (`version`), idempotency reservations (`api_requests`), and persistence.
   - Modules are cleanly separated: `modules/inventory`, `modules/expiry`, and `modules/scan`.
3. **Python Scan Service (`services/python-scan`)**:
   - Stateless microservice dedicated to image preprocessing and date candidate extraction.
   - **Zero direct database access:** Python cannot mutate MySQL inventory records.
   - No heavy ML/DL training frameworks, PyTorch, or LLMs (YAGNI & Ponytail principle).
4. **Database (`database/mysql`)**:
   - Relational persistence in MySQL 8.4 InnoDB with generated columns, audit ledgers (`stock_movements`), and foreign key integrity.

## Development & Testing Commands

### Monorepo Quick Commands

```bash
# Run all unit tests and builds across web, api, and python
npm run test:all

# Run backend API tests
npm run test:api

# Run Python scan unit tests
npm run test:python

# Build frontend production bundle
npm run build:web
```

### Full-Stack Docker Environment

```bash
# Start MySQL, Node.js API, and Python Scan Service
docker compose up -d

# Check health
docker compose ps
curl http://localhost:3001/health
curl http://localhost:8000/health
```

### Local Standalone Development

1. **Frontend**:
   ```bash
   cd apps/web
   npm install
   npm run dev
   ```
2. **Backend API**:
   ```bash
   cd apps/api
   npm install
   npm run dev
   ```
3. **Python Scan**:
   ```bash
   cd services/python-scan
   pip install -r requirements.txt
   uvicorn app.main:app --port 8000
   ```
