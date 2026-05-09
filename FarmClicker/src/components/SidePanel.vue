<script setup lang="ts">
import { computed, ref } from 'vue';

type CropShopItem = {
  id: string;
  name: string;
  cost: number;
  icon: string;
  canAfford: boolean;
};

type CropUnlockItem = {
  id: string;
  name: string;
  cost: number;
  icon: string;
  unlocked: boolean;
  canAfford: boolean;
};

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

type AchievementItem = {
  id: string;
  name: string;
  description: string;
  earned: boolean;
};

type AchievementGroup = {
  key: string;
  label: string;
  items: AchievementItem[];
};

const props = defineProps<{
  activeSection: string;
  shopCrops: CropShopItem[];
  selectedCropId: string | null;
  cropUnlockItems: CropUnlockItem[];
  upgrades: UpgradeItem[];
  achievementGroups: AchievementGroup[];
}>();

const emit = defineEmits<{
  close: [];
  selectCrop: [cropId: string];
  buyCrop: [cropId: string];
  buyUpgrade: [upgradeId: string];
}>();

const SECTION_TITLES: Record<string, string> = {
  shop:         'Shop',
  crops:        'Crops',
  upgrades:     'Upgrades',
  market:       'Market',
  achievements: 'Achievements',
};

const expandedSections = ref<Record<string, boolean>>({
  field:  false,
  boost:  false,
  income: false,
});

const toggleSection = (section: string) => {
  expandedSections.value[section] = !expandedSections.value[section];
};

const nonAutoUpgrades = computed(() => props.upgrades.filter(u => u.type !== 'auto'));
const autoUpgrades    = computed(() => props.upgrades.filter(u => u.type === 'auto'));
</script>

<template>
  <aside class="sidePanel" @click.stop>
    <!-- Header -->
    <div class="panelHeader">
      <h3>{{ SECTION_TITLES[activeSection] ?? activeSection }}</h3>
      <button class="closeBtn" @click="emit('close')">✕</button>
    </div>

    <!-- Content -->
    <div class="panelContent">

      <!-- ── SHOP ── -->
      <template v-if="activeSection === 'shop'">
        <p v-if="shopCrops.length === 0" class="emptyMsg">No crops unlocked yet.</p>
        <div class="cropGrid">
          <button
            v-for="crop in shopCrops"
            :key="crop.id"
            class="cropButton"
            :class="{ selected: selectedCropId === crop.id }"
            :disabled="!crop.canAfford"
            @click="emit('selectCrop', crop.id)"
          >
            <div class="cropIcon" :style="{ backgroundImage: `url(${crop.icon})` }"></div>
            <span class="cropName">{{ crop.name }}</span>
            <span class="cropCost">{{ crop.cost }}</span>
          </button>
        </div>
      </template>

      <!-- ── CROPS ── -->
      <template v-else-if="activeSection === 'crops'">
        <div class="cropGrid">
          <button
            v-for="crop in cropUnlockItems"
            :key="crop.id"
            class="cropButton"
            :class="{ unlocked: crop.unlocked }"
            :disabled="!crop.canAfford || crop.unlocked"
            @click="emit('buyCrop', crop.id)"
          >
            <div class="cropIcon" :style="{ backgroundImage: `url(${crop.icon})` }"></div>
            <span class="cropName">{{ crop.name }}</span>
            <span class="cropCost">{{ crop.unlocked ? 'Owned' : crop.cost }}</span>
          </button>
        </div>
      </template>

      <!-- ── UPGRADES ── -->
      <template v-else-if="activeSection === 'upgrades'">
        <div v-if="nonAutoUpgrades.some(u => u.type === 'field' || !u.type)" class="upgradeSection">
          <button class="sectionHeader" @click="toggleSection('field')">
            <span class="sectionTitle">Fields</span>
            <span class="sectionToggle" :class="{ expanded: expandedSections.field }">▼</span>
          </button>
          <div v-if="expandedSections.field" class="upgradesList">
            <button
              v-for="u in nonAutoUpgrades.filter(u => u.type === 'field' || !u.type)"
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

        <div v-if="nonAutoUpgrades.some(u => u.type === 'boost')" class="upgradeSection">
          <button class="sectionHeader" @click="toggleSection('boost')">
            <span class="sectionTitle">Boosts</span>
            <span class="sectionToggle" :class="{ expanded: expandedSections.boost }">▼</span>
          </button>
          <div v-if="expandedSections.boost" class="upgradesList">
            <button
              v-for="u in nonAutoUpgrades.filter(u => u.type === 'boost')"
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

        <div v-if="nonAutoUpgrades.some(u => u.type === 'income')" class="upgradeSection">
          <button class="sectionHeader" @click="toggleSection('income')">
            <span class="sectionTitle">Income</span>
            <span class="sectionToggle" :class="{ expanded: expandedSections.income }">▼</span>
          </button>
          <div v-if="expandedSections.income" class="upgradesList">
            <button
              v-for="u in nonAutoUpgrades.filter(u => u.type === 'income')"
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

      <!-- ── MARKET ── -->
      <template v-else-if="activeSection === 'market'">
        <div class="upgradesList">
          <button
            v-for="u in autoUpgrades"
            :key="u.id"
            class="upgradeButton"
            :class="{
              purchased: (u.quantity ?? 0) >= 10,
              unaffordable: !u.canAfford && (u.quantity ?? 0) < 10
            }"
            :disabled="!u.canAfford || (u.quantity ?? 0) >= 10"
            @click="emit('buyUpgrade', u.id)"
          >
            <span class="upgradeName">{{ u.name }}</span>
            <span class="upgradeDesc">{{ u.description }}</span>
            <span class="upgradeCost">{{ (u.quantity ?? 0) >= 10 ? 'Max' : u.cost }}</span>
            <span class="upgradeQty">Owned: {{ u.quantity ?? 0 }}/10</span>
          </button>
        </div>
      </template>

      <!-- ── ACHIEVEMENTS ── -->
      <template v-else-if="activeSection === 'achievements'">
        <div v-for="group in achievementGroups" :key="group.key" class="achievementGroup">
          <h4 class="groupTitle">{{ group.label }}</h4>
          <div class="achievementsList">
            <div
              v-for="item in group.items"
              :key="item.id"
              class="achievementItem"
              :class="{ earned: item.earned }"
            >
              <span class="achievementStar">{{ item.earned ? '★' : '☆' }}</span>
              <div class="achievementInfo">
                <span class="achievementName">{{ item.name }}</span>
                <span class="achievementDesc">{{ item.description }}</span>
              </div>
            </div>
          </div>
        </div>
      </template>

    </div>
  </aside>
</template>

<style scoped>
.sidePanel {
  position: fixed;
  right: 0;
  top: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  width: 340px;
  border-left: 4px solid var(--border-color);
  background-color: var(--button-color);
  box-sizing: border-box;
  z-index: 50;
  overflow: hidden;
}

.panelHeader {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.6rem 0.75rem;
  border-bottom: 4px solid var(--border-color);
  flex-shrink: 0;
}

.panelHeader h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: bold;
}

.closeBtn {
  background: none;
  border: 2px solid var(--border-color);
  cursor: pointer;
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  color: inherit;
  line-height: 1;
}

.closeBtn:hover {
  background-color: var(--button-hover-color);
}

.panelContent {
  flex: 1;
  overflow-y: auto;
  padding: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

/* ── Shared crop grid ── */
.cropGrid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.cropButton {
  border: 2px solid var(--border-color);
  width: 90px;
  background-color: var(--button-color);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.35rem;
  padding: 0.5rem;
  cursor: pointer;
}

.cropButton:hover:not(:disabled) {
  background-color: var(--button-hover-color);
}

.cropButton.selected,
.cropButton.unlocked {
  background-color: var(--button-selected-color);
}

.cropButton:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.cropIcon {
  width: 54px;
  height: 54px;
  background-size: cover;
  background-position: center;
}

.cropName,
.cropCost {
  font-size: 0.7rem;
}

.emptyMsg {
  font-size: 0.75rem;
  opacity: 0.6;
  margin: 0;
}

/* ── Shared upgrade styles ── */
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

.upgradeQty {
  font-size: 0.7rem;
  color: #d4af37;
  font-weight: bold;
  background: rgba(212, 175, 55, 0.15);
  padding: 0.2rem 0.4rem;
  margin-top: 0.2rem;
  display: inline-block;
}

/* ── Achievements ── */
.achievementGroup {
  margin-bottom: 0.75rem;
}

.groupTitle {
  font-size: 0.75rem;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0 0 0.5rem;
  padding-bottom: 0.4rem;
  border-bottom: 2px solid var(--border-color);
}

.achievementsList {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.achievementItem {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  padding: 0.5rem;
  filter: grayscale(100%);
  opacity: 0.45;
}

.achievementItem.earned {
  filter: none;
  opacity: 1;
  background-color: var(--button-selected-color);
}

.achievementStar {
  font-size: 1.2rem;
  flex-shrink: 0;
  line-height: 1.3;
}

.achievementInfo {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.achievementName {
  font-size: 0.75rem;
  font-weight: bold;
}

.achievementDesc {
  font-size: 0.65rem;
  opacity: 0.75;
}

@media (max-width: 600px) {
  .sidePanel {
    width: 100%;
    left: 0;
  }
}
</style>
