<script setup lang="ts">
import { computed, ref } from "vue";

export interface Props {
  src: string;
  style: Record<string, string>;
}
const props = defineProps<Props>();

const isLoading = ref(true);

function handleImageLoaded() {
  isLoading.value = false;
}

const imageStyle = computed(() => {
  return { ...props.style, display: isLoading.value ? "none" : "unset" };
});
</script>
<template>
  <div
    :style="{
      ...props.style,
      display: 'flex',
      justifyContent: 'center',
      'align-items': 'center',
      'align-content': 'center',
    }"
    v-if="isLoading"
  >
    <v-skeleton-loader
      min-height="100%"
      min-width="100%"
      type="image"
      color="grey"
    />
  </div>
  <img
    ref="imageElement"
    @load="handleImageLoaded"
    :src="props.src"
    :style="imageStyle"
  />
</template>
<style lang="scss" scoped>
:deep(.v-skeleton-loader__image) {
  height: v-bind("$props.style.height");
}
</style>
