import { describe, expect, it } from 'vitest';
import { lerp } from '../../src/utils/lerp';

describe('lerp', () => {
  it('returns the start value at t=0', () => {
    expect(lerp(0, 10, 0)).toBe(0);
  });

  it('returns the end value at t=1', () => {
    expect(lerp(0, 10, 1)).toBe(10);
  });

  it('interpolates linearly between start and end', () => {
    expect(lerp(0, 10, 0.5)).toBe(5);
    expect(lerp(10, 20, 0.25)).toBe(12.5);
  });

  it('extrapolates for t outside [0, 1]', () => {
    expect(lerp(0, 10, 2)).toBe(20);
  });
});
