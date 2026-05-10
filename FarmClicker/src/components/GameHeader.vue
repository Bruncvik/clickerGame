<script setup lang="ts">
import StatBar from './StatBar.vue';
import { useGameStore } from '../stores/gameStore';
import { autoIconById } from '../composables/useCropImages';

defineProps<{
  goldPulse: boolean;
  offlineIncomeVisible: number | null;
}>();

const gameStore = useGameStore();
</script>

<template>
  <nav>
    <h1>Farm Clicker</h1>
    <header>
      <div class="goldStatWrap">
        <StatBar :value="gameStore.money" currency="Gold" :pulse="goldPulse" />
        <div v-if="offlineIncomeVisible !== null" class="offlineIncomePopup">
          +{{ Math.round((offlineIncomeVisible ?? 0) * 100) / 100 }} while away
        </div>
      </div>
      <StatBar :value="`${gameStore.timePerClickMinutes} minutes`" currency="Time per click" />
      <div v-if="gameStore.generation > 0" class="genBadge">
        Gen {{ gameStore.generation }} · ×{{ gameStore.goldMultiplier.toFixed(2) }}
      </div>
      <div class="autoClickersWrap">
        <img
          v-for="u in gameStore.upgrades.filter(x => x.type === 'auto' && x.purchased)"
          :key="u.id"
          :src="autoIconById[u.id]"
          :alt="u.name"
          class="autoIcon"
        />
      </div>
    </header>
  </nav>
</template>

<style scoped>
nav {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
}

header {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  gap: 5rem;
}

.goldStatWrap {
  position: relative;
  display: inline-flex;
}

.offlineIncomePopup {
  position: absolute;
  left: calc(100% + 0.5rem);
  top: 50%;
  transform: translateY(-50%);
  padding: 0.45rem 0.6rem;
  border: 4px solid var(--border-color);
  background-color: #e8d28a;
  font-size: 0.65rem;
  white-space: nowrap;
  animation: fadeAway 3s ease forwards;
  pointer-events: none;
}

@keyframes fadeAway {
  0%   { opacity: 0; transform: translateY(-50%) translateX(-6px); }
  12%  { opacity: 1; transform: translateY(-50%) translateX(0); }
  80%  { opacity: 1; }
  100% { opacity: 0; transform: translateY(-50%) translateX(6px); }
}

.genBadge {
  font-size: 0.6rem;
  padding: 0.3rem 0.6rem;
  background: #5a1f7a;
  color: #e8c8ff;
  font-weight: bold;
  border: 2px solid var(--border-color);
  white-space: nowrap;
}

.autoClickersWrap {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  margin-left: 0.75rem;
}

.autoIcon {
  width: 32px;
  height: 32px;
  object-fit: contain;
  padding: 0.1rem;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 6px;
  border: 2px solid var(--border-color);
}

@media (max-width: 600px) {
  nav {
    padding: 0.5rem 0.75rem;
  }
  nav h1 {
    font-size: 0.9rem;
    margin: 0 0 0.4rem;
  }
  header {
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.3rem;
    font-size: 0.55rem;
  }
  .genBadge {
    font-size: 0.5rem;
    padding: 0.2rem 0.4rem;
  }
}
</style>
