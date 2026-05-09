<script setup lang="ts">
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

defineProps<{
  groups: AchievementGroup[];
}>();
</script>

<template>
  <aside class="achievementsPopup">
    <h3>Achievements</h3>
    <div v-for="group in groups" :key="group.key" class="achievementGroup">
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
  </aside>
</template>

<style scoped>
.achievementsPopup {
  position: absolute;
  left: 100%;
  top: 0;
  margin-left: 0.75rem;
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

.achievementGroup {
  margin-bottom: 1rem;
}

.groupTitle {
  font-size: 0.65rem;
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
  gap: 0.4rem;
}

.achievementItem {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  padding: 0.4rem;
  filter: grayscale(100%);
  opacity: 0.45;
}

.achievementItem.earned {
  filter: none;
  opacity: 1;
  background-color: var(--button-selected-color);
}

.achievementStar {
  font-size: 1rem;
  flex-shrink: 0;
  line-height: 1.2;
}

.achievementInfo {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.achievementName {
  font-size: 0.65rem;
  font-weight: bold;
}

.achievementDesc {
  font-size: 0.55rem;
  opacity: 0.75;
}

@media (max-width: 700px) {
  .achievementsPopup {
    left: auto;
    top: auto;
    bottom: calc(100% + 0.5rem);
    transform: translateX(-50%);
    margin-left: 0;
    width: 280px;
  }
}

@media (max-width: 600px) {
  .achievementsPopup {
    left: 50%;
  }
}
</style>
