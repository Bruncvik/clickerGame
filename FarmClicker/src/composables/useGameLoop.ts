import { onBeforeUnmount, onMounted, ref } from 'vue';
import { useGameStore } from '../stores/gameStore';
import { ACHIEVEMENT_DEFS } from '../data/achievements';
import { useToast } from './useToast';

export function useGameLoop() {
  const gameStore = useGameStore();

  const goldPulse = ref(false);
  const offlineIncomePopup = useToast<number>(3000);
  const achievementToast = useToast<{ name: string; description: string }>(4000);
  const criticalHarvestToast = useToast<true>(1800);

  let lastEventSpawnAt = 0;
  let timerId: number | null = null;
  let goldPulseTimeoutId: number | null = null;
  let saveOnExit: (() => void) | null = null;

  function showAchievementNotification(id: string) {
    const def = ACHIEVEMENT_DEFS.find(a => a.id === id);
    if (def) achievementToast.show(def);
  }

  onMounted(() => {
    if (gameStore.offlineIncomeGained > 0) {
      offlineIncomePopup.show(gameStore.offlineIncomeGained);
    }

    timerId = window.setInterval(() => {
      gameStore.updateNow();
      gameStore.tickFieldEvents();

      const now = Date.now();
      if (now - lastEventSpawnAt > 30_000 + Math.random() * 30_000) {
        gameStore.spawnFieldEvent();
        lastEventSpawnAt = now;
      }

      gameStore.money += gameStore.passiveIncomePerSecond * gameStore.goldMultiplier;

      const { gainedGold, critical } = gameStore.completeReadyFields();
      if (critical) criticalHarvestToast.show(true);

      gameStore.checkAchievements();
      if (gameStore.pendingAchievements.length > 0) {
        showAchievementNotification(gameStore.pendingAchievements.shift()!);
      }

      gameStore.persistProgress();

      if (gainedGold > 0) {
        goldPulse.value = false;
        if (goldPulseTimeoutId !== null) clearTimeout(goldPulseTimeoutId);
        requestAnimationFrame(() => { goldPulse.value = true; });
        goldPulseTimeoutId = window.setTimeout(() => { goldPulse.value = false; }, 350);
      }
    }, 1000);

    saveOnExit = () => { gameStore.persistProgress(); };
    window.addEventListener('beforeunload', saveOnExit);
    document.addEventListener('visibilitychange', saveOnExit);

    gameStore.initAutoClickers();
  });

  onBeforeUnmount(() => {
    if (timerId !== null) clearInterval(timerId);
    if (goldPulseTimeoutId !== null) clearTimeout(goldPulseTimeoutId);

    offlineIncomePopup.clear();
    achievementToast.clear();
    criticalHarvestToast.clear();

    gameStore.persistProgress();

    if (saveOnExit) {
      window.removeEventListener('beforeunload', saveOnExit);
      document.removeEventListener('visibilitychange', saveOnExit);
    }
  });

  return {
    goldPulse,
    offlineIncomeVisible: offlineIncomePopup.value,
    achievementToastData: achievementToast.value,
    criticalHarvestVisible: criticalHarvestToast.value,
  };
}
