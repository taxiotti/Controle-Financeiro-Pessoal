import type { Category, Transaction, TransactionInput, TransactionPage } from '../types/finance'

const API_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api').replace(/\/$/, '')

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })

  if (!response.ok) {
    const body = await response.json().catch(() => ({})) as { error?: string }
    throw new Error(body.error ?? `Não foi possível acessar a API (${response.status}).`)
  }

  return response.json() as Promise<T>
}

export async function getCategories(): Promise<Category[]> {
  return request<Category[]>('/categorias')
}

export async function getTransactionPage(
  page = 1,
  pageSize = 100,
): Promise<TransactionPage> {
  return request<TransactionPage>(`/transacoes?page=${page}&pageSize=${pageSize}`)
}

export async function getAllTransactions(): Promise<Transaction[]> {
  const firstPage = await getTransactionPage()
  const pages = [firstPage]
  const totalPages = Math.ceil(firstPage.total / firstPage.pageSize)

  for (let page = 2; page <= totalPages; page += 1) {
    pages.push(await getTransactionPage(page, firstPage.pageSize))
  }

  return pages.flatMap((page) => page.items)
}

export async function createTransaction(input: TransactionInput): Promise<Transaction> {
  return request<Transaction>('/transacoes', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}