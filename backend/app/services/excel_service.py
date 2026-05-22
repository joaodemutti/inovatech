from io import BytesIO

import pandas as pd
from fastapi import HTTPException, UploadFile
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill


def exportar_para_xlsx(dados: list[dict], colunas: list[str]) -> BytesIO:
    wb = Workbook()
    ws = wb.active

    header_fill = PatternFill(start_color="1F4E79", end_color="1F4E79", fill_type="solid")
    header_font = Font(color="FFFFFF", bold=True)

    for col_idx, coluna in enumerate(colunas, 1):
        cell = ws.cell(row=1, column=col_idx, value=coluna)
        cell.fill = header_fill
        cell.font = header_font

    for row_idx, registro in enumerate(dados, 2):
        for col_idx, coluna in enumerate(colunas, 1):
            valor = registro.get(coluna, "")
            ws.cell(row=row_idx, column=col_idx, value=str(valor) if valor is not None else "")

    for col in ws.columns:
        max_len = max((len(str(cell.value or "")) for cell in col), default=10)
        ws.column_dimensions[col[0].column_letter].width = min(max_len + 4, 50)

    buffer = BytesIO()
    wb.save(buffer)
    buffer.seek(0)
    return buffer


async def importar_de_xlsx(
    arquivo: UploadFile, colunas_obrigatorias: list[str]
) -> tuple[list[dict], list[str]]:
    conteudo = await arquivo.read()
    try:
        df = pd.read_excel(BytesIO(conteudo), dtype=str)
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Erro ao ler arquivo: {str(e)}")

    colunas_faltando = [c for c in colunas_obrigatorias if c not in df.columns]
    if colunas_faltando:
        raise HTTPException(
            status_code=422,
            detail=f"Colunas obrigatórias ausentes: {', '.join(colunas_faltando)}",
        )

    registros_validos = []
    erros = []

    for idx, row in df.iterrows():
        linha_num = idx + 2
        try:
            faltando = [c for c in colunas_obrigatorias if pd.isna(row.get(c))]
            if faltando:
                erros.append(f"Linha {linha_num}: campos obrigatórios vazios: {', '.join(faltando)}")
                continue
            registro = {col: (None if pd.isna(val) else val) for col, val in row.items()}
            registros_validos.append(registro)
        except Exception as e:
            erros.append(f"Linha {linha_num}: {str(e)}")

    return registros_validos, erros
