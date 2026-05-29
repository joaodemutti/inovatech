from pydantic import BaseModel


class ImportResult(BaseModel):
    importados: int
    erros: list[str]
