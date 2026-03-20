<script setup lang="ts">
type CropPopupItem = {
  id: string;
  name: string;
  cost: number;
  icon: string;
  canAfford: boolean;
};

defineProps<{
  crops: CropPopupItem[];
  selectedCropId: string | null;
}>();

const emit = defineEmits<{
  selectCrop: [cropId: string];
}>();
</script>

<template>
  <aside class="shopPopup">
    <h3>Crops</h3>
    <div class="cropIcons">
      <button
        v-for="crop in crops"
        :key="crop.id"
        class="cropButton"
        :class="{ selected: selectedCropId === crop.id }"
        :disabled="!crop.canAfford"
        @click="emit('selectCrop', crop.id)"
      >
        <div class="icon" :style="{ backgroundImage: `url(${crop.icon})` }"></div>
        <span>{{ crop.cost }}</span>
      </button>
    </div>
  </aside>
</template>

<style scoped>
.shopPopup {
  position: absolute;
  right: 100%;
  top: 0;
  margin-right: 0.75rem;
  width: 170px;
  padding: 0.75rem;
  border: 4px solid var(--border-color);
  background-color: var(--button-color);
  z-index: 5;
}

h3 {
  margin: 0 0 0.75rem;
  font-size: 0.8rem;
}

.cropIcons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.cropButton {
  width: 68px;
  border: 3px solid var(--border-color);
  background-color: var(--button-color);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem;
  cursor: pointer;
}

.cropButton:hover {
  background-color: var(--button-hover-color);
}

.cropButton.selected {
  outline: 3px solid var(--border-color);
}

.cropButton:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.icon {
  width: 42px;
  height: 42px;
  background-size: cover;
  background-position: center;
}

span {
  font-size: 0.65rem;
}

@media (max-width: 700px) {
  .shopPopup {
    left: 50%;
    right: auto;
    top: auto;
    bottom: calc(100% + 0.5rem);
    transform: translateX(-50%);
    margin-right: 0;
  }
}
</style>
