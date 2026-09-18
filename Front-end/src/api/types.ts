export type TipoCategoria = 'receita' | 'despesa' | 'ambos'
export type TipoTransacao = 'receita' | 'despesa'

export type Categoria = {
  id: string
  nome: string
  tipo: TipoCategoria
  cor: string
  icone: string
  padrao: boolean
}

export type CategoriaInput = Omit<Categoria, 'id' | 'padrao'>

export type Transacao = {
  id: string
  tipo: TipoTransacao
  valor: string
  descricao: string
  data: string
  categoriaId: string
  categoria?: Categoria
}

export type TransacaoInput = {
  tipo: TipoTransacao
  valor: number
  descricao: string
  data: string
  categoriaId: string
}

export type FiltrosTransacao = {
  page?: number
  pageSize?: number
  from?: string
  to?: string
  tipo?: TipoTransacao
  categoriaId?: string
  minValor?: string
  maxValor?: string
}

export type PaginaTransacoes = {
  items: Transacao[]
  total: number
  page: number
  pageSize: number
}

export type ResumoMensal = {
  ano: number
  mes: number
  totalReceitas: string
  totalDespesas: string
  saldo: string
}

export type FatiaPizza = {
  categoriaId: string
  nome: string
  cor: string
  total: string
}

export type PontoEvolucao = {
  ano: number
  mes: number
  totalReceitas: string
  totalDespesas: string
}

export type Comparativo = {
  atual: ResumoMensal
  anterior: ResumoMensal
  variacaoReceitas: string
  variacaoDespesas: string
  variacaoSaldo: string
}

export interface FinanceClient {
  listarCategorias(): Promise<Categoria[]>
  criarCategoria(input: CategoriaInput): Promise<Categoria>
  atualizarCategoria(id: string, input: CategoriaInput): Promise<Categoria>
  excluirCategoria(id: string): Promise<void>
  listarTransacoes(filtros?: FiltrosTransacao): Promise<PaginaTransacoes>
  criarTransacao(input: TransacaoInput): Promise<Transacao>
  atualizarTransacao(id: string, input: TransacaoInput): Promise<Transacao>
  excluirTransacao(id: string): Promise<void>
  obterResumo(ano: number, mes: number): Promise<ResumoMensal>
  obterPizza(ano: number, mes: number, tipo: TipoTransacao): Promise<FatiaPizza[]>
  obterEvolucao(meses?: number): Promise<PontoEvolucao[]>
  obterComparativo(ano: number, mes: number): Promise<Comparativo>
}

export class AppError extends Error {
  readonly status: number

  constructor(message: string, status = 400) {
    super(message)
    this.name = 'AppError'
    this.status = status
  }
}
