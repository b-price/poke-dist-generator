import Chart from 'react-apexcharts'
import React, {useEffect, useState} from "react";
import {MedianData, RangeData} from "../types.ts";
import {chartResolution, highestBST} from "../constants.ts";

interface RangeChartProps {
    bstMedianData: MedianData[];
    bstRangeData: RangeData[];
    levelMedianData: MedianData[];
    levelRangeData: RangeData[];
    theme: 'dark' | 'light';
}

const RangeChart: React.FC<RangeChartProps> = ({bstMedianData, bstRangeData, levelMedianData, levelRangeData, theme}) => {
    const [state, setState] = useState({
        series: [
            {
                type: 'line',
                name: 'Ace Level',
                data: levelMedianData,
            },
            {
                type: 'rangeArea',
                name: 'Level Range',
                data: levelRangeData,
            },
            {
                type: 'line',
                name: 'BST Median',
                data: bstMedianData,
            },
            {
                type: 'rangeArea',
                name: 'BST Range',
                data: bstRangeData,
            },
        ],
        options: {
            chart: {
                height: 350,
                type: 'rangeArea',
                animations: {
                    speed: 500
                },
                toolbar: {
                    show: false,
                },
                zoom: {
                    enabled: false,
                },
                background: 'transparent',
            },
            colors: ['#d4526e', '#d4526e', '#33b2df', '#33b2df'],
            dataLabels: {
                enabled: false
            },
            fill: {
                opacity: [1, 0.24, 1, 0.24]
            },
            stroke: {
                curve: 'straight',
                width: [2, 0, 2, 0]
            },
            legend: {
                show: true,
                inverseOrder: true
            },
            markers: {
                hover: {
                    sizeOffset: 5
                }
            },
            tooltip: {
                enabledOnSeries: [0, 2],
                shared: true,
                hideEmptySeries: false,
            },
            theme: {
                mode: theme
            },
            xaxis: {
                min: 0,
                max: chartResolution,
                labels: {show: false},
                axisTicks: {show: false},
            },
            yaxis: [
                {
                    seriesName: ['Level Range', 'Ace Level'],
                    opposite: true,
                    axisTicks: {
                        show: true,
                        color: '#d4526e'
                    },
                    axisBorder: {
                        show: true,
                        color: '#d4526e'
                    },
                    min: 0,
                    max: 100,
                    decimalsInFloat: 0,
                    title: {
                        text: "Level",
                        style: {
                            color: '#d4526e'
                        }
                    },
                },
                {
                    seriesName: ['BST Range', 'BST Median'],
                    min: 0,
                    max: highestBST,
                    decimalsInFloat: 0,
                    axisTicks: {
                        show: true,
                        color: '#33b2df'
                    },
                    axisBorder: {
                        show: true,
                        color: '#33b2df'
                    },
                    title: {
                        text: "BST",
                        style: {
                            color: '#33b2df'
                        }
                    },
                }
            ],
        },
    });

    useEffect(() => {
        setState({
            series: [
                {
                    type: 'line',
                    name: 'Ace Level',
                    data: levelMedianData,
                },
                {
                    type: 'rangeArea',
                    name: 'Level Range',
                    data: levelRangeData,
                },
                {
                    type: 'line',
                    name: 'BST Median',
                    data: bstMedianData,
                },
                {
                    type: 'rangeArea',
                    name: 'BST Range',
                    data: bstRangeData,
                },
            ],
            options: {
                ...state.options,
                theme: { mode: theme }
            }
        });
    }, [bstMedianData, bstRangeData, levelMedianData, levelRangeData, theme]);


    if (!levelRangeData.length || !bstMedianData.length || !levelMedianData.length || !bstRangeData.length) {
        return null;
    }
    return (
        <div>
            <div id="chart">
                <Chart options={state.options} series={state.series} type="rangeArea" height={350} />
            </div>
        </div>
    );
}

export default RangeChart;

