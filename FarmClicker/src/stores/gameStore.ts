import { defineStore } from "pinia";                //vyuzit copilot

const GAME_STORAGE_KEY = "farm-clicker-game-v1";

type CropType = {
    id: string;
    name: string;
    cost: number;
    unlockCost?: number;
    unlocked: boolean;
    growDurationMs: number;
    reward: number;
};

type Field = {
    id: number;
    unlocked: boolean;
    cropId: string | null;
    plantedAt: number | null;
    plantedSkippedMs: number | null;
}

type UpgradeType = {
    id: string;
    name: string;
    description: string;
    cost: number;
    purchased: boolean;
    type: 'field' | 'boost' | 'income' | 'auto';
    quantity?: number;
}

type AutoClickerInstance = {
    instanceId: string;
    type: string;
    x: number;
    y: number;
}

export type AchievementCategory = 'farming' | 'gold' | 'upgrade' | 'time' | 'crops';

export type AchievementDef = {
    id: string;
    name: string;
    description: string;
    category: AchievementCategory;
};

export const ACHIEVEMENT_DEFS: AchievementDef[] = [
    { id: 'harvest_1',         name: 'First Harvest',       description: 'Complete your first harvest',         category: 'farming' },
    { id: 'harvest_10',        name: 'Seasoned Farmer',      description: 'Complete 10 harvests',                category: 'farming' },
    { id: 'harvest_50',        name: 'Harvest Master',       description: 'Complete 50 harvests',                category: 'farming' },
    { id: 'harvest_100',       name: 'Legendary Harvester',  description: 'Complete 100 harvests',               category: 'farming' },
    { id: 'gold_100',          name: 'Pocket Change',        description: 'Earn 100 gold from harvests',         category: 'gold' },
    { id: 'gold_1000',         name: 'Saver',                description: 'Earn 1,000 gold from harvests',       category: 'gold' },
    { id: 'gold_10000',        name: 'Wealthy Farmer',       description: 'Earn 10,000 gold from harvests',      category: 'gold' },
    { id: 'gold_50000',        name: 'Gold Baron',           description: 'Earn 50,000 gold from harvests',      category: 'gold' },
    { id: 'upgrade_first',     name: 'First Upgrade',        description: 'Purchase your first upgrade',         category: 'upgrade' },
    { id: 'upgrade_all_fields',name: 'Land Baron',           description: 'Unlock all 9 fields',                 category: 'upgrade' },
    { id: 'upgrade_auto_first',name: 'Hired Help',           description: 'Buy your first auto-clicker',        category: 'upgrade' },
    { id: 'upgrade_auto_max',  name: 'Full Workforce',       description: 'Max out any auto-clicker to 10',     category: 'upgrade' },
    { id: 'time_1h',           name: 'Time Skip',            description: 'Skip 100 total hours',               category: 'time' },
    { id: 'time_24h',          name: 'Time Traveler',        description: 'Skip 500 total hours',               category: 'time' },
    { id: 'time_100h',         name: 'Chronomancer',         description: 'Skip 2,500 total hours',             category: 'time' },
    { id: 'time_500h',         name: 'Master of Time',       description: 'Skip 10,000 total hours',            category: 'time' },
    { id: 'crop_wheat',        name: 'Wheat Farmer',         description: 'Unlock wheat seeds',                 category: 'crops' },
    { id: 'crop_corn',         name: 'Corn Farmer',          description: 'Unlock corn seeds',                  category: 'crops' },
    { id: 'crop_tulip',        name: 'Tulip Grower',         description: 'Unlock tulip seeds',                 category: 'crops' },
    { id: 'crop_pumpkin',      name: 'Pumpkin Farmer',       description: 'Unlock pumpkin seeds',               category: 'crops' },
    { id: 'crop_apple',        name: 'Apple Grower',         description: 'Unlock apple seeds',                 category: 'crops' },
    { id: 'crop_all',          name: 'Full Harvest',         description: 'Unlock all crop types',              category: 'crops' },
];

const calculateFieldProgress = (
    field: Field,
    crop: CropType,
    now: number,
    totalSkippedMs: number,
) => {
    if (!field.cropId || !field.plantedAt) {
        return 0;
    }

    const skippedSincePlant = totalSkippedMs - (field.plantedSkippedMs ?? 0);
    const elapsed = (now - field.plantedAt) + Math.max(0, skippedSincePlant);
    return Math.max(0, Math.min(1, elapsed / crop.growDurationMs));
};

const createDefaultState = () => ({
    money: 25,
    moneyPerClick: 1,
    timePerClickMinutes: 5,
    autoClickers: 0,
    autoClickerCost: 10,
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
    cropShopItems: [
        {
            id: "potato_seed",
            name: "Potato",
            cost: 25,
            unlocked: true,
            growDurationMs: 12 * 60 * 60 * 1000,
            reward: 40,
        },
        {
            id: "wheat_seed",
            name: "Wheat",
            cost: 50,
            unlockCost: 200,
            unlocked: false,
            growDurationMs: 18 * 60 * 60 * 1000,
            reward: 105,
        },
        {
            id: "corn_seed",
            name: "Corn",
            cost: 100,
            unlockCost: 800,
            unlocked: false,
            growDurationMs: 32 * 60 * 60 * 1000,
            reward: 350,
        },
        {
            id: "tulip_seed",
            name: "Tulip",
            cost: 150,
            unlockCost: 2000,
            unlocked: false,
            growDurationMs: 54 * 60 * 60 * 1000,
            reward: 700,
        },
        {
            id: "pumpkin_seed",
            name: "Pumpkin",
            cost: 300,
            unlockCost: 6000,
            unlocked: false,
            growDurationMs: 72 * 60 * 60 * 1000,
            reward: 1600,
        },
        {
            id: "apple_seed",
            name: "Apple",
            cost: 600,
            unlockCost: 18000,
            unlocked: false,
            growDurationMs: 128 * 60 * 60 * 1000,
            reward: 3500,
        },
    ] as CropType[],
    fields: Array.from({ length: 9 }, (_, index) => ({
        id: index,
        unlocked: index === 0,
        cropId: null,
        plantedAt: null,
        plantedSkippedMs: null,
    })) as Field[],
    upgrades: [
        {
            id: "field_2",
            name: "Field 2",
            description: "Unlock field 2",
            cost: 150,
            purchased: false,
            type: "field",
        },
        {
            id: "field_3",
            name: "Field 3",
            description: "Unlock field 3",
            cost: 500,
            purchased: false,
            type: "field",
        },
        {
            id: "field_4",
            name: "Field 4",
            description: "Unlock field 4",
            cost: 1500,
            purchased: false,
            type: "field",
        },
        {
            id: "field_5",
            name: "Field 5",
            description: "Unlock field 5",
            cost: 5000,
            purchased: false,
            type: "field",
        },
        {
            id: "field_6",
            name: "Field 6",
            description: "Unlock field 6",
            cost: 15000,
            purchased: false,
            type: "field",
        },
        {
            id: "field_7",
            name: "Field 7",
            description: "Unlock field 7",
            cost: 50000,
            purchased: false,
            type: "field",
        },
        {
            id: "field_8",
            name: "Field 8",
            description: "Unlock field 8",
            cost: 150000,
            purchased: false,
            type: "field",
        },
        {
            id: "field_9",
            name: "Field 9",
            description: "Unlock field 9",
            cost: 500000,
            purchased: false,
            type: "field",
        },
        {
            id: "time_boost_1",
            name: "Time Boost I",
            description: "×2 time per click (5→10 min)",
            cost: 200,
            purchased: false,
            type: "boost",
        },
        {
            id: "time_boost_2",
            name: "Time Boost II",
            description: "×2 time per click (10→20 min)",
            cost: 800,
            purchased: false,
            type: "boost",
        },
        {
            id: "time_boost_3",
            name: "Time Boost III",
            description: "×2 time per click (20→40 min)",
            cost: 3000,
            purchased: false,
            type: "boost",
        },
        {
            id: "time_boost_4",
            name: "Time Boost IV",
            description: "×2 time per click (40→80 min)",
            cost: 12000,
            purchased: false,
            type: "boost",
        },
        {
            id: "income_boost_1",
            name: "Income Boost I",
            description: "+0.0025 gold/sec",
            cost: 400,
            purchased: false,
            type: "income",
        },
        {
            id: "income_boost_2",
            name: "Income Boost II",
            description: "+0.05 gold/sec",
            cost: 3000,
            purchased: false,
            type: "income",
        },
        {
            id: "income_boost_3",
            name: "Income Boost III",
            description: "+0.5 gold/sec",
            cost: 20000,
            purchased: false,
            type: "income",
        },
        {
            id: "auto_person",
            name: "Farmhand (Person)",
            description: "Clicks once per second for you",
            cost: 250,
            purchased: false,
            type: "auto",
            quantity: 0,
        },
        {
            id: "auto_tractor",
            name: "Tractor",
            description: "Clicks 3 times per second",
            cost: 2500,
            purchased: false,
            type: "auto",
            quantity: 0,
        },
        {
            id: "auto_harvester",
            name: "Harvester",
            description: "Clicks 10 times per second",
            cost: 20000,
            purchased: false,
            type: "auto",
            quantity: 0,
        },
    ] as UpgradeType[],
    autoClickerInstances: [] as AutoClickerInstance[],
});

let __autoClickerIntervalId: number | null = null;

const loadInitialState = () => {
    const defaults = createDefaultState();

    if (typeof window === "undefined") {
        return defaults;
    }

    try {
        const rawState = localStorage.getItem(GAME_STORAGE_KEY);

        if (!rawState) {
            return defaults;
        }

        const parsedState = JSON.parse(rawState) as Partial<ReturnType<typeof createDefaultState>>;

        const savedFields = parsedState.fields ?? defaults.fields;
        const savedLastSavedAt = parsedState.lastSavedAt ?? defaults.lastSavedAt;
        const offlineSeconds = Math.max(0, (Date.now() - savedLastSavedAt) / 1000);
        const offlineMoney = offlineSeconds * (parsedState.passiveIncomePerSecond ?? defaults.passiveIncomePerSecond);

        return {
            ...defaults,
            ...parsedState,
            money: (parsedState.money ?? defaults.money) + offlineMoney,
            offlineIncomeGained: offlineMoney,
            cropShopItems: defaults.cropShopItems.map(defaultCrop => {
                const savedCrop = parsedState.cropShopItems?.find(c => c.id === defaultCrop.id);
                return savedCrop ? { ...defaultCrop, ...savedCrop } : defaultCrop;
            }),
            upgrades: defaults.upgrades.map(defaultUpgrade => {
                const savedUpgrade = parsedState.upgrades?.find(u => u.id === defaultUpgrade.id);
                return savedUpgrade ? { ...defaultUpgrade, ...savedUpgrade } : defaultUpgrade;
            }),
            fields: savedFields.map((field, index) => ({
                ...defaults.fields[index],
                ...field,
                plantedSkippedMs: field.plantedSkippedMs ?? null,
            })),
            lastSavedAt: Date.now(),
            now: Date.now(),
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

export const useGameStore = defineStore("game", {
    state: () => loadInitialState(),
    actions: {
        spawnFieldEvent() {
            const eligible = this.fields.filter(f =>
                f.unlocked && f.cropId &&
                !this.fieldEvents.some(e => e.fieldId === f.id)
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
            const expired = this.fieldEvents.filter(e => e.expiresAt <= now);
            for (const ev of expired) {
                if (ev.type === 'withered') {
                    const field = this.fields.find(f => f.id === ev.fieldId);
                    if (field) {
                        field.cropId = null;
                        field.plantedAt = null;
                        field.plantedSkippedMs = null;
                    }
                }
            }
            this.fieldEvents = this.fieldEvents.filter(e => e.expiresAt > now);
        },
        persistProgress() {
            if (typeof window === "undefined") {
                return;
            }

            const stateToPersist = {
                money: this.money,
                moneyPerClick: this.moneyPerClick,
                timePerClickMinutes: this.timePerClickMinutes,
                autoClickers: this.autoClickers,
                autoClickerCost: this.autoClickerCost,
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
            };

            localStorage.setItem(GAME_STORAGE_KEY, JSON.stringify(stateToPersist));
        },
        resetGame() {
            const defaults = createDefaultState();

            if (typeof window !== "undefined") {
                try {
                    localStorage.removeItem(GAME_STORAGE_KEY);
                } catch {
                    // ignore
                }
            }

            for (const key in defaults) {
                (this as any)[key] = (defaults as any)[key];
            }

            this.lastSavedAt = Date.now();
            this.now = Date.now();
            this.totalSkippedMs = 0;
            this.autoClickerInstances = [];

            this.persistProgress();
            // ensure auto-clickers are stopped after reset
            this.stopAutoClickers();
        },
        initAutoClickers() {
            // ensure any existing timer is reset and start according to purchased upgrades
            this.stopAutoClickers();
            this.startAutoClickers();
        },
        updateNow() {
            this.now = Date.now();
        },
        skipTime() {
            const skipMs = this.timePerClickMinutes * 60 * 1000;
            this.totalSkippedMs += skipMs;
            this.persistProgress();
        },
        selectCropForPlanting(cropId: string) {
            const crop = this.cropShopItems.find((item) => item.id === cropId);

            if (!crop || !crop.unlocked) {
                return;
            }

            this.selectedCropId = cropId;
            this.persistProgress();
        },
        plantSelectedCrop(fieldId: number) {
            const field = this.fields.find((item) => item.id === fieldId);

            if (!field || !field.unlocked || field.cropId) {
                return;
            }

            if (!this.selectedCropId) {
                return;
            }

            const crop = this.cropShopItems.find((item) => item.id === this.selectedCropId);

            if (!crop || !crop.unlocked) {
                return;
            }

            if (this.money < crop.cost) {
                return;
            }

            this.money -= crop.cost;
            field.cropId = crop.id;
            field.plantedAt = Date.now();
            field.plantedSkippedMs = this.totalSkippedMs;
            this.now = Date.now();
            this.persistProgress();
        },
        completeReadyFields(): { gainedGold: number; critical: boolean } {
            let didCompleteAnyField = false;
            let gainedGold = 0;
            let critical = false;

            this.fields.forEach((field) => {
                if (!field.cropId) {
                    return;
                }

                const crop = this.cropShopItems.find((item) => item.id === field.cropId);

                if (!crop) {
                    return;
                }

                const progress = calculateFieldProgress(field, crop, this.now, this.totalSkippedMs);

                if (progress < 1) {
                    return;
                }

                const isCritical = Math.random() < 0.15;
                const goldenIdx = this.fieldEvents.findIndex(e => e.fieldId === field.id && e.type === 'golden');
                const isGolden = goldenIdx !== -1;
                if (isGolden) this.fieldEvents.splice(goldenIdx, 1);
                const reward = crop.reward * (isCritical ? 3 : 1) * (isGolden ? 3 : 1);
                if (isCritical) critical = true;

                this.money += reward;
                gainedGold += reward;
                this.totalGoldEarned += reward;
                this.totalHarvests += 1;
                field.cropId = null;
                field.plantedAt = null;
                field.plantedSkippedMs = null;
                this.selectedCropId = null;
                didCompleteAnyField = true;
            });

            if (didCompleteAnyField) {
                this.persistProgress();
            }

            return { gainedGold, critical };
        },
        completeField(fieldId: number) {
            const field = this.fields.find((item) => item.id === fieldId);

            if (!field || !field.cropId || !field.plantedAt) {
                return;
            }

            const crop = this.cropShopItems.find((item) => item.id === field.cropId);

            if (!crop) {
                return;
            }

            const progress = calculateFieldProgress(field, crop, this.now, this.totalSkippedMs);

            if (progress < 1) {
                return;
            }

            this.money += crop.reward;
            field.cropId = null;
            field.plantedAt = null;
            field.plantedSkippedMs = null;
            this.selectedCropId = null;
            this.persistProgress();
        },
        buyCrop(cropId: string) {
            const crop = this.cropShopItems.find((item) => item.id === cropId);

            if (!crop || crop.unlocked) {
                return;
            }

            const price = crop.unlockCost ?? crop.cost;

            if (this.money < price) {
                return;
            }

            this.money -= price;
            crop.unlocked = true;
            this.persistProgress();
        },
        buyUpgrade(upgradeId: string) {
            const upgrade = this.upgrades.find((item) => item.id === upgradeId);

            if (!upgrade) {
                return;
            }

            const actualCost = upgrade.type === 'auto'
                ? Math.round(upgrade.cost * Math.pow(1.2, upgrade.quantity ?? 0))
                : upgrade.cost;

            if (this.money < actualCost) {
                return;
            }

            // Safety feature: ensure player keeps at least 25 gold (potato seed cost)
            if (this.money - actualCost < 25) {
                return;
            }

            // For auto-clickers, handle quantity instead of purchased flag
            if (upgrade.type === 'auto') {
                const currentQty = upgrade.quantity ?? 0;
                if (currentQty >= 10) {
                    return; // Max 10 of each type
                }
                this.money -= actualCost;
                upgrade.quantity = currentQty + 1;
                
                // Add visual instance at random position
                const randomX = 25 + Math.random() * 50; // 25% to 75% horizontally
                const randomY = 25 + Math.random() * 50; // 25% to 75% vertically
                const instanceId = `${upgradeId}_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
                this.autoClickerInstances.push({
                    instanceId,
                    type: upgradeId,
                    x: randomX,
                    y: randomY,
                });
                
                this.startAutoClickers();
                this.persistProgress();
                return;
            }

            // For other upgrade types, check purchased flag
            if (upgrade.purchased) {
                return;
            }

            this.money -= actualCost;
            upgrade.purchased = true;

            // Unlock field if it's a field upgrade
            if (upgrade.type === 'field') {
                const fieldNum = parseInt(upgrade.id.split('_')[1]!);
                const field = this.fields.find((f) => f.id === fieldNum - 1);
                if (field) {
                    field.unlocked = true;
                }
            }

            // Apply boost if it's a boost upgrade
            if (upgrade.type === 'boost') {
                if (upgrade.id.startsWith('time_boost_')) {
                    this.timePerClickMinutes *= 2;
                }
            }

            // Apply income if it's an income upgrade
            if (upgrade.type === 'income') {
                if (upgrade.id.startsWith('income_boost_')) {
                    this.passiveIncomePerSecond += upgrade.id === 'income_boost_1' ? 0.0025 : upgrade.id === 'income_boost_2' ? 0.05 : 0.5;
                }
            }

            this.persistProgress();
        }
        ,
        computeAutoClicksPerSecond() {
            let cps = 0;
            for (const u of this.upgrades) {
                if (u.type !== 'auto') continue;
                const qty = u.quantity ?? 0;
                if (u.id === 'auto_person') cps += qty * 1;
                if (u.id === 'auto_tractor') cps += qty * 3;
                if (u.id === 'auto_harvester') cps += qty * 10;
            }
            return cps;
        },
        startAutoClickers() {
            if (typeof window === 'undefined') return;

            const cps = this.computeAutoClicksPerSecond();

            if (__autoClickerIntervalId !== null) {
                clearInterval(__autoClickerIntervalId);
                __autoClickerIntervalId = null;
            }

            if (cps <= 0) return;

            __autoClickerIntervalId = window.setInterval(() => {
                // perform cps clicks per second by calling skipTime that many times
                for (let i = 0; i < cps; i++) {
                    try {
                        this.skipTime();
                    } catch {
                        // ignore
                    }
                }
            }, 1000) as unknown as number;
        },
        stopAutoClickers() {
            if (__autoClickerIntervalId !== null) {
                clearInterval(__autoClickerIntervalId);
                __autoClickerIntervalId = null;
            }
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
            check('gold_1000',  this.totalGoldEarned >= 1000);
            check('gold_10000', this.totalGoldEarned >= 10000);
            check('gold_50000', this.totalGoldEarned >= 50000);

            const nonAuto = this.upgrades.filter(u => u.type !== 'auto');
            const auto    = this.upgrades.filter(u => u.type === 'auto');
            check('upgrade_first',      nonAuto.some(u => u.purchased));
            check('upgrade_all_fields', this.fields.every(f => f.unlocked));
            check('upgrade_auto_first', auto.some(u => (u.quantity ?? 0) >= 1));
            check('upgrade_auto_max',   auto.some(u => (u.quantity ?? 0) >= 10));

            const totalHours = this.totalSkippedMs / (60 * 60 * 1000);
            check('time_1h',   totalHours >= 100);
            check('time_24h',  totalHours >= 500);
            check('time_100h', totalHours >= 2500);
            check('time_500h', totalHours >= 10000);

            const wheat   = this.cropShopItems.find(c => c.id === 'wheat_seed');
            const corn    = this.cropShopItems.find(c => c.id === 'corn_seed');
            const tulip   = this.cropShopItems.find(c => c.id === 'tulip_seed');
            const pumpkin = this.cropShopItems.find(c => c.id === 'pumpkin_seed');
            const apple   = this.cropShopItems.find(c => c.id === 'apple_seed');
            check('crop_wheat',   wheat?.unlocked   ?? false);
            check('crop_corn',    corn?.unlocked    ?? false);
            check('crop_tulip',   tulip?.unlocked   ?? false);
            check('crop_pumpkin', pumpkin?.unlocked ?? false);
            check('crop_apple',   apple?.unlocked   ?? false);
            check('crop_all',     this.cropShopItems.every(c => c.unlocked));
        },
    },
    getters: {
        autoClickerCurrentCost: (state) => (upgradeId: string) => {
            const u = state.upgrades.find(u => u.id === upgradeId);
            if (!u || u.type !== 'auto') return 0;
            return Math.round(u.cost * Math.pow(1.2, u.quantity ?? 0));
        },
        unlockedCrops(state) {
            return state.cropShopItems.filter((item) => item.unlocked);
        },
        selectedCrop(state) {
            return state.cropShopItems.find((item) => item.id === state.selectedCropId) ?? null;
        },
        fieldProgress: (state) => {
            return (fieldId: number) => {
                const field = state.fields.find((item) => item.id === fieldId);

                if (!field || !field.cropId || !field.plantedAt) {
                    return 0;
                }

                const crop = state.cropShopItems.find((item) => item.id === field.cropId);

                if (!crop) {
                    return 0;
                }

                return calculateFieldProgress(field, crop, state.now, state.totalSkippedMs);
            };
        }
    }
})