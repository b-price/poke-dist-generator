import {useState} from 'react'
import 'bootstrap/dist/css/bootstrap.min.css';
import {Alert, Button, Col, Container, FloatingLabel, Form, InputGroup, Row} from "react-bootstrap";
import lCurves from '../data/levelCurvePresets.json' with { type: 'json' };
import bstCurves from '../data/bstCurvePresets.json' with { type: 'json' };
import {Output} from "./Output.tsx";
import {PokemonGenerator} from "./PokemonGenerator.tsx";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faMoon, faSun, faPlus, faMinus} from "@fortawesome/free-solid-svg-icons"
import {bstMaxFactor, bstMinFactor, expGrowthFunction, maxPreGym, minPostGym, title} from "../constants.ts";
import {SplitData} from "../types.ts";
import {
    getCurrentBST,
    getExpAtAces,
    getFinalLevel,
    getFinalTrainer,
    getSimulatedBaseExp,
    getTotalExp, getXPYield
} from "../utils/calc.ts";

const defaultState = {
    gymAces: [10,15,20,25,30,35,40,45],
    e4Aces: [50, 52, 54, 56, 60],
    bstCoeffs: [245, 565, -1150, 900, 0],
    teamSize: 6,
    teamStrength: 85,
    firstAce: 5,
    trainerPercent: 100,
}

function App() {
    const [gymAces, setGymAces] = useState<number[]>(defaultState.gymAces);
    const [e4Aces, setE4Aces] = useState<number[]>(defaultState.e4Aces);
    const [bstCoefficients, setBstCoefficients] = useState<number[]>(defaultState.bstCoeffs);
    const [teamSize, setTeamSize] = useState<number>(defaultState.teamSize);
    const [teamStrength, setTeamStrength] = useState<number>(defaultState.teamStrength);
    const [firstAce, setFirstAce] = useState<number>(defaultState.firstAce);
    const [trainerPercent, setTrainerPercent] = useState<number>(defaultState.trainerPercent);
    const [useChampion, setUseChampion] = useState<boolean>(false);
    const [errorState, setErrorState] = useState<boolean>(false);
    const [errors, setErrors] = useState<string[]>(['']);
    const [showModal, setShowModal] = useState<boolean>(false);
    const [showGenerator, setShowGenerator] = useState<boolean>(false);
    const [results, setResults] = useState<SplitData[]>([]);
    const [totalExp, setTotalExp] = useState<number>(0);
    const [maxLevel, setMaxLevel] = useState<number>(65);
    const [dark, setDark] = useState<boolean>(false);

    const bstLabels = ['', 'x', 'x²', 'x³', 'x⁴'];

    const onGymAceChange = (level: number, idx: number) => {
        setGymAces(gymAces.map((l, i) => i === idx ? level : l));
    }

    const onE4AceChange = (level: number, idx: number) => {
        setE4Aces(e4Aces.map((l, i) => i === idx ? level : l));
    }

    const onCoeffChange = (coeff: number, idx: number) => {
        setBstCoefficients(bstCoefficients.map((b, i) => i === idx ? coeff : b));
    }

    const addGymField = () => {
        setGymAces([...gymAces, 0]);
    }

    const removeGymField = () => {
        setGymAces([...gymAces].slice(0, gymAces.length - 1));
    }

    const addE4Field = () => {
        setE4Aces([...e4Aces, 0]);
    }

    const removeE4Field = () => {
        setE4Aces([...e4Aces].slice(0, e4Aces.length - 1));
    }

    const onLevelPresetChange = (idx: number) => {
        if (!isNaN(idx)) {
            setGymAces(lCurves[idx].gyms);
            setE4Aces(lCurves[idx].league)
        }
    }

    const onBSTPresetChange = (idx: number) => {
        if (!isNaN(idx)) {
            setBstCoefficients(bstCurves[idx].coefficients);
        }
    }

    const validateInput = () => {
        const messages = [];
        let isError = false;
        gymAces.forEach((level, i) => {
            if (isNaN(level) || level < 1 || level > 100) {
                isError = true;
                messages.push(`Gym ace #${i + 1} invalid.`);
            }
        })
        e4Aces.forEach((level, i) => {
            if (isNaN(level) || level < 1 || level > 100) {
                isError = true;
                messages.push(`E4 ace #${i + 1} invalid.`);
            }
        })
        bstCoefficients.forEach((b, i) => {
            if (isNaN(b)) {
                isError = true;
                messages.push(`BST coefficient of ${bstLabels[i]} invalid.`);
            }
        })
        if (isNaN(teamSize) || teamSize < 1) {
            isError = true;
            messages.push(`Invalid Team Size.`);
        }
        if (isNaN(teamStrength) || teamStrength <= 0) {
            isError = true;
            messages.push(`Invalid Team Strength.`);
        }
        if (isNaN(firstAce) || firstAce < 1) {
            isError = true;
            messages.push(`Invalid First Battle Level.`);
        }
        if (isNaN(trainerPercent) || trainerPercent <= 0) {
            isError = true;
            messages.push(`Invalid Trainers to Fight.`);
        }
        setErrorState(isError);
        setErrors(messages);
        return isError;
    }

    // const getCurrentTeamSize = (gym: number) => {
    //     return gym >= gymAces.length ? teamSize : Math.ceil((gym / gymAces.length) * teamSize);
    // }

    // const getCurrentBST = (progress: number) => {
    //     let bst = 0;
    //     bstCoefficients.forEach((b, i) => {
    //         bst += b * Math.pow(progress, i);
    //     })
    //     return bst;
    // }
    //
    // const getXPYield = (level: number, bxp: number) => {
    //     return 1.5 * (level * bxp) / 7;
    // }
    //
    // const getSimulatedBaseExp = (bst: number) => {
    //     return 0.000514205 * Math.pow(bst, 2.07129);
    // }

    const onGenerateMon = () => {
        setShowModal(false);
        setShowGenerator(true);
    }

    const onSubmit = () => {
        const isInvalid = validateInput();
        if (!isInvalid) {
            const finalTrainer = getFinalTrainer(useChampion, e4Aces);
            const adjFinalLevel = getFinalLevel(finalTrainer, teamStrength);
            setMaxLevel(Math.round(adjFinalLevel));
            //const totalExp = getTotalExp(teamSize, adjFinalLevel, trainerPercent, expGrowthFunction);
            setTotalExp(getTotalExp(teamSize, adjFinalLevel, trainerPercent, expGrowthFunction));
            const aces = [...gymAces, finalTrainer];

            // const flags: number[] = [];
            // const xpTotalAtAces = aces.map((l, i) => {
            //     const adjLevel = l * (teamStrength / 100);
            //     const xp = getCurrentTeamSize(i + 1) * Math.pow(adjLevel, 3);
            //     return xp * ((100 - trainerPercent) / trainerPercent + 1);
            // })
            // const xpAtAces = xpTotalAtAces.map((x, i) => {
            //     const prevXP = i === 0 ? 0 : xpTotalAtAces[i - 1];
            //     if (x - prevXP <= 0) {
            //         flags.push(i)
            //     }
            //     return x - prevXP;
            // })
            //
            // if (flags.length > 0) {
            //
            //     flags.forEach((f) => {
            //         if (f > 0) {
            //             const split = xpAtAces[f - 1] / 2;
            //             xpAtAces[f] = split;
            //             xpAtAces[f - 1] = split;
            //         }
            //     })
            // }

            const xpAtAces = getExpAtAces(aces, teamStrength, trainerPercent, teamSize, gymAces.length, expGrowthFunction);

            const splitInfo: SplitData[] = [];

            xpAtAces.forEach((x, i) => {
                const minLevel = i === 0 ? firstAce : Math.round(aces[i - 1] * minPostGym);
                const maxLevel = Math.round(aces[i] * maxPreGym);
                const averageLevel = Math.round((minLevel + maxLevel) / 2);
                const minBST = getCurrentBST(i / (aces.length), bstCoefficients, bstMinFactor);
                const maxBST = getCurrentBST((i + 1) / (aces.length), bstCoefficients, bstMaxFactor);
                const averageBST = (minBST + maxBST) / 2;
                const averageMonBaseExp = getSimulatedBaseExp(averageBST);
                const averageMonYield = getXPYield(averageLevel, averageMonBaseExp);
                const monAmount = Math.round(x / averageMonYield);
                splitInfo.push({
                    minLevel,
                    maxLevel,
                    averageLevel,
                    minBST,
                    maxBST,
                    averageBST,
                    averageMonBaseExp,
                    averageMonYield,
                    monAmount,
                    totalExp: x,
                    position: i + 1
                })
            })

            setResults(splitInfo);
            setShowModal(true);
        }
    }

    const switchTheme = (isDark: boolean) => {
        setDark(isDark);
        document.documentElement.setAttribute('data-bs-theme',`${isDark ? "dark" : "light"}`)
    }

  return (
      <Container className="mx-5 mt-5">

          <Row className="mb-3 align-items-center justify-content-between">
              <Col><h2>{title}</h2></Col>
              <Col className="text-end">
                    {dark ? (
                        <h3><FontAwesomeIcon cursor="pointer" icon={faSun} onClick={() => switchTheme(false)} /></h3>
              ) : (
                        <h3><FontAwesomeIcon cursor="pointer" icon={faMoon} onClick={() => switchTheme(true)} /></h3>
              )}
              </Col>
          </Row>
          <Row className="mb-3 align-items-center">
              <Col xs="auto">
                  <Form.Label className="mb-0">Level Curve</Form.Label>
              </Col>
              <Col xs="auto">
                  <Form.Select onChange={(e) => onLevelPresetChange(parseFloat(e.target.value))}>
                      <option>Game Preset...</option>
                      {lCurves.map((l, i) => (
                          <option key={i} value={i}>{l.game}</option>
                      ))}
                  </Form.Select>
              </Col>
          </Row>

          <Row>
              <Form.Label>Gym Leader Ace Levels</Form.Label>
          </Row>
          <Form.Group as={Row} className="mb-3 align-items-center" controlId="gymAces">
              {gymAces.map((a, i) => (
                  <Col xs="auto" lg={1} key={i}>
                      <FloatingLabel
                          controlId={`levelCurve${i}`}
                          label={`Ace #${i+1}`}
                          className=""
                      >
                          <Form.Control
                              value={a}
                              placeholder="1"
                              onChange={(e) => onGymAceChange(parseFloat(e.target.value), i)}
                          />
                      </FloatingLabel>
                  </Col>
                )
              )}
              <Col>
                  <Row className="align-items-center">
                      <Button as={Col} xs={2} variant="outline-success" className="mx-2" onClick={addGymField}>
                          <FontAwesomeIcon icon={faPlus} />
                      </Button>
                      <Button as={Col} xs={2} variant="outline-danger" className="" onClick={removeGymField}>
                          <FontAwesomeIcon icon={faMinus} />
                      </Button>
                  </Row>
              </Col>
          </Form.Group>

          <Row>
              <Form.Label>League Ace Levels</Form.Label>
          </Row>
          <Form.Group as={Row} className="mb-3 align-items-center" controlId="e4Aces">
              {e4Aces.map((a, i) => (
                      <Col lg="1" key={i}>
                          <FloatingLabel
                              controlId={`levelCurve${i}`}
                              label={`Ace #${i+1}`}
                              className="mb-3"
                          >
                              <Form.Control
                                  value={a}
                                  placeholder="1"
                                  onChange={(e) => onE4AceChange(parseFloat(e.target.value), i)}
                              />
                          </FloatingLabel>
                      </Col>
                  )
              )}
              <Col>
                  <Row className="align-items-center">
                      <Button as={Col} xs={1} variant="outline-success" className="mx-2" onClick={addE4Field}>
                          <FontAwesomeIcon icon={faPlus} />
                      </Button>
                      <Button as={Col} xs={1} variant="outline-danger" className="" onClick={removeE4Field}>
                          <FontAwesomeIcon icon={faMinus} />
                      </Button>
                  </Row>
              </Col>
          </Form.Group>

          <Row className="mb-3 align-items-center">
              <Col xs="auto">
                  <Form.Label className="mb-0">BST Curve</Form.Label>
              </Col>
              <Col xs="auto">
                  <Form.Select onChange={(e) => onBSTPresetChange(parseFloat(e.target.value))}>
                      <option>Game Preset...</option>
                      {bstCurves.map((l, i) => (
                          <option key={i} value={i}>{l.game}</option>
                      ))}
                  </Form.Select>
              </Col>
          </Row>

          <Form.Group as={Row} className="mb-4 align-items-center" controlId="bstCurve">
              {bstCoefficients.map((bst, i) => (
                  <>
                      {i !== bstCoefficients.length - 1 &&(
                          <Col xs="auto" className="text-center">
                              <Form.Label>+</Form.Label>
                          </Col>
                      )}
                      <Col >
                          <InputGroup>
                              <Form.Control
                                  value={bst}
                                  placeholder="20"
                                  onChange={(e) => onCoeffChange(parseFloat(e.target.value), i)}
                              />
                              <InputGroup.Text>{bstLabels[i]}</InputGroup.Text>
                          </InputGroup>
                      </Col>
                  </>
                  )
              ).reverse()}
          </Form.Group>

          <Row className="mb-3">
              <Form.Group as={Col} xs="auto" controlId="teamSize">
                  <Form.Label>Team Size</Form.Label>
                  <Form.Control type="number" value={teamSize} onChange={(e) => setTeamSize(parseFloat(e.target.value))} />
              </Form.Group>

              <Form.Group as={Col} xs="auto" controlId="teamStrength">
                  <Form.Label>Team Strength Relative to Aces (%)</Form.Label>
                  <Form.Control value={teamStrength} onChange={(e) => setTeamStrength(parseFloat(e.target.value))} />
              </Form.Group>
              <Form.Group as={Col} xs="auto" controlId="trainerPercent">
                  <Form.Label>Expected Trainers to Fight (%)</Form.Label>
                  <Form.Control value={trainerPercent} onChange={(e) => setTrainerPercent(parseFloat(e.target.value))} />
              </Form.Group>
          </Row>

          <Row className="mb-3 align-items-center">
              <Form.Group as={Col} xs="auto" controlId="startingLevel">
                  <Form.Label>First Battle Level</Form.Label>
                  <Form.Control type="number" value={firstAce} onChange={(e) => setFirstAce(parseFloat(e.target.value))} />
              </Form.Group>
              <Col>
                  <Form.Check
                      type="switch"
                      id="useChampion"
                      label="Use Champion instead of First League Member"
                      onChange={(e) => {setUseChampion(e.target.checked)}}
                  />
              </Col>
          </Row>

          <Button variant="primary" size="lg" onClick={onSubmit}>
              Generate
          </Button>

          <Alert className="mt-3" show={errorState} variant="danger">
              {errors.map((e, i) => (
                  <p key={i}>{e}</p>
              ))}
          </Alert>

          <Output
              show={showModal}
              splits={results}
              totalExp={totalExp}
              onClose={() => setShowModal(false)}
              nextStep={onGenerateMon}
          />
          <PokemonGenerator
              show={showGenerator}
              onClose={() => setShowGenerator(false)}
              splits={results}
              maxLevel={maxLevel}
              minLevel={firstAce}
          />
      </Container>
  )
}

export default App
