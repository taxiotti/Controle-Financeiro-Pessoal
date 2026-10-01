export type TransactionType = 'receita' | 'despesa'

export type CategoryType = TransactionType | 'ambos'

export type Category = {
  id: string
  nome: string
  tipo: CategoryType
  cor: string
  icone: string
  padrao: boolean
}

export type Transaction = {
  id: string
  tipo: TransactionType
  valor: string
  descricao: string
  data: string
  categoriaId: string
  categoria: Category
}

export type TransactionInput = {
  tipo: TransactionType
  valor: number
  descricao: string
  data: string
  categoriaId: string
}

export type TransactionPage = {
  items: Transaction[]
  total: number
  page: number
  pageSize: number
}