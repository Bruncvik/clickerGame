<script setup>
defineProps({
    value : String,
    currency: String
})
</script>

<template>
    <div class="stat">
        <p>{{ currency }}: {{ value }}</p>
    </div>
</template>

<style scoped>
.stat {
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
@media (max-width: 1300px) {
  .stat {
    padding-left: 1rem; padding-right: 1rem;
    padding-top: 0.5rem; padding-bottom: 0.5rem;
    font-size: 0.8rem;
  }
}
@media (max-width: 600px) {
  .stat {
    padding: 0.5rem 0.25rem;
    font-size: 0.7rem;
    justify-content: center;
  }
}
</style>