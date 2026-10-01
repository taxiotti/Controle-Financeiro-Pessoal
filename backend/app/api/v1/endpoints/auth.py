from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import criar_access_token, get_usuario_atual, hash_senha, verificar_senha
from app.models import Usuario
from app.schemas.auth import LoginInput, RegistroInput, SessaoResponse, UsuarioPublico
from app.seed import garantir_categorias_padrao

router = APIRouter()


def _sessao(usuario: Usuario) -> SessaoResponse:
    return SessaoResponse(
        access_token=criar_access_token(usuario.id),
        token_type="bearer",
        usuario=UsuarioPublico.model_validate(usuario),
    )


@router.post("/register", response_model=SessaoResponse, status_code=201)
def registrar(payload: RegistroInput, db: Session = Depends(get_db)):
    email = str(payload.email).strip().lower()
    usuario = Usuario(
        nome=payload.nome,
        email=email,
        senha_hash=hash_senha(payload.senha),
    )
    db.add(usuario)
    try:
        db.flush()
    except IntegrityError:
        db.rollback()
        raise HTTPException(409, "Já existe uma conta com este e-mail.") from None

    garantir_categorias_padrao(db, usuario)
    db.commit()
    db.refresh(usuario)
    return _sessao(usuario)


@router.post("/login", response_model=SessaoResponse)
def login(payload: LoginInput, db: Session = Depends(get_db)):
    email = str(payload.email).strip().lower()
    usuario = db.scalar(select(Usuario).where(Usuario.email == email))
    if usuario is None or not verificar_senha(payload.senha, usuario.senha_hash):
        raise HTTPException(401, "E-mail ou senha inválidos.")
    return _sessao(usuario)


@router.post("/logout", status_code=204)
def logout(_usuario: Usuario = Depends(get_usuario_atual)):
    return Response(status_code=204)


@router.get("/me", response_model=UsuarioPublico)
def me(usuario: Usuario = Depends(get_usuario_atual)):
    return usuario
