<script setup lang="ts">
const props = defineProps({
    title: String,
    icon: String
})
</script>

<template>
    <div class="button">
          <p>{{ title }}</p>
          <div class="icon" :style="{ backgroundImage: `url(${icon})` }"></div>
        </div>
</template>

<style>
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
  margin-right: 0.5rem;
  background-size: contain;
  background-repeat: no-repeat;
}
</style>