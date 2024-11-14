import { GraphEdgeItemOption } from 'echarts/types/src/chart/graph/GraphSeries.js';

export interface INode extends GraphEdgeItemOption {
    id: string;
    name: string;
    category?: number;
    x?: number;
    y?: number;
    itemStyle?: {
        color?: string;
        borderWidth?: string | number;
    };
    select?: {};
}

export interface ILink extends GraphEdgeItemOption {
    source: string;
    target: string;
    select?: {};
}

export interface IGraph {
    nodes: INode[];
    links: ILink[];
}
