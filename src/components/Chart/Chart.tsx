import React, { useState, useEffect, useRef } from "react";
import ReactEcharts from "echarts-for-react";
import * as echarts from "echarts";
import styles from "./Chart.module.css";
import { IGraph, INode, ILink } from "@/src/interfaces/graph.interface";
import { IData } from "@/src/interfaces/data.interface";
import { CallbackDataParams } from "echarts/types/dist/shared";

export const Chart: React.FC = (): JSX.Element => {
    const [option, setOption] = useState<echarts.EChartsOption | null>({
        series: [] as echarts.SeriesOption[],
    });
    const chartRef = useRef<echarts.ECharts | null>(null);

    const parseData = (data: IData[]) => {
        const nodes: INode[] = [];
        const links: ILink[] = [];
        const uniqueSkills = new Map<string, string>();
        let idCounter = 0;

        data.forEach((profession: IData) => {
            const professionNode = {
                id: String(idCounter++),
                name: profession.name,
                category: 0,
                itemStyle: {
                    color: "#ADADAD",
                    borderWidth: 0,
                },
                select: {
                    itemStyle: {
                        color: "#00A372",
                    },
                },
            };
            nodes.push(professionNode);

            const addChild = (type: number): void => {
                (type === 1
                    ? profession.mainSkills
                    : profession.otherSkills
                ).forEach((skill) => {
                    if (!uniqueSkills.has(skill)) {
                        uniqueSkills.set(skill, String(idCounter));
                        nodes.push({
                            id: String(idCounter++),
                            name: skill,
                            category: type,
                            itemStyle: {
                                color: "#FFD4AD",
                                borderWidth: 0,
                            },
                            select: {
                                itemStyle: {
                                    color: "#FF7A00",
                                },
                            },
                        });
                    }
                    links.push({
                        source: professionNode.id,
                        target: uniqueSkills.get(skill) as string,
                        lineStyle: {
                            color: "transparent",
                        },
                    });
                });
            };

            addChild(1);
            addChild(2);
        });

        return { nodes, links };
    };

    const dataValidation = (params: echarts.ECElementEvent): boolean | any => {
        if (!(option?.series && Array.isArray(option.series))) {
            console.error("Не удалось валидировать данные", params);
            return false;
        }

        const series = option.series[0] as echarts.SeriesOption & {
            data: INode[];
        };
        if (!series.data || !Array.isArray(series.data)) {
            console.error(
                "Свойство 'data' не определено или не является массивом."
            );
            return false;
        }
        
        if (params?.fromActionPayload.dataType !== "node") {
            console.error("Выбран не узел", params);
            return false;
        }
        if (!params?.selected || params.selected.length === 0) {
            console.error("Нет выбранных узлов", params);
            return false;
        }

        const selectedNodeIndex = params.selected[0]?.dataIndex[0];
        if (selectedNodeIndex === undefined) {
            console.error(
                "Не удалось извлечь индекс выбранного узла:",
                params.selected[0]
            );
            return false;
        }

        const selectedNode = series.data[selectedNodeIndex];
        if (!selectedNode) {
            console.error(
                "Не удалось найти данные для выбранного узла:",
                selectedNodeIndex
            );
            return false;
        }
        //console.log(selectedNode);
        const nodeId = selectedNode.id;

        return { selectedNodeIndex, nodeId, series };
    };

    //написать код для пересчета координат при выборе узла, чтобы связанные узлы стали ближе
    //есть идея выделить пул ближайших узлов и поменять из местами со связанными узлами
    //далее просто пересчитать координаты для всех или только для измененных узлов
    //полученный результат передать в стейт
    const coordRecalculation = () => {
        
    };

    const handleNodeSelect = (params: echarts.ECElementEvent) => {
        const validParams = dataValidation(params);
        if (!validParams) {
            return;
        }

        const { selectedNodeIndex, nodeId, series } = validParams;
        //coordRecalculation(series);

        
        const updatedLinks = series?.links.map((link: ILink) => {
            let newLinkStyle = link.lineStyle || {};

            if (link.source === nodeId || link.target === nodeId) {
                const targetNode = series?.data.find(
                    (node: INode) =>
                        node.id === link.target || node.id === link.source
                ) as INode;

                if (targetNode) {
                    const color =
                        targetNode.category === 1 ? "#FF7A00" : "#8F59B9";
                    newLinkStyle = { ...newLinkStyle, color };
                }
            } else {
                newLinkStyle = { ...newLinkStyle, color: "transparent" };
            }

            return { ...link, lineStyle: newLinkStyle };
        });

        if (chartRef.current) {
            chartRef.current.setOption({
                series: [
                    {
                        ...series,
                        links: updatedLinks,
                    },
                ],
            });

            // chartRef.current.dispatchAction({
            //     //type: "highlight",
            //     seriesIndex: 0,
            //     dataIndex: selectedNodeIndex,
            // });

            // setTimeout(() => {
            //     chartRef.current?.dispatchAction({
            //         //type: "downplay",
            //         seriesIndex: 0,
            //         dataIndex: selectedNodeIndex,
            //     });
            // }, 0);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch("/data.json");
                const data = await response.json();
                const graph: IGraph = parseData(data);

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

                calcCoord(parents, 125);
                calcCoord(childrens, 250);

                setOption({
                    animationDurationUpdate: 1500,
                    animationEasingUpdate: "quinticInOut",
                    series: [
                        {
                            type: "graph",
                            layout: "none",
                            roam: false,
                            //draggable: true,
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
                            symbol: "circle",
                            lineStyle: {
                                opacity: 1,
                                curveness: 0.3,
                                width: 2,
                            },
                            label: {
                                show: true,
                                position: "top",
                            },
                            selectedMode: "single",
                            autoCurveness: true,
                            emphasis: {
                                itemStyle: {
                                    color: "inherit",
                                    borderColor: "inherit",
                                    borderWidth: 0,
                                },
                                scale: false,
                            },
                        },
                    ] as echarts.SeriesOption[],
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
                    onEvents={{
                        selectchanged: handleNodeSelect,
                    }}
                    onChartReady={(echartsInstance) => {
                        chartRef.current = echartsInstance;
                    }}
                />
            ) : (
                <p>Загрузка графика...</p>
            )}
        </div>
    );
};
