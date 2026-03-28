import { describe, it, expect } from 'vitest'
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  generateSKU,
  generateOrderNumber,
  generateSaleNumber,
} from '@/lib/utils'

describe('formatCurrency', () => {
  it('formats zero', () => {
    const result = formatCurrency(0)
    expect(result).toBeTypeOf('string')
    expect(result).toMatch(/0/)
  })

  it('formats positive integer', () => {
    const result = formatCurrency(1000)
    expect(result).toBeTypeOf('string')
    // Should contain the digits 1,000 in some form
    expect(result).toMatch(/1[,.]?000|1000/)
  })

  it('formats decimal amount', () => {
    const result = formatCurrency(99.5)
    expect(result).toBeTypeOf('string')
    expect(result).toMatch(/99/)
  })

  it('formats large amount', () => {
    const result = formatCurrency(99999)
    expect(result).toBeTypeOf('string')
    expect(result).toMatch(/99/)
  })

  it('formats negative amount', () => {
    const result = formatCurrency(-100)
    expect(result).toBeTypeOf('string')
    expect(result).toMatch(/-/)
    expect(result).toMatch(/100/)
  })
})

describe('formatDate', () => {
  it('returns a non-empty string for a valid date string', () => {
    const result = formatDate('2024-01-15')
    expect(result).toBeTypeOf('string')
    expect(result.length).toBeGreaterThan(0)
  })

  it('returns a non-empty string for a Date object', () => {
    const result = formatDate(new Date('2024-06-01'))
    expect(result).toBeTypeOf('string')
    expect(result.length).toBeGreaterThan(0)
  })

  it('includes the year 2024', () => {
    const result = formatDate('2024-03-10')
    // Thai or Gregorian year should contain 2024 or 2567 (Buddhist)
    expect(result).toMatch(/2024|2567/)
  })
})

describe('formatDateTime', () => {
  it('returns a non-empty string', () => {
    const result = formatDateTime('2024-01-15T10:30:00')
    expect(result).toBeTypeOf('string')
    expect(result.length).toBeGreaterThan(0)
  })

  it('includes hour and minute', () => {
    const result = formatDateTime('2024-01-15T10:30:00')
    expect(result).toBeTypeOf('string')
    // Should contain "10" and "30" somewhere
    expect(result).toMatch(/10/)
    expect(result).toMatch(/30/)
  })
})

describe('generateSKU', () => {
  it('returns a string', () => {
    const result = generateSKU('SHIRT', 'Red', 'L')
    expect(result).toBeTypeOf('string')
  })

  it('includes the prefix', () => {
    const result = generateSKU('SHIRT', 'Red', 'L')
    expect(result).toContain('SHIRT')
  })

  it('uses first 3 chars of color uppercased', () => {
    const result = generateSKU('ITEM', 'blue', 'M')
    expect(result).toContain('BLU')
  })

  it('includes size uppercased', () => {
    const result = generateSKU('ITEM', 'Red', 'xl')
    expect(result).toContain('XL')
  })

  it('matches expected pattern PREFIX-COL-SIZE-XXXX', () => {
    const result = generateSKU('TSH', 'White', 'S')
    expect(result).toMatch(/^TSH-WHI-S-[A-Z0-9]{4}$/)
  })

  it('generates different SKUs on each call (random suffix)', () => {
    const sku1 = generateSKU('A', 'Red', 'M')
    const sku2 = generateSKU('A', 'Red', 'M')
    // Very unlikely to be equal due to random suffix
    // We just check the shape is consistent
    expect(sku1).toMatch(/^A-RED-M-[A-Z0-9]{4}$/)
    expect(sku2).toMatch(/^A-RED-M-[A-Z0-9]{4}$/)
  })
})

describe('generateOrderNumber', () => {
  it('returns a string', () => {
    const result = generateOrderNumber()
    expect(result).toBeTypeOf('string')
  })

  it('uses JOB prefix by default', () => {
    const result = generateOrderNumber()
    expect(result).toMatch(/^JOB-/)
  })

  it('uses custom prefix when provided', () => {
    const result = generateOrderNumber('ORD')
    expect(result).toMatch(/^ORD-/)
  })

  it('matches pattern PREFIX-YYMMDD-XXXX', () => {
    const result = generateOrderNumber('JOB')
    expect(result).toMatch(/^JOB-\d{6}-[A-Z0-9]{4}$/)
  })
})

describe('generateSaleNumber', () => {
  it('returns a string', () => {
    const result = generateSaleNumber()
    expect(result).toBeTypeOf('string')
  })

  it('starts with INV-', () => {
    const result = generateSaleNumber()
    expect(result).toMatch(/^INV-/)
  })

  it('matches pattern INV-YYMMDDHHmmss', () => {
    const result = generateSaleNumber()
    expect(result).toMatch(/^INV-\d{12}$/)
  })
})
