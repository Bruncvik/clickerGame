import { defineStore } from 'pinia';
import type { CropType, Field, UpgradeType, AutoClickerInstance } from '../types';
export type { AchievementDef, AchievementCategory } from '../types';
import { CROP_DEFS } from '../data/crops';
import { UPGRADE_DEFS } from '../data/upgrades';

const GAME_STORAGE_KEY = 'farm-clicker-game-v1';
export const REBIRTH_THRESHOLD = 10_000;

const calculateFieldProgress = (field: Field, crop: CropType, now: number, totalSkippedMs: number) => {
  if (!field.cropId || !field.plantedAt) return 0;
  const skippedSincePlant = totalSkippedMs - (field.plantedSkippedMs ?? 0);
  const elapsed = (now - field.plantedAt) + Math.max(0, skippedSincePlant);
  return Math.max(0, Math.min(1, elapsed / crop.growDurationMs));
};

const createDefaultState = () => ({
  generation: 0,
  money: 25,
  timePerClickMinutes: 5,
  passiveIncomePerSecond: 0,
  offlineIncomeGained: 0,
  lastSavedAt: Date.now(),
  now: Date.now(),
  totalSkippedMs: 0,
  selectedCropId: null as string | null,
  totalGoldEarned: 0,
  totalHarvests: 0,
  earnedAchievementIds: [] as string[],
  pendingAchievements: [] as string[],
  fieldEvents: [] as { id: string; fieldId: number; type: 'golden' | 'withered'; expiresAt: number }[],
  cropShopItems: structuredClone(CROP_DEFS) as CropType[],
  fields: Array.from({ length: 9 }, (_, i) => ({
    id: i, unlocked: i === 0, cropId: null, plantedAt: null, plantedSkippedMs: null,
  })) as Field[],
  upgrades: structuredClone(UPGRADE_DEFS) as UpgradeType[],
  autoClickerInstances: [] as AutoClickerInstance[],
});

let __autoClickerIntervalId: number | null = null;

const loadInitialState = () => {
  const defaults = createDefaultState();
  if (typeof window === 'undefined') return defaults;

  try {
    const rawState = localStorage.getItem(GAME_STORAGE_KEY);
    if (!rawState) return defaults;

    const parsedState = JSON.parse(rawState) as Partial<ReturnType<typeof createDefaultState>>;
    const savedLastSavedAt = parsedState.lastSavedAt ?? defaults.lastSavedAt;
    const offlineSeconds = Math.max(0, (Date.now() - savedLastSavedAt) / 1000);
    const savedGeneration = parsedState.generation ?? defaults.generation;
    const offlineMoney = offlineSeconds
      * (parsedState.passiveIncomePerSecond ?? defaults.passiveIncomePerSecond)
      * (1 + savedGeneration * 0.25);

    return {
      ...defaults,
      ...parsedState,
      money: (parsedState.money ?? defaults.money) + offlineMoney,
      offlineIncomeGained: offlineMoney,
      cropShopItems: defaults.cropShopItems.map(def => {
        const saved = parsedState.cropShopItems?.find(c => c.id === def.id);
        return saved ? { ...def, ...saved } : def;
      }),
      upgrades: defaults.upgrades.map(def => {
        const saved = parsedState.upgrades?.find(u => u.id === def.id);
        return saved ? { ...def, ...saved } : def;
      }),
      fields: (parsedState.fields ?? defaults.fields).map((field, i) => ({
        ...defaults.fields[i],
        ...field,
        plantedSkippedMs: field.plantedSkippedMs ?? null,
      })),
      lastSavedAt: Date.now(),
      now: Date.now(),
      generation: parsedState.generation ?? defaults.generation,
      totalGoldEarned: parsedState.totalGoldEarned ?? defaults.totalGoldEarned,
      totalHarvests: parsedState.totalHarvests ?? defaults.totalHarvests,
      earnedAchievementIds: Array.isArray(parsedState.earnedAchievementIds) ? parsedState.earnedAchievementIds : [],
      pendingAchievements: [],
      autoClickerInstances: parsedState.autoClickerInstances ?? [],
    };
  } catch {
    return defaults;
  }
};

export const useGameStore = defineStore('game', {
  state: () => loadInitialState(),

  actions: {
    spawnFieldEvent() {
      const eligible = this.fields.filter(f =>
        f.unlocked && f.cropId && !this.fieldEvents.some(e => e.fieldId === f.id)
      );
      if (eligible.length === 0) return;
      const field = eligible[Math.floor(Math.random() * eligible.length)]!;
      const type = Math.random() < 0.5 ? 'golden' : 'withered';
      this.fieldEvents.push({
        id: Math.random().toString(36).substring(2, 9),
        fieldId: field.id,
        type,
        expiresAt: Date.now() + (type === 'withered' ? 45_000 : 90_000),
      });
    },

    resolveFieldEvent(fieldId: number): 'golden' | 'withered' | null {
      const idx = this.fieldEvents.findIndex(e => e.fieldId === fieldId);
      if (idx === -1) return null;
      const type = this.fieldEvents[idx]!.type;
      this.fieldEvents.splice(idx, 1);
      return type;
    },

    tickFieldEvents() {
      const now = Date.now();
      for (const ev of this.fieldEvents.filter(e => e.expiresAt <= now)) {
        if (ev.type === 'withered') {
          const field = this.fields.find(f => f.id === ev.fieldId);
          if (field) { field.cropId = null; field.plantedAt = null; field.plantedSkippedMs = null; }
        }
      }
      this.fieldEvents = this.fieldEvents.filter(e => e.expiresAt > now);
    },

    persistProgress() {
      if (typeof window === 'undefined') return;
      localStorage.setItem(GAME_STORAGE_KEY, JSON.stringify({
        generation: this.generation,
        money: this.money,
        timePerClickMinutes: this.timePerClickMinutes,
        passiveIncomePerSecond: this.passiveIncomePerSecond,
        lastSavedAt: Date.now(),
        totalSkippedMs: this.totalSkippedMs,
        selectedCropId: this.selectedCropId,
        totalGoldEarned: this.totalGoldEarned,
        totalHarvests: this.totalHarvests,
        earnedAchievementIds: this.earnedAchievementIds,
        cropShopItems: this.cropShopItems,
        upgrades: this.upgrades,
        fields: this.fields,
        autoClickerInstances: this.autoClickerInstances,
      }));
    },

    resetGame() {
      this.stopAutoClickers();
      if (typeof window !== 'undefined') {
        try { localStorage.removeItem(GAME_STORAGE_KEY); } catch { /* ignore */ }
      }
      const defaults = createDefaultState();
      for (const key in defaults) (this as any)[key] = (defaults as any)[key];
      this.lastSavedAt = Date.now();
      this.now = Date.now();
      this.persistProgress();
    },

    updateNow() { this.now = Date.now(); },

    skipTime() { this.totalSkippedMs += this.timePerClickMinutes * 60 * 1000; },

    selectCropForPlanting(cropId: string) {
      const crop = this.cropShopItems.find(c => c.id === cropId);
      if (crop?.unlocked) this.selectedCropId = cropId;
    },

    plantSelectedCrop(fieldId: number) {
      const field = this.fields.find(f => f.id === fieldId);
      if (!field?.unlocked || field.cropId || !this.selectedCropId) return;
      const crop = this.cropShopItems.find(c => c.id === this.selectedCropId);
      if (!crop?.unlocked || this.money < crop.cost) return;
      this.money -= crop.cost;
      field.cropId = crop.id;
      field.plantedAt = Date.now();
      field.plantedSkippedMs = this.totalSkippedMs;
      this.now = Date.now();
      this.persistProgress();
    },

    completeReadyFields(): { gainedGold: number; critical: boolean } {
      let gainedGold = 0;
      let critical = false;
      let anyCompleted = false;

      for (const field of this.fields) {
        if (!field.cropId) continue;
        const crop = this.cropShopItems.find(c => c.id === field.cropId);
        if (!crop) continue;
        if (calculateFieldProgress(field, crop, this.now, this.totalSkippedMs) < 1) continue;

        const isCritical = Math.random() < 0.15;
        const goldenIdx = this.fieldEvents.findIndex(e => e.fieldId === field.id && e.type === 'golden');
        const isGolden = goldenIdx !== -1;
        if (isGolden) this.fieldEvents.splice(goldenIdx, 1);

        const reward = Math.round(crop.reward * (isCritical ? 3 : 1) * (isGolden ? 3 : 1) * this.goldMultiplier);
        if (isCritical) critical = true;
        this.money += reward;
        gainedGold += reward;
        this.totalGoldEarned += reward;
        this.totalHarvests += 1;
        field.cropId = null;
        field.plantedAt = null;
        field.plantedSkippedMs = null;
        anyCompleted = true;
      }

      if (anyCompleted) this.persistProgress();
      return { gainedGold, critical };
    },

    buyCrop(cropId: string) {
      const crop = this.cropShopItems.find(c => c.id === cropId);
      if (!crop || crop.unlocked) return;
      const price = crop.unlockCost ?? crop.cost;
      if (this.money < price) return;
      this.money -= price;
      crop.unlocked = true;
      this.persistProgress();
    },

    buyUpgrade(upgradeId: string) {
      const upgrade = this.upgrades.find(u => u.id === upgradeId);
      if (!upgrade) return;

      const actualCost = upgrade.type === 'auto'
        ? Math.round(upgrade.cost * Math.pow(1.3, upgrade.quantity ?? 0))
        : upgrade.cost;

      if (this.money < actualCost || this.money - actualCost < 25) return;

      if (upgrade.type === 'auto') {
        if ((upgrade.quantity ?? 0) >= 10) return;
        this.money -= actualCost;
        upgrade.quantity = (upgrade.quantity ?? 0) + 1;
        this.autoClickerInstances.push({
          instanceId: `${upgradeId}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
          type: upgradeId,
          x: 25 + Math.random() * 50,
          y: 25 + Math.random() * 50,
        });
        this.startAutoClickers();
        this.persistProgress();
        return;
      }

      if (upgrade.purchased) return;
      this.money -= actualCost;
      upgrade.purchased = true;

      if (upgrade.type === 'field') {
        const fieldNum = parseInt(upgrade.id.split('_')[1]!);
        const field = this.fields.find(f => f.id === fieldNum - 1);
        if (field) field.unlocked = true;
      }
      if (upgrade.type === 'boost') this.timePerClickMinutes *= 2;
      if (upgrade.type === 'income') this.passiveIncomePerSecond += upgrade.incomeAmount ?? 0;

      this.persistProgress();
    },

    initAutoClickers() { this.stopAutoClickers(); this.startAutoClickers(); },

    startAutoClickers() {
      if (typeof window === 'undefined') return;
      if (__autoClickerIntervalId !== null) { clearInterval(__autoClickerIntervalId); __autoClickerIntervalId = null; }
      const cps = this.upgrades
        .filter(u => u.type === 'auto')
        .reduce((sum, u) => sum + (u.clicksPerSecond ?? 0) * (u.quantity ?? 0), 0);
      if (cps <= 0) return;
      __autoClickerIntervalId = window.setInterval(() => {
        for (let i = 0; i < cps; i++) { try { this.skipTime(); } catch { /* ignore */ } }
      }, 1000) as unknown as number;
    },

    stopAutoClickers() {
      if (__autoClickerIntervalId !== null) { clearInterval(__autoClickerIntervalId); __autoClickerIntervalId = null; }
    },

    rebirth() {
      const nextGeneration = this.generation + 1;
      this.stopAutoClickers();
      const defaults = createDefaultState();
      for (const key in defaults) (this as any)[key] = (defaults as any)[key];
      this.generation = nextGeneration;
      this.lastSavedAt = Date.now();
      this.now = Date.now();
      this.persistProgress();
    },

    checkAchievements() {
      const earned = this.earnedAchievementIds;
      const check = (id: string, condition: boolean) => {
        if (condition && !earned.includes(id)) {
          earned.push(id);
          this.pendingAchievements.push(id);
        }
      };

      check('harvest_1',   this.totalHarvests >= 1);
      check('harvest_10',  this.totalHarvests >= 10);
      check('harvest_50',  this.totalHarvests >= 50);
      check('harvest_100', this.totalHarvests >= 100);

      check('gold_100',   this.totalGoldEarned >= 100);
      check('gold_1000',  this.totalGoldEarned >= 1_000);
      check('gold_10000', this.totalGoldEarned >= 10_000);
      check('gold_50000', this.totalGoldEarned >= 50_000);

      const nonAuto = this.upgrades.filter(u => u.type !== 'auto');
      const auto    = this.upgrades.filter(u => u.type === 'auto');
      check('upgrade_first',      nonAuto.some(u => u.purchased));
      check('upgrade_all_fields', this.fields.every(f => f.unlocked));
      check('upgrade_auto_first', auto.some(u => (u.quantity ?? 0) >= 1));
      check('upgrade_auto_max',   auto.some(u => (u.quantity ?? 0) >= 10));

      const totalHours = this.totalSkippedMs / (60 * 60 * 1000);
      check('time_1h',   totalHours >= 100);
      check('time_24h',  totalHours >= 500);
      check('time_100h', totalHours >= 2_500);
      check('time_500h', totalHours >= 10_000);

      check('crop_wheat',   this.cropShopItems.find(c => c.id === 'wheat_seed')?.unlocked   ?? false);
      check('crop_corn',    this.cropShopItems.find(c => c.id === 'corn_seed')?.unlocked    ?? false);
      check('crop_tulip',   this.cropShopItems.find(c => c.id === 'tulip_seed')?.unlocked   ?? false);
      check('crop_pumpkin', this.cropShopItems.find(c => c.id === 'pumpkin_seed')?.unlocked ?? false);
      check('crop_apple',   this.cropShopItems.find(c => c.id === 'apple_seed')?.unlocked   ?? false);
      check('crop_all',     this.cropShopItems.every(c => c.unlocked));
    },
  },

  getters: {
    goldMultiplier:      (state): number  => 1 + state.generation * 0.25,
    canRebirth:          (state): boolean => state.totalGoldEarned >= REBIRTH_THRESHOLD,
    unlockedCrops:       (state) => state.cropShopItems.filter(c => c.unlocked),
    autoClickerCurrentCost: (state) => (upgradeId: string) => {
      const u = state.upgrades.find(u => u.id === upgradeId);
      if (!u || u.type !== 'auto') return 0;
      return Math.round(u.cost * Math.pow(1.3, u.quantity ?? 0));
    },
    fieldProgress: (state) => (fieldId: number) => {
      const field = state.fields.find(f => f.id === fieldId);
      if (!field?.cropId || !field.plantedAt) return 0;
      const crop = state.cropShopItems.find(c => c.id === field.cropId);
      if (!crop) return 0;
      return calculateFieldProgress(field, crop, state.now, state.totalSkippedMs);
    },
  },
});
