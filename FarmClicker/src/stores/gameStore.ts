import { defineStore } from "pinia";                //vyuzit copilot

const GAME_STORAGE_KEY = "farm-clicker-game-v1";

type CropType = {
    id: string;
    name: string;
    cost: number;
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
    cropShopItems: [
        {
            id: "potato_seed",
            name: "Potato",
            cost: 25,
            unlocked: true,
            growDurationMs: 24 * 60 * 60 * 1000,
            reward: 40,
        },
        {
            id: "wheat_seed",
            name: "Wheat",
            cost: 50,
            unlocked: false,
            growDurationMs: 36 * 60 * 60 * 1000,
            reward: 105,
        }
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
            cost: 75,
            purchased: false,
            type: "field",
        },
        {
            id: "field_3",
            name: "Field 3",
            description: "Unlock field 3",
            cost: 125,
            purchased: false,
            type: "field",
        },
        {
            id: "field_4",
            name: "Field 4",
            description: "Unlock field 4",
            cost: 175,
            purchased: false,
            type: "field",
        },
        {
            id: "field_5",
            name: "Field 5",
            description: "Unlock field 5",
            cost: 250,
            purchased: false,
            type: "field",
        },
        {
            id: "field_6",
            name: "Field 6",
            description: "Unlock field 6",
            cost: 350,
            purchased: false,
            type: "field",
        },
        {
            id: "field_7",
            name: "Field 7",
            description: "Unlock field 7",
            cost: 475,
            purchased: false,
            type: "field",
        },
        {
            id: "field_8",
            name: "Field 8",
            description: "Unlock field 8",
            cost: 625,
            purchased: false,
            type: "field",
        },
        {
            id: "field_9",
            name: "Field 9",
            description: "Unlock field 9",
            cost: 800,
            purchased: false,
            type: "field",
        },
        {
            id: "time_boost_1",
            name: "Time Boost I",
            description: "+5 min per click",
            cost: 100,
            purchased: false,
            type: "boost",
        },
        {
            id: "time_boost_2",
            name: "Time Boost II",
            description: "+5 min per click",
            cost: 250,
            purchased: false,
            type: "boost",
        },
        {
            id: "time_boost_3",
            name: "Time Boost III",
            description: "+5 min per click",
            cost: 500,
            purchased: false,
            type: "boost",
        },
        {
            id: "time_boost_4",
            name: "Time Boost IV",
            description: "+5 min per click",
            cost: 1000,
            purchased: false,
            type: "boost",
        },
        {
            id: "income_boost_1",
            name: "Income Boost I",
            description: "+0.0025 gold/sec",
            cost: 10,
            purchased: false,
            type: "income",
        },
        {
            id: "income_boost_2",
            name: "Income Boost II",
            description: "+0.05 gold/sec",
            cost: 200,
            purchased: false,
            type: "income",
        },
        {
            id: "income_boost_3",
            name: "Income Boost III",
            description: "+0.5 gold/sec",
            cost: 400,
            purchased: false,
            type: "income",
        },
        {
            id: "auto_person",
            name: "Farmhand (Person)",
            description: "Clicks once per second for you",
            cost: 50,
            purchased: false,
            type: "auto",
            quantity: 0,
        },
        {
            id: "auto_tractor",
            name: "Tractor",
            description: "Clicks 3 times per second",
            cost: 300,
            purchased: false,
            type: "auto",
            quantity: 0,
        },
        {
            id: "auto_harvester",
            name: "Harvester",
            description: "Clicks 10 times per second",
            cost: 2000,
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
            autoClickerInstances: parsedState.autoClickerInstances ?? [],
        };
    } catch {
        return defaults;
    }
};

export const useGameStore = defineStore("game", {
    state: () => loadInitialState(),
    actions: {
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
        completeReadyFields() {
            let didCompleteAnyField = false;
            let gainedGold = 0;

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

                this.money += crop.reward;
                gainedGold += crop.reward;
                field.cropId = null;
                field.plantedAt = null;
                field.plantedSkippedMs = null;
                this.selectedCropId = null;
                didCompleteAnyField = true;
            });

            if (didCompleteAnyField) {
                this.persistProgress();
            }

            return gainedGold;
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

            if (this.money < crop.cost) {
                return;
            }

            this.money -= crop.cost;
            crop.unlocked = true;
            this.persistProgress();
        },
        buyUpgrade(upgradeId: string) {
            const upgrade = this.upgrades.find((item) => item.id === upgradeId);

            if (!upgrade) {
                return;
            }

            if (this.money < upgrade.cost) {
                return;
            }

            // Safety feature: ensure player keeps at least 25 gold (potato seed cost)
            if (this.money - upgrade.cost < 25) {
                return;
            }

            // For auto-clickers, handle quantity instead of purchased flag
            if (upgrade.type === 'auto') {
                const currentQty = upgrade.quantity ?? 0;
                if (currentQty >= 10) {
                    return; // Max 10 of each type
                }
                this.money -= upgrade.cost;
                upgrade.quantity = currentQty + 1;
                
                // Add visual instance at random position
                const randomX = 25 + Math.random() * 50; // 25% to 75% horizontally
                const randomY = 25 + Math.random() * 50; // 25% to 75% vertically
                const instanceId = `${upgradeId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
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

            this.money -= upgrade.cost;
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
                    this.timePerClickMinutes += 5;
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
    },
    getters: {
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