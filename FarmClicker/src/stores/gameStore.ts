import { defineStore } from "pinia";

const GAME_STORAGE_KEY = "farm-clicker-game-v1";

type CropType = {
    id: string;
    name: string;
    cost: number;
    unlocked: boolean;
    growDurationMs: number;
};

type Field = {
    id: number;
    unlocked: boolean;
    cropId: string | null;
    plantedAt: number | null;
    plantedSkippedMs: number | null;
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
        },
    ] as CropType[],
    fields: Array.from({ length: 9 }, (_, index) => ({
        id: index,
        unlocked: index === 0,
        cropId: null,
        plantedAt: null,
        plantedSkippedMs: null,
    })) as Field[],
});

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

        return {
            ...defaults,
            ...parsedState,
            cropShopItems: parsedState.cropShopItems ?? defaults.cropShopItems,
            fields: savedFields.map((field, index) => ({
                ...defaults.fields[index],
                ...field,
                plantedSkippedMs: field.plantedSkippedMs ?? null,
            })),
            now: Date.now(),
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
                totalSkippedMs: this.totalSkippedMs,
                selectedCropId: this.selectedCropId,
                cropShopItems: this.cropShopItems,
                fields: this.fields,
            };

            localStorage.setItem(GAME_STORAGE_KEY, JSON.stringify(stateToPersist));
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

                this.money += 40;
                gainedGold += 40;
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

            this.money += 40;
            field.cropId = null;
            field.plantedAt = null;
            field.plantedSkippedMs = null;
            this.selectedCropId = null;
            this.persistProgress();
        }
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