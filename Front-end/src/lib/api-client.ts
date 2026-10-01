import { httpFinanceClient } from '../api/httpClient'
import type { TransacaoInput } from '../api/types'

/** Helpers legado; o app usa `financeClient` de `api/client`. */
export const getCategories = () => httpFinanceClient.listarCategorias()

export const getTransactionPage = (page = 1, pageSize = 100) =>
  httpFinanceClient.listarTransacoes({ page, pageSize })

export async function getAllTransactions() {
  const firstPage = await getTransactionPage()
  const pages = [firstPage]
  const totalPages = Math.ceil(firstPage.total / firstPage.pageSize)

  for (let page = 2; page <= totalPages; page += 1) {
    pages.push(await getTransactionPage(page, firstPage.pageSize))
  }

  return pages.flatMap((page) => page.items)
}

export const createTransaction = (input: TransacaoInput) =>
  httpFinanceClient.criarTransacao(input)
