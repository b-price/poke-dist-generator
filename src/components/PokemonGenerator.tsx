import {SplitData} from "./App.tsx";
import {Alert, Modal} from "react-bootstrap";
import {useState} from "react";
import mons from '../data/pokemonBstBasexp.json' with { type: 'json' };
import {PokemonGenDisplay} from "./PokemonGenDisplay.tsx";
import {PokeGenFilters} from "./PokeGenFilters.tsx";

interface PokemonGeneratorProps {
    show: boolean;
    onClose: () => void;
    splits: SplitData[];
    maxLevel: number;
    minLevel: number;
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

const legends = [
    144, 145, 146, 150, 151,
    243, 244, 245, 249, 250, 251,
    377, 378, 379, 380, 381, 382, 383, 384, 385, 386,
    480, 481, 482, 483, 484, 485, 486, 487, 488, 489, 490, 491, 492, 493,
    494, 638, 639, 640, 641, 642, 643, 644, 645, 646, 647, 648, 649,
    716, 717, 718, 719, 720, 721,
    785, 786, 787, 788, 789, 790, 791, 792, 800, 801, 802, 808, 809,
    888, 889, 890, 891, 892, 893, 894, 895, 896, 897, 898, 905,
    1001, 1002, 1003, 1004, 1007, 1008, 1014, 1015, 1016, 1017, 1024, 1025
];
const beasts = [794, 795, 796, 797, 798, 799, 803, 804, 805, 806, 807];
const paradox = [984, 985, 986, 987, 988, 989, 990, 991, 992, 993, 994, 995, 1005, 1006, 1009, 1010, 1020, 1021, 1022, 1023];
const gens = [0, 151, 251, 386, 493, 649, 721, 905, 1025];

export const PokemonGenerator: React.FC<PokemonGeneratorProps> = ({show, onClose, splits, maxLevel, minLevel}) => {
    const [pokemon, setPokemon] = useState<PokeData[][]>([]);
    const [isCalculated, setIsCalculated] = useState<boolean>(false);
    const [recalcFilter, setRecalcFilter] = useState<MonFilter>();
    const [errorState, setErrorState] = useState<boolean>(false);
    const [message, setMessage] = useState<string>('');

    const getRandomIntInclusive = (min: number, max: number) => {
        const minCeiled = Math.ceil(min);
        const maxFloored = Math.floor(max);
        return Math.floor(Math.random() * (maxFloored - minCeiled + 1) + minCeiled); // The maximum is inclusive and the minimum is inclusive
    }

    const range = (start: number, stop: number, step: number = 1) =>
        Array.from(
            { length: Math.ceil((stop - start) / step) },
            (_, i) => start + i * step,
        );

    const onExit = () => {
        setIsCalculated(false);
        setPokemon([]);
        onClose();
    }

    const onSubmit = (filter?: MonFilter) => {
        if (filter) {
            setRecalcFilter(filter);
        }
        calculateMon(filter);
    }

    const setError = (errorMessage: string) => {
        setErrorState(true);
        setMessage(errorMessage);
    }

    const resetError = () => {
        setErrorState(false);
        setMessage('');
    }

    const calculateMon = (monFilter?: MonFilter) => {
        try {
            let filteredMons = mons;
            if (monFilter) {
                let filtered: number[] = [];
                if (monFilter.noLegends) filtered = legends;
                if (monFilter.noBeasts) filtered = [...filtered, ...beasts];
                if (monFilter.noParadox) filtered = [...filtered, ...paradox];
                let included: number[] = [];
                if (monFilter.gens) {
                    monFilter.gens.forEach(gen => {
                        const genMons = range(gens[gen - 1] + 1, gens[gen] + 1)
                        included = [...included, ...genMons]
                    })
                }
                if (monFilter.numbers) {
                    filteredMons = filteredMons.filter(mon => monFilter.numbers?.includes(mon.number) && included.includes(mon.number) && !filtered.includes(mon.number));
                } else {
                    filteredMons = filteredMons.filter(mon => included.includes(mon.number) && !filtered.includes(mon.number));
                }
            }

            if (filteredMons.length < 1) {
                throw new Error("Filter resulted in no valid Pokémon!")
            }

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

            setPokemon(selectedMons);
            setIsCalculated(true);
            resetError();
        } catch (e) {
            setError('' + e.toString());
            console.error(e);
        }
    }

    return (
        <Modal onHide={onExit} show={show}>
            <Modal.Header closeButton>
                <Modal.Title>Pokémon Generator</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {isCalculated ? (
                    <PokemonGenDisplay
                        data={pokemon}
                        onRecalc={() => calculateMon(recalcFilter)}
                        maxLevel={maxLevel}
                        minLevel={minLevel}
                        setError={setError}
                        resetError={resetError}
                    />
                ) : (
                    <PokeGenFilters onSubmit={onSubmit} setError={setError} resetError={resetError} />
                )}
                <Alert variant="danger" className="mt-3 mx-2" show={errorState}>{message}</Alert>
            </Modal.Body>
        </Modal>
    )
}