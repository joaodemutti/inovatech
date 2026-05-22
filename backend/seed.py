"""
Seed de dados iniciais para o banco INOVATECH.
Executar com: python seed.py (dentro do container ou com DB acessível)
"""
import sys
import os

sys.path.insert(0, os.path.dirname(__file__))

from datetime import date, time, datetime
from decimal import Decimal

from sqlalchemy.orm import Session

from app.core.security import criar_hash_senha
from app.database import SessionLocal, engine
from app.models import (
    Consulta,
    LancamentoFinanceiro,
    LogAuditoria,
    Medico,
    Paciente,
    Pessoa,
    Prontuario,
    RegistroPonto,
    Usuario,
)

SENHA_PADRAO = "Inovatech@2026"


def seed(db: Session):
    print("Iniciando seed...")

    # ── Usuários ──────────────────────────────────────────────────────────
    usuarios_dados = [
        {"nome": "Roberto Admin", "perfil": "gestor", "login": "roberto", "email": "roberto@clinica.com"},
        {"nome": "Ana Lima", "perfil": "recepcionista", "login": "ana", "email": "ana@clinica.com"},
        {"nome": "Dr. Carlos Lima", "perfil": "medico", "login": "carlos", "email": "carlos@clinica.com"},
        {"nome": "Dra. Renata Souza", "perfil": "medico", "login": "renata", "email": "renata@clinica.com"},
        {"nome": "Dr. Marcos Teles", "perfil": "medico", "login": "marcos", "email": "marcos@clinica.com"},
    ]
    usuarios = []
    for u in usuarios_dados:
        usuario = Usuario(
            **u,
            password_hash=criar_hash_senha(SENHA_PADRAO),
            status="ativo",
            created_at=datetime.utcnow(),
        )
        db.add(usuario)
        usuarios.append(usuario)
    db.flush()
    print(f"  {len(usuarios)} usuários criados")

    # ── Pacientes ─────────────────────────────────────────────────────────
    pacientes_dados = [
        {
            "pessoa": {"nome_completo": "Maria Oliveira", "cpf": "123.456.789-00", "telefone": "(11) 99001-1001", "email": "maria@email.com", "tipo": "paciente"},
            "paciente": {"data_nascimento": date(1985, 3, 15), "convenio": "Unimed", "endereco": "Rua das Flores, 100"},
        },
        {
            "pessoa": {"nome_completo": "João Silva", "cpf": "234.567.890-11", "telefone": "(11) 99002-2002", "email": "joao@email.com", "tipo": "paciente"},
            "paciente": {"data_nascimento": date(1990, 7, 22), "convenio": "Bradesco Saúde", "endereco": "Av. Brasil, 500"},
        },
        {
            "pessoa": {"nome_completo": "Fernanda Costa", "cpf": "345.678.901-22", "telefone": "(11) 99003-3003", "email": "fernanda@email.com", "tipo": "paciente"},
            "paciente": {"data_nascimento": date(1978, 11, 5), "convenio": "Particular", "endereco": "Rua Augusta, 200"},
        },
        {
            "pessoa": {"nome_completo": "Pedro Santos", "cpf": "456.789.012-33", "telefone": "(11) 99004-4004", "email": "pedro@email.com", "tipo": "paciente"},
            "paciente": {"data_nascimento": date(2000, 1, 30), "convenio": "SulAmérica", "endereco": "Rua do Comércio, 50"},
        },
        {
            "pessoa": {"nome_completo": "Lucia Ferreira", "cpf": "567.890.123-44", "telefone": "(11) 99005-5005", "email": "lucia@email.com", "tipo": "paciente"},
            "paciente": {"data_nascimento": date(1965, 6, 18), "convenio": "Unimed", "endereco": "Av. Paulista, 1500"},
        },
    ]
    pacientes = []
    for pd in pacientes_dados:
        pessoa = Pessoa(**pd["pessoa"], status="ativo")
        db.add(pessoa)
        db.flush()
        paciente = Paciente(**pd["paciente"], pessoa_id=pessoa.id)
        db.add(paciente)
        pacientes.append(paciente)
    db.flush()
    print(f"  {len(pacientes)} pacientes criados")

    # ── Médicos ───────────────────────────────────────────────────────────
    medicos_dados = [
        {
            "pessoa": {"nome_completo": "Carlos Lima", "cpf": "678.901.234-55", "telefone": "(11) 98001-1001", "email": "carlos@clinica.com", "tipo": "medico"},
            "medico": {"crm": "CRM-SP 12345", "especialidade": "Clínica Geral", "data_formatura": date(2005, 12, 10)},
        },
        {
            "pessoa": {"nome_completo": "Renata Souza", "cpf": "789.012.345-66", "telefone": "(11) 98002-2002", "email": "renata@clinica.com", "tipo": "medico"},
            "medico": {"crm": "CRM-SP 23456", "especialidade": "Cardiologia", "data_formatura": date(2008, 6, 20)},
        },
        {
            "pessoa": {"nome_completo": "Marcos Teles", "cpf": "890.123.456-77", "telefone": "(11) 98003-3003", "email": "marcos@clinica.com", "tipo": "medico"},
            "medico": {"crm": "CRM-SP 34567", "especialidade": "Ortopedia", "data_formatura": date(2010, 3, 15)},
        },
    ]
    medicos = []
    for md in medicos_dados:
        pessoa = Pessoa(**md["pessoa"], status="ativo")
        db.add(pessoa)
        db.flush()
        medico = Medico(**md["medico"], pessoa_id=pessoa.id)
        db.add(medico)
        medicos.append(medico)
    db.flush()
    print(f"  {len(medicos)} médicos criados")

    # ── Consultas ─────────────────────────────────────────────────────────
    consultas_dados = [
        {"paciente_id": pacientes[0].id, "medico_id": medicos[0].id, "data": date(2026, 5, 22), "horario": time(8, 0), "tipo_consulta": "Clínica Geral", "convenio": "Unimed", "valor": Decimal("150.00"), "status": "agendada"},
        {"paciente_id": pacientes[1].id, "medico_id": medicos[1].id, "data": date(2026, 5, 22), "horario": time(9, 30), "tipo_consulta": "Cardiologia", "convenio": "Bradesco Saúde", "valor": Decimal("250.00"), "status": "confirmada"},
        {"paciente_id": pacientes[2].id, "medico_id": medicos[0].id, "data": date(2026, 5, 20), "horario": time(10, 0), "tipo_consulta": "Clínica Geral", "convenio": "Particular", "valor": Decimal("200.00"), "status": "realizada"},
        {"paciente_id": pacientes[3].id, "medico_id": medicos[2].id, "data": date(2026, 5, 19), "horario": time(14, 0), "tipo_consulta": "Ortopedia", "convenio": "SulAmérica", "valor": Decimal("300.00"), "status": "realizada"},
        {"paciente_id": pacientes[4].id, "medico_id": medicos[1].id, "data": date(2026, 5, 18), "horario": time(11, 0), "tipo_consulta": "Cardiologia", "convenio": "Unimed", "valor": Decimal("250.00"), "status": "cancelada"},
        {"paciente_id": pacientes[0].id, "medico_id": medicos[2].id, "data": date(2026, 5, 25), "horario": time(15, 30), "tipo_consulta": "Ortopedia", "convenio": "Unimed", "valor": Decimal("300.00"), "status": "agendada"},
    ]
    consultas = []
    for cd in consultas_dados:
        consulta = Consulta(**cd, created_at=datetime.utcnow())
        db.add(consulta)
        consultas.append(consulta)
    db.flush()
    print(f"  {len(consultas)} consultas criadas")

    # ── Prontuários ───────────────────────────────────────────────────────
    prontuarios_dados = [
        {"paciente_id": pacientes[2].id, "medico_id": medicos[0].id, "data": date(2026, 5, 20), "cid": "J06.9", "diagnostico": "Infecção aguda das vias aéreas superiores", "prescricao": "Paracetamol 750mg 8/8h por 5 dias. Repouso.", "retorno_em_dias": 7, "laudo_liberado": True},
        {"paciente_id": pacientes[3].id, "medico_id": medicos[2].id, "data": date(2026, 5, 19), "cid": "M54.5", "diagnostico": "Lombociatalgia", "prescricao": "Ibuprofeno 600mg 12/12h por 7 dias. Fisioterapia.", "retorno_em_dias": 30, "laudo_liberado": False},
        {"paciente_id": pacientes[0].id, "medico_id": medicos[0].id, "data": date(2026, 4, 10), "cid": "I10", "diagnostico": "Hipertensão arterial sistêmica", "prescricao": "Losartana 50mg 1x ao dia. Dieta hipossódica.", "retorno_em_dias": 60, "laudo_liberado": True},
        {"paciente_id": pacientes[1].id, "medico_id": medicos[1].id, "data": date(2026, 3, 5), "cid": "S82.0", "diagnostico": "Fratura da patela", "prescricao": "Imobilização por 6 semanas. Dipirona 500mg se dor.", "retorno_em_dias": 42, "laudo_liberado": True},
    ]
    prontuarios = []
    for pd in prontuarios_dados:
        prontuario = Prontuario(**pd, created_at=datetime.utcnow())
        db.add(prontuario)
        prontuarios.append(prontuario)
    db.flush()
    print(f"  {len(prontuarios)} prontuários criados")

    # ── Lançamentos Financeiros ───────────────────────────────────────────
    lancamentos_dados = [
        {"paciente_id": pacientes[2].id, "medico_id": medicos[0].id, "consulta_id": consultas[2].id, "data": date(2026, 5, 20), "servico": "Clínica Geral", "convenio": "Particular", "valor": Decimal("200.00"), "status": "pago", "forma_pagamento": "Pix"},
        {"paciente_id": pacientes[3].id, "medico_id": medicos[2].id, "consulta_id": consultas[3].id, "data": date(2026, 5, 19), "servico": "Ortopedia", "convenio": "SulAmérica", "valor": Decimal("300.00"), "status": "pendente", "forma_pagamento": "Convênio"},
        {"paciente_id": pacientes[0].id, "medico_id": medicos[0].id, "consulta_id": None, "data": date(2026, 4, 10), "servico": "Consulta de Retorno", "convenio": "Unimed", "valor": Decimal("100.00"), "status": "pago", "forma_pagamento": "Convênio"},
        {"paciente_id": pacientes[1].id, "medico_id": medicos[1].id, "consulta_id": None, "data": date(2026, 3, 5), "servico": "Cardiologia", "convenio": "Bradesco Saúde", "valor": Decimal("250.00"), "status": "pago", "forma_pagamento": "Cartão de Crédito"},
        {"paciente_id": pacientes[4].id, "medico_id": medicos[1].id, "consulta_id": None, "data": date(2026, 4, 15), "servico": "Ecocardiograma", "convenio": "Unimed", "valor": Decimal("400.00"), "status": "atrasado", "forma_pagamento": "Convênio"},
        {"paciente_id": pacientes[2].id, "medico_id": medicos[2].id, "consulta_id": None, "data": date(2026, 5, 1), "servico": "Raio-X", "convenio": "Particular", "valor": Decimal("150.00"), "status": "pendente", "forma_pagamento": None},
    ]
    for ld in lancamentos_dados:
        lancamento = LancamentoFinanceiro(**ld, created_at=datetime.utcnow())
        db.add(lancamento)
    db.flush()
    print(f"  {len(lancamentos_dados)} lançamentos financeiros criados")

    # ── Registros de Ponto ────────────────────────────────────────────────
    pontos_dados = [
        {"usuario_id": usuarios[1].id, "data": date(2026, 5, 19), "entrada": time(8, 0), "saida": time(17, 0), "h_trabalhadas": Decimal("9.0"), "h_esperadas": Decimal("8.0"), "diferenca": Decimal("1.0"), "situacao": "normal"},
        {"usuario_id": usuarios[1].id, "data": date(2026, 5, 20), "entrada": time(8, 30), "saida": time(17, 0), "h_trabalhadas": Decimal("8.5"), "h_esperadas": Decimal("8.0"), "diferenca": Decimal("0.5"), "situacao": "normal"},
        {"usuario_id": usuarios[2].id, "data": date(2026, 5, 19), "entrada": time(7, 30), "saida": time(18, 0), "h_trabalhadas": Decimal("10.5"), "h_esperadas": Decimal("8.0"), "diferenca": Decimal("2.5"), "situacao": "h_extra"},
        {"usuario_id": usuarios[2].id, "data": date(2026, 5, 20), "entrada": time(9, 0), "saida": time(17, 0), "h_trabalhadas": Decimal("8.0"), "h_esperadas": Decimal("8.0"), "diferenca": Decimal("0.0"), "situacao": "normal"},
        {"usuario_id": usuarios[3].id, "data": date(2026, 5, 19), "entrada": time(8, 45), "saida": time(17, 0), "h_trabalhadas": Decimal("8.25"), "h_esperadas": Decimal("8.0"), "diferenca": Decimal("0.25"), "situacao": "normal"},
        {"usuario_id": usuarios[3].id, "data": date(2026, 5, 20), "entrada": time(10, 0), "saida": time(17, 0), "h_trabalhadas": Decimal("7.0"), "h_esperadas": Decimal("8.0"), "diferenca": Decimal("-1.0"), "situacao": "atraso"},
        {"usuario_id": usuarios[4].id, "data": date(2026, 5, 20), "entrada": None, "saida": None, "h_trabalhadas": Decimal("0.0"), "h_esperadas": Decimal("8.0"), "diferenca": Decimal("-8.0"), "situacao": "falta"},
    ]
    for pd in pontos_dados:
        ponto = RegistroPonto(**pd)
        db.add(ponto)
    db.flush()
    print(f"  {len(pontos_dados)} registros de ponto criados")

    # ── Log de Auditoria ──────────────────────────────────────────────────
    logs_dados = [
        {"usuario_id": usuarios[0].id, "acao": "login", "modulo": "auth", "ip": "192.168.1.1", "resultado": "sucesso", "detalhes": "Login: roberto"},
        {"usuario_id": usuarios[1].id, "acao": "login", "modulo": "auth", "ip": "192.168.1.2", "resultado": "sucesso", "detalhes": "Login: ana"},
        {"usuario_id": usuarios[1].id, "acao": "criar", "modulo": "cadastro", "ip": "192.168.1.2", "resultado": "sucesso", "detalhes": "Paciente criado: 1"},
        {"usuario_id": usuarios[2].id, "acao": "criar", "modulo": "prontuario", "ip": "192.168.1.3", "resultado": "sucesso", "detalhes": "Prontuário criado: 1"},
        {"usuario_id": None, "acao": "login", "modulo": "auth", "ip": "10.0.0.5", "resultado": "falha", "detalhes": "Tentativa de login falha para login: admin"},
        {"usuario_id": usuarios[0].id, "acao": "backup", "modulo": "admin", "ip": "192.168.1.1", "resultado": "sucesso", "detalhes": "Backup manual solicitado"},
    ]
    for ld in logs_dados:
        log = LogAuditoria(**ld, data_hora=datetime.utcnow())
        db.add(log)
    db.flush()
    print(f"  {len(logs_dados)} logs de auditoria criados")

    db.commit()
    print("\n✓ Seed concluído com sucesso!")
    print(f"  Login gestor:        roberto / {SENHA_PADRAO}")
    print(f"  Login recepcionista: ana / {SENHA_PADRAO}")
    print(f"  Login médico:        carlos / {SENHA_PADRAO}")


if __name__ == "__main__":
    db = SessionLocal()
    try:
        if db.query(Usuario).first():
            print("ℹ Banco já populado — seed ignorado.")
        else:
            seed(db)
    except Exception as e:
        db.rollback()
        print(f"✗ Erro durante seed: {e}")
        raise
    finally:
        db.close()
