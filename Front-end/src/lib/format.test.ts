import { describe, expect, it } from 'vitest'
import { centsToDecimal, decimalToCents, formatMoney, monthBounds, shiftMonth } from './format'

describe('money helpers', () => {
  it('converte entradas brasileiras e decimais sem usar float persistido', () => {
    expect(decimalToCents('1.234,56')).toBe(123456)
    expect(decimalToCents('150.90')).toBe(15090)
    expect(centsToDecimal(15090)).toBe('150.90')
    expect(formatMoney('150.90')).toContain('150,90')
  })

  it('preserva centavos em somas inteiras', () => {
    const total = decimalToCents('0.10') + decimalToCents('0.20')
    expect(centsToDecimal(total)).toBe('0.30')
  })
})

describe('month helpers', () => {
  it('trata virada de ano e último dia do mês', () => {
    expect(shiftMonth(2026, 1, -1)).toEqual({ ano: 2025, mes: 12 })
    expect(monthBounds(2024, 2)).toEqual({ from: '2024-02-01', to: '2024-02-29' })
  })
})
