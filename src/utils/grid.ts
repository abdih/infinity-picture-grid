import { NextBatchImageData } from '@/api-clients/image';
import { getImageHeightScaled } from '@/utils/image';
import { computeViewportBottom, isWithinViewport } from '@/utils/viewport';

export interface GridItemData {
  top: number;
  src: string;
  height: number;
}

/**
 * Determines the next grid slot to place the next image inside. The next
 * grid slot should be the topmost available free slot, with ties broken in
 * a left-to-right fashion.
 * @returns {Object} The column index and top pixel of the next grid's slot.
 */
export function findNextPlacementData({
  bottomInvisibleColumns,
  visibleColumns,
  GapAmount,
}: {
  bottomInvisibleColumns: Array<Array<GridItemData>>;
  visibleColumns: Array<Array<GridItemData>>;
  GapAmount: number;
}): {
  index: number;
  top: number;
} {
  const nextTopPixelCandidates = bottomInvisibleColumns.map((column, index) => {
    if (column.length === 0) {
      if (visibleColumns[index].length === 0) {
        return 0;
      }
      const visibleColumn = visibleColumns[index];
      return itemBottom(visibleColumn.at(-1)!) + GapAmount;
    }

    return itemBottom(column.at(-1)!) + GapAmount;
  });

  const nextTopPixel = Math.min(...nextTopPixelCandidates);
  const nextIndex = nextTopPixelCandidates.findIndex(
    (candidate) => candidate === nextTopPixel,
  );

  return {
    index: nextIndex,
    top: nextTopPixel,
  };
}

export async function placeNewImagesWithoutVirtualization({
  bottomInvisibleColumns,
  imagesData,
  visibleColumns,
  GapAmount,
  columnWidth,
}: {
  imagesData: Array<NextBatchImageData>;
  bottomInvisibleColumns: Array<Array<GridItemData>>;
  visibleColumns: Array<Array<GridItemData>>;
  GapAmount: number;
  columnWidth: number;
}): Promise<void> {
  for (const imageData of imagesData) {
    const nextPlacementData = findNextPlacementData({
      bottomInvisibleColumns,
      visibleColumns,
      GapAmount,
    });

    // Using abstraction of imageData instead of something as simple as "url",
    // for instance, because in upcoming PRs, we'll retrieve more complex
    // DTOs from the API endpoint invoker.
    //
    // Unsure why TypeScript's not picking up that it's a string.
    const src = imageData as unknown as string;

    // "height" is useful for handling virtualization of scrolling up and also
    // for getting the next image's placement location.
    let height: number;
    try {
      height = await getImageHeightScaled(src, columnWidth);
    } catch {
      console.error(`Failed to get the height for ${src}`);
      continue;
    }

    bottomInvisibleColumns[nextPlacementData.index].push({
      top: nextPlacementData.top,
      height,
      src,
    });
  }
}

/**
 * Accommodates the "top" part of scrolling up's virtualization.
 *
 * Mutates updatedVisibleColumns and/or bottomInvisibleColumns so that they
 * match the new top invisible columns.
 *
 * @param updatedVisibleColumns buffering data structure used to enable bulk
 * editing of the visible columns so as to not trigger unnecessary, intermediary
 * Vue renderings.
 */

export function feedDownFromTopInvisible({
  updatedVisibleColumns,
  topInvisibleColumns,
  bottomInvisibleColumns,
}: {
  updatedVisibleColumns: Array<Array<GridItemData>>;
  topInvisibleColumns: Array<Array<GridItemData>>;
  bottomInvisibleColumns: Array<Array<GridItemData>>;
}): void {
  const viewportTop = window.scrollY;
  const viewportBottom = computeViewportBottom();

  for (
    let columnIndex = 0;
    columnIndex < updatedVisibleColumns.length;
    columnIndex++
  ) {
    while (true) {
      const candidate = topInvisibleColumns[columnIndex].at(-1);

      if (!candidate) {
        break;
      }

      // Unsure whether empirically the viewport will ever move in a way so that
      // an image from the top invisible section will need to move straight to
      // the bottom invisible section. Still, I want to account for this.

      const needsToMoveDirectlyIntoBottomInvisible =
        candidate.top > viewportBottom;
      const needsToMoveDown =
        needsToMoveDirectlyIntoBottomInvisible ||
        isWithinViewport({
          viewportTop,
          viewportBottom,
          candidateTop: candidate.top,
          candidateHeight: candidate.height,
        });

      if (needsToMoveDown) {
        const toBeMoved = topInvisibleColumns[columnIndex].pop();
        const destinationColumns = needsToMoveDirectlyIntoBottomInvisible
          ? bottomInvisibleColumns
          : updatedVisibleColumns;
        destinationColumns[columnIndex].unshift(toBeMoved!);
      } else {
        break;
      }
    }
  }
}

/**
 * Accommodates the "bottom" part scrolling up's virtualization.
 *
 * Mutates updatedVisibleColumns so that it matches the new top invisible
 * columns.
 *
 * @param updatedVisibleColumns buffering data structure used to enable bulk
 * editing of the visible columns so as to not trigger unnecessary, intermediary
 * Vue renderings.
 */

export function feedBottomInvisibleFromVisible({
  bottomInvisibleColumns,
  updatedVisibleColumns,
}: {
  bottomInvisibleColumns: Array<Array<GridItemData>>;
  updatedVisibleColumns: Array<Array<GridItemData>>;
}): void {
  const viewportTop = window.scrollY;
  const viewportBottom = computeViewportBottom();

  for (
    let columnIndex = 0;
    columnIndex < updatedVisibleColumns.length;
    columnIndex++
  ) {
    while (true) {
      const candidate = updatedVisibleColumns[columnIndex].at(-1);

      if (!candidate) {
        break;
      }

      if (
        !isWithinViewport({
          viewportTop,
          viewportBottom,
          candidateTop: candidate.top,
          candidateHeight: candidate.height,
        })
      ) {
        const toMove = updatedVisibleColumns[columnIndex].pop();
        bottomInvisibleColumns[columnIndex].unshift(toMove!);
      } else {
        break;
      }
    }
  }
}

/**
 * Accommodates the "bottom" part of scrolling down's virtualization.
 *
 * Mutates updatedVisibleColumns and/or topInvisibleColumns so that they
 * match the new bottom invisible columns.
 *
 * @param updatedVisibleColumns buffering data structure used to enable bulk
 * editing of the visible columns so as to not trigger unnecessary, intermediary
 * Vue renderings.
 */
export function feedUpFromBottomInvisible({
  updatedVisibleColumns,
  topInvisibleColumns,
  bottomInvisibleColumns,
}: {
  updatedVisibleColumns: Array<Array<GridItemData>>;
  topInvisibleColumns: Array<Array<GridItemData>>;
  bottomInvisibleColumns: Array<Array<GridItemData>>;
}): void {
  const viewportTop = window.scrollY;
  const viewportBottom = computeViewportBottom();

  for (
    let columnIndex = 0;
    columnIndex < updatedVisibleColumns.length;
    columnIndex++
  ) {
    while (true) {
      const candidate = bottomInvisibleColumns[columnIndex][0];

      if (!candidate) {
        break;
      }

      // Unsure whether empirically the viewport will ever move in a way so that
      // an image from the bottom invisible section will need to move straight
      // to the top invisible section. Still, I want to account for this.

      const needsToMoveDirectlyIntoTopInvisible =
        itemBottom(candidate) < viewportTop;
      const needsToMoveUp =
        needsToMoveDirectlyIntoTopInvisible ||
        isWithinViewport({
          viewportTop,
          viewportBottom,
          candidateTop: candidate.top,
          candidateHeight: candidate.height,
        });

      if (needsToMoveUp) {
        const toBeMoved = bottomInvisibleColumns[columnIndex].shift();
        const destinationColumns = needsToMoveDirectlyIntoTopInvisible
          ? topInvisibleColumns
          : updatedVisibleColumns;
        destinationColumns[columnIndex].push(toBeMoved!);
      } else {
        break;
      }
    }
  }
}

/**
 * Accommodates the "top" part of scrolling down's virtualization.
 *
 * Mutates updatedVisibleColumns so that it matches the new top invisible
 * columns.
 *
 * @param updatedVisibleColumns buffering data structure used to enable bulk
 * editing of the visible columns so as to not trigger unnecessary, intermediary
 * Vue renderings.
 */
export function feedTopInvisibleFromVisible({
  updatedVisibleColumns,
  topInvisibleColumns,
}: {
  updatedVisibleColumns: Array<Array<GridItemData>>;
  topInvisibleColumns: Array<Array<GridItemData>>;
}): void {
  const viewportTop = window.scrollY;
  const viewportBottom = computeViewportBottom();

  for (
    let columnIndex = 0;
    columnIndex < updatedVisibleColumns.length;
    columnIndex++
  ) {
    while (true) {
      const candidate = updatedVisibleColumns[columnIndex][0];

      if (!candidate) {
        break;
      }

      if (
        !isWithinViewport({
          viewportTop,
          viewportBottom,
          candidateTop: candidate.top,
          candidateHeight: candidate.height,
        })
      ) {
        const toAdd = updatedVisibleColumns[columnIndex].shift();
        topInvisibleColumns[columnIndex].push(toAdd!);
      } else {
        break;
      }
    }
  }
}

export function itemBottom(item: GridItemData): number {
  return item.top + item.height;
}
