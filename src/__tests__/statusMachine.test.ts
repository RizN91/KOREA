import { describe, it, expect } from 'vitest'
import { canTransition, nextStatuses } from '../utils/statusMachine'

describe('status machine', () => {
  it('allows forward move by 1 or 2', () => {
    expect(canTransition('New','Need to Measure')).toBe(true)
    expect(canTransition('New','Measured')).toBe(true)
    expect(canTransition('New','Quoted')).toBe(false)
  })
  it('offers next statuses', () => {
    expect(nextStatuses('New')).toContain('Need to Measure')
  })
})