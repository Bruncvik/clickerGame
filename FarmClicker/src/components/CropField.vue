<script setup lang="ts">
const props = defineProps<{
    unlocked: boolean;
    cropImage: string | null;
    progress: number;
    event: 'golden' | 'withered' | null;
}>();

const emit = defineEmits<{
    selectField: [];
}>();

function handleClick(e: Event) {
    if (!props.unlocked) return;
    if (props.event) {
        e.stopPropagation();
        emit("selectField");
        return;
    }
    if (props.cropImage !== null) return;
    e.stopPropagation();
    emit("selectField");
}
</script>

<template>
    <div
      class="field"
      :class="{ locked: !unlocked, 'event-golden': event === 'golden', 'event-withered': event === 'withered' }"
      :style="cropImage ? { backgroundImage: `url(${cropImage})` } : undefined"
      @click="handleClick"
    >
      <div v-if="event === 'golden'" class="eventBadge golden">✨ Golden!</div>
      <div v-else-if="event === 'withered'" class="eventBadge withered">💀 Withered!</div>
      <div v-if="unlocked" class="progressBarWrap">
        <div class="progressBar" :style="{ width: `${Math.floor(progress * 100)}%` }"></div>
      </div>
    </div>
</template>

<style scoped>
.field {
    height: 100%;
    width: 100%;
    border: 4px solid rgb(121, 84, 0);
    box-sizing: border-box;
    background-size: cover;
    background-position: center;
    position: relative;
    cursor: pointer;
    background-image: url(../assets/Field_bg.webp);
}

.locked {
  background-image: url(../assets/LockedField_bg.webp);
  cursor: not-allowed;
}

.event-golden {
  box-shadow: inset 0 0 0 4px #ffd700;
  animation: pulseGold 1s ease-in-out infinite alternate;
}

.event-withered {
  box-shadow: inset 0 0 0 4px #8b0000;
  animation: pulseRed 0.6s ease-in-out infinite alternate;
  filter: saturate(0.4);
}

@keyframes pulseGold {
  from { box-shadow: inset 0 0 0 4px #ffd700; }
  to   { box-shadow: inset 0 0 12px 4px #ffd700; }
}

@keyframes pulseRed {
  from { box-shadow: inset 0 0 0 4px #8b0000; }
  to   { box-shadow: inset 0 0 12px 4px #ff2020; }
}

.eventBadge {
  position: absolute;
  top: 4px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 0.45rem;
  font-weight: bold;
  padding: 0.15rem 0.35rem;
  white-space: nowrap;
  pointer-events: none;
  z-index: 2;
  font-family: "Press Start 2P", monospace;
}

.eventBadge.golden {
  background: #ffd700;
  color: #5a3a00;
  border: 2px solid #b8860b;
}

.eventBadge.withered {
  background: #8b0000;
  color: #ffcccc;
  border: 2px solid #ff2020;
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