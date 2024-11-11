import React, { useState, useEffect } from "react";
import ReactEcharts from "echarts-for-react";
import * as echarts from "echarts";
import styles from "./Chart.module.css";
import { IGraph, INode, ILink } from "@/src/interfaces/graph.interface";
import { IData } from "@/src/interfaces/data.interface";

const Chart: React.FC = (): JSX.Element => {
    const [option, setOption] = useState<echarts.EChartsOption | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch("/data.json");
                const data = await response.json();

                const nodes: INode[] = [];
                const links: ILink[] = [];
                const uniqueSkills = new Map();
                let idCounter = 0;

                data.forEach((profession: IData) => {
                    const professionNode = {
                        id: String(idCounter++),
                        name: profession.name,
                        category: 0,
                        itemStyle: { color: "#ADADAD" },
                    };
                    nodes.push(professionNode);

                    const addChild = (type: number): void => {
                        (type === 1 ? profession.mainSkills : profession.otherSkills).forEach((skill) => {
                            if (!uniqueSkills.has(skill)) {
                                uniqueSkills.set(skill, idCounter);
                                nodes.push({
                                    id: String(idCounter++),
                                    name: skill,
                                    category: type,
                                    itemStyle: { color: "#FFD4AD" },
                                });
                            }
                            links.push({
                                source: professionNode.id,
                                target: uniqueSkills.get(skill),
                                lineStyle: { color: "#ADADAD" },
                            });
                        });
                    }

                    addChild(1);
                    addChild(2);
                });

                // Результат
                const graph: IGraph = { nodes, links };
                //console.log(JSON.stringify(graph, null, 2));

                const radiusInner = 125;
                const radiusOuter = 250;
                const parents = graph.nodes.filter(
                    (node) => node.category === 0
                );
                const childrens = graph.nodes.filter(
                    (node) => node.category !== 0
                );

                const calcCoord = (nodes: INode[], radius: number): void => {
                    nodes.forEach((node, index: number) => {
                        const angle = (index / nodes.length) * 2 * Math.PI;
                        node.x = Math.sin(angle) * radius;
                        node.y = -Math.cos(angle) * radius;
                    });
                };

                calcCoord(parents, radiusInner);
                calcCoord(childrens, radiusOuter);

            

                setOption({
                    tooltip: {},
                    animationDurationUpdate: 1500,
                    animationEasingUpdate: "quinticInOut",
                    series: [
                        {
                            type: "graph",
                            layout: "none",
                            roam: true,
                            
                            edgeSymbolSize: [4, 10],
                            symbolSize: 30,
                            data: graph.nodes,
                            links: graph.links,
                            categories: [
                                { name: "Профессии" },
                                { name: "Основные навыки" },
                                { name: "Дополнительные навыки" },
                            ],
                            force: {
                                repulsion: 400,
                                gravity: 0.1,
                            },
                            lineStyle: {
                                opacity: 0.5, // Линии по умолчанию невидимы
                                curveness: 0.5, // Закругленность линий; подберите значение по желанию
                            },
                            label: {
                                show: true,
                                position: "top"
                            },
                            emphasis: {
                                focus: "adjacency",
                                itemStyle: {
                                    color: "#00A372",
                                },
                                lineStyle: {
                                    color: "#ADADAD",
                                    opacity: 1, // Делает линии видимыми при наведении/выборе
                                },
                            },
                            symbol: "circle",
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
