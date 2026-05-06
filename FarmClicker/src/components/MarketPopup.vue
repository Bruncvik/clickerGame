<script setup lang="ts">

type UpgradeItem = {
  id: string;
  name: string;
  description: string;
  cost: number;
  purchased: boolean;
  canAfford: boolean;
  type?: string;
  quantity?: number;
};

defineProps<{
  upgrades: UpgradeItem[];
}>();

const emit = defineEmits<{
  buyUpgrade: [upgradeId: string];
}>();
</script>

<template>
  <aside class="marketPopup">
    <h3>Market</h3>
    
    <div class="upgradesList">
      <button
        v-for="upgrade in upgrades"
        :key="upgrade.id"
        class="upgradeButton"
        :class="{ 
          purchased: (upgrade.quantity ?? 0) >= 10, 
          unaffordable: !upgrade.canAfford && (upgrade.quantity ?? 0) < 10 
        }"
        :disabled="!upgrade.canAfford || (upgrade.quantity ?? 0) >= 10"
        @click="emit('buyUpgrade', upgrade.id)"
      >
        <div class="upgradeContent">
          <span class="upgradeName">{{ upgrade.name }}</span>
          <span class="upgradeDesc">{{ upgrade.description }}</span>
          <span class="upgradeCost">{{ (upgrade.quantity ?? 0) >= 10 ? 'Max' : upgrade.cost }}</span>
          <span class="upgradeQty">Owned: {{ upgrade.quantity ?? 0 }}/10</span>
        </div>
      </button>
    </div>
  </aside>
</template>

<style scoped>
.marketPopup {
  position: absolute;
  right: 100%;
  top: 0;
  margin-right: 0.75rem;
  width: 300px;
  max-height: 400px;
  padding: 0.75rem;
  border: 4px solid var(--border-color);
  background-color: var(--button-color);
  z-index: 5;
  box-sizing: border-box;
  overflow-y: auto;
  will-change: transform;
}

h3 {
  margin: 0 0 0.75rem;
  font-size: 0.9rem;
  font-weight: bold;
}

.upgradesList {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.upgradeButton {
  border: none;
  background-color: var(--button-color);
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0.5rem;
  cursor: pointer;
  text-align: left;
  transition: background-color 0.1s;
}

.upgradeButton:hover:not(:disabled) {
  background-color: var(--button-hover-color);
}

.upgradeButton.purchased {
  background-color: var(--button-selected-color);
}

.upgradeButton:disabled {
  cursor: not-allowed;
}

.upgradeButton.unaffordable {
  filter: grayscale(100%);
  opacity: 0.6;
}

.upgradeContent {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.upgradeName {
  font-size: 0.7rem;
  font-weight: bold;
}

.upgradeDesc {
  font-size: 0.6rem;
  opacity: 0.8;
}

.upgradeCost {
  font-size: 0.65rem;
  margin-top: 0.15rem;
}

.upgradeQty {
  font-size: 0.6rem;
  color: #d4af37;
  font-weight: bold;
  display: inline-block;
  background: rgba(212, 175, 55, 0.15);
  padding: 0.2rem 0.4rem;
  border-radius: 3px;
  margin-top: 0.25rem;
}

@media (max-width: 700px) {
  .marketPopup {
    right: auto;
    top: auto;
    bottom: calc(100% + 0.5rem);
    transform: translateX(-50%);
    margin-right: 0;
    width: 280px;
  }
}

@media (max-width: 600px) {
  .marketPopup {
    left: 50%;
  }
}
</style>
