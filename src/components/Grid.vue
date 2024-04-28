<script setup lang="ts">
import { computed, onMounted, onUnmounted, Ref, ref } from 'vue';
import {
  feedBottomInvisibleFromVisible,
  feedDownFromTopInvisible,
  feedTopInvisibleFromVisible,
  feedUpFromBottomInvisible,
  GridItemData,
  itemBottom,
  placeNewImagesWithoutVirtualization,
} from '@/utils/grid';
import { debounce } from 'lodash';
import { getNextBatch } from '@/api-clients/image';
import { clone2DArrayNaive } from '@/utils/array';

let topInvisibleColumns: Array<Array<GridItemData>> = [];
let bottomInvisibleColumns: Array<Array<GridItemData>> = [];
const visibleColumns: Ref<Array<Array<GridItemData>>> = ref([]);

const columnWidth: Ref<number | undefined> = ref(undefined);
const GapAmount = 8;

let previousScrollY: number = 0;

const afterToken: Ref<number | null | undefined> = ref(undefined);

let scrollHandlingChain = Promise.resolve();

function handleScroll(_event: Event): void {
  const currentScrollY = window.scrollY;
  const isScrollingDown = currentScrollY > previousScrollY;

  previousScrollY = currentScrollY;
  if (isScrollingDown) {
    handleScrollDown();
  } else {
    handleScrollUp();
  }
}

const debouncedHandleScroll = debounce(handleScroll, 50);

onMounted(async () => {
  const columnCount = 3;

  const blankColumns = () => Array.from(Array(columnCount)).map(() => []);
  visibleColumns.value.push(...blankColumns());
  topInvisibleColumns.push(...blankColumns());
  bottomInvisibleColumns.push(...blankColumns());

  // Column width is: [full visual viewport's width - (gap in between columns + padding on either side)] / 3
  columnWidth.value =
    (window.innerWidth - ((columnCount - 1) * GapAmount + GapAmount * 2)) / 3;

  await handleScrollDown();

  addEventListener('scroll', debouncedHandleScroll);
});

onUnmounted(() => {
  removeEventListener('scroll', debouncedHandleScroll);
});

function addScrollHandling(initiateNewHandling: () => Promise<void>) {
  // TODO: Ensure errors are properly handled.
  scrollHandlingChain = scrollHandlingChain.then(() => {
    return initiateNewHandling();
  });

  return scrollHandlingChain;
}

async function handleScrollDown(): Promise<void> {
  const initiateNewHandling = () => {
    return new Promise<void>(async (resolve) => {
      let nextBatchResponseDto:
        | undefined
        | Awaited<ReturnType<typeof getNextBatch>>;

      if (afterToken.value !== null) {
        nextBatchResponseDto = await getNextBatch(afterToken.value);

        // Add the images to the grid
        await placeNewImagesWithoutVirtualization({
          bottomInvisibleColumns,
          visibleColumns: visibleColumns.value,
          imagesData: nextBatchResponseDto.data,
          GapAmount,
          columnWidth: columnWidth.value!,
        });

        afterToken.value = nextBatchResponseDto.afterToken;
      }

      // Virtualize.

      const updatedVisibleColumns = clone2DArrayNaive(visibleColumns.value);

      feedTopInvisibleFromVisible({
        updatedVisibleColumns,
        topInvisibleColumns,
      });
      feedUpFromBottomInvisible({
        updatedVisibleColumns,
        topInvisibleColumns,
        bottomInvisibleColumns,
      });

      visibleColumns.value = updatedVisibleColumns;

      resolve();
    });
  };

  const initiateNewHandlingWithGuaranteedLoadingIndicatorTermination = () => {
    return initiateNewHandling().finally(() => {
      // Want a different loading indicator at the initial render.
      // Furthermore, don't want to remove the loading indicator until we're
      // sure there's content to be shown. Said differently, we want to
      // leverage the synergy of the initial loading indicator right up until
      // we're ready to show the user something.
      //
      // Not using nextTick because that's unnecessary. Furthermore, it adds the
      // risk of blocking the rendering of the grid.
      if (!haveProcessedInitialRetrieval.value) {
        haveProcessedInitialRetrieval.value = true;
      }
    });
  };

  return addScrollHandling(
    initiateNewHandlingWithGuaranteedLoadingIndicatorTermination,
  );
}

async function handleScrollUp(): Promise<void> {
  const initiateNewHandling = () => {
    return new Promise<void>(async (resolve) => {
      // Virtualize.

      const updatedVisibleColumns = clone2DArrayNaive(visibleColumns.value);

      feedBottomInvisibleFromVisible({
        updatedVisibleColumns,
        bottomInvisibleColumns,
      });
      feedDownFromTopInvisible({
        updatedVisibleColumns,
        topInvisibleColumns,
        bottomInvisibleColumns,
      });

      visibleColumns.value = updatedVisibleColumns;

      resolve();
    });
  };

  return addScrollHandling(initiateNewHandling);
}

function computeStyle({
  imageData,
  imageIndex,
  columnIndex,
}: {
  imageData: GridItemData;
  imageIndex: number;
  columnIndex: number;
}): Record<string, string> | undefined {
  const style = {} as Record<string, string>;
  // The height is necessary in the case that the browser cache doesn't have the
  // image and it takes the browser some time to update the DOM img element with
  // the right height, in the case of scrolling up, it can make the previously
  // top image jump up out of the view and then when the aforementioned img
  // element's height's determined, it triggers and undesired scroll down.
  style.height = `${imageData.height}px`;
  if (imageIndex === 0) {
    style.marginTop = `${imageData.top}px`;
  }
  if (imageIndex === visibleColumns.value[columnIndex].length - 1) {
    if (bottomInvisibleColumns[columnIndex].length) {
      const lastBottomPx = itemBottom(
        bottomInvisibleColumns[columnIndex].at(-1)!,
      );
      const differencePx = lastBottomPx - itemBottom(imageData);
      style.marginBottom = `${differencePx}px`;
    }
  }
  return style;
}

// Page-level loading indicator-related code (Start)
const haveProcessedInitialRetrieval: Ref<boolean> = ref(false);

const hasServerStatedNoMoreSubsequentBatches = computed(() => {
  return afterToken.value === null;
});
// Page-level loading indicator-related code (Finish)
</script>
<template>
  <div
    :style="`display: flex; column-gap: ${GapAmount}px; justify-content: center`"
  >
    <div
      :key="columnIndex"
      v-for="(column, columnIndex) in visibleColumns"
      :style="`flex: 0 0 ${columnWidth}px; row-gap: ${GapAmount}px; display: flex; flex-direction: column`"
    >
      <Image
        :key="imageData.src"
        v-for="(imageData, imageIndex) in column"
        :src="imageData.src"
        :style="computeStyle({ imageData, imageIndex, columnIndex })"
      />
    </div>
  </div>
  <template v-if="haveProcessedInitialRetrieval">
    <div
      style="
        display: flex;
        justify-content: center;
        align-items: center;
        align-content: center;
        height: 45px;
        width: 100%;
      "
    >
      <v-progress-circular
        v-if="!hasServerStatedNoMoreSubsequentBatches"
        indeterminate
        width="1"
      />
      <span v-else>There are no more images.</span>
    </div>
  </template>
  <template v-else>
    <div
      style="
        display: flex;
        justify-content: center;
        align-items: center;
        align-content: center;
        height: 100vh;
        width: 100vw;
      "
    >
      <v-progress-circular indeterminate width="1" />
    </div>
  </template>
</template>
