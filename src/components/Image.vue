<script setup lang="ts">
import { computed, ref } from 'vue';

export interface Props {
  src: string;
  // Avoiding `style` because don't currently have the intention for it to
  // ever automatically get applied to the root element of this component and
  // I'm worried that since `class` does this, so will `style`.
  styles: Record<string, string>;
  adIdentifier: string | undefined;
}
const props = defineProps<Props>();

const isLoading = ref(true);

function handleImageLoaded() {
  isLoading.value = false;
}

const imageStyle = computed(() => {
  const styles = {} as Record<string, string>;

  styles.width = '100%';
  styles.height = '100%';

  if (isLoading.value) {
    styles.display = 'none';
  }

  return styles;
});
</script>
<template>
  <!-- A motivating factor behind there being a container around both the
  skeleton loader and the img elements as opposed to it just being around the
  img and advertisement elements is that it without it, it appears that
  the `v-skeleton-loader`'s `v-if` condition can evaluate to false (due to
  isLoading getting turned off) but at the same time for the `img`'s
  `display` to still stay as `"none"`, thereby causing an undesirably shift
  in column items. -->
  <div :style="props.styles" class="container">
    <v-skeleton-loader
      :style="'height: 100%; width: 100%'"
      v-if="isLoading"
      type="image"
      color="grey"
    />
    <img @load="handleImageLoaded" :style="imageStyle" :src="src" />
    <h6 class="advertisement" v-if="!isLoading && adIdentifier">
      Advertisement
    </h6>
  </div>
</template>
<style lang="scss" scoped>
:deep(.v-skeleton-loader__image) {
  height: v-bind('styles.height');
}

.container {
  container: imageContainer / inline-size;
  display: flex;
  justify-content: center;
  align-items: center;
  align-content: center;
  position: relative;
}

.advertisement {
  position: absolute;
  width: 100%;
  text-align: center;

  @container (width <= 71px) {
    // max-width is necessary because the current architecture is with respect
    // to innerWidth, which includes the scrollbar, and so the ellipsis can be
    // hidden under the scrollbar.
    //
    // The alternative to refactor everything to use clientWidth at this time
    // is unreasonable, assuming it's unequivocally better in the first place.
    max-width: 80%;
    text-align: start;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}
</style>
