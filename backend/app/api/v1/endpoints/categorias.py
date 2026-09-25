
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.models import Categoria, Transacao, Usuario
from app.schemas.categoria import CategoriaInput, CategoriaResponse

router = APIRouter()


def get_usuario_atual(db: Session = Depends(get_db)) -> Usuario:
    # Usuário implícito permitido pelo quickstart até a implementação da US6.
    usuario = db.scalar(select(Usuario).where(
        Usuario.email == settings.dev_user_email.strip().lower(),
    ))
    if usuario is None:
        raise HTTPException(503, "Usuário de desenvolvimento ausente. Execute python -m app.seed.")
    return usuario


def buscar_categoria(db: Session, id: UUID, usuario: Usuario) -> Categoria:
    categoria = db.scalar(select(Categoria).where(
        Categoria.id == str(id),
        Categoria.usuario_id == usuario.id,
    ))
    if categoria is None:
        raise HTTPException(404, "Categoria não encontrada.")
    return categoria


def salvar(db: Session):
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(400, "Já existe uma categoria com esse nome.") from None


@router.get("", response_model=list[CategoriaResponse])
def listar(
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_usuario_atual),
):
    return db.scalars(select(Categoria).where(
        Categoria.usuario_id == usuario.id,
    ).order_by(Categoria.nome, Categoria.id)).all()


@router.post("", response_model=CategoriaResponse, status_code=201)
def criar(
    payload: CategoriaInput,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_usuario_atual),
):
    categoria = Categoria(**payload.model_dump(), usuario_id=usuario.id, padrao=False)
    db.add(categoria)
    salvar(db)
    db.refresh(categoria)
    return categoria


@router.patch("/{id}", response_model=CategoriaResponse)
def editar(
    id: UUID,
    payload: CategoriaInput,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_usuario_atual),
):
    categoria = buscar_categoria(db, id, usuario)
    if payload.tipo != "ambos":
        incompatível = db.scalar(select(Transacao.id).where(
            Transacao.categoria_id == categoria.id,
            Transacao.tipo != payload.tipo,
        ).limit(1))
        if incompatível:
            raise HTTPException(409, "O tipo é incompatível com transações desta categoria.")
    for campo, valor in payload.model_dump().items():
        setattr(categoria, campo, valor)
    salvar(db)
    db.refresh(categoria)
    return categoria


@router.delete("/{id}", status_code=204)
def excluir(
    id: UUID,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_usuario_atual),
):
    categoria = buscar_categoria(db, id, usuario)
    if categoria.padrao:
        raise HTTPException(409, "Categorias padrão não podem ser excluídas.")
    em_uso = db.scalar(select(Transacao.id).where(
        Transacao.categoria_id == categoria.id,
    ).limit(1))
    if em_uso:
        raise HTTPException(409, "Categoria vinculada a transações não pode ser excluída.")
    db.delete(categoria)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(409, "Categoria vinculada a transações não pode ser excluída.") from None
    return Response(status_code=204)
