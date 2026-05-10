<script setup lang="ts">
const props = defineProps<{
    title: string;
    icon: string;
    active?: boolean;
}>()
</script>

<template>
    <div class="button" :class="{ active: props.active }">
          <p>{{ title }}</p>
          <div class="icon" :style="{ backgroundImage: `url(${icon})` }"></div>
        </div>
</template>

<style scoped>
.button {
  padding-left: 2rem; padding-right: 2rem;
  padding-top: 1rem; padding-bottom: 1rem;
  background-color: var(--button-color);
  border: 4px solid var(--border-color);
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;

  &:hover {
    background-color: var(--button-hover-color);
  }

  &.active {
    background-color: var(--button-selected-color);
  }
}
@media (max-width: 1000px) {
  .button {
    p {
      display: none;
    }
  }
}
.icon {
  height: 3rem;
  width: 3rem;
  background-size: contain;
  background-repeat: no-repeat;
}
@media (max-width: 600px) {
  .button {
    padding: 0.4rem;
    border-width: 2px;
  }
  .icon {
    height: 2rem;
    width: 2rem;
  }
}
</style>