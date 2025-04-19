import {PokeData} from "./PokemonGenerator.tsx";
import * as React from "react";
import {useEffect, useState} from "react";
import {Button, Col, Container, Dropdown, DropdownButton, Row} from "react-bootstrap";
import { CSVLink } from "react-csv";

interface PokemonGenDisplayProps {
    data: PokeData[][];
    maxLevel: number;
    minLevel: number;
    onRecalc: () => void;
    setError: (errorMessage: string) => void;
    resetError: () => void;
}

interface PokeDataCSV {
    beforeBadge: number;
    name: string;
    level?: number;
    bst: number;
    baseExp: number;
    dexNum: number;
}

export const PokemonGenDisplay: React.FC<PokemonGenDisplayProps> = ({ data, onRecalc, maxLevel, minLevel, setError, resetError }) => {
    const [csv, setCsv] = useState<PokeDataCSV[]>([]);

    useEffect(() => {
        setCsv(getCSV());
    }, [data]);

    const getCSV = () => {
        const sanitized: PokeDataCSV[] = [];
        data.forEach((s, i) => {
            s.forEach((p) => {
                sanitized.push({
                    beforeBadge: i + 1,
                    name: p.name,
                    level: p.level,
                    bst: p.bst,
                    baseExp: p.baseExp,
                    dexNum: p.number
                })
            })
        })
        return sanitized;
    }

    const getIV = (level: number) => {
        const iv = Math.round(31 * (level - minLevel) / (maxLevel - minLevel));
        return iv < 0 ? 0 : iv > 31 ? 31 : iv;
    }

    const getShowdown = (ivs: string) => {
        let txt = ``;
        data.forEach((s, i) => {
            txt += i !== data.length - 1 ? `/* Before Badge ${i + 1}: */\n\n` : `/* Before League: */\n\n`
            s.forEach((p) => {
                if (ivs === "none") {
                    txt += `${p.name}\nLevel: ${p.level}\n\n`
                } else {
                    let iv = ivs === "31" ? 31 : 0;
                    if (ivs === "calc") {
                        iv = getIV(p.level || minLevel);
                    }
                    txt += `${p.name}\nLevel: ${p.level}\nIVs: ${iv} HP / ${iv} Atk / ${iv} Def / ${iv} SpA / ${iv} SpD / ${iv} Spd\n\n`
                }
            })
        })
        const blob = new Blob([txt], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = 'generated_pokemon.txt';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
    return (
        <Container>
            {data.map((s, i) => (
                <Container key={i} className="mb-3">
                    <Row><h5>Before {i !== data.length - 1 ? `Badge ${i + 1}` : 'League'}:</h5></Row>
                    <Row>
                        {s.map((p, j) => (
                            <Col key={`${i}${j}`}>
                                <p>{p.name} Lv. {p.level}</p>
                            </Col>
                        ))}
                    </Row>
                </Container>
            ))}
            <Row>
                <Col xs="auto">
                    <Button variant="secondary" className="me-2" onClick={onRecalc}>Recalculate</Button>
                </Col>
                <Col xs="auto">
                    <Button variant="success" className="me-2" onClick={onRecalc}>
                        <CSVLink
                            data={csv}
                            filename={"pokemon_generated.csv"}
                            target="_blank"
                            className="text-white"
                        >
                            Export to CSV
                        </CSVLink>
                    </Button>
                </Col>
                <Col xs="auto">
                    <DropdownButton title="Export to Text" variant="primary">
                        <Dropdown.Item onClick={() => getShowdown("none")}>No IVs</Dropdown.Item>
                        <Dropdown.Divider />
                        <Dropdown.Item onClick={() => getShowdown("calc")}>Scaled IVs</Dropdown.Item>
                        <Dropdown.Item onClick={() => getShowdown("0")}>All 0 IVs</Dropdown.Item>
                        <Dropdown.Item onClick={() => getShowdown("31")}>All 31 IVs</Dropdown.Item>
                    </DropdownButton>
                </Col>
            </Row>
        </Container>
    )
}