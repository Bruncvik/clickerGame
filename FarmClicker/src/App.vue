<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import MenuButton from "./components/MenuButton.vue";
import ShopIcon from "./assets/Shop_icon.webp";
import CropsIcon from "./assets/Crops_icon.webp";
import UpgradesIcon from "./assets/Upgrades_icon.webp";
import MarketIcon from "./assets/Market_icon.webp";
import SettingsIcon from "./assets/Settings_icon.webp";
import AchievementsIcon from "./assets/Achievements_icon.webp";
import PotatoCrop1 from "./assets/PotatoCrop1.webp";
import PotatoCrop2 from "./assets/PotatoCrop2.webp";
import PotatoCrop3 from "./assets/PotatoCrop3.webp";
import WheatCrop1 from "./assets/WheatCrop1.webp";
import WheatCrop2 from "./assets/WheatCrop2.webp";
import WheatCrop3 from "./assets/WheatCrop3.webp";
import CornCrop1 from "./assets/CornCrop1.webp";
import CornCrop2 from "./assets/CornCrop2.webp";
import CornCrop3 from "./assets/CornCrop3.webp";
import TulipCrop1 from "./assets/TulipCrop1.webp";
import TulipCrop2 from "./assets/TulipCrop2.webp";
import TulipCrop3 from "./assets/TulipCrop3.webp";
import PumpkinCrop1 from "./assets/PumpkinCrop1.webp";
import PumpkinCrop2 from "./assets/PumpkinCrop2.webp";
import PumpkinCrop3 from "./assets/PumpkinCrop3.webp";
import AppleCrop1 from "./assets/AppleCrop1.webp";
import AppleCrop2 from "./assets/AppleCrop2.webp";
import AppleCrop3 from "./assets/AppleCrop3.webp";
import CropField from "./components/CropField.vue";
import StatBar from "./components/StatBar.vue";
import SidePanel from "./components/SidePanel.vue";
import WelcomePopup from "./components/WelcomePopup.vue";
import { ACHIEVEMENT_DEFS } from "./stores/gameStore";
import Farmer_icon from "./assets/Farmer_icon.webp";
import Tractor_icon from "./assets/Tractor_icon.webp";
import AutoHarvester_icon from "./assets/AutoHarvester_icon.webp";
import { useGameStore } from "./stores/gameStore";
import { useParticles } from "./composables/useParticles";

const gameStore = useGameStore();
const { burst } = useParticles();

function onResetClick() {
  const confirmed = window.confirm("Are you sure you want to reset your progress? This cannot be undone.");
  if (!confirmed) return;
  gameStore.resetGame();
}

function addTestGold() {
  gameStore.money += 100;
}
const showWelcome = ref(localStorage.getItem('farm_clicker_welcomed') !== 'true');

function dismissWelcome() {
  showWelcome.value = false;
  localStorage.setItem('farm_clicker_welcomed', 'true');
}

const activePanelSection = ref<string | null>(null);
const goldPulse = ref(false);
const showOfflineIncomePopup = ref(false);
const achievementToast = ref<{ name: string; description: string } | null>(null);
const criticalHarvest = ref(false);
let lastEventSpawnAt = 0;
let timerId: number | null = null;
let goldPulseTimeoutId: number | null = null;
let offlineIncomePopupTimeoutId: number | null = null;
let achievementToastTimeoutId: number | null = null;
let criticalHarvestTimeoutId: number | null = null;
let saveOnExit: (() => void) | null = null;

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

const cropImageById: Record<string, string[]> = {
  potato_seed:  [PotatoCrop1,  PotatoCrop2,  PotatoCrop3],
  wheat_seed:   [WheatCrop1,   WheatCrop2,   WheatCrop3],
  corn_seed:    [CornCrop1,    CornCrop2,    CornCrop3],
  tulip_seed:   [TulipCrop1,   TulipCrop2,   TulipCrop3],
  pumpkin_seed: [PumpkinCrop1, PumpkinCrop2, PumpkinCrop3],
  apple_seed:   [AppleCrop1,   AppleCrop2,   AppleCrop3],
};

const autoIconById: Record<string, string> = {
  auto_person: Farmer_icon,
  auto_tractor: Tractor_icon,
  auto_harvester: AutoHarvester_icon,
};

const fieldEventMap = computed(() =>
  Object.fromEntries(gameStore.fieldEvents.map(e => [e.fieldId, e.type]))
);

const popupCrops = computed(() => {
  return gameStore.unlockedCrops.map((crop) => ({
    id: crop.id,
    name: crop.name,
    cost: crop.cost,
    icon: cropImageById[crop.id]?.[0] ?? '',
    canAfford: gameStore.money >= crop.cost,
  }));
});

const unlockedCropsList = computed(() => {
  return gameStore.cropShopItems.map((crop) => {
    const unlockCost = crop.unlockCost ?? crop.cost;
    return {
      id: crop.id,
      name: crop.name,
      cost: unlockCost,
      icon: cropImageById[crop.id]?.[0] ?? '',
      unlocked: crop.unlocked,
      canAfford: gameStore.money >= unlockCost,
    };
  });
});

const upgradesList = computed(() => {
  return gameStore.upgrades.map((upgrade) => {
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
  });
});

function openPanel(section: string) {
  activePanelSection.value = activePanelSection.value === section ? null : section;
}

function closeAllPopups() {
  activePanelSection.value = null;
}

function onDocClick(e: MouseEvent) {
  burst(e.clientX, e.clientY);
}

function showAchievementNotification(id: string) {
  const def = ACHIEVEMENT_DEFS.find(a => a.id === id);
  if (!def) return;
  if (achievementToastTimeoutId !== null) clearTimeout(achievementToastTimeoutId);
  achievementToast.value = def;
  achievementToastTimeoutId = window.setTimeout(() => {
    achievementToast.value = null;
    achievementToastTimeoutId = null;
  }, 4000);
}

function selectCrop(cropId: string) {
  gameStore.selectCropForPlanting(cropId);
}

function selectField(fieldId: number) {
  const resolved = gameStore.resolveFieldEvent(fieldId);
  if (resolved) return;
  gameStore.plantSelectedCrop(fieldId);
  activePanelSection.value = null;
}

function buyCrop(cropId: string) {
  gameStore.buyCrop(cropId);
}

function buyUpgrade(upgradeId: string) {
  gameStore.buyUpgrade(upgradeId);
}

function skipTime() {
  gameStore.skipTime();
}

function getFieldCropImage(cropId: string | null, progress: number) {
  if (!cropId) {
    return null;
  }

  const stageImages = cropImageById[cropId];

  if (!stageImages) {
    return null;
  }

  if (progress >= 0.66) {
    return stageImages[2] ?? stageImages[0] ?? null;
  }

  if (progress >= 0.33) {
    return stageImages[1] ?? stageImages[0] ?? null;
  }

  return stageImages[0] ?? null;
}

onMounted(() => {
  if (gameStore.offlineIncomeGained > 0) {
    showOfflineIncomePopup.value = true;

    offlineIncomePopupTimeoutId = window.setTimeout(() => {
      showOfflineIncomePopup.value = false;
    }, 3000);
  }

  timerId = window.setInterval(() => {
    gameStore.updateNow();
    gameStore.tickFieldEvents();

    const now = Date.now();
    if (now - lastEventSpawnAt > 30_000 + Math.random() * 30_000) {
      gameStore.spawnFieldEvent();
      lastEventSpawnAt = now;
    }

    // Apply passive income
    gameStore.money += gameStore.passiveIncomePerSecond;
    
    const { gainedGold, critical } = gameStore.completeReadyFields();

    if (critical) {
      criticalHarvest.value = true;
      if (criticalHarvestTimeoutId !== null) clearTimeout(criticalHarvestTimeoutId);
      criticalHarvestTimeoutId = window.setTimeout(() => {
        criticalHarvest.value = false;
        criticalHarvestTimeoutId = null;
      }, 1800);
    }

    gameStore.checkAchievements();
    if (gameStore.pendingAchievements.length > 0) {
      showAchievementNotification(gameStore.pendingAchievements.shift()!);
    }

    gameStore.persistProgress();

    if (gainedGold > 0) {
      goldPulse.value = false;

      if (goldPulseTimeoutId !== null) {
        clearTimeout(goldPulseTimeoutId);
      }

      requestAnimationFrame(() => {
        goldPulse.value = true;
      });

      goldPulseTimeoutId = window.setTimeout(() => {
        goldPulse.value = false;
      }, 350);
    }
  }, 1000);

  saveOnExit = () => {
    gameStore.persistProgress();
  };

  window.addEventListener('beforeunload', saveOnExit);
  document.addEventListener('visibilitychange', saveOnExit);
  document.addEventListener('click', closeAllPopups);
  document.addEventListener('click', onDocClick);

  // start auto-clickers based on purchased upgrades
  gameStore.initAutoClickers();
});

onBeforeUnmount(() => {
  if (timerId !== null) {
    clearInterval(timerId);
  }

  if (goldPulseTimeoutId !== null) {
    clearTimeout(goldPulseTimeoutId);
  }

  if (offlineIncomePopupTimeoutId !== null) {
    clearTimeout(offlineIncomePopupTimeoutId);
  }

  if (achievementToastTimeoutId !== null) {
    clearTimeout(achievementToastTimeoutId);
  }

  if (criticalHarvestTimeoutId !== null) {
    clearTimeout(criticalHarvestTimeoutId);
  }

  gameStore.persistProgress();

  if (saveOnExit) {
    window.removeEventListener('beforeunload', saveOnExit);
    document.removeEventListener('visibilitychange', saveOnExit);
  }

  document.removeEventListener('click', closeAllPopups);
  document.removeEventListener('click', onDocClick);
});
</script>

<template>
  <article class="app">
    <nav>
      <h1>Farm Clicker</h1>
      <header>
        <div class="goldStatWrap">
          <StatBar :value="gameStore.money" currency="Gold" :pulse="goldPulse"/>
          <div v-if="showOfflineIncomePopup" class="offlineIncomePopup">
            +{{ Math.round(gameStore.offlineIncomeGained * 100) / 100 }} while away
          </div>
        </div>
        <StatBar :value="`${gameStore.timePerClickMinutes} minutes`" currency="Time per click"/>
        <button class="resetButton" @click="onResetClick">Reset</button>
          <button class="testButton" @click="addTestGold">+100 Gold</button>
        <div class="autoClickersWrap">
          <span v-for="u in gameStore.upgrades.filter(x => x.type === 'auto' && x.purchased)" :key="u.id" class="autoIcon">
            {{ autoIconById[u.id] ?? 'đź¤–' }}
          </span>
        </div>
      </header>
    </nav>
    <main class="mainPage">
      <section class="menuButtons" @click.stop>
        <MenuButton
          :title="'Achievements'"
          :icon="AchievementsIcon"
          @click="openPanel('achievements')"
        />
        <MenuButton
          :title="'Tutorial'"
          :icon="SettingsIcon"
          @click="openPanel('tutorial')"
        />
      </section>
      <section class="fields" @click="skipTime">
        <CropField
          v-for="field in gameStore.fields"
          :key="field.id"
          :unlocked="field.unlocked"
          :crop-image="getFieldCropImage(field.cropId, gameStore.fieldProgress(field.id))"
          :progress="gameStore.fieldProgress(field.id)"
          :event="fieldEventMap[field.id] ?? null"
          @select-field="selectField(field.id)"
        />
        <!-- Auto-clicker visuals -->
        <div v-for="instance in gameStore.autoClickerInstances" :key="instance.instanceId" 
             class="autoClickerVisual" 
             :style="{ left: instance.x + '%', top: instance.y + '%' }">
          <img 
            v-if="autoIconById[instance.type]"
            :src="autoIconById[instance.type]" 
            :alt="instance.type" 
            class="autoVisualImg"
          />
        </div>
      </section>
      <section class="menuButtons" @click.stop>
        <MenuButton :title="'Shop'"     :icon="ShopIcon"     :active="activePanelSection === 'shop'"     @click="openPanel('shop')" />
        <MenuButton :title="'Crops'"    :icon="CropsIcon"    :active="activePanelSection === 'crops'"    @click="openPanel('crops')" />
        <MenuButton :title="'Upgrades'" :icon="UpgradesIcon" :active="activePanelSection === 'upgrades'" @click="openPanel('upgrades')" />
        <MenuButton :title="'Market'"   :icon="MarketIcon"   :active="activePanelSection === 'market'"   @click="openPanel('market')" />
      </section>
      <SidePanel
        v-if="activePanelSection !== null"
        :active-section="activePanelSection"
        :shop-crops="popupCrops"
        :selected-crop-id="gameStore.selectedCropId"
        :crop-unlock-items="unlockedCropsList"
        :upgrades="upgradesList"
        :achievement-groups="achievementGroups"
        @close="activePanelSection = null"
        @select-crop="selectCrop"
        @buy-crop="buyCrop"
        @buy-upgrade="buyUpgrade"
      />
    </main>
    <WelcomePopup v-if="showWelcome" @close="dismissWelcome" />
    <Transition name="critical-toast">
      <div v-if="criticalHarvest" class="criticalToast">
        <span class="criticalLabel">Critical Harvest!</span>
        <span class="criticalDesc">3× gold earned</span>
      </div>
    </Transition>
    <Transition name="achievement-toast">
      <div v-if="achievementToast" class="achievementToast">
        <span class="toastLabel">Achievement Unlocked!</span>
        <span class="toastName">{{ achievementToast.name }}</span>
        <span class="toastDesc">{{ achievementToast.description }}</span>
      </div>
    </Transition>
  </article>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
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

.resetButton {
  margin-left: 1rem;
  padding: 0.35rem 0.6rem;
  border-radius: 6px;
  border: 2px solid var(--border-color);
  background: #7a2f2f;
  color: #fff;
  font-weight: 700;
  cursor: pointer;
}

.resetButton:active {
  transform: translateY(1px);
}

.autoClickersWrap {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  margin-left: 0.75rem;
}
.autoIconBadge {
  position: relative;
  display: inline-flex;
  align-items: center;
}
.autoIcon {
  width: 32px;
  height: 32px;
  object-fit: contain;
  padding: 0.1rem;
  background: rgba(255,255,255,0.06);
  border-radius: 6px;
  border: 2px solid var(--border-color);
}
.autoIconBadge .quantity {
  position: absolute;
  top: -6px;
  right: -4px;
  background: #d4af37;
  color: #000;
  font-size: 0.55rem;
  font-weight: bold;
  padding: 0.1rem 0.25rem;
  border-radius: 3px;
  border: 1px solid var(--border-color);
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

.autoClickerVisual img,
.autoVisualImg {
  display: block !important;
  width: 80px;
  height: 80px;
  object-fit: contain;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
  margin: auto;
}

@keyframes popIn {
  0% {
    opacity: 0;
    transform: scale(0.3);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes fadeAway {
  0% {
    opacity: 0;
    transform: translateY(-50%) translateX(-6px);
  }
  12% {
    opacity: 1;
    transform: translateY(-50%) translateX(0);
  }
  80% {
    opacity: 1;
  }
  100% {
    opacity: 0;
    transform: translateY(-50%) translateX(6px);
  }
}

.menuButtons {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 1rem;
  margin: 2rem;
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

.critical-toast-enter-active,
.critical-toast-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.critical-toast-enter-from,
.critical-toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(0.5rem);
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

.achievement-toast-enter-active,
.achievement-toast-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.achievement-toast-enter-from,
.achievement-toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(0.75rem);
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
@media (max-width: 1300px) {
  .fields {
    grid-template-columns: repeat(3, 100px);
    grid-template-rows: repeat(3, 100px);
  }
  .button {
    padding-left: 1rem; padding-right: 1rem;
    padding-top: 0.5rem; padding-bottom: 0.5rem;
    font-size: 0.8rem;
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
    gap: 2rem;

    .menuButtons {
      flex-direction: row;
      gap: 1rem;
      flex-wrap: wrap;
    }
  }
  header {
    flex-direction: column;
     gap: 1rem;
  }
}
</style>
