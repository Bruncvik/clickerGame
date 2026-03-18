<script setup>
    defineProps({
        class: String
    })
</script>

<template>
    <div :class="class">
    </div>
</template>

<style scoped>
div {
    height: 100%;
    width: 100%;
    border: 4px solid black;
    box-sizing: border-box;
  }

  div:nth-child(1n + 4) {
    background-color: rgba(128, 128, 128, 0.419);
  }
</style>