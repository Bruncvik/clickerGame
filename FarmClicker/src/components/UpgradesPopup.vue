<script setup lang="ts">
import { ref } from 'vue';

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

const expandedSections = ref<Record<string, boolean>>({
  field: false,
  boost: false,
  income: false,
});

const toggleSection = (section: string) => {
  expandedSections.value[section] = !expandedSections.value[section];
};
</script>

<template>
  <aside class="upgradesPopup">
    <h3>Upgrades</h3>
    
    <!-- Fields Section -->
    <div class="upgradeSection" v-if="upgrades.some(u => u.type === 'field' || !u.type)">
      <button class="sectionHeader" @click="toggleSection('field')">
        <span class="sectionTitle">Fields</span>
        <span class="sectionToggle" :class="{ expanded: expandedSections.field }">▼</span>
      </button>
      <div v-if="expandedSections.field" class="upgradesList">
        <button
          v-for="upgrade in upgrades.filter(u => u.type === 'field' || !u.type)"
          :key="upgrade.id"
          class="upgradeButton"
          :class="{ purchased: upgrade.purchased, unaffordable: !upgrade.canAfford && !upgrade.purchased }"
          :disabled="!upgrade.canAfford || upgrade.purchased"
          @click="emit('buyUpgrade', upgrade.id)"
        >
          <div class="upgradeContent">
            <span class="upgradeName">{{ upgrade.name }}</span>
            <span class="upgradeDesc">{{ upgrade.description }}</span>
            <span class="upgradeCost">{{ upgrade.purchased ? 'Owned' : upgrade.cost }}</span>
          </div>
        </button>
      </div>
    </div>

    <!-- Boosts Section -->
    <div class="upgradeSection" v-if="upgrades.some(u => u.type === 'boost')">
      <button class="sectionHeader" @click="toggleSection('boost')">
        <span class="sectionTitle">Boosts</span>
        <span class="sectionToggle" :class="{ expanded: expandedSections.boost }">▼</span>
      </button>
      <div v-if="expandedSections.boost" class="upgradesList">
        <button
          v-for="upgrade in upgrades.filter(u => u.type === 'boost')"
          :key="upgrade.id"
          class="upgradeButton"
          :class="{ purchased: upgrade.purchased, unaffordable: !upgrade.canAfford && !upgrade.purchased }"
          :disabled="!upgrade.canAfford || upgrade.purchased"
          @click="emit('buyUpgrade', upgrade.id)"
        >
          <div class="upgradeContent">
            <span class="upgradeName">{{ upgrade.name }}</span>
            <span class="upgradeDesc">{{ upgrade.description }}</span>
            <span class="upgradeCost">{{ upgrade.purchased ? 'Owned' : upgrade.cost }}</span>
          </div>
        </button>
      </div>
    </div>

    <!-- Income Section -->
    <div class="upgradeSection" v-if="upgrades.some(u => u.type === 'income')">
      <button class="sectionHeader" @click="toggleSection('income')">
        <span class="sectionTitle">Income</span>
        <span class="sectionToggle" :class="{ expanded: expandedSections.income }">▼</span>
      </button>
      <div v-if="expandedSections.income" class="upgradesList">
        <button
          v-for="upgrade in upgrades.filter(u => u.type === 'income')"
          :key="upgrade.id"
          class="upgradeButton"
          :class="{ purchased: upgrade.purchased, unaffordable: !upgrade.canAfford && !upgrade.purchased }"
          :disabled="!upgrade.canAfford || upgrade.purchased"
          @click="emit('buyUpgrade', upgrade.id)"
        >
          <div class="upgradeContent">
            <span class="upgradeName">{{ upgrade.name }}</span>
            <span class="upgradeDesc">{{ upgrade.description }}</span>
            <span class="upgradeCost">{{ upgrade.purchased ? 'Owned' : upgrade.cost }}</span>
          </div>
        </button>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.upgradesPopup {
  position: absolute;
  right: 100%;
  bottom: -50%;
  margin-right: 0.75rem;
  width: 300px;
  max-height: min(600px, calc(100vh - 8rem));
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

.upgradeSection {
  margin-bottom: 1rem;
}

.sectionHeader {
  width: 100%;
  border: none;
  background-color: var(--button-color);
  padding: 0.5rem;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0;
  border-bottom: 2px solid var(--border-color);
}

.sectionHeader:hover {
  background-color: var(--button-hover-color);
}

.sectionTitle {
  flex: 1;
  text-align: left;
}

.sectionToggle {
  transition: transform 0.2s;
  font-size: 0.6rem;
}

.sectionToggle.expanded {
  transform: rotate(180deg);
}

.upgradesList {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding-top: 0.5rem;
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

@media (max-width: 700px) {
  .upgradesPopup {
    right: auto;
    top: auto;
    bottom: calc(100% + 0.5rem);
    transform: translateX(-50%);
    margin-right: 0;
    width: 280px;
  }
}

@media (max-width: 600px) {
  .upgradesPopup {
    left: 50%;
  }
}
</style>
