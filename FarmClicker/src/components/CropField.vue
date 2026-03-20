<script setup lang="ts">
const props = defineProps<{
    unlocked: boolean;
    cropImage: string | null;
    progress: number;
}>();

const emit = defineEmits<{
    selectField: [];
}>();

function handleClick(event: Event) {
    if (!props.unlocked || props.cropImage !== null) {
        return;
    }

    event.stopPropagation();
    emit("selectField");
}
</script>

<template>
    <div
      class="field"
      :class="{ locked: !unlocked }"
      :style="cropImage ? { backgroundImage: `url(${cropImage})` } : undefined"
      @click="handleClick"
    >
      <div v-if="unlocked" class="progressBarWrap">
        <div class="progressBar" :style="{ width: `${Math.floor(progress * 100)}%` }"></div>
      </div>
    </div>
</template>

<style scoped>
.field {
    height: 100%;
    width: 100%;
    border: 4px solid black;
    box-sizing: border-box;
    background-size: cover;
    background-position: center;
    position: relative;
    cursor: pointer;
}

.locked {
  background-color: rgba(128, 128, 128, 0.419);
  cursor: not-allowed;
}

.progressBarWrap {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 12px;
  border-top: 2px solid black;
  background-color: rgba(0, 0, 0, 0.3);
}

.progressBar {
  height: 100%;
  background-color: rgba(89, 212, 89, 0.85);
}
</style>