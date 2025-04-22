import {
    getCurrentTeamSize,
    getCurrentBST,
    getXPYield,
    getSimulatedBaseExp,
    getFinalTrainer,
    getFinalLevel,
    getTotalExp,
    getExpAtAces,
    getRandomIntInclusive,
    range,
    filterMons,
    generateMons,
    getIV,
    getExp,
    getBSTRangeData,
    getLevelRangeData,
} from "../utils/calc";
import { GrowthRates, MonFilter, PokeData, SplitData } from "../types";
import {highestBST, lowestBST} from "../constants";

describe("getCurrentTeamSize", () => {
    it("should return full team size if gym >= gymAces", () => {
        expect(getCurrentTeamSize(5, 5, 6)).toBe(6);
        expect(getCurrentTeamSize(6, 5, 6)).toBe(6);
    });

    it("should return partial team size if gym < gymAces", () => {
        expect(getCurrentTeamSize(2, 5, 6)).toBe(3);
    });

    it("should handle edge case when gym = 0", () => {
        expect(getCurrentTeamSize(0, 5, 6)).toBe(1);
    });
});

describe("getCurrentBST", () => {
    it("should calculate BST correctly", () => {
        expect(getCurrentBST(0.5, [175, 500, -1100, 900])).toBeCloseTo(262.5);
    });

    it("should handle factor correctly", () => {
        expect(getCurrentBST(0.5, [175, 500, -1100, 900], 2)).toBe(525);
    });

    it("should handle edge case when progress = 0", () => {
        expect(getCurrentBST(0, [175, 500, -1100, 900])).toBe(175);
    });

    it("should handle edge cases when BST result is higher or lower than the max", () => {
        expect(getCurrentBST(100, [175, 500, -1100, 900], 10)).toBe(highestBST);
        expect(getCurrentBST(1, [175, 500, -1100, 900], 0.001)).toBe(lowestBST);
    });
});

describe("getXPYield", () => {
    it("should calculate XP yield correctly", () => {
        expect(getXPYield(1, 100)).toBeCloseTo(21.4285);
        expect(getXPYield(50, 100)).toBeCloseTo(1071.428);
        expect(getXPYield(75, 400)).toBeCloseTo(6428.571);
        expect(getXPYield(100, 400)).toBeCloseTo(8571.428);
    });

    it("should handle edge case when level = 0", () => {
        expect(getXPYield(0, 100)).toBe(0);
    });
});

describe("getSimulatedBaseExp", () => {
    it("should calculate simulated base exp correctly", () => {
        expect(getSimulatedBaseExp(175)).toBeCloseTo(22.757);
        expect(getSimulatedBaseExp(500)).toBeCloseTo(200.21);
        expect(getSimulatedBaseExp(720)).toBeCloseTo(426.089);
    });

    it("should handle edge case when BST = 0", () => {
        expect(getSimulatedBaseExp(0)).toBe(0);
    });
});

describe("getFinalTrainer", () => {
    it("should return last trainer if champion", () => {
        expect(getFinalTrainer(true, [1, 2, 3])).toBe(3);
    });

    it("should return first trainer if not champion", () => {
        expect(getFinalTrainer(false, [1, 2, 3])).toBe(1);
    });
});

describe("getFinalLevel", () => {
    it("should calculate final level correctly", () => {
        expect(getFinalLevel(50, 100)).toBe(50);
        expect(getFinalLevel(50, 80)).toBe(40);
        expect(getFinalLevel(50, 120)).toBe(60);
    });

    it("should handle edge case when team strength is 0", () => {
        expect(getFinalLevel(50, 0)).toBe(0);
    });
});

describe("getTotalExp", () => {
    const expYieldFunction: GrowthRates = 'mediumFast';

    it("should calculate total exp correctly", () => {
        expect(getTotalExp(6, 50, 50, expYieldFunction)).toBe(1500000);
        expect(getTotalExp(4, 50, 50, expYieldFunction)).toBe(1000000);
        expect(getTotalExp(6, 50, 100, expYieldFunction)).toBe(750000);
        expect(getTotalExp(6, 100, 50, expYieldFunction)).toBe(12000000);
    });

    it("should handle edge case when team size is 0", () => {
        expect(getTotalExp(0, 50, 50, expYieldFunction)).toBe(0);
    });
});

describe("getExpAtAces", () => {
    const expYieldFunction: GrowthRates = 'mediumFast';

    it("should calculate exp at aces correctly", () => {
        expect(getExpAtAces([10, 20, 30], 100, 50, 6, 3, expYieldFunction)).toEqual([4000, 60000, 260000]);
    });

    it("should handle edge case when team strength is 0", () => {
        expect(getExpAtAces([10, 20, 30], 0, 50, 6, 3, expYieldFunction)).toEqual([0, 0, 0]);
    });

    it("should handle edge case when there is only one ace", () => {
        expect(getExpAtAces([10], 100, 50, 6, 1, expYieldFunction)).toEqual([12000]);
    });
});

describe("getRandomIntInclusive", () => {
    it("should return a number within the specified range", () => {
        const min = 1;
        const max = 10;
        const result = getRandomIntInclusive(min, max);
        expect(result).toBeGreaterThanOrEqual(min);
        expect(result).toBeLessThanOrEqual(max);
    });

    it("should handle edge case when min = max", () => {
        expect(getRandomIntInclusive(5, 5)).toBe(5);
    });
});

describe("range", () => {
    it("should generate a range array correctly", () => {
        expect(range(1, 5)).toEqual([1, 2, 3, 4]);
    });

    it("should handle custom step size", () => {
        expect(range(1, 10, 2)).toEqual([1, 3, 5, 7, 9]);
    });

    it("should handle edge case when start = stop", () => {
        expect(range(5, 5)).toEqual([]);
    });
});

describe("filterMons", () => {
    const pokemon: PokeData[] = [
        { number: 1, name: "Bulbasaur", bst: 318, baseExp: 64 },
        { number: 144, name: "Articuno", bst: 580, baseExp: 261 },
        { number: 794, name: "Buzzwole", bst: 600, baseExp: 270 },
        { number: 1020, name: "Gouging Fire", bst: 590, baseExp: 295 },
    ];

    it("should filter out legendary Pokémon", () => {
        const monFilter: MonFilter = { noLegends: true };
        expect(filterMons(pokemon, monFilter)).toEqual([
            { number: 1, name: "Bulbasaur", bst: 318, baseExp: 64 },
            { number: 794, name: "Buzzwole", bst: 600, baseExp: 270 },
            { number: 1020, name: "Gouging Fire", bst: 590, baseExp: 295 },
        ]);
    });

    it("should filter out beasts", () => {
        const monFilter: MonFilter = { noBeasts: true };
        expect(filterMons(pokemon, monFilter)).toEqual([
            { number: 1, name: "Bulbasaur", bst: 318, baseExp: 64 },
            { number: 144, name: "Articuno", bst: 580, baseExp: 261 },
            { number: 1020, name: "Gouging Fire", bst: 590, baseExp: 295 },
        ]);
    });

    it("should filter out paradox Pokémon", () => {
        const monFilter: MonFilter = { noParadox: true };
        expect(filterMons(pokemon, monFilter)).toEqual([
            { number: 1, name: "Bulbasaur", bst: 318, baseExp: 64 },
            { number: 144, name: "Articuno", bst: 580, baseExp: 261 },
            { number: 794, name: "Buzzwole", bst: 600, baseExp: 270 },
        ]);
    });

    it("should handle multiple filters", () => {
        const monFilter: MonFilter = { noLegends: true, noBeasts: true };
        expect(filterMons(pokemon, monFilter)).toEqual([
            { number: 1, name: "Bulbasaur", bst: 318, baseExp: 64 },
            { number: 1020, name: "Gouging Fire", bst: 590, baseExp: 295 },
        ]);
    });

    it("should throw an error if filter results in no valid Pokémon", () => {
        const monFilter: MonFilter = { numbers: [999] };
        expect(() => filterMons(pokemon, monFilter)).toThrow("Filter resulted in no valid Pokémon!");
    });
});

describe("generateMons", () => {
    const filteredMons: PokeData[] = [
        { number: 1, name: "Bulbasaur", bst: 318, baseExp: 64 },
        { number: 4, name: "Charmander", bst: 309, baseExp: 62 },
        { number: 7, name: "Squirtle", bst: 314, baseExp: 63 },
    ];

    const splits: SplitData[] = [
        {
            minLevel: 5,
            maxLevel: 10,
            averageLevel: 7.5,
            minBST: 300,
            maxBST: 400,
            averageBST: 350,
            averageMonBaseExp: 60,
            averageMonYield: 100,
            monAmount: 2,
            totalExp: 200,
            position: 0,
        },
    ];

    it("should generate Pokémon based on splits", () => {
        const result = generateMons(filteredMons, splits);
        expect(result).toHaveLength(1);
        expect(result[0]).toHaveLength(2);
        result[0].forEach((mon) => {
            expect(mon.level).toBeGreaterThanOrEqual(5);
            expect(mon.level).toBeLessThanOrEqual(10);
        });
    });

    it("should handle edge case when no Pokémon match the BST range", () => {
        const emptySplits: SplitData[] = [
            {
                minLevel: 5,
                maxLevel: 10,
                averageLevel: 7.5,
                minBST: 500,
                maxBST: 600,
                averageBST: 550,
                averageMonBaseExp: 60,
                averageMonYield: 100,
                monAmount: 2,
                totalExp: 200,
                position: 0,
            },
        ];
        const result = generateMons(filteredMons, emptySplits);
        expect(result).toEqual([[]]);
    });
});

describe("getIV", () => {
    it("should calculate IV correctly", () => {
        expect(getIV(50, 1, 100)).toBe(15);
    });

    it("should handle edge case when level is below minLevel", () => {
        expect(getIV(0, 1, 100)).toBeCloseTo(0);
    });

    it("should handle edge case when level is above maxLevel", () => {
        expect(getIV(101, 1, 100)).toBe(31);
    });
});

describe("getExp", () => {
    it("should return correct exp for different growth rates", () => {
        expect(getExp('erratic', 100)).toBe(600000);
        expect(getExp('fast', 100)).toBe(800000);
        expect(getExp('mediumFast', 100)).toBe(1000000);
        expect(getExp('mediumSlow', 100)).toBe(1059860);
        expect(getExp('slow', 100)).toBe(1250000);
        expect(getExp('fluctuating', 100)).toBe(1640000);
    });

    it("should default to mediumFast if growth rate is unknown", () => {
        expect(getExp('unknown' as GrowthRates, 100)).toBe(1000000);
    });
});

describe("getBSTRangeData", () => {
    const result = getBSTRangeData([175, 500, -1100, 900], 100, 0.8, 1.2);
    it("should generate bst range data with the correct amount of data points", () => {
        expect(result.rangeData).toHaveLength(101);
    });

    it("should generate bst data with the correct amount of data points", () => {
        expect(result.rangeData).toHaveLength(101);
    });

    it("should generate BST median data correctly", () => {
        expect(result.medianData[0].y).toBeCloseTo(175);
        expect(result.medianData[50].y).toBeCloseTo(262.5);
        expect(result.medianData[100].y).toBeCloseTo(475);
    });

    it("should generate BST range data correctly", () => {
        expect(result.rangeData[0].y).toEqual([175 * 0.8, 175 * 1.2]);
        expect(result.rangeData[50].y).toEqual([262.5 * 0.8, 262.5 * 1.2]);
        expect(result.rangeData[100].y).toEqual([475 * 0.8, 475 * 1.2]);
    });

    it("should handle edge case when xRange is 0", () => {
        const result = getBSTRangeData([1, 2, 3], 0, 0.8, 1.2);
        expect(result.rangeData).toHaveLength(1);
        expect(result.medianData).toHaveLength(1);
    });
});

describe("getLevelRangeData", () => {
    const result = getLevelRangeData([10, 20, 30], 0.8, 1.2, 5);
    it("generate level data with the correct amount of data points", () => {
        expect(result.medianData).toHaveLength(3);
    });

    it("generate level range data with the correct amount of data points", () => {
        expect(result.rangeData).toHaveLength(3);
    });

    it("should generate level data correctly", () => {
        expect(result.medianData[0].y).toBe(10);
        expect(result.medianData[1].y).toBe(20);
        expect(result.medianData[2].y).toBe(30);
    });

    it("should generate level range data correctly", () => {
        expect(result.rangeData[0].y).toEqual([5, 10 * 1.2]);
        expect(result.rangeData[1].y).toEqual([10 * 0.8, 20 * 1.2]);
        expect(result.rangeData[2].y).toEqual([20 * 0.8, 30 * 1.2]);
    });

    it("should handle edge case when aces array is empty", () => {
        const resultEmpty = getLevelRangeData([], 0.8, 1.2, 5);
        expect(resultEmpty.rangeData).toHaveLength(0);
        expect(resultEmpty.medianData).toHaveLength(0);
    });
});