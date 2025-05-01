
import { MarkerType } from '@xyflow/react';
import { CSSProperties } from 'react';

export interface GraphNode {
  id: string;
  type: 'graphNode';
  position: {
    x: number;
    y: number;
  };
  data: {
    label: string;
    content?: string;
    isExecuting?: boolean;
  };
  draggable: boolean;
  style?: CSSProperties;
  selectable?: boolean;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  type: 'default';
  markerEnd: {
    type: MarkerType;
  };
  style: {
    strokeWidth: number;
    visibility?: "visible" | "hidden";
    opacity?: number;
    zIndex?: number;
  };
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

// New types for backend API response
export interface BackendNode {
  id: string;
  type: string;
  label: string;
  description: string;
}

export interface BackendEdge {
  source: string;
  target: string;
}

export interface BackendGraphData {
  nodes: BackendNode[];
  edges: BackendEdge[];
}
