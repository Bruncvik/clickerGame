<script setup lang="ts">
import { ref } from 'vue';
import type { UpgradeItem } from '../types';

defineProps<{
  label: string;
  upgrades: UpgradeItem[];
}>();

const emit = defineEmits<{ buyUpgrade: [upgradeId: string] }>();

const expanded = ref(false);
</script>

<template>
  <div class="upgradeSection">
    <button class="sectionHeader" @click="expanded = !expanded">
      <span class="sectionTitle">{{ label }}</span>
      <span class="sectionToggle" :class="{ expanded }">▼</span>
    </button>
    <div v-if="expanded" class="upgradesList">
      <button
        v-for="u in upgrades"
        :key="u.id"
        class="upgradeButton"
        :class="{ purchased: u.purchased, unaffordable: !u.canAfford && !u.purchased }"
        :disabled="!u.canAfford || u.purchased"
        @click="emit('buyUpgrade', u.id)"
      >
        <span class="upgradeName">{{ u.name }}</span>
        <span class="upgradeDesc">{{ u.description }}</span>
        <span class="upgradeCost">{{ u.purchased ? 'Owned' : u.cost }}</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.upgradeSection {
  margin-bottom: 0.75rem;
}

.sectionHeader {
  width: 100%;
  border: none;
  background-color: var(--button-color);
  padding: 0.65rem 0.5rem;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0;
  border-bottom: 2px solid var(--border-color);
  font-family: inherit;
  color: inherit;
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
  font-size: 0.75rem;
}

.sectionToggle.expanded {
  transform: rotate(180deg);
}

.upgradesList {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  padding-top: 0.4rem;
}

.upgradeButton {
  border: none;
  background-color: var(--button-color);
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  padding: 0.75rem 0.6rem;
  cursor: pointer;
  text-align: left;
  transition: background-color 0.1s;
  font-family: inherit;
  color: inherit;
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

.upgradeName {
  font-size: 0.8rem;
  font-weight: bold;
}

.upgradeDesc {
  font-size: 0.7rem;
  opacity: 0.8;
}

.upgradeCost {
  font-size: 0.75rem;
  margin-top: 0.15rem;
}
</style>
