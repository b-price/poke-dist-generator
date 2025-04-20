import {Alert, Modal} from "react-bootstrap";
import React, {useState} from "react";
import mons from '../data/pokemonBstBasexp.json' with { type: 'json' };
import {PokemonGenDisplay} from "./PokemonGenDisplay.tsx";
import {PokeGenFilters} from "./PokeGenFilters.tsx";
import {MonFilter, PokeData, SplitData} from "../types.ts";
import {filterMons, generateMons} from "../utils/calc.ts";

interface PokemonGeneratorProps {
    show: boolean;
    onClose: () => void;
    splits: SplitData[];
    maxLevel: number;
    minLevel: number;
}

export const PokemonGenerator: React.FC<PokemonGeneratorProps> = ({show, onClose, splits, maxLevel, minLevel}) => {
    const [pokemon, setPokemon] = useState<PokeData[][]>([]);
    const [isCalculated, setIsCalculated] = useState<boolean>(false);
    const [recalcFilter, setRecalcFilter] = useState<MonFilter>();
    const [errorState, setErrorState] = useState<boolean>(false);
    const [message, setMessage] = useState<string>('');

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
            // let filteredMons = mons;
            // if (monFilter) {
            //     let filtered: number[] = [];
            //     if (monFilter.noLegends) filtered = legends;
            //     if (monFilter.noBeasts) filtered = [...filtered, ...beasts];
            //     if (monFilter.noParadox) filtered = [...filtered, ...paradox];
            //     let included: number[] = [];
            //     if (monFilter.gens) {
            //         monFilter.gens.forEach(gen => {
            //             const genMons = range(gens[gen - 1] + 1, gens[gen] + 1);
            //             included = [...included, ...genMons];
            //         })
            //     }
            //     if (monFilter.numbers) {
            //         filteredMons = filteredMons.filter(mon =>
            //             monFilter.numbers?.includes(mon.number)
            //             && included.includes(mon.number)
            //             && !filtered.includes(mon.number));
            //     } else {
            //         filteredMons = filteredMons.filter(mon =>
            //             included.includes(mon.number)
            //             && !filtered.includes(mon.number));
            //     }
            // }
            //
            // if (filteredMons.length < 1) {
            //     throw new Error("Filter resulted in no valid Pokémon!")
            // }
            //
            // const selectedMons: PokeData[][] = [];
            // splits.forEach((s) => {
            //     const pool = filteredMons.filter(p => p.bst > s.minBST && p.bst < s.maxBST);
            //     const selected: PokeData[] = [];
            //     for (let j = 0; j < s.monAmount; j++) {
            //         const poke = pool[getRandomIntInclusive(0, pool.length - 1)];
            //         const level = Math.round((poke.bst / s.maxBST) * s.maxLevel);
            //         selected.push({...poke, level: level });
            //     }
            //     selectedMons.push(selected)
            // })

            const filteredMons = monFilter ? filterMons(mons, monFilter) : mons;
            setPokemon(generateMons(filteredMons, splits));
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