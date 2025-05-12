import {RangeData, GrowthRates, MonFilter, PokeData, SplitData, MedianData} from "../types";
import {beasts, gens, highestBST, legends, lowestBST, paradox, starters} from "../constants";

export const getCurrentTeamSize = (gym: number, gymAces: number, teamSize: number) => {
    return gym >= gymAces ? teamSize : gym <= 0 ? 1 : Math.ceil((gym / gymAces) * teamSize);
}

export const getCurrentBST = (progress: number, bstCoefficients: number[], factor: number = 1) => {
    let bst = 0;
    bstCoefficients.forEach((b, i) => {
        bst += b * Math.pow(progress, i);
    })
    const result = bst * factor;
    return result > highestBST ? highestBST : result < lowestBST ? lowestBST : result;
}

export const getXPYield = (level: number, bxp: number) => {
    return 1.5 * (level * bxp) / 7;
}

export const getSimulatedBaseExp = (bst: number) => {
    return 0.000514205 * Math.pow(bst, 2.07129);
}

export const getFinalLevel = (finalTrainer: number, teamStrength: number) => {
    return finalTrainer * (teamStrength / 100);
}

export const getTotalExp = (teamSize: number, finalLevel: number, trainerPercent: number, expYieldFunction: GrowthRates) => {
    return (teamSize * getExp(expYieldFunction, finalLevel)) * ((100 - trainerPercent) / trainerPercent + 1);
}

export const getExpAtAces = (
    aces: number[],
    teamStrength: number,
    trainerPercent: number,
    teamSize: number,
    gymAmount: number,
    expYieldFunction: GrowthRates
) => {
    const flags: number[] = [];
    
    const xpTotalAtAces = aces.map((l, i) => {
        const adjLevel = l * (teamStrength / 100);
        const xp = getCurrentTeamSize(i + 1, gymAmount, teamSize) * getExp(expYieldFunction, adjLevel);
        return xp * ((100 - trainerPercent) / trainerPercent + 1);
    })
    
    const xpAtAces = xpTotalAtAces.map((x, i) => {
        const prevXP = i === 0 ? 0 : xpTotalAtAces[i - 1];
        if (x - prevXP <= 0) {
            flags.push(i)
        }
        return x - prevXP;
    })

    if (flags.length > 0) {
        flags.forEach((f) => {
            if (f > 0) {
                const split = xpAtAces[f - 1] / 2;
                xpAtAces[f] = split;
                xpAtAces[f - 1] = split;
            }
        })
    }
    return xpAtAces;
}

export const getRandomIntInclusive = (min: number, max: number) => {
    const minCeiled = Math.ceil(min);
    const maxFloored = Math.floor(max);
    return Math.floor(Math.random() * (maxFloored - minCeiled + 1) + minCeiled); // The maximum is inclusive and the minimum is inclusive
}

export const range = (start: number, stop: number, step: number = 1) =>
    Array.from(
        { length: Math.ceil((stop - start) / step) },
        (_, i) => start + i * step,
    );

export const filterMons = (pokemon: PokeData[], monFilter: MonFilter) => {
        let filteredMons = pokemon;
        if (monFilter) {
            let filtered: number[] = [];
            if (monFilter.noLegends) filtered = legends;
            if (monFilter.noBeasts) filtered = [...filtered, ...beasts];
            if (monFilter.noParadox) filtered = [...filtered, ...paradox];
            if (monFilter.noStarters) filtered = [...filtered, ...starters];
            let included: number[] = [];
            const gensFilter = monFilter.gens ? monFilter.gens : [1,2,3,4,5,6,7,8,9];
            gensFilter.forEach(gen => {
                const genMons = range(gens[gen - 1] + 1, gens[gen] + 1);
                included = [...included, ...genMons];
            })
            if (monFilter.numbers) {
                filteredMons = filteredMons.filter(mon =>
                    monFilter.numbers?.includes(mon.number)
                    && included.includes(mon.number)
                    && !filtered.includes(mon.number));
            } else {
                filteredMons = filteredMons.filter(mon =>
                    included.includes(mon.number)
                    && !filtered.includes(mon.number));
            }
        }
        if (filteredMons.length < 1) {
            throw new Error("Filter resulted in no valid Pokémon!")
        }
        return filteredMons;
}

export const generateMons = (filteredMons: PokeData[], splits: SplitData[], fullyEvolvedLevel?: number) => {
    const selectedMons: PokeData[][] = [];
    splits.forEach((s) => {
        const pool = filteredMons.filter(p => p.bst > s.minBST && p.bst < s.maxBST);
        const selected: PokeData[] = [];
        if (pool.length > 0) {
            for (let j = 0; j < s.monAmount; j++) {
                const poke = pool[getRandomIntInclusive(0, pool.length - 1)];
                const level = Math.round((poke.bst / s.maxBST) * s.maxLevel);
                selected.push({...poke, level: level });
            }
        }
        selectedMons.push(selected)
    })
    return selectedMons;
}

export const getIV = (level: number, minLevel: number, maxLevel: number) => {
    const iv = Math.round(31 * (level - minLevel) / (maxLevel - minLevel));
    return iv < 0 ? 0 : iv > 31 ? 31 : iv;
}

export const getExp = (growthRate: GrowthRates, level: number) => {
    switch (growthRate) {
        case 'erratic':
            return erratic(level);
        case 'fast':
            return fast(level);
        case "mediumFast":
            return mediumFast(level);
        case "mediumSlow":
            return mediumSlow(level);
        case "slow":
            return slow(level);
        case "fluctuating":
            return fluctuating(level);
        default:
            return mediumFast(level);
    }
}

export const erratic = (level: number) => {
    if (level < 50)
        return (Math.pow(level, 3) * (100 - level)) / 50;
    else if (level >= 50 && level < 68)
        return (Math.pow(level, 3) * (150 - level)) / 50;
    else if (level >= 68 && level < 98)
        return (Math.pow(level, 3) * Math.floor((1911 - 10 * level) / 3)) / 500;
    else
        return (Math.pow(level, 3) * (160 - level)) / 100;
}

export const fast = (level: number) => {
    return (4 * Math.pow(level, 3)) / 5;
}

export const mediumFast = (level: number) => {
    return Math.pow(level, 3);
}

export const mediumSlow = (level: number) => {
    return (6 / 5) * Math.pow(level, 3) - 15 * Math.pow(level, 2) + 100 * level - 140;
}

export const slow = (level: number) => {
    return (5 * Math.pow(level, 3)) / 4;
}

export const fluctuating = (level: number) => {
    if (level < 15)
        return (Math.pow(level, 3) * (Math.floor((level + 1) / 3) + 24)) / 50;
    else if (level >= 15 && level < 36)
        return (Math.pow(level, 3) * (level + 14)) / 50;
    else
        return (Math.pow(level, 3) * (Math.floor(level / 2) + 32)) / 50;
}

export const getBSTRangeData = (coefficients: number[], xRange: number, minBSTRatio: number, maxBSTRatio: number) => {
    const rangeData: RangeData[] = [];
    const medianData: MedianData[] = [];
    const dataPoints = range(0, xRange + 1);
    dataPoints.forEach(x => {
        const y = getCurrentBST(x / 100, coefficients);
        medianData.push({ x, y });
        rangeData.push({
            x,
            y: [y * minBSTRatio, y * maxBSTRatio]
        })
    })
    return {rangeData, medianData};
}

export const getLevelRangeData = (aces: number[], minLevelRatio: number, maxLevelRatio: number, minLevel: number) => {
    const rangeData: RangeData[] = [];
    const medianData: MedianData[] = [];
    aces.forEach((y, i) => {
        const x = i * 100 / (aces.length - 1);
        medianData.push({ x, y });
        rangeData.push({ x, y: [i === 0 ? minLevel : aces[i - 1] * minLevelRatio, y * maxLevelRatio] });
    })
    return {rangeData, medianData};
}

export const getMean = (list: number[]) => {
    if (list.length === 0) return 0;
    let sum = 0;
    list.forEach(x => sum += x);
    return sum / list.length;
}