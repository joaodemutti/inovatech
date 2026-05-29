import pytest
from fastapi.testclient import TestClient


EXPORT_MODULES = [
    "pacientes",
    "medicos",
    "consultas",
    "prontuarios",
    "financeiro",
    "ponto",
    "usuarios",
    "log-auditoria",
]


class TestExportExcel:
    @pytest.mark.parametrize("modulo", EXPORT_MODULES)
    def test_gestor_exporta(self, gestor_client: TestClient, modulo: str):
        r = gestor_client.get(f"/excel/export/{modulo}")
        assert r.status_code == 200
        # Arquivo .xlsx tem magic bytes: PK (ZIP)
        assert r.content[:2] == b"PK"
        assert "spreadsheet" in r.headers.get("content-type", "").lower() or \
               "octet-stream" in r.headers.get("content-type", "").lower() or \
               r.content[:2] == b"PK"

    @pytest.mark.parametrize("modulo", EXPORT_MODULES)
    def test_recepcionista_negado(self, recep_client: TestClient, modulo: str):
        r = recep_client.get(f"/excel/export/{modulo}")
        assert r.status_code == 403

    @pytest.mark.parametrize("modulo", EXPORT_MODULES)
    def test_sem_auth_negado(self, client: TestClient, modulo: str):
        r = client.get(f"/excel/export/{modulo}")
        assert r.status_code == 401

    def test_export_pacientes_com_dados(self, gestor_client: TestClient, paciente):
        r = gestor_client.get("/excel/export/pacientes")
        assert r.status_code == 200
        assert len(r.content) > 500  # arquivo não vazio


IMPORT_MODULES = [
    ("pacientes", [{"nome_completo": "Importado Teste", "cpf": "99988877711"}]),
    ("medicos", [{"nome_completo": "Dr. Importado", "cpf": "99988877722", "crm": "CRMIMP01", "especialidade": "Geral"}]),
]


class TestImportExcel:
    def test_import_modulo_invalido_404(self, gestor_client: TestClient):
        r = gestor_client.post("/excel/import/modulo_inexistente",
                               files={"file": ("test.xlsx", b"fake", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")})
        assert r.status_code in (404, 422)

    def test_recepcionista_negado(self, recep_client: TestClient):
        r = recep_client.post("/excel/import/pacientes",
                              files={"file": ("test.xlsx", b"fake", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")})
        assert r.status_code == 403
