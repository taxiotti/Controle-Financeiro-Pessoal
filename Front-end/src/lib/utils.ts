import type { Transaction } from '../types/finance'

export function parseMoney(value: string | number): number {
  if (typeof value === 'number') return value
  return Number(value.replace(',', '.')) || 0
}

export function formatMoney(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export function formatSignedMoney(value: number): string {
  return `${value >= 0 ? '+' : '−'} ${formatMoney(Math.abs(value))}`
}

export function formatDate(value: string): string {
  const [year, month, day] = value.split('-').map(Number)
  return new Intl.DateTimeFormat('pt-BR').format(new Date(year, month - 1, day))
}

export function monthKey(value: string): string {
  return value.slice(0, 7)
}

export function monthLabel(key: string): string {
  const [year, month] = key.split('-').map(Number)
  const label = new Intl.DateTimeFormat('pt-BR', {
    month: 'long',
    year: 'numeric',
  }).format(new Date(year, month - 1, 1))
  return label.charAt(0).toUpperCase() + label.slice(1)
}

export function currentMonthKey(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

export function transactionsForMonth(
  transactions: Transaction[],
  key: string,
): Transaction[] {
  return transactions.filter((transaction) => monthKey(transaction.data) === key)
}

export function monthOffset(key: string, offset: number): string {
  const [year, month] = key.split('-').map(Number)
  const date = new Date(year, month - 1 + offset, 1)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

export function totalForType(
  transactions: Transaction[],
  type: Transaction['tipo'],
): number {
  return transactions
    .filter((transaction) => transaction.tipo === type)
    .reduce((total, transaction) => total + parseMoney(transaction.valor), 0)
}