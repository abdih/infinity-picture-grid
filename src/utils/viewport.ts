export function computeViewportBottom(visualViewportHeight: number): number {
  return window.scrollY + visualViewportHeight;
}

export function isWithinViewport({
  viewportTop,
  viewportBottom,
  candidateTop,
  candidateHeight,
}: {
  viewportTop: number;
  viewportBottom: number;
  candidateTop: number;
  candidateHeight: number;
}): boolean {
  const imageBottom = candidateTop + candidateHeight;

  const isEntirelyAbove = imageBottom < viewportTop;
  const isEntirelyBelow = candidateTop > viewportBottom;

  return !isEntirelyAbove && !isEntirelyBelow;
}
