<script setup lang="ts">
const emit = defineEmits<{ close: [] }>();
</script>

<template>
  <div class="overlay" @click.self="emit('close')">
    <div class="popup">
      <h2 class="title">Welcome to<br>Farm Clicker!</h2>
      <p class="subtitle">Grow crops, skip time, build your farm empire.</p>

      <ol class="steps">
        <li>
          <span class="stepNum">1</span>
          <div class="stepText">
            <strong>Open the Shop</strong>
            <span>Select a crop to plant, then click an empty field.</span>
          </div>
        </li>
        <li>
          <span class="stepNum">2</span>
          <div class="stepText">
            <strong>Click the grid with fields</strong>
            <span>Every click skips time — crops grow and harvest automatically.</span>
          </div>
        </li>
        <li>
          <span class="stepNum">3</span>
          <div class="stepText">
            <strong>Spend your gold</strong>
            <span>Unlock better crops, buy field upgrades, and hire auto-harvesters.</span>
          </div>
        </li>
        <li>
          <span class="stepNum">!</span>
          <div class="stepText">
            <strong>Watch your fields</strong>
            <span>Random events appear — click a glowing field before it withers!</span>
          </div>
        </li>
      </ol>

      <p class="hint">Full details in the <strong>Tutorial</strong> button anytime.</p>

      <button class="startBtn" @click="emit('close')">Start Farming!</button>
    </div>
  </div>
</template>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.65);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 300;
}

.popup {
  background: var(--button-color);
  border: 4px solid var(--border-color);
  padding: 2rem 2.25rem;
  max-width: 480px;
  width: 90vw;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  box-sizing: border-box;
}

.title {
  margin: 0;
  font-size: 1rem;
  line-height: 1.6;
  text-align: center;
}

.subtitle {
  margin: 0;
  font-size: 0.62rem;
  text-align: center;
  opacity: 0.8;
}

.steps {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.steps li {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}

.stepNum {
  flex-shrink: 0;
  width: 1.4rem;
  height: 1.4rem;
  background: var(--border-color);
  color: var(--button-color);
  font-size: 0.6rem;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stepText {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.stepText strong {
  font-size: 0.65rem;
}

.stepText span {
  font-size: 0.55rem;
  opacity: 0.8;
  line-height: 1.6;
}

.hint {
  margin: 0;
  font-size: 0.55rem;
  text-align: center;
  opacity: 0.7;
}

.startBtn {
  align-self: center;
  padding: 0.75rem 1.5rem;
  background: var(--border-color);
  color: var(--button-color);
  border: none;
  font-family: inherit;
  font-size: 0.7rem;
  cursor: pointer;
  transition: opacity 0.15s;
}

.startBtn:hover {
  opacity: 0.85;
}
</style>
