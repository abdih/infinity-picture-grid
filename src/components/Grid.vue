<script setup lang="ts">
import { clone2DArrayNaive } from '@/utils/array';
import {
  ComponentPublicInstance,
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
  blankColumns,
  feedBottomInvisibleFromVisible,
  feedDownFromTopInvisible,
  feedTopInvisibleFromVisible,
  feedUpFromBottomInvisible,
  GridItemData,
  itemBottom,
  placeNewImagesWithoutVirtualization,
  updateGridColumnDimensions,
} from '@/utils/grid';
import {
  getMatchingSupportedCssPixelWidth,
  getMatchingSupportedDpr,
  getNextBatch,
  NextBatchImageData,
} from '@/api-clients/image';
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

type AfterTokenServerValue = number | null;
const afterToken: Ref<AfterTokenServerValue | undefined> = ref(undefined);

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

declare global {
  interface Window {
    initialImageBatch?: Array<NextBatchImageData>;
    afterToken?: AfterTokenServerValue;
  }
}

let haveUsedInitialRenderingOptimization = false;

onUnmounted(() => {
  removeEventListener('scroll', debouncedHandleScroll);
  subsequentLoadingIndicatorObserver.disconnect();
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

      const canUseInitialRenderingOptimization =
        !haveUsedInitialRenderingOptimization && !!window.initialImageBatch;

      const shouldPlaceImages =
        canUseInitialRenderingOptimization || afterToken.value !== null;

      if (shouldPlaceImages) {
        let imagesData: Array<NextBatchImageData>;
        if (canUseInitialRenderingOptimization) {
          imagesData = window.initialImageBatch!;
          haveUsedInitialRenderingOptimization = true;
        } else {
          // I.e., afterToken.value !== null
          nextBatchResponseDto = await getNextBatch(afterToken.value!);

          imagesData = nextBatchResponseDto.data;
        }

        // Add the images to the grid
        await placeNewImagesWithoutVirtualization({
          bottomInvisibleColumns,
          visibleColumns: visibleColumns.value,
          imagesData,
          GapAmount,
          columnWidth: columnWidth.value!,
          matchingSupportedCssPixelWidth: matchingSupportedCssPixelWidth.value,
          matchingSupportedDpr: matchingSupportedDpr.value,
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

      let havePreviouslySetAfterToken = false;

      // Setting the afterToken here because if we do it earlier, when the
      // afterToken is such that it indicates there's no more image for the
      // server to provide, that message is shown at the bottom and doesn't
      // flash before the penultimate batch gets appended.
      if (nextBatchResponseDto) {
        afterToken.value = nextBatchResponseDto.afterToken;
        havePreviouslySetAfterToken = true;
      }

      // Not using else-if and using havePreviouslySetAfterToken to avoid
      // potentially suppressing a bug.
      if (canUseInitialRenderingOptimization) {
        if (havePreviouslySetAfterToken) {
          console.error(
            'Setting afterToken from index.html after having set it from the response DTO.',
          );
        }
        afterToken.value = window.afterToken!;
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

// Page-level loading indicator-related code (start)
const haveProcessedInitialRetrieval: Ref<boolean> = ref(false);

const hasServerStatedNoMoreSubsequentBatches = computed(() => {
  return afterToken.value === null;
});
// Page-level loading indicator-related code (finish)

// Additional code for handling page resizing (start)
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
    previousAdElementRefByIdentifier = {};

    // Initialize further
    visibleColumns.value.push(...blankColumns(columnCount));
    topInvisibleColumns.push(...blankColumns(columnCount));
    bottomInvisibleColumns.push(...blankColumns(columnCount));

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
            itemBottom(column.at(-1)!) >
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
        return;
      }
    },
  );
}
// Additional code for handling page resizing (finish)

// Additional code for ensuring responsive images (start)

const matchingSupportedCssPixelWidth = computed(() => {
  return getMatchingSupportedCssPixelWidth(columnWidth.value);
});

const matchingSupportedDpr = computed(() => {
  return getMatchingSupportedDpr(devicePixelRatio.value);
});

// Additional code for ensuring responsive images (finish)

// Additional profiling code for subsequent batch loading indicator's seen
// count (start)

let seenSubsequentLoadingCount = 0;
let previousLoadingIndicatorIsIntersecting = false;
let haveObservedLoading = false;

const subsequentLoadingIndicatorObserver: IntersectionObserver =
  new IntersectionObserver((entries: Array<IntersectionObserverEntry>) => {
    if (
      entries[0]?.isIntersecting &&
      previousLoadingIndicatorIsIntersecting === false
    ) {
      seenSubsequentLoadingCount += 1;
      console.log(
        `seenLoadingIndicatorCount incremented to ${seenSubsequentLoadingCount}`,
      );
    }

    previousLoadingIndicatorIsIntersecting = entries[0]?.isIntersecting;
  });

async function ensureObservedSubsequentLoading(
  element: Element | ComponentPublicInstance | null,
) {
  if (!haveObservedLoading && element) {
    // This addresses the problem of the count being less than what it should
    // be by at least 1 in the case that the initial retrieval doesn't entirely
    // fill the page.
    await nextTick();
    subsequentLoadingIndicatorObserver.observe(
      (element as ComponentPublicInstance).$el as Element,
    );
    haveObservedLoading = true;
  }
}

let haveUnobservedLoading = false;

function ensureUnobservedSubsequentLoading(
  element: Element | ComponentPublicInstance | null,
): void {
  if (!haveUnobservedLoading && element) {
    subsequentLoadingIndicatorObserver.disconnect();
  }
}
// Additional profiling code for subsequent batch loading indicator's seen
// count (finish)

// Additional profiling code for ads seen fully (start)

const seenAdUrls = new Set<string>();

let previousAdElementRefByIdentifier: Record<string, Element | null>;

const seenAdFullyObserver: IntersectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      // TODO: Investigate more closely why the observer callback is initially
      // called without the image element being substantial. Furthermore,
      // see if this is a problem.
      const imageElement = entry.target as HTMLImageElement;
      const isPrematurelyInvokingObserverCallback =
        entry.intersectionRect.width === 0 &&
        entry.intersectionRect.height === 0;
      if (isPrematurelyInvokingObserverCallback) {
        return;
      }

      const fullUrl = new URL(imageElement.src);

      const justBecameFullyVisible =
        entry.isIntersecting && entry.intersectionRatio === 1;
      if (justBecameFullyVisible) {
        // Do whatever

        console.log(
          'Saw a new ad fully:',
          `${imageElement.dataset.adIdentifier}`,
        );

        seenAdUrls.add(fullUrl.pathname);

        seenAdFullyObserver.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 1,
  },
);

function ensureObserveAd(
  element: Element | ComponentPublicInstance | null,
  imageData: GridItemData,
): void {
  if (!imageData.adIdentifier) {
    return;
  }
  if (seenAdUrls.has(imageData.adIdentifier)) {
    return;
  }

  const previousRef = previousAdElementRefByIdentifier[imageData.adIdentifier];

  const isMounting = !previousRef && !!element;

  const isUnmounting = previousRef && element === null;

  (previousAdElementRefByIdentifier as any)[imageData.adIdentifier] = element;

  if (isMounting) {
    seenAdFullyObserver.observe(element as any);

    return;
  }

  if (isUnmounting) {
    const alreadyHandledUnobserve = seenAdUrls.has(imageData.adIdentifier);

    if (!alreadyHandledUnobserve) {
      seenAdFullyObserver.unobserve(previousRef!);
    }

    return;
  }

  if (previousRef && !!element && previousRef !== element) {
    console.error(
      `The ref for the ad ${imageData.adIdentifier} is consecutively non-nullable but not the same. This is problematic because we only observe the element associated with the ad's element ref when the ref just prior was null. We don't observe the element associated with the element ref when the ref just prior was also an element. This error being logged implies the latter case is occurring and that we're potentially losing observability of the ad's visibility change. The approach around the aforementioned observability needs to be re-evaluated.`,
    );
  }
}

// Additional profiling code for ads seen fully (finish)
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
      <!-- Ended up not using the approach of <picture> + <source> + <img>
        because for unknown reasons, it didn't seem to respond to changes in
        the DPR as a result of zooming in.

        Also, not relying on srcset and instead just on src seems to lead
        to easier verification of the embedded image URL when inspecting in
        DevTools.

        For posterity, leaving the alternative implementation as a comment,
        which is slightly outdated since it's before the using the custom
        Image component, introduced as part of an effort to clean up commits
        and publish them.:

        <picture>
          <source
            :key="srcSet"
            v-for="(
              { media, srcSet }
            ) in imageData.sourceData"
            :srcset="srcSet"
            :media="media"
          />
          <img
            :src="imageData.src"
            :alt="imageData.src"
            :style="computeStyle({ imageData, imageIndex, columnIndex })"
          "
          />
        </picture>

      -->
      <Image
        :key="imageData.src"
        v-for="(imageData, imageIndex) in column"
        :src="imageData.src"
        :styles="computeStyle({ imageData, imageIndex, columnIndex })"
        :adIdentifier="imageData.adIdentifier"
        @ref="ensureObserveAd($event, imageData)"
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
        :ref="ensureObservedSubsequentLoading"
      />
      <span v-else :ref="ensureUnobservedSubsequentLoading">
        There are no more images.
      </span>
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
