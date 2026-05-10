import type { UpgradeType } from '../types';

export const UPGRADE_DEFS: UpgradeType[] = [
  // Fields
  { id: 'field_2', name: 'Field 2', description: 'Unlock field 2', cost:    150, purchased: false, type: 'field' },
  { id: 'field_3', name: 'Field 3', description: 'Unlock field 3', cost:    500, purchased: false, type: 'field' },
  { id: 'field_4', name: 'Field 4', description: 'Unlock field 4', cost:   1500, purchased: false, type: 'field' },
  { id: 'field_5', name: 'Field 5', description: 'Unlock field 5', cost:   5000, purchased: false, type: 'field' },
  { id: 'field_6', name: 'Field 6', description: 'Unlock field 6', cost:  15000, purchased: false, type: 'field' },
  { id: 'field_7', name: 'Field 7', description: 'Unlock field 7', cost:  50000, purchased: false, type: 'field' },
  { id: 'field_8', name: 'Field 8', description: 'Unlock field 8', cost: 150000, purchased: false, type: 'field' },
  { id: 'field_9', name: 'Field 9', description: 'Unlock field 9', cost: 500000, purchased: false, type: 'field' },
  // Time boosts
  { id: 'time_boost_1', name: 'Time Boost I',   description: '×2 time per click (5→10 min)',   cost:    500, purchased: false, type: 'boost' },
  { id: 'time_boost_2', name: 'Time Boost II',  description: '×2 time per click (10→20 min)',  cost:   3000, purchased: false, type: 'boost' },
  { id: 'time_boost_3', name: 'Time Boost III', description: '×2 time per click (20→40 min)',  cost:  18000, purchased: false, type: 'boost' },
  { id: 'time_boost_4', name: 'Time Boost IV',  description: '×2 time per click (40→80 min)',  cost: 100000, purchased: false, type: 'boost' },
  // Income
  { id: 'income_boost_1', name: 'Income Boost I',   description: '+0.0025 gold/sec', cost:    400, purchased: false, type: 'income', incomeAmount: 0.0025 },
  { id: 'income_boost_2', name: 'Income Boost II',  description: '+0.05 gold/sec',   cost:   3000, purchased: false, type: 'income', incomeAmount: 0.05   },
  { id: 'income_boost_3', name: 'Income Boost III', description: '+0.5 gold/sec',    cost:  20000, purchased: false, type: 'income', incomeAmount: 0.5    },
  // Auto-clickers
  { id: 'auto_person',    name: 'Farmhand (Person)', description: 'Clicks once per second for you', cost:    85, purchased: false, type: 'auto', quantity: 0, clicksPerSecond: 1  },
  { id: 'auto_tractor',   name: 'Tractor',           description: 'Clicks 3 times per second',      cost:  2500, purchased: false, type: 'auto', quantity: 0, clicksPerSecond: 3  },
  { id: 'auto_harvester', name: 'Harvester',         description: 'Clicks 10 times per second',     cost: 20000, purchased: false, type: 'auto', quantity: 0, clicksPerSecond: 10 },
];
