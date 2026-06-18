from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse

from app.core.config import settings
from app.dependencies.auth import require_role
from app.models.usuario import Usuario
from app.routes import (
    admin,
    auth,
    consultas,
    dashboard,
    excel,
    financeiro,
    medicos,
    pacientes,
    ponto,
    portal,
    prontuarios,
    usuarios,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    from app.database import engine
    try:
        with engine.connect() as conn:
            pass
        print("✓ Banco de dados conectado com sucesso")
    except Exception as e:
        print(f"✗ Erro ao conectar ao banco de dados: {e}")
    yield


app = FastAPI(
    title="INOVATECH — Sistema de Gestão Clínica",
    description="API backend para a Clínica Vida Plena. Projeto acadêmico SENAI Mariano Ferraz 2026.",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(usuarios.router)
app.include_router(pacientes.router)
app.include_router(medicos.router)
app.include_router(consultas.router)
app.include_router(prontuarios.router)
app.include_router(financeiro.router)
app.include_router(ponto.router)
app.include_router(admin.router)
app.include_router(portal.router)
app.include_router(excel.router)
app.include_router(dashboard.router)


@app.get("/", tags=["Health"])
def root():
    return {"status": "ok", "app": "INOVATECH API", "version": "1.0.0"}


@app.get("/e2e", tags=["E2E"])
def e2e_redirect(_: Usuario = Depends(require_role("gestor"))):
    """Atalho para a demonstração: redireciona para o frontend (app de produção).

    Requer estar autenticado como **gestor**. Abra a URL direto no navegador
    (barra de endereços) para ser redirecionado — o "Execute" do Swagger apenas
    segue o redirect e mostra o HTML da página de destino.
    """
    return RedirectResponse(url=settings.frontend_url)
