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
import CropField from "./components/CropField.vue";
import StatBar from "./components/StatBar.vue";
import CropShopPopup from "./components/CropShopPopup.vue";
import { useGameStore } from "./stores/gameStore";

const gameStore = useGameStore();
const isShopOpen = ref(false);
const goldPulse = ref(false);
let timerId: number | null = null;
let goldPulseTimeoutId: number | null = null;

const cropImageById: Record<string, string[]> = {
  potato_seed: [PotatoCrop1, PotatoCrop2, PotatoCrop3],
};

const popupCrops = computed(() => {
  return gameStore.unlockedCrops.map((crop) => ({
    id: crop.id,
    name: crop.name,
    cost: crop.cost,
    icon: cropImageById[crop.id]?.[0] ?? PotatoCrop1,
    canAfford: gameStore.money >= crop.cost,
  }));
});

function toggleShop() {
  isShopOpen.value = !isShopOpen.value;
}

function selectCrop(cropId: string) {
  gameStore.selectCropForPlanting(cropId);
}

function selectField(fieldId: number) {
  gameStore.plantSelectedCrop(fieldId);
  isShopOpen.value = false;
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
  timerId = window.setInterval(() => {
    gameStore.updateNow();
    const gainedGold = gameStore.completeReadyFields();

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
});

onBeforeUnmount(() => {
  if (timerId !== null) {
    clearInterval(timerId);
  }

  if (goldPulseTimeoutId !== null) {
    clearTimeout(goldPulseTimeoutId);
  }
});
</script>

<template>
  <article class="app">
    <nav>
      <h1>Farm Clicker</h1>
      <header>
        <StatBar :value="gameStore.money" currency="Gold" :pulse="goldPulse"/>
        <StatBar value="3 minutes" currency="Time skip per click"/>
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
         <MenuButton
         :title="'Crops'"
          :icon="CropsIcon"
         />
         <MenuButton
         :title="'Upgrades'"
          :icon="UpgradesIcon"
         />
         <MenuButton
         :title="'Market'"
          :icon="MarketIcon"
         />
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

.fields {
  display: grid;
  grid-template-columns: repeat(3, 150px);
  grid-template-rows: repeat(3, 150px);
  gap: 1rem;
  padding: 3rem;
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
@media (max-width: 700px) {
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
