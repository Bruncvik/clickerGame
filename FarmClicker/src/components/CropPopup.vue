<script setup lang="ts">
type CropUnlockItem = {
  id: string;
  name: string;
  cost: number;
  icon: string;
  unlocked: boolean;
  canAfford: boolean;
};

defineProps<{
  crops: CropUnlockItem[];
}>();

const emit = defineEmits<{
  buyCrop: [cropId: string];
}>();
</script>

<template>
  <aside class="cropPopup">
    <h3>Unlock Crops</h3>
    <div class="cropIcons">
      <button
        v-for="crop in crops"
        :key="crop.id"
        class="cropButton"
        :class="{ unlocked: crop.unlocked }"
        :disabled="!crop.canAfford || crop.unlocked"
        @click="emit('buyCrop', crop.id)"
      >
        <span>{{ crop.name }}</span>
        <div class="icon" :style="{ backgroundImage: `url(${crop.icon})` }"></div>
        <span>{{ crop.unlocked ? 'Owned' : crop.cost }}</span>
      </button>
    </div>
  </aside>
</template>

<style scoped>
.cropPopup {
  position: absolute;
  right: 100%;
  top: 0;
  margin-right: 0.75rem;
  width: 200px;
  padding: 0.75rem;
  border: 4px solid var(--border-color);
  background-color: var(--button-color);
  z-index: 5;
  box-sizing: border-box;
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
  border: none;
  width: 68px;
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

.cropButton.unlocked {
  background-color: var(--button-selected-color);
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
  .cropPopup {
    right: auto;
    top: auto;
    bottom: calc(100% + 0.5rem);
    transform: translateX(-50%);
    margin-right: 0;
  }
}

@media (max-width: 600px) {
  .cropPopup {
    left: 50%;
  }
}
</style>
