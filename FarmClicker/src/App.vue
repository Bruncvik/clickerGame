<script setup lang="ts">
</script>

<template>
  <article class="app">
    <nav>
      <h1>Farm Clicker</h1>
      <header>
        <div class="stat">
          <p>Gold: --var--</p>
        </div>
        <div class="stat">
          <p>Time per click: --var--</p>
        </div>
      </header>
    </nav>
    <main class="mainPage">
      <section class="menuButtons">
        <div class="button">
          <p>achievements</p>
          <div class="icon achievements"></div>
        </div>
        <div class="button">
          <p>settings</p>
          <div class="icon settings"></div>
        </div>
      </section>
      <section class="fields">
        <div class="crop"></div>
        <div class="crop"></div>
        <div class="crop"></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </section>
      <section class="menuButtons">
        <div class="button">
          <p>shop</p>
          <div class="icon shop"></div>
        </div>
        <div class="button">
          <p>crops</p>
          <div class="icon crops"></div>
        </div>
        <div class="button">
          <p>upgrades</p>
          <div class="icon upgrades"></div>
        </div>
        <div class="button">
          <p>market</p>
          <div class="icon market"></div>
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

.button {
  padding-left: 2rem; padding-right: 2rem;
  padding-top: 1rem; padding-bottom: 1rem;
  background-color: var(--button-color);
  border: 4px solid var(--border-color);
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;

  &:hover {
    background-color: var(--button-hover-color);
  }
}
.stat {
  padding-left: 2rem; padding-right: 2rem;
  padding-top: 1rem; padding-bottom: 1rem;
  background-color: var(--button-color);
  border: 4px solid var(--border-color);
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;

  &:hover {
    background-color: var(--button-hover-color);
  }
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
.icon {
  height: 3rem;
  width: 3rem;
  margin-right: 0.5rem;
}
.shop {
  background-image: url("./assets/Shop_icon.png");
  background-size: contain;
  background-repeat: no-repeat;
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
  .stat {
    padding-left: 1rem; padding-right: 1rem;
    padding-top: 0.5rem; padding-bottom: 0.5rem;
    font-size: 0.8rem;
  }
}
@media (max-width: 1000px) {
  .button {
    p {
      display: none;
    }
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
@media (max-width: 540px) {
  .mainPage {
    flex-direction: column;
    gap: 2rem;

    .menuButtons {
      flex-direction: row;
      gap: 1rem;
      flex-wrap: wrap;
    }
  }
}
</style>
