
from datetime import date, datetime, timezone
from decimal import Decimal
from uuid import uuid4

from sqlalchemy import Boolean, CheckConstraint, Date, DateTime, ForeignKey, Index, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class Transacao(Base):
    __tablename__ = "transacoes"
    __table_args__ = (
        Index("ix_transacoes_usuario_data", "usuario_id", "data"),
        Index("ix_transacoes_usuario_categoria", "usuario_id", "categoria_id"),
        Index("ix_transacoes_usuario_tipo", "usuario_id", "tipo"),
        CheckConstraint("tipo IN ('receita', 'despesa')"),
        CheckConstraint("valor > 0"),
    )

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    usuario_id: Mapped[str] = mapped_column(ForeignKey("usuarios.id", ondelete="CASCADE"))
    categoria_id: Mapped[str] = mapped_column(ForeignKey("categorias.id", ondelete="RESTRICT"))
    tipo: Mapped[str] = mapped_column(String(7))
    valor: Mapped[Decimal] = mapped_column(Numeric(12, 2))
    descricao: Mapped[str] = mapped_column(String(120))
    data: Mapped[date] = mapped_column(Date)
    recorrente: Mapped[bool] = mapped_column(Boolean, default=False)
    criado_em: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
    )
    atualizado_em: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )
