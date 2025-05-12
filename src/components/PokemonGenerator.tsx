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
            const filteredMons = monFilter ? filterMons(mons, monFilter) : mons;
            if (monFilter && monFilter.fullyEvolvedLevel && monFilter.fullyEvolvedLevel > 0) {
                setPokemon(generateMons(filteredMons, splits, monFilter.fullyEvolvedLevel));
            } else {
                setPokemon(generateMons(filteredMons, splits));
            }
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