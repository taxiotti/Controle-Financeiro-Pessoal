
from sqlalchemy import select

from app.core.config import settings
from app.core.database import SessionLocal, create_tables
from app.core.security import hash_senha
from app.models import Categoria, Usuario

CATEGORIAS_PADRAO = [
    ("Alimentação", "despesa", "#F97316", "utensils"),
    ("Transporte", "despesa", "#3B82F6", "car"),
    ("Moradia", "despesa", "#8B5CF6", "house"),
    ("Saúde", "despesa", "#EF4444", "heart-pulse"),
    ("Educação", "despesa", "#EAB308", "graduation-cap"),
    ("Lazer", "despesa", "#EC4899", "gamepad-2"),
    ("Salário", "receita", "#22C55E", "wallet"),
    ("Investimentos", "receita", "#14B8A6", "trending-up"),
    ("Outros", "ambos", "#64748B", "ellipsis"),
]


def garantir_categorias_padrao(db, usuario: Usuario) -> None:
    for nome, tipo, cor, icone in CATEGORIAS_PADRAO:
        existente = db.scalar(select(Categoria).where(
            Categoria.usuario_id == usuario.id,
            Categoria.nome == nome,
        ))
        if existente is None:
            db.add(Categoria(
                usuario_id=usuario.id,
                nome=nome,
                tipo=tipo,
                cor=cor,
                icone=icone,
                padrao=True,
            ))


def seed(db):
    email = settings.dev_user_email.strip().lower()
    usuario = db.scalar(select(Usuario).where(Usuario.email == email))
    if usuario is None:
        if not settings.dev_user_password:
            raise RuntimeError("Configure DEV_USER_PASSWORD no .env antes de executar o seed.")
        usuario = Usuario(
            nome="Usuário de desenvolvimento",
            email=email,
            senha_hash=hash_senha(settings.dev_user_password),
        )
        db.add(usuario)
        db.flush()

    garantir_categorias_padrao(db, usuario)
    db.commit()


if __name__ == "__main__":
    create_tables()
    with SessionLocal() as db:
        seed(db)
