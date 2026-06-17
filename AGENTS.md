# AGENTS.md

Guidance for AI coding agents (and humans) working in this repository.

## Project Context

**Inovatech** is an academic project, delivered as the **final project for the
Software Engineering course** of the *Analysis and Software Development (ADS)*
program at **SENAI**.

The assignment was to build an **ERP system for a medical clinic** ("Clínica
Vida Plena"), taking an **Excel spreadsheet as the starting point / source of
truth** and turning it into a modular web application.

## Architecture

- **Backend** (`backend/`) — REST API in **Python** (FastAPI + SQLAlchemy +
  Alembic), deployed on **Render** (`render.yaml` → service `inovatech-api`).
- **Frontend** (`frontend/`) — web app in **Next.js**, deployed on **Vercel**
  (`https://inovatech-online.vercel.app`).

## Documentation

The `*.md` files in this repository describe the project architecture and the
implementation prompts used to build it:

- [`INOVATECH_PROJECT.md`](INOVATECH_PROJECT.md) / [`README.md`](README.md) —
  full specification (Portuguese): modules, data model, requirements, API routes,
  business rules.
- [`BACKEND_PLAN.md`](BACKEND_PLAN.md) · [`INOVATECH_BACKEND_PROMPT.md`](INOVATECH_BACKEND_PROMPT.md) — backend design & build prompt.
- [`FRONTEND_PLAN.md`](FRONTEND_PLAN.md) · [`INOVATECH_FRONTEND_PROMPT.md`](INOVATECH_FRONTEND_PROMPT.md) — frontend design & build prompt.
- [`PLANO_TESTES_DOMINIOS.md`](PLANO_TESTES_DOMINIOS.md) · [`CODEX_REVIEW.md`](CODEX_REVIEW.md) — testing plan & review notes.

> The specification documents are written in Portuguese.
