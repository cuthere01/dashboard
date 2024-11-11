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
                const input = await response.json();

                const nodes = [];
                const links = [];
                const uniqueSkills = new Map();
                let idCounter = 0;

                input.forEach((profession) => {
                    const professionNode = {
                        id: idCounter++,
                        name: profession.name,
                        category: 0,
                    };
                    nodes.push(professionNode);

                    profession.mainSkills.forEach((skill) => {
                        if (!uniqueSkills.has(skill)) {
                            uniqueSkills.set(skill, idCounter);
                            nodes.push({
                                id: idCounter++,
                                name: skill,
                                category: 1,
                            });
                        }
                        links.push({
                            source: professionNode.id,
                            target: uniqueSkills.get(skill),
                        });
                    });

                    profession.otherSkills.forEach((skill) => {
                        if (!uniqueSkills.has(skill)) {
                            uniqueSkills.set(skill, idCounter);
                            nodes.push({
                                id: idCounter++,
                                name: skill,
                                category: 2,
                            });
                        }
                        links.push({
                            source: professionNode.id,
                            target: uniqueSkills.get(skill),
                        });
                    });
                });

                // Результат
                const data = { nodes, links };
                console.log(JSON.stringify(data, null, 2));

                
                const radiusInner = 100;
                const radiusOuter = 200;
                const parents = data.nodes.filter(node => node.category === 0);
                const childrens = data.nodes.filter(node => node.category !== 0);

                const calcCoord = (nodes: any, radius: number): void => {
                    nodes.forEach((node: any, index: number) => {
                        const angle = (index / nodes.length) * 2 * Math.PI;
                        node.x = Math.cos(angle) * radius;
                        node.y = Math.sin(angle) * radius;
                    });
                }

                calcCoord(parents, radiusInner);
                calcCoord(childrens, radiusOuter);


                data.nodes.forEach((node: any, index: number) => {
                    if (node.category === undefined) {
                        console.warn("У узла отсутствует категория:", node);
                        node.category = -1; 
                    }
                    if (node.category === 0) {
                        node.radius = radiusInner;
                        node.itemStyle = "green";

                    } else if (node.category === 1 || node.category === 2) {
                        node.radius = radiusOuter;
                        node.itemStyle = "orange";
                    } else {
                        node.radius = radiusOuter;
                        node.itemStyle = "orange";
                    }
                });

                setOption({
                    tooltip: {},
                    animationDurationUpdate: 1500,
                    animationEasingUpdate: "quinticInOut",
                    series: [
                        {
                            type: "graph",
                            layout: "none",
                            roam: true,
                            edgeSymbol: ["circle", "line"],
                            edgeSymbolSize: [4, 10],
                            symbolSize: 30,
                            data: data.nodes, 
                            links: data.links, 
                            categories: [
                                { name: "Профессии" },
                                { name: "Основные навыки" },
                                { name: "Дополнительные навыки" },
                            ],
                            force: {
                                repulsion: 400, 
                                gravity: 0.1, 
                            },
                            emphasis: {
                                focus: "adjacency",
                                lineStyle: {
                                    width: 4,
                                },
                            },
                            symbol: "circle",
                            edgeLabel: {
                                show: true,
                                formatter: "{c}",
                                fontSize: 14,
                                color: "#aaa",
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
