export interface SplitData {
    minLevel: number;
    maxLevel: number;
    averageLevel: number;
    minBST: number;
    maxBST: number;
    averageBST: number;
    averageMonBaseExp: number;
    averageMonYield: number;
    monAmount: number;
    totalExp: number;
    position: number;
}

export interface PokeData {
    number: number;
    name: string;
    bst: number;
    baseExp: number;
    level?: number;
}

export interface MonFilter {
    noLegends?: boolean;
    noBeasts?: boolean;
    noParadox?: boolean;
    gens?: number[];
    numbers?: number[];
}

export interface PokeDataCSV {
    beforeBadge: number;
    name: string;
    level?: number;
    bst: number;
    baseExp: number;
    dexNum: number;
}

export type GrowthRates = 'erratic' | 'fast' | 'mediumFast' | 'mediumSlow' | 'slow' | 'fluctuating';

export interface RangeData {
    x: number;
    y: [number, number];
}

export interface MedianData {
    x: number;
    y: number;
}

export interface ChartData {
    rangeData: RangeData[];
    medianData: MedianData[];
}