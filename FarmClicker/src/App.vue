<script setup lang="ts">
import MenuButton from "./components/MenuButton.vue";
import ShopIcon from "./assets/Shop_icon.png";
import CropsIcon from "./assets/Crops_icon.png";
import UpgradesIcon from "./assets/Upgrades_icon.png";
import MarketIcon from "./assets/Market_icon.png";
import SettingsIcon from "./assets/Settings_icon.png";
import AchievementsIcon from "./assets/Achievements_icon.png";
import CropField from "./components/CropField.vue";
import StatBar from "./components/StatBar.vue";
</script>

<template>
  <article class="app">
    <nav>
      <h1>Farm Clicker</h1>
      <header>
        <StatBar value="" currency="Gold"/>
        <StatBar value="" currency="Time per click"/>
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
      <section class="fields">
        <CropField class="crop"/>
        <CropField class="crop"/>
        <CropField class="crop"/>
        <CropField/>
        <CropField/>
        <CropField/>
        <CropField/>
        <CropField/>
        <CropField/>
      </section>
      <section class="menuButtons">
        <MenuButton
         :title="'Shop'"
          :icon="ShopIcon"
         />
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
.fields {
  display: grid;
  grid-template-columns: repeat(3, 150px);
  grid-template-rows: repeat(3, 150px);
  gap: 1rem;
  padding: 3rem;

  div {
    height: 100%;
    width: 100%;
    border: 4px solid black;
    box-sizing: border-box;
  }

  div:nth-child(1n + 4) {
    background-color: rgba(128, 128, 128, 0.419);
  }
}
.settings {
  background-image: url("./assets/Settings_icon.png");
  background-size: contain;
  background-repeat: no-repeat;
}
.market {
  background-image: url("./assets/Market_icon.png");
  background-size: contain;
  background-repeat: no-repeat;
}
.crops {
  background-image: url("./assets/Crops_icon.png");
  background-size: contain;
  background-repeat: no-repeat;
}
.crop {
  background-image: url("./assets/PotatoCrop.png");
  background-size: cover;
}
.upgrades {
  background-image: url("./assets/Upgrades_icon.png");
  background-size: contain;
  background-repeat: no-repeat;
}
.achievements {
  background-image: url("./assets/Achievements_icon.png");
  background-size: contain;
  background-repeat: no-repeat;
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
  .shop, .settings, .market, .crops, .upgrades, .achievements {
    height: 2rem;
    width: 2rem;
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
