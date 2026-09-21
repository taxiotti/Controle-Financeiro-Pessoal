
from datetime import datetime, timezone
from uuid import uuid4

from sqlalchemy import Boolean, CheckConstraint, DateTime, ForeignKey, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class Categoria(Base):
    __tablename__ = "categorias"
    __table_args__ = (
        UniqueConstraint("usuario_id", "nome"),
        CheckConstraint("tipo IN ('receita', 'despesa', 'ambos')"),
    )

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    usuario_id: Mapped[str] = mapped_column(ForeignKey("usuarios.id", ondelete="CASCADE"))
    nome: Mapped[str] = mapped_column(String(40))
    tipo: Mapped[str] = mapped_column(String(7))
    cor: Mapped[str] = mapped_column(String(7))
    icone: Mapped[str] = mapped_column(String)
    padrao: Mapped[bool] = mapped_column(Boolean, default=False)
    criado_em: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
    )
