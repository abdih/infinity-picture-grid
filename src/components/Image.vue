<script setup lang="ts">
import { computed, ref } from "vue";

export interface Props {
  src: string;
  // Avoiding `style` because don't currently have the intention for it to
  // ever automatically get applied to the root element of this component and
  // I'm worried that since `class` does this, so will `style`.
  imgStyle: Record<string, string>;
}
const props = defineProps<Props>();

const isLoading = ref(true);

function handleImageLoaded() {
  isLoading.value = false;
}

const imgStyleFull = computed(() => {
  return { ...props.imgStyle, display: isLoading.value ? "none" : "unset" };
});
</script>
<template>
  <v-skeleton-loader
    v-if="isLoading"
    :style="props.imgStyle"
    type="image"
    color="grey"
  />
  <img @load="handleImageLoaded" :src="props.src" :style="imgStyleFull" />
</template>
<style lang="scss" scoped>
:deep(.v-skeleton-loader__image) {
  height: v-bind("$props.imgStyle.height");
}
</style>
