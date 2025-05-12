import * as React from "react";
import {useState} from "react";
import {Button, Col, Container, Form, InputGroup, Row} from "react-bootstrap";
import {MonFilter} from "../types.ts";
import {TextTooltip} from "./TextTooltip.tsx";
import {pokemonText} from "../constants.ts";

interface PokeGenFiltersProps {
    onSubmit: (filter?: MonFilter) => void;
    setError: (errorMessage: string) => void;
    resetError: () => void;
}

const initGens = [true, true, true, true, true, true, true, true, true]

export const PokeGenFilters: React.FC<PokeGenFiltersProps> = ({onSubmit, setError, resetError}) => {
    const [filtered, setFiltered] = useState<boolean>(false);
    const [noLegends, setNoLegends] = useState<boolean>(false);
    const [noBeasts, setNoBeasts] = useState<boolean>(false);
    const [noParadox, setNoParadox] = useState<boolean>(false);
    const [noStarters, setNoStarters] = useState<boolean>(false);
    const [selectedGens, setSelectedGens] = useState<boolean[]>(initGens);
    const [file, setFile] = useState<File | null>(null);
    const [fullyEvolvedLevel, setFullyEvolvedLevel] = useState<number>(0);

    const changeGens = (checked: boolean, idx: number) => {
        setSelectedGens(selectedGens.map((v, i) => i === idx ? checked : v));
    }

    const initState = () => {
        setFiltered(false);
        setNoLegends(false);
        setNoBeasts(false);
        setNoParadox(false);
        setNoStarters(false);
        setSelectedGens(initGens);
        setFullyEvolvedLevel(0);
        setFile(null);
    }

    const submit = async () => {
        try {
            if (!filtered) {
                onSubmit();
            } else {
                let list = null;
                if (!selectedGens.includes(true)){
                    throw new Error("Select at least one generation!")
                }
                if (file) {
                    const txt = await file.text();
                    let strList = txt.split(',');
                    strList = strList.map(s => s.trim());
                    list = strList.map(p => parseFloat(p));
                }
                const filter: MonFilter = {
                    noLegends,
                    noBeasts,
                    noParadox,
                    noStarters,
                    gens: selectedGens.map((_, i) => i + 1).filter((_, j) => selectedGens[j]),
                    fullyEvolvedLevel: fullyEvolvedLevel < 1 ? undefined : fullyEvolvedLevel,
                }
                if (list) filter.numbers = list;
                initState();
                resetError();
                onSubmit(filter);
            }
        } catch (e) {
            console.log(e);
            setError(e.toString());
        }
    }

    const selectAllGens = (checked: boolean) => {
        setSelectedGens(selectedGens.map(() => checked));
    }

    return (
        <Container>
            {!filtered ? (
                <>
                    <Button variant="secondary" className="me-2" onClick={() => setFiltered(true)}>Filter</Button>
                    <Button variant="primary" onClick={submit}>Generate</Button>
                </>
            ) : (
                <Form>
                    <Row className="mb-2"><h4>Filters</h4></Row>
                    <Row className="align-items-top mb-3">
                        <Col>
                            <Form.Check
                                type="switch"
                                id="startersSwitch"
                                label="No Starters"
                                onChange={(e) => {setNoStarters(e.target.checked)}}
                            />
                        </Col>
                        <Col>
                            <Form.Check
                                type="switch"
                                id="legendSwitch"
                                label="No Legendaries"
                                onChange={(e) => {setNoLegends(e.target.checked)}}
                            />
                        </Col>
                        <Col>
                            <Form.Check
                                type="switch"
                                id="beastsSwitch"
                                label="No Ultra Beasts"
                                onChange={(e) => {setNoBeasts(e.target.checked)}}
                            />
                        </Col>
                        <Col>
                            <Form.Check
                                type="switch"
                                id="paradoxSwitch"
                                label="No Paradoxes"
                                onChange={(e) => {setNoParadox(e.target.checked)}}
                            />
                        </Col>
                    </Row>
                    <Row className="align-items-baseline mb-2">
                        <Col xs="auto">
                            <Form.Label>Include Generation(s):</Form.Label>
                        </Col>
                        <Col xs="auto">
                            <Button variant="outline-primary" onClick={() => selectAllGens(true)} size="sm">All</Button>
                        </Col>
                        <Col xs="auto">
                            <Button variant="outline-secondary" onClick={() => selectAllGens(false)} size="sm">None</Button>
                        </Col>
                    </Row>
                    <Row className="mb-2">
                        {selectedGens.map((g, i) => (
                            <Col key={i}>
                                <Form.Check
                                    type="checkbox"
                                    label={i + 1}
                                    onChange={(e) => changeGens(e.target.checked, i)}
                                    checked={g}
                                />
                            </Col>
                        ) )}
                    </Row>
                    <Row className="mb-3">
                        <TextTooltip id="ttFullyEvolved" text={`All ${pokemonText} above this level will be fully evolved. A value of 0 disables this.`}>
                            <Form.Label>Force Fully-Evolved After</Form.Label>
                        </TextTooltip>
                        <InputGroup>
                            <InputGroup.Text>Lv.</InputGroup.Text>
                            <Form.Control
                                type="number"
                                value={fullyEvolvedLevel}
                                onChange={(e) => setFullyEvolvedLevel(parseInt(e.target.value))}
                            />
                        </InputGroup>
                    </Row>
                    <Row className="mb-3">
                        <Form.Group>
                            <Form.Label>Upload List of Pokémon <small>.txt, comma-separated numbers only</small></Form.Label>
                            <Form.Control type="file" accept=".txt" onChange={(e) => setFile(e.target.files[0])} />
                        </Form.Group>
                    </Row>
                    <Button variant="primary" onClick={submit}>Generate</Button>
                </Form>
            )}
        </Container>
    )
}