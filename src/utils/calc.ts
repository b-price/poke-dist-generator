import {MonFilter, PokeData, SplitData} from "../types.ts";
import {beasts, gens, legends, paradox} from "../constants.ts";

export const getCurrentTeamSize = (gym: number, gymAces: number, teamSize: number) => {
    return gym >= gymAces ? teamSize : Math.ceil((gym / gymAces) * teamSize);
}

export const getCurrentBST = (progress: number, bstCoefficients: number[], factor: number = 1) => {
    let bst = 0;
    bstCoefficients.forEach((b, i) => {
        bst += b * Math.pow(progress, i);
    })
    return bst * factor;
}

export const getXPYield = (level: number, bxp: number) => {
    return 1.5 * (level * bxp) / 7;
}

export const getSimulatedBaseExp = (bst: number) => {
    return 0.000514205 * Math.pow(bst, 2.07129);
}

export const getFinalTrainer = (champion: boolean, e4Aces: number[]) => {
    return champion ? e4Aces[e4Aces.length - 1] : e4Aces[0];
}

export const getFinalLevel = (finalTrainer: number, teamStrength: number) => {
    return finalTrainer * (teamStrength / 100);
}

export const getTotalExp = (teamSize: number, finalLevel: number, trainerPercent: number, expYieldFunction: (level: number) => number) => {
    return (teamSize * expYieldFunction(finalLevel)) * ((100 - trainerPercent) / trainerPercent + 1);
}

export const getExpAtAces = (
    aces: number[],
    teamStrength: number,
    trainerPercent: number,
    teamSize: number,
    gymAmount: number,
    expYieldFunction: (level: number) => number
) => {
    const flags: number[] = [];
    
    const xpTotalAtAces = aces.map((l, i) => {
        const adjLevel = l * (teamStrength / 100);
        const xp = getCurrentTeamSize(i + 1, gymAmount, teamSize) * expYieldFunction(adjLevel);
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
            let included: number[] = [];
            if (monFilter.gens) {
                monFilter.gens.forEach(gen => {
                    const genMons = range(gens[gen - 1] + 1, gens[gen] + 1);
                    included = [...included, ...genMons];
                })
            }
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

export const generateMons = (filteredMons: PokeData[], splits: SplitData[]) => {
    const selectedMons: PokeData[][] = [];
    splits.forEach((s) => {
        const pool = filteredMons.filter(p => p.bst > s.minBST && p.bst < s.maxBST);
        const selected: PokeData[] = [];
        for (let j = 0; j < s.monAmount; j++) {
            const poke = pool[getRandomIntInclusive(0, pool.length - 1)];
            const level = Math.round((poke.bst / s.maxBST) * s.maxLevel);
            selected.push({...poke, level: level });
        }
        selectedMons.push(selected)
    })
    return selectedMons;
}

export const getIV = (level: number, minLevel: number, maxLevel: number) => {
    const iv = Math.round(31 * (level - minLevel) / (maxLevel - minLevel));
    return iv < 0 ? 0 : iv > 31 ? 31 : iv;
}