<script setup lang="ts">
import { clone2DArrayNaive } from '@/utils/array';
import {
  computed,
  nextTick,
  onUnmounted,
  ref,
  Ref,
  watch,
  WatchStopHandle,
} from 'vue';
import { debounce } from 'lodash';
import {
  ensureVirtualizationBuffer,
  feedBottomInvisibleFromVisible,
  feedDownFromTopInvisible,
  feedTopInvisibleFromVisible,
  feedUpFromBottomInvisible,
  GridItemData,
  itemBottom,
  placeNewImagesWithoutVirtualization,
  updateGridColumnDimensions,
} from '@/utils/grid';
import { getNextBatch, NextBatchImageData } from '@/api-clients/image';
import { useDevicePixelRatio } from '@/composables/dpr';
import { useDisplay } from 'vuetify';
import { computeViewportBottom } from '@/utils/viewport';

let topInvisibleColumns: Array<Array<GridItemData>> = [];
let bottomInvisibleColumns: Array<Array<GridItemData>> = [];
const visibleColumns: Ref<Array<Array<GridItemData>>> = ref([]);
const VirtualizationBuffer = 3;

const columnWidth: Ref<number | undefined> = ref(undefined);
const GapAmount = 8;

let previousScrollY: number = 0;

const afterToken: Ref<number | null | undefined> = ref(undefined);

let scrollHandlingChain: Promise<void>;

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

      const shouldPlaceImages = afterToken.value !== null;
      if (shouldPlaceImages) {
        let imagesData: Array<NextBatchImageData>;

        // I.e., afterToken.value !== null
        nextBatchResponseDto = await getNextBatch(afterToken.value!);

        imagesData = nextBatchResponseDto.data;

        // Add the images to the grid
        await placeNewImagesWithoutVirtualization({
          bottomInvisibleColumns,
          visibleColumns: visibleColumns.value,
          imagesData,
          GapAmount,
          columnWidth: columnWidth.value!,
        });
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
        visualViewportHeight: visualViewportHeight.value!,
      });
      ensureVirtualizationBuffer({
        updatedVisibleColumns,
        topInvisibleColumns,
        bottomInvisibleColumns,
        buffer: VirtualizationBuffer,
        visualViewportHeight: visualViewportHeight.value!,
      });

      visibleColumns.value = updatedVisibleColumns;
      // Setting the afterToken here because if we do it earlier, when the
      // afterToken is such that it indicates there's no more image for the
      // server to provide, that message is shown at the bottom and doesn't
      // flash before the penultimate batch gets appended.
      if (nextBatchResponseDto) {
        afterToken.value = nextBatchResponseDto.afterToken;
      }

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
        visualViewportHeight: visualViewportHeight.value!,
      });
      feedDownFromTopInvisible({
        updatedVisibleColumns,
        topInvisibleColumns,
        bottomInvisibleColumns,
        visualViewportHeight: visualViewportHeight.value!,
      });
      ensureVirtualizationBuffer({
        updatedVisibleColumns,
        topInvisibleColumns,
        bottomInvisibleColumns,
        buffer: VirtualizationBuffer,
        visualViewportHeight: visualViewportHeight.value!,
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

// Additional code for handling page resizing (Start)
const {
  name: breakpointName,
  height: visualViewportHeight,
  width: visualViewportWidth,
  thresholds,
} = useDisplay();

const { devicePixelRatio } = useDevicePixelRatio();

let visualViewportHandlingChain = Promise.resolve();

const processVisualViewportChanges = async () => {
  console.log(
    `visualViewportWidth.value: ${visualViewportWidth.value}; visualViewportHeight.value: ${visualViewportHeight.value}; breakpointName.value: ${breakpointName.value}; devicePixelRatio.value: ${devicePixelRatio.value}`,
    visualViewportWidth.value,
  );
  async function handleVisualViewportChanges() {
    removeEventListener('scroll', debouncedHandleScroll);

    // Initialize
    const { columnCount } = updateGridColumnDimensions({
      columnWidth,
      visualViewportWidth: visualViewportWidth.value,
      GapAmount,
      breakpointName: breakpointName.value,
      thresholds: thresholds.value,
    });

    haveProcessedInitialRetrieval.value = false;
    topInvisibleColumns = [];
    bottomInvisibleColumns = [];
    visibleColumns.value = [];
    previousScrollY = 0;
    scrollHandlingChain = Promise.resolve();
    afterToken.value = undefined;

    // Initialize further
    const blankColumns = () => Array.from(Array(columnCount)).map(() => []);
    visibleColumns.value.push(...blankColumns());
    topInvisibleColumns.push(...blankColumns());
    bottomInvisibleColumns.push(...blankColumns());

    setupWatchEnsureVisibleColumnsFilled();

    await handleScrollDown();

    addEventListener('scroll', debouncedHandleScroll);
  }

  // Doing this out of paranoia around being in a corrupt state otherwise due
  // to race conditions. Investigate optimizing this if it becomes a
  // bottleneck.
  //
  // TODO: Ensure errors are properly handled.
  visualViewportHandlingChain = visualViewportHandlingChain.then(async () => {
    // We want to ensure we're awaiting the last scheduled scroll handling. To
    // do so, we want to:
    //   1. Stop the watcher from scheduling more handling.
    //   2. Ensure the watcher's handling is invoked in the case it's triggered
    //   before we await the chain of scroll handling.
    //     - When handleScrollDown modifies visibleColumns and triggers the
    //     watcher, the handling of the watcher, at least sometimes, doesn't
    //     get invoked by the time we're at this point.

    // (1)
    if (unwatchEnsureVisibleColumnsFilled) {
      unwatchEnsureVisibleColumnsFilled();
    }

    // (2)
    await nextTick();

    await scrollHandlingChain;
    return handleVisualViewportChanges();
  });
};

const debouncedProcessVisualViewportChanges = debounce(
  processVisualViewportChanges,
  250,
);

// It appears that this watcher's invoked twice subsequently when the user
// zooms in: once for a change in the DPR and another for the change in the
// visual viewport's width. I tried to debounce the callback, but that appears
// to get rid of the Watcher's functionality entirely.
//
// TODO: Reduce duplicate invocations.

// Can't use watchEffect because we also want to watch for changes in the visual
// viewport's height and this reactive dependency (i.e.,
// visualViewportHeight.value) isn't used in the callback. (E.g.,
// although computeViewportBottom is referenced within this callback,
// computeViewportBottom's usage of window.innerHeight is insufficient.)
//
// Using debounce because without it, the chain of handlers can get very long
// and drastically slow the page.
watch(
  [visualViewportWidth, visualViewportHeight, devicePixelRatio],
  debouncedProcessVisualViewportChanges,
  {
    immediate: true,
  },
);

let unwatchEnsureVisibleColumnsFilled: WatchStopHandle | undefined;

function setupWatchEnsureVisibleColumnsFilled() {
  unwatchEnsureVisibleColumnsFilled = watch(
    visibleColumns,
    (newVisibleColumns, _oldVisibleColumns) => {
      const isSomeColumnUnfilled = newVisibleColumns.some((column) => {
        if (column.length === 0) {
          return true;
        }

        const canColumnHandleOneMoreItem =
          computeViewportBottom(visualViewportHeight.value!) -
            (column.at(-1)!.top + column.at(-1)!.height) >
          GapAmount;

        if (canColumnHandleOneMoreItem) {
          return true;
        }

        return false;
      });

      if (
        isSomeColumnUnfilled &&
        !hasServerStatedNoMoreSubsequentBatches.value
      ) {
        handleScrollDown();
      }
    },
  );
}
// Additional code for handling page resizing (Finish)
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
        :imgStyle="computeStyle({ imageData, imageIndex, columnIndex })"
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
