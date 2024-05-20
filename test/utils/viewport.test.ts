import { describe, expect, test } from 'vitest';
import { isWithinViewport } from '@/utils/viewport';

describe('viewport.ts', () => {
  test(`Correctly handles the edge case where the candidate's top is above the viewport's top and the candidate's bottom is below the viewport's bottom`, () => {
    expect(
      isWithinViewport({
        viewportTop: 80,
        viewportBottom: 334,
        candidateTop: 0,
        candidateHeight: 384,
      }),
    ).toBe(true);
  });
});
