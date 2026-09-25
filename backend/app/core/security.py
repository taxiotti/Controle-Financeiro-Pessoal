from datetime import datetime, timedelta, timezone
from uuid import UUID

import bcrypt
from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.models import Usuario

bearer_scheme = HTTPBearer(auto_error=False)


def hash_senha(senha: str) -> str:
    return bcrypt.hashpw(senha.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verificar_senha(senha: str, senha_hash: str) -> bool:
    try:
        return bcrypt.checkpw(senha.encode("utf-8"), senha_hash.encode("utf-8"))
    except ValueError:
        return False


def criar_access_token(usuario_id: str) -> str:
    expira = datetime.now(timezone.utc) + timedelta(minutes=settings.access_token_expire_minutes)
    return jwt.encode(
        {"sub": usuario_id, "exp": expira},
        settings.secret_key,
        algorithm=settings.jwt_algorithm,
    )


def get_usuario_atual(
    credenciais: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> Usuario:
    if credenciais is None or credenciais.scheme.lower() != "bearer" or not credenciais.credentials:
        raise HTTPException(
            status_code=401,
            detail="Sessão ausente ou inválida.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    try:
        payload = jwt.decode(
            credenciais.credentials,
            settings.secret_key,
            algorithms=[settings.jwt_algorithm],
        )
        usuario_id = payload.get("sub")
        UUID(str(usuario_id))
    except (JWTError, ValueError, TypeError):
        raise HTTPException(
            status_code=401,
            detail="Sessão ausente ou inválida.",
            headers={"WWW-Authenticate": "Bearer"},
        ) from None

    usuario = db.scalar(select(Usuario).where(Usuario.id == str(usuario_id)))
    if usuario is None:
        raise HTTPException(
            status_code=401,
            detail="Sessão ausente ou inválida.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return usuario
