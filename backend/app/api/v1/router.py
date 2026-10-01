
from fastapi import APIRouter

from app.api.v1.endpoints.auth import router as auth_router
from app.api.v1.endpoints.categorias import router as categorias_router
from app.api.v1.endpoints.transacoes import router as transacoes_router

router = APIRouter()
router.include_router(auth_router, prefix="/auth", tags=["Auth"])
router.include_router(categorias_router, prefix="/categorias", tags=["Categorias"])
router.include_router(transacoes_router, prefix="/transacoes", tags=["Transacoes"])
from fastapi import APIRouter

from app.api.v1.endpoints.categorias import router as categorias_router
from app.api.v1.endpoints.relatorios import router as relatorios_router
from app.api.v1.endpoints.transacoes import router as transacoes_router

router = APIRouter()
router.include_router(categorias_router, prefix="/categorias", tags=["Categorias"])
router.include_router(transacoes_router, prefix="/transacoes", tags=["Transacoes"])
router.include_router(relatorios_router, prefix="/relatorios", tags=["Relatorios"])
