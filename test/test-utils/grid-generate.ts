import { blankColumns, GridItemData, itemBottom } from '@/utils/grid';
import { randomSelect } from '@/utils/random';

export interface GridItemDataTestVersion extends GridItemData {
  bottom: number;
}

/**
 * Generates a grid whose items' heights are randomly assigned and whose
 * other characterstics abide by the provided constraints (e.g., columnCount).
 * This function's used in generating a reference grid for unit tests testing
 * functionality around the grid (e.g., feedDownFromTopInvisible). Furthermore,
 * it also provides a src-height mapping that'll help for mocking purposes.
 */
export function generateRandomGrid({
  possibleHeights,
  GapAmount,
  columnCount,
  minimumColumnHeight,
}: {
  possibleHeights: Array<number>;
  GapAmount: number;
  columnCount: number;
  minimumColumnHeight: number;
}): {
  grid: Array<Array<GridItemDataTestVersion>>;
  srcToHeightMapping: Record<string, number>;
} {
  const grid = blankColumns<GridItemDataTestVersion>(columnCount);
  const srcToHeightMapping = {} as Record<string, number>;

  for (let columnIndex = 0; columnIndex < columnCount; columnIndex++) {
    const currentColumnHeight = () => {
      const lastItem = grid[columnIndex].at(-1);
      if (lastItem) {
        return itemBottom(lastItem!);
      } else {
        return 0;
      }
    };

    let rowIndex = 0;

    while (currentColumnHeight() < minimumColumnHeight) {
      let top: number;
      const lastItem = grid[columnIndex].at(-1);
      if (lastItem) {
        top = itemBottom(lastItem!) + GapAmount;
      } else {
        top = 0;
      }

      const height = randomSelect(possibleHeights);

      const src = `${columnIndex}-${rowIndex}`;

      grid[columnIndex].push({
        src: `${columnIndex}-${rowIndex}`,
        height,
        top,
        // It's incredibly helpful to see this value quickly for constructing
        // test cases.
        bottom: top + height,
      });

      srcToHeightMapping[src] = height;

      rowIndex++;
    }
  }

  return {
    grid,
    srcToHeightMapping,
  };
}
