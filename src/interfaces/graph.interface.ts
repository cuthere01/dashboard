import { GraphEdgeItemOption, GraphNodeStateOption } from 'echarts/types/src/chart/graph/GraphSeries.js';

export interface INode extends GraphNodeStateOption {
    id: string;
    name: string;
    category: number;
    x?: number;
    y?: number;
}

export interface ILink extends GraphEdgeItemOption {
    source: string;
    target: number;
}

export interface IGraph {
    nodes: INode[];
    links: ILink[];
}
