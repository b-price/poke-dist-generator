import Chart from 'react-apexcharts'
import React, {useEffect, useState} from "react";
import {MedianData, RangeData} from "../types.ts";
import {chartResolution, highestBST, lowestBST} from "../constants.ts";

interface RangeChartProps {
    medianData: MedianData[];
    rangeData: RangeData[];
}

const RangeChart: React.FC<RangeChartProps> = ({medianData, rangeData}) => {
    const [state, setState] = useState({
        series: [
            {
                type: 'rangeArea',
                name: 'BST Range',
                data: rangeData,
            },
            {
                type: 'line',
                name: 'BST Median',
                data: medianData,
            },
        ],
        options: {
            chart: {
                height: 350,
                type: 'rangeArea',
                animations: {
                    speed: 500
                }
            },
            colors: ['#d4526e', '#33b2df', '#d4526e', '#33b2df'],
            dataLabels: {
                enabled: false
            },
            fill: {
                opacity: [0.24, 1, 1, 1]
            },
            forecastDataPoints: {
                count: 2
            },
            stroke: {
                curve: 'straight',
                width: [0, 2, 2, 2]
            },
            legend: {
                show: true,
                inverseOrder: true
            },
            title: {
                text: 'BST Curve'
            },
            markers: {
                hover: {
                    sizeOffset: 5
                }
            },
            xaxis: {
                min: 0,
                max: chartResolution,
                labels: {show: false}
            },
            yaxis: {
                min: lowestBST,
                max: highestBST,
                decimalsInFloat: 0
            }
        },
    });

    useEffect(() => {
        setState({
            series: [
                {
                    type: 'rangeArea',
                    name: 'BST Range',
                    data: rangeData,
                },

                {
                    type: 'line',
                    name: 'BST Median',
                    data: medianData,
                },
            ],
            options: {
                chart: {
                    height: 350,
                    type: 'rangeArea',
                    animations: {
                        speed: 500
                    }
                },
                colors: ['#d4526e', '#33b2df'],
                dataLabels: {
                    enabled: false
                },
                fill: {
                    opacity: [0.24, 1]
                },
                forecastDataPoints: {
                    count: 2
                },
                stroke: {
                    curve: 'straight',
                    width: [0, 2]
                },
                legend: {
                    show: true,
                    inverseOrder: true
                },
                title: {
                    text: 'BST Curve'
                },
                markers: {
                    hover: {
                        sizeOffset: 5
                    }
                },
                xaxis: {
                    min: 0,
                    max: chartResolution,
                    labels: {show: false}
                },
                yaxis: {
                    min: lowestBST,
                    max: highestBST,
                    decimalsInFloat: 0
                }
            },


        });

    }, [medianData, rangeData]);


    return (
        <div>
            <div id="chart">
                <Chart options={state.options} series={state.series} type="rangeArea" height={350} />
            </div>
        </div>
    );
}

export default RangeChart;

