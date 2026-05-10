import type { CropType } from '../types';

const H = 60 * 60 * 1000;

export const CROP_DEFS: CropType[] = [
  { id: 'potato_seed',  name: 'Potato',  cost: 25,  unlocked: true,  growDurationMs:  12 * H, reward:    40 },
  { id: 'wheat_seed',   name: 'Wheat',   cost: 50,  unlockCost:   200, unlocked: false, growDurationMs:  18 * H, reward:   105 },
  { id: 'corn_seed',    name: 'Corn',    cost: 100, unlockCost:   800, unlocked: false, growDurationMs:  32 * H, reward:   350 },
  { id: 'tulip_seed',   name: 'Tulip',   cost: 150, unlockCost:  2000, unlocked: false, growDurationMs:  54 * H, reward:   700 },
  { id: 'pumpkin_seed', name: 'Pumpkin', cost: 300, unlockCost:  6000, unlocked: false, growDurationMs:  72 * H, reward:  1600 },
  { id: 'apple_seed',   name: 'Apple',   cost: 600, unlockCost: 18000, unlocked: false, growDurationMs: 128 * H, reward:  3500 },
];
