import {useEffect, useState} from 'react'
import 'bootstrap/dist/css/bootstrap.min.css';
import {Alert, Button, Col, Container, FloatingLabel, Form, InputGroup, Row} from "react-bootstrap";
import lCurves from '../data/levelCurvePresets.json' with { type: 'json' };
import bstCurves from '../data/bstCurvePresets.json' with { type: 'json' };
import {Output} from "./Output.tsx";
import {PokemonGenerator} from "./PokemonGenerator.tsx";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faMoon, faSun, faPlus, faMinus} from "@fortawesome/free-solid-svg-icons"
import {
    bstMaxFactor,
    bstMinFactor,
    chartResolution,
    expGrowthFunction,
    maxPreGym,
    minPostGym, pokemonText,
    title
} from "../constants.ts";
import {ChartData, FinalAce, SplitData} from "../types.ts";
import {
    getCurrentBST,
    getExpAtAces,
    getFinalLevel,
    getBSTRangeData,
    getSimulatedBaseExp,
    getTotalExp, getXPYield, getLevelRangeData, getMean
} from "../utils/calc.ts";
import RangeChart from "./RangeChart.tsx";
import {TextTooltip} from "./TextTooltip.tsx";

const defaultState = {
    gymAces: [10,15,20,25,30,35,40,45],
    e4Aces: [50, 52, 54, 56, 60],
    bstCoeffs: [245, 565, -1150, 900, 0],
    teamSize: 6,
    teamStrength: 85,
    firstAce: 5,
    trainerPercent: 100,
    bstDataPoints: getBSTRangeData([245, 565, -1150, 900, 0], chartResolution, bstMinFactor, bstMaxFactor),
    levelDataPoints: getLevelRangeData([10,15,20,25,30,35,40,45,50], minPostGym, maxPreGym, 5),
    finalAce: {level: 50, position: "first"}
}

function App() {
    const [gymAces, setGymAces] = useState<number[]>(defaultState.gymAces);
    const [e4Aces, setE4Aces] = useState<number[]>(defaultState.e4Aces);
    const [bstCoefficients, setBstCoefficients] = useState<number[]>(defaultState.bstCoeffs);
    const [teamSize, setTeamSize] = useState<number>(defaultState.teamSize);
    const [teamStrength, setTeamStrength] = useState<number>(defaultState.teamStrength);
    const [firstAce, setFirstAce] = useState<number>(defaultState.firstAce);
    const [trainerPercent, setTrainerPercent] = useState<number>(defaultState.trainerPercent);
    const [errorState, setErrorState] = useState<boolean>(false);
    const [errors, setErrors] = useState<string[]>(['']);
    const [showOutput, setShowOutput] = useState<boolean>(false);
    const [showGenerator, setShowGenerator] = useState<boolean>(false);
    const [results, setResults] = useState<SplitData[]>([]);
    const [totalExp, setTotalExp] = useState<number>(0);
    const [maxLevel, setMaxLevel] = useState<number>(60);
    const [dark, setDark] = useState<boolean>(false);
    const [bstChartData, setBstChartData] = useState<ChartData>(defaultState.bstDataPoints);
    const [levelChartData, setLevelChartData] = useState<ChartData>(defaultState.levelDataPoints);
    const [finalAce, setFinalAce] = useState<FinalAce>(defaultState.finalAce);

    const bstLabels = ['', 'x', 'x²', 'x³', 'x⁴'];

    useEffect(() => {
        setLevelChartData(getLevelRangeData([...gymAces, finalAce.level], minPostGym, maxPreGym, firstAce));
    }, [gymAces, e4Aces, finalAce, firstAce]);

    useEffect(() => {
        setBstChartData(getBSTRangeData(bstCoefficients, chartResolution, bstMinFactor, bstMaxFactor));
    }, [bstCoefficients]);

    const onGymAceChange = (level: number, idx: number) => {
        const newGymAces = gymAces.map((l, i) => i === idx ? level : l);
        setGymAces(newGymAces);
    }

    const onE4AceChange = (level: number, idx: number) => {
        setE4Aces(e4Aces.map((l, i) => i === idx ? level : l));
    }

    const onCoeffChange = (coeff: number, idx: number) => {
        const newCoeffs = bstCoefficients.map((b, i) => i === idx ? coeff : b);
        setBstCoefficients(newCoeffs);
    }

    const addGymField = () => {
        setGymAces([...gymAces, 0]);
    }

    const removeGymField = () => {
        const newGymAces = [...gymAces].slice(0, gymAces.length - 1);
        setGymAces(newGymAces);
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
            setE4Aces(lCurves[idx].league);
            switch (finalAce.position) {
                case "champion":
                    setFinalAce({level: lCurves[idx].league[lCurves[idx].league.length - 1], position: "champion"});
                    break;
                case "average":
                    setFinalAce({level: getMean(lCurves[idx].league), position: "average"});
                    break;
                default:
                    setFinalAce({level: lCurves[idx].league[0], position: "first"});
            }
        }
    }

    const onFinalTrainerChange = (selection: string) => {
        switch (selection) {
            case "champion":
                setFinalAce({level: e4Aces[e4Aces.length - 1], position: "champion"});
                break;
            case "average":
                setFinalAce({level: getMean(e4Aces), position: "average"});
                break;
            default:
                setFinalAce({level: e4Aces[0], position: "first"});
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
                messages.push(`League ace #${i + 1} invalid.`);
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

    const onGenerateMon = () => {
        setShowOutput(false);
        setShowGenerator(true);
    }

    const onSubmit = () => {
        const isInvalid = validateInput();
        if (!isInvalid) {
            const adjFinalLevel = getFinalLevel(finalAce.level, teamStrength);
            setMaxLevel(Math.round(adjFinalLevel));
            setTotalExp(getTotalExp(teamSize, adjFinalLevel, trainerPercent, expGrowthFunction));
            const aces = [...gymAces, finalAce.level];
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
            setShowOutput(true);
        }
    }

    const switchTheme = (isDark: boolean) => {
        setDark(isDark);
        document.documentElement.setAttribute('data-bs-theme',`${isDark ? "dark" : "light"}`)
    }

  return (
      <Container className="mx-4 my-5">

          <Row className="mb-3 align-items-center justify-content-between">
              <Col ><h2>{title}</h2></Col>
              <Col className="text-lg-end text-center">
                    {dark ? (
                        <h3><FontAwesomeIcon cursor="pointer" icon={faSun} onClick={() => switchTheme(false)} /></h3>
              ) : (
                        <h3><FontAwesomeIcon cursor="pointer" icon={faMoon} onClick={() => switchTheme(true)} /></h3>
              )}
              </Col>
          </Row>
          <Row className="mb-3 align-items-center">
              <Col xs="auto">
                  <TextTooltip
                      id="ttLevelCurve"
                      text="Your game's level curve, determined by the levels of each gym leader's ace."
                  >
                      <Form.Label className="mb-0">Level Curve</Form.Label>
                  </TextTooltip>
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
              <Form.Label>
                  <TextTooltip
                      id="ttGymLeaders"
                      text={`The highest-level ${pokemonText} on each gym leader's team. All are taken into account in calculations.`}>
                      <span>Gym Leader Ace Levels</span>
                  </TextTooltip>
              </Form.Label>
          </Row>
          <Form.Group as={Row} className="mb-3 align-items-center" controlId="gymAces">
              {gymAces.map((a, i) => (
                  <Col xs="auto" lg={1} key={i}>
                      <FloatingLabel
                          controlId={`levelCurve${i}`}
                          label={i + 1}
                          className="mb-3"
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
              <Col xs="auto">
                  <Row>
                      <Col xs="auto">
                          <Button variant="outline-success" className="mx-1 py-2 px-3" onClick={addGymField}>
                              <FontAwesomeIcon icon={faPlus} />
                          </Button>
                      </Col>
                      <Col xs="auto">
                          <Button variant="outline-danger" className="py-2 px-3" onClick={removeGymField}>
                              <FontAwesomeIcon icon={faMinus} />
                          </Button>
                      </Col>
                  </Row>
              </Col>
          </Form.Group>

          <Row className="align-items-center mb-2">
              <Col xs="auto">
                  <Form.Label>
                      <TextTooltip
                          id="ttLeagueAces"
                          text={`The highest-level ${pokemonText} on each league member's team. Choose to use the first 
                      member, champion, or an average of all to use as the final trainer in calculations.`}>
                          <span>League Ace Levels</span>
                      </TextTooltip>
                  </Form.Label>
              </Col>
              <Col xs="auto">
                  <Form.Select id="finalTrainerSelect" onChange={(e) => onFinalTrainerChange(e.target.value)}>
                      <option value="default">Select Final Trainer...</option>
                      <option value="first">First League Member</option>
                      <option value="champion">Champion</option>
                      <option value="average">Average of League Aces</option>
                  </Form.Select>
              </Col>
          </Row>
          <Form.Group as={Row} className="mb-3 align-items-center" controlId="e4Aces">
              {e4Aces.map((a, i) => (
                      <Col xs="auto" lg={1} key={i}>
                          <FloatingLabel
                              controlId={`levelCurve${i}`}
                              label={i === e4Aces.length - 1 ? "Champion" : i + 1}
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
              <Col xs="auto">
                  <Row>
                      <Col xs="auto">
                          <Button variant="outline-success" className="mx-1 py-2 px-3" onClick={addE4Field}>
                              <FontAwesomeIcon icon={faPlus} />
                          </Button>
                      </Col>
                      <Col xs="auto">
                          <Button variant="outline-danger" className="py-2 px-3" onClick={removeE4Field}>
                              <FontAwesomeIcon icon={faMinus} />
                          </Button>
                      </Col>

                  </Row>
              </Col>
          </Form.Group>

          <Row className="mb-3 align-items-center">
              <Col xs="auto">
                  <Form.Label className="mb-0">
                      <TextTooltip
                          id="ttBSTCurve"
                          text={`Function used to determine the Base Stat Total of the generated ${pokemonText} at any given 
                          point in the game, represented as the game completion percentage x / 1.`}>
                          <span>BST Curve</span>
                      </TextTooltip>
                  </Form.Label>
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
                      <Col lg={2} xs="auto" className="mb-3">
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

          <RangeChart
              bstMedianData={bstChartData.medianData}
              bstRangeData={bstChartData.rangeData}
              levelRangeData={levelChartData.rangeData}
              levelMedianData={levelChartData.medianData}
              theme={dark ? 'dark' : 'light'}
          />

          <Row className="mb-3">
              <Form.Group as={Col} xs="auto" controlId="teamSize" className="mb-3">
                  <Form.Label>
                      <TextTooltip
                          id="ttTeamSize"
                          text={`The amount of battling ${pokemonText} the player should be expected to raise throughout the game.`}>
                          <span>Team Size</span>
                      </TextTooltip>
                  </Form.Label>
                  <Form.Control type="number" value={teamSize} onChange={(e) => setTeamSize(parseFloat(e.target.value))} />
              </Form.Group>

              <Form.Group as={Col} xs="auto" controlId="teamStrength" className="mb-3">
                  <Form.Label>
                      <TextTooltip
                          id="ttTeamStrength"
                          text={`The percentage of the Gym/League ace's level the player's ${pokemonText} are expected to be when battling them. Out of 100.`}>
                          <span>Team Strength Relative to Aces (%)</span>
                      </TextTooltip>
                  </Form.Label>
                  <Form.Control value={teamStrength} onChange={(e) => setTeamStrength(parseFloat(e.target.value))} />
              </Form.Group>
              <Form.Group as={Col} xs="auto" controlId="trainerPercent" className="mb-3">
                  <Form.Label>
                      <TextTooltip
                          id="ttTrainerPercent"
                          text={`The percentage of trainers throughout the game the player is expected to battle. Out of 100.`}>
                          <span>Expected Trainers to Fight (%)</span>
                      </TextTooltip>
                  </Form.Label>
                  <Form.Control value={trainerPercent} onChange={(e) => setTrainerPercent(parseFloat(e.target.value))} />
              </Form.Group>
              <Form.Group as={Col} xs="auto" controlId="startingLevel" className="mb-3">
                  <Form.Label>
                      <TextTooltip
                          id="ttFirstAce"
                          text={`The level of the first trainer in the game's ace ${pokemonText}.`}>
                          <span>First Battle Level</span>
                      </TextTooltip>
                  </Form.Label>
                  <Form.Control type="number" value={firstAce} onChange={(e) => setFirstAce(parseFloat(e.target.value))} />
              </Form.Group>
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
              show={showOutput}
              splits={results}
              totalExp={totalExp}
              onClose={() => setShowOutput(false)}
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
