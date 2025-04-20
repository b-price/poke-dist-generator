import {Button, Col, Modal, Row} from "react-bootstrap";
import { CSVLink } from "react-csv";
import {SplitData} from "../types.ts";
import React from "react";
import {pokemonText} from "../constants.ts";

interface OutputProps {
    totalExp: number;
    splits: SplitData[];
    show: boolean;
    onClose: () => void;
    nextStep: () => void;
}

export const Output: React.FC<OutputProps> = ({totalExp, splits, show, onClose, nextStep}) => {
    return (
        <Modal show={show} onHide={onClose}>
            <Modal.Header closeButton>
                <Modal.Title>Results</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Row>
                    <h4>{Math.round(totalExp).toLocaleString()} Total Exp. Needed</h4>
                </Row>
                {splits.map((s, i) => (
                    <>
                        <Row><h5>Before {i !== splits.length - 1 ? `Badge ${s.position}` : 'League'}:</h5></Row>
                        <Row className="mb-1">
                            <Col>{s.monAmount} {pokemonText}</Col>
                            <Col>{Math.round(s.totalExp).toLocaleString()} Total Exp.</Col>
                        </Row>

                        <Row className="mb-2">
                            <Col>BST: {Math.round(s.minBST)} ~ {Math.round(s.averageBST)} ~ {Math.round(s.maxBST)}</Col>
                            <Col>Level: {Math.round(s.minLevel)} ~ {s.averageLevel} ~ {Math.round(s.maxLevel)}</Col>
                        </Row>
                    </>
                ))}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="primary" onClick={nextStep}>Generate Pokémon</Button>
                <Button variant="success">
                    <CSVLink
                        data={splits}
                        filename={"pokemon_info.csv"}
                        target="_blank"
                        className="text-white"
                    >
                        Export to CSV
                    </CSVLink>
                </Button>
                <Button variant="secondary" onClick={onClose}>Close</Button>
            </Modal.Footer>
        </Modal>
    )
}