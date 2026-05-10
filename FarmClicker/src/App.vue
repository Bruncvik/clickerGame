<script setup lang="ts">
import { computed, ref } from 'vue';
import MenuButton from './components/MenuButton.vue';
import GameHeader from './components/GameHeader.vue';
import CropField from './components/CropField.vue';
import SidePanel from './components/SidePanel.vue';
import WelcomePopup from './components/WelcomePopup.vue';
import ShopIcon from './assets/Shop_icon.webp';
import CropsIcon from './assets/Crops_icon.webp';
import UpgradesIcon from './assets/Upgrades_icon.webp';
import MarketIcon from './assets/Market_icon.webp';
import SettingsIcon from './assets/Settings_icon.webp';
import AchievementsIcon from './assets/Achievements_icon.webp';
import RebirthIcon from './assets/Rebirth_icon.webp';
import { REBIRTH_THRESHOLD, useGameStore } from './stores/gameStore';
import { ACHIEVEMENT_DEFS } from './data/achievements';
import { useParticles } from './composables/useParticles';
import { useGameLoop } from './composables/useGameLoop';
import { cropImageById, autoIconById, getFieldCropImage } from './composables/useCropImages';

const gameStore = useGameStore();
const { burst } = useParticles();
const { goldPulse, offlineIncomeVisible, achievementToastData, criticalHarvestVisible } = useGameLoop();

const showWelcome = ref(localStorage.getItem('farm_clicker_welcomed') !== 'true');
function dismissWelcome() {
  showWelcome.value = false;
  localStorage.setItem('farm_clicker_welcomed', 'true');
}

const activePanelSection = ref<string | null>(null);

const CATEGORY_LABELS: Record<string, string> = {
  farming: 'Farming Milestones',
  gold:    'Gold Milestones',
  upgrade: 'Upgrade Milestones',
  time:    'Skipped Time Milestones',
  crops:   'Crop Collection',
};

const achievementGroups = computed(() =>
  ['farming', 'gold', 'upgrade', 'time', 'crops'].map(cat => ({
    key: cat,
    label: CATEGORY_LABELS[cat]!,
    items: ACHIEVEMENT_DEFS.filter(a => a.category === cat).map(a => ({
      id: a.id,
      name: a.name,
      description: a.description,
      earned: gameStore.earnedAchievementIds.includes(a.id),
    })),
  }))
);

const fieldEventMap = computed(() =>
  Object.fromEntries(gameStore.fieldEvents.map(e => [e.fieldId, e.type]))
);

const popupCrops = computed(() =>
  gameStore.unlockedCrops.map(crop => ({
    id: crop.id,
    name: crop.name,
    cost: crop.cost,
    icon: cropImageById[crop.id]?.[0] ?? '',
    canAfford: gameStore.money >= crop.cost,
  }))
);

const unlockedCropsList = computed(() =>
  gameStore.cropShopItems.map(crop => {
    const unlockCost = crop.unlockCost ?? crop.cost;
    return {
      id: crop.id,
      name: crop.name,
      cost: unlockCost,
      icon: cropImageById[crop.id]?.[0] ?? '',
      unlocked: crop.unlocked,
      canAfford: gameStore.money >= unlockCost,
    };
  })
);

const upgradesList = computed(() =>
  gameStore.upgrades.map(upgrade => {
    const displayCost = upgrade.type === 'auto'
      ? gameStore.autoClickerCurrentCost(upgrade.id)
      : upgrade.cost;
    return {
      id: upgrade.id,
      name: upgrade.name,
      description: upgrade.description,
      cost: displayCost,
      purchased: upgrade.purchased,
      canAfford: gameStore.money >= displayCost && gameStore.money - displayCost >= 25,
      type: upgrade.type,
      quantity: upgrade.quantity ?? 0,
    };
  })
);

function openPanel(section: string) {
  activePanelSection.value = activePanelSection.value === section ? null : section;
}

function onAppClick(e: MouseEvent) {
  burst(e.clientX, e.clientY);
  activePanelSection.value = null;
}

function onRebirth() {
  const nextGen = gameStore.generation + 1;
  const nextMult = (gameStore.goldMultiplier + 0.25).toFixed(2);
  const confirmed = window.confirm(
    `Rebirth to Generation ${nextGen}?\n\nAll progress (gold, crops, fields, upgrades, achievements) resets.\nYour Gold Multiplier will become ×${nextMult} permanently.`
  );
  if (confirmed) {
    gameStore.rebirth();
    activePanelSection.value = null;
    gameStore.initAutoClickers();
  }
}

function selectField(fieldId: number) {
  const resolved = gameStore.resolveFieldEvent(fieldId);
  if (resolved) return;
  gameStore.plantSelectedCrop(fieldId);
  activePanelSection.value = null;
}
</script>

<template>
  <article class="app" @click="onAppClick">
    <GameHeader :gold-pulse="goldPulse" :offline-income-visible="offlineIncomeVisible" />

    <main class="mainPage">
      <section class="menuButtons" @click.stop>
        <MenuButton title="Achievements" :icon="AchievementsIcon" :active="activePanelSection === 'achievements'" @click="openPanel('achievements')" />
        <MenuButton title="Tutorial"     :icon="SettingsIcon"     :active="activePanelSection === 'tutorial'"     @click="openPanel('tutorial')" />
        <MenuButton title="Rebirth"      :icon="RebirthIcon"      :active="activePanelSection === 'rebirth'"      @click="openPanel('rebirth')" />
      </section>

      <section class="fields" @click.stop="gameStore.skipTime()">
        <CropField
          v-for="field in gameStore.fields"
          :key="field.id"
          :unlocked="field.unlocked"
          :crop-image="getFieldCropImage(field.cropId, gameStore.fieldProgress(field.id))"
          :progress="gameStore.fieldProgress(field.id)"
          :event="fieldEventMap[field.id] ?? null"
          @select-field="selectField(field.id)"
        />
        <div
          v-for="instance in gameStore.autoClickerInstances"
          :key="instance.instanceId"
          class="autoClickerVisual"
          :style="{ left: instance.x + '%', top: instance.y + '%' }"
        >
          <img
            v-if="autoIconById[instance.type]"
            :src="autoIconById[instance.type]"
            :alt="instance.type"
            class="autoVisualImg"
          />
        </div>
      </section>

      <section class="menuButtons" @click.stop>
        <MenuButton title="Shop"     :icon="ShopIcon"     :active="activePanelSection === 'shop'"     @click="openPanel('shop')" />
        <MenuButton title="Crops"    :icon="CropsIcon"    :active="activePanelSection === 'crops'"    @click="openPanel('crops')" />
        <MenuButton title="Upgrades" :icon="UpgradesIcon" :active="activePanelSection === 'upgrades'" @click="openPanel('upgrades')" />
        <MenuButton title="Market"   :icon="MarketIcon"   :active="activePanelSection === 'market'"   @click="openPanel('market')" />
      </section>

      <SidePanel
        v-if="activePanelSection !== null"
        :active-section="activePanelSection"
        :shop-crops="popupCrops"
        :selected-crop-id="gameStore.selectedCropId"
        :crop-unlock-items="unlockedCropsList"
        :upgrades="upgradesList"
        :achievement-groups="achievementGroups"
        :generation="gameStore.generation"
        :gold-multiplier="gameStore.goldMultiplier"
        :can-rebirth="gameStore.canRebirth"
        :total-gold-earned="gameStore.totalGoldEarned"
        :rebirth-threshold="REBIRTH_THRESHOLD"
        @close="activePanelSection = null"
        @select-crop="gameStore.selectCropForPlanting($event)"
        @buy-crop="gameStore.buyCrop($event)"
        @buy-upgrade="gameStore.buyUpgrade($event)"
        @rebirth="onRebirth"
      />
    </main>

    <WelcomePopup v-if="showWelcome" @close="dismissWelcome" />

    <Transition name="critical-toast">
      <div v-if="criticalHarvestVisible" class="criticalToast">
        <span class="criticalLabel">Critical Harvest!</span>
        <span class="criticalDesc">3× gold earned</span>
      </div>
    </Transition>

    <Transition name="achievement-toast">
      <div v-if="achievementToastData" class="achievementToast">
        <span class="toastLabel">Achievement Unlocked!</span>
        <span class="toastName">{{ achievementToastData.name }}</span>
        <span class="toastDesc">{{ achievementToastData.description }}</span>
      </div>
    </Transition>
  </article>
</template>

<style scoped>
.app {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.mainPage {
  height: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}

.menuButtons {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 1rem;
  margin: 2rem;
}

.fields {
  height: 100%;
  display: grid;
  grid-template-columns: repeat(3, 150px);
  grid-template-rows: repeat(3, 150px);
  gap: 1rem;
  padding: 3rem;
  position: relative;
}

.autoClickerVisual {
  position: absolute;
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: popIn 0.4s ease-out;
  pointer-events: none;
  z-index: 10;
  padding: 0;
  margin: 0;
}

.autoVisualImg {
  display: block;
  width: 80px;
  height: 80px;
  object-fit: contain;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
  margin: auto;
}

.criticalToast {
  position: fixed;
  bottom: 6rem;
  left: 50%;
  transform: translateX(-50%);
  padding: 0.6rem 1.1rem;
  border: 4px solid var(--border-color);
  background-color: #a8d45a;
  z-index: 200;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  pointer-events: none;
  white-space: nowrap;
}

.criticalLabel {
  font-size: 0.7rem;
  font-weight: bold;
  color: #2d5a00;
}

.criticalDesc {
  font-size: 0.55rem;
  color: #3a7000;
}

.achievementToast {
  position: fixed;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  padding: 0.75rem 1.25rem;
  border: 4px solid var(--border-color);
  background-color: #e8d28a;
  z-index: 200;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  pointer-events: none;
  white-space: nowrap;
}

.toastLabel {
  font-size: 0.55rem;
  color: #7a5a00;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.toastName {
  font-size: 0.7rem;
  font-weight: bold;
}

.toastDesc {
  font-size: 0.55rem;
  opacity: 0.75;
}

.critical-toast-enter-active,
.critical-toast-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.critical-toast-enter-from,
.critical-toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(0.5rem);
}

.achievement-toast-enter-active,
.achievement-toast-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.achievement-toast-enter-from,
.achievement-toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(0.75rem);
}

@keyframes popIn {
  0%   { opacity: 0; transform: scale(0.3); }
  100% { opacity: 1; transform: scale(1); }
}

@media (max-width: 1300px) {
  .fields {
    grid-template-columns: repeat(3, 100px);
    grid-template-rows: repeat(3, 100px);
  }
}

@media (max-width: 723px) {
  .fields {
    grid-template-columns: repeat(3, 70px);
    grid-template-rows: repeat(3, 70px);
    padding: 1rem;
  }
  .menuButtons {
    position: relative;
  }
}

@media (max-width: 600px) {
  .mainPage {
    flex-direction: column;
    gap: 0.5rem;

    .menuButtons {
      flex-direction: row;
      gap: 0.4rem;
      flex-wrap: wrap;
      justify-content: center;
      margin: 0;
    }
  }
}
</style>
