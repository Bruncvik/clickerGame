<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import MenuButton from "./components/MenuButton.vue";
import ShopIcon from "./assets/Shop_icon.png";
import CropsIcon from "./assets/Crops_icon.png";
import UpgradesIcon from "./assets/Upgrades_icon.png";
import MarketIcon from "./assets/Market_icon.png";
import SettingsIcon from "./assets/Settings_icon.png";
import AchievementsIcon from "./assets/Achievements_icon.png";
import PotatoCrop1 from "./assets/PotatoCrop1.png";
import PotatoCrop2 from "./assets/PotatoCrop2.png";
import PotatoCrop3 from "./assets/PotatoCrop3.png";
import WheatCrop1 from "./assets/WheatCrop1.png";
import WheatCrop2 from "./assets/WheatCrop2.png";
import WheatCrop3 from "./assets/WheatCrop3.png";
import CropField from "./components/CropField.vue";
import StatBar from "./components/StatBar.vue";
import CropShopPopup from "./components/CropShopPopup.vue";
import CropPopup from "./components/CropPopup.vue";
import UpgradesPopup from "./components/UpgradesPopup.vue";
import MarketPopup from "./components/MarketPopup.vue";
import Farmer_icon from "./assets/Farmer_icon.png";
import Tractor_icon from "./assets/Tractor_icon.png";
import AutoHarvester_icon from "./assets/AutoHarvester_icon.png";
import { useGameStore } from "./stores/gameStore";

const gameStore = useGameStore();

function onResetClick() {
  const confirmed = window.confirm("Are you sure you want to reset your progress? This cannot be undone.");
  if (!confirmed) return;
  gameStore.resetGame();
}

function addTestGold() {
  gameStore.money += 100;
}
const isShopOpen = ref(false);
const isCropsOpen = ref(false);
const isUpgradesOpen = ref(false);
const isMarketOpen = ref(false);
const goldPulse = ref(false);
const showOfflineIncomePopup = ref(false);
let timerId: number | null = null;
let goldPulseTimeoutId: number | null = null;
let offlineIncomePopupTimeoutId: number | null = null;
let saveOnExit: (() => void) | null = null;

const cropImageById: Record<string, string[]> = {
  potato_seed: [PotatoCrop1, PotatoCrop2, PotatoCrop3],
  wheat_seed: [WheatCrop1, WheatCrop2, WheatCrop3],
};

const autoIconById: Record<string, string> = {
  auto_person: Farmer_icon,
  auto_tractor: Tractor_icon,
  auto_harvester: AutoHarvester_icon,
};

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
  return gameStore.cropShopItems.map((crop) => ({
    id: crop.id,
    name: crop.name,
    cost: crop.cost,
    icon: cropImageById[crop.id]?.[0] ?? '',
    unlocked: crop.unlocked,
    canAfford: gameStore.money >= crop.cost,
  }));
});

const upgradesList = computed(() => {
  return gameStore.upgrades.map((upgrade) => ({
    id: upgrade.id,
    name: upgrade.name,
    description: upgrade.description,
    cost: upgrade.cost,
    purchased: upgrade.purchased,
    canAfford: gameStore.money >= upgrade.cost && gameStore.money - upgrade.cost >= 25,
    type: upgrade.type,
    quantity: upgrade.quantity ?? 0,
  }));
});

function toggleShop() {
  isShopOpen.value = !isShopOpen.value;
  if (isShopOpen.value) {
    isCropsOpen.value = false;
    isUpgradesOpen.value = false;
  }
}

function toggleCropsPopup() {
  isCropsOpen.value = !isCropsOpen.value;
  if (isCropsOpen.value) {
    isShopOpen.value = false;
    isUpgradesOpen.value = false;
  }
}

function toggleUpgradesPopup() {
  isUpgradesOpen.value = !isUpgradesOpen.value;
  if (isUpgradesOpen.value) {
    isShopOpen.value = false;
    isCropsOpen.value = false;
    isMarketOpen.value = false;
  }
}

function toggleMarketPopup() {
  isMarketOpen.value = !isMarketOpen.value;
  if (isMarketOpen.value) {
    isShopOpen.value = false;
    isCropsOpen.value = false;
    isUpgradesOpen.value = false;
  }
}

function selectCrop(cropId: string) {
  gameStore.selectCropForPlanting(cropId);
}

function selectField(fieldId: number) {
  gameStore.plantSelectedCrop(fieldId);
  isShopOpen.value = false;
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
    
    // Apply passive income
    gameStore.money += gameStore.passiveIncomePerSecond;
    
    const gainedGold = gameStore.completeReadyFields();

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

  gameStore.persistProgress();

  if (saveOnExit) {
    window.removeEventListener('beforeunload', saveOnExit);
    document.removeEventListener('visibilitychange', saveOnExit);
  }
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
            {{ autoIconById[u.id] ?? '🤖' }}
          </span>
        </div>
      </header>
    </nav>
    <main class="mainPage">
      <section class="menuButtons">
        <MenuButton
         :title="'Achievements'"
          :icon="AchievementsIcon"
         />
         <MenuButton
         :title="'Settings'"
          :icon="SettingsIcon"
         />
      </section>
      <section class="fields" @click="skipTime">
        <CropField
          v-for="field in gameStore.fields"
          :key="field.id"
          :unlocked="field.unlocked"
          :crop-image="getFieldCropImage(field.cropId, gameStore.fieldProgress(field.id))"
          :progress="gameStore.fieldProgress(field.id)"
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
      <section class="menuButtons">
        <div class="shopAnchor">
          <MenuButton
           :title="'Shop'"
            :icon="ShopIcon"
            @click="toggleShop"
           />
          <CropShopPopup
            v-if="isShopOpen"
            :crops="popupCrops"
            :selected-crop-id="gameStore.selectedCropId"
            @select-crop="selectCrop"
          />
        </div>
        <div class="cropsAnchor">
         <MenuButton
         :title="'Crops'"
          :icon="CropsIcon"
          @click="toggleCropsPopup"
         />
         <CropPopup
           v-if="isCropsOpen"
           :crops="unlockedCropsList"
           @buy-crop="buyCrop"
         />
        </div>
        <div class="upgradesAnchor">
         <MenuButton
         :title="'Upgrades'"
          :icon="UpgradesIcon"
          @click="toggleUpgradesPopup"
         />
         <UpgradesPopup
           v-if="isUpgradesOpen"
           :upgrades="upgradesList.filter(u => u.type !== 'auto')"
           @buy-upgrade="buyUpgrade"
         />
        </div>
        <div class="marketAnchor">
         <MenuButton
         :title="'Market'"
          :icon="MarketIcon"
          @click="toggleMarketPopup"
         />
         <MarketPopup
           v-if="isMarketOpen"
           :upgrades="upgradesList.filter(u => u.type === 'auto')"
           @buy-upgrade="buyUpgrade"
         />
        </div>
      </section>
    </main>
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

.shopAnchor {
  position: relative;
}

.cropsAnchor {
  position: relative;
}

.upgradesAnchor {
  position: relative;
}

.marketAnchor {
  position: relative;
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
