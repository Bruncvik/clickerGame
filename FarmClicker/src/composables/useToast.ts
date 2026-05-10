import { ref, readonly } from 'vue';

export function useToast<T>(durationMs: number) {
  const value = ref<T | null>(null);
  let timeoutId: number | null = null;

  function show(data: T) {
    if (timeoutId !== null) clearTimeout(timeoutId);
    value.value = data;
    timeoutId = window.setTimeout(() => {
      value.value = null;
      timeoutId = null;
    }, durationMs);
  }

  function clear() {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    value.value = null;
  }

  return { value: readonly(value), show, clear };
}
