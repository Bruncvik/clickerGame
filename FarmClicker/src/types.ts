// ── Store model types ──────────────────────────────────────────────────────
export type CropType = {
  id: string;
  name: string;
  cost: number;
  unlockCost?: number;
  unlocked: boolean;
  growDurationMs: number;
  reward: number;
};

export type Field = {
  id: number;
  unlocked: boolean;
  cropId: string | null;
  plantedAt: number | null;
  plantedSkippedMs: number | null;
};

export type UpgradeType = {
  id: string;
  name: string;
  description: string;
  cost: number;
  purchased: boolean;
  type: 'field' | 'boost' | 'income' | 'auto';
  quantity?: number;
  incomeAmount?: number;
  clicksPerSecond?: number;
};

export type AutoClickerInstance = {
  instanceId: string;
  type: string;
  x: number;
  y: number;
};

export type AchievementCategory = 'farming' | 'gold' | 'upgrade' | 'time' | 'crops';

export type AchievementDef = {
  id: string;
  name: string;
  description: string;
  category: AchievementCategory;
};

// ── UI prop/DTO types ───────────────────────────────────────────────────────
export type CropShopItem = {
  id: string;
  name: string;
  cost: number;
  icon: string;
  canAfford: boolean;
};

export type CropUnlockItem = {
  id: string;
  name: string;
  cost: number;
  icon: string;
  unlocked: boolean;
  canAfford: boolean;
};

export type UpgradeItem = {
  id: string;
  name: string;
  description: string;
  cost: number;
  purchased: boolean;
  canAfford: boolean;
  type?: 'field' | 'boost' | 'income' | 'auto';
  quantity?: number;
};

export type AchievementItem = {
  id: string;
  name: string;
  description: string;
  earned: boolean;
};

export type AchievementGroup = {
  key: string;
  label: string;
  items: AchievementItem[];
};
