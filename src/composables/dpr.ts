import { onMounted, onUnmounted, Ref, ref } from "vue";

export function useDevicePixelRatio() {
  let remove: null | (() => void) = null;

  const devicePixelRatio: Ref<number> = ref(window.devicePixelRatio);

  const updateDevicePixelRatio = () => {
    devicePixelRatio.value = window.devicePixelRatio;
    if (remove != null) {
      remove();
    }

    const mediaQueryString = `(resolution: ${window.devicePixelRatio}dppx)`;
    const media = matchMedia(mediaQueryString);
    media.addEventListener("change", updateDevicePixelRatio);
    remove = () => {
      media.removeEventListener("change", updateDevicePixelRatio);
    };
  };

  onMounted(() => {
    updateDevicePixelRatio();
  });

  onUnmounted(() => {
    if (remove) {
      remove();
    }
  });

  return {
    devicePixelRatio,
  };
}
