import React, { useState, useEffect } from "react";
import ReactEcharts from "echarts-for-react";
import * as echarts from "echarts";
import styles from "./Chart.module.css";

const Chart: React.FC = (): JSX.Element => {
    const [option, setOption] = useState<echarts.EChartsOption | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch("/data.json");
                const data = await response.json();

                setOption({
                    tooltip: {
                        trigger: "item",
                        triggerOn: "mousemove",
                    },
                    series: [
                        {
                            type: "tree",
                            data: [data],
                            top: "18%",
                            bottom: "14%",
                            layout: "radial",
                            symbol: "emptyCircle",
                            symbolSize: 7,
                            initialTreeDepth: 3,
                            animationDurationUpdate: 750,
                            emphasis: {
                                focus: "descendant",
                            },
                        },
                    ],
                });
            } catch (error) {
                console.error("Ошибка загрузки данных:", error);
            }
        };

        fetchData();
    }, []);

    return (
        <div className={styles.wrapper}>
            {option ? (
                <ReactEcharts
                    option={option}
                    style={{ width: "800px", height: "800px" }}
                    notMerge={true}
                    lazyUpdate={true}
                    theme={"light"}
                />
            ) : (
                <p>Загрузка графика...</p>
            )}
        </div>
    );
};

export default Chart;
