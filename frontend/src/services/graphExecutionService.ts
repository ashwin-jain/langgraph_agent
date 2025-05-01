
import { Edge } from '@xyflow/react';
import { GraphNode } from '../types/graph';
import { realWebSocketService } from './realWebSocketService';

export const getChildNodes = (nodeId: string, edges: Edge[]): string[] => {
  const children: string[] = [];
  const visited = new Set<string>();

  const traverse = (currentId: string) => {
    if (visited.has(currentId)) return;
    visited.add(currentId);
    
    edges.forEach(edge => {
      if (edge.source === currentId) {
        children.push(edge.target);
        traverse(edge.target);
      }
    });
  };

  traverse(nodeId);
  return children;
};

export const getAllNodes = (nodes: GraphNode[], edges: Edge[]): string[] => {
  // Get all nodes except __start__ and __end__
  return nodes
    .filter(node => !['__start__', '__end__'].includes(node.data.label))
    .map(node => node.id);
};

export const executeNodes = (
  nodes: GraphNode[],
  edges: Edge[],
  type: 'single' | 'below' | 'all' = 'all',
  selectedNodeId?: string
): void => {
  // We're simplifying this to only execute all nodes
  const nodesToExecute = getAllNodes(nodes, edges);

  // Fix: Call executeGraph without passing an object as parameter
  // The realWebSocketService.executeGraph() doesn't need the object we're passing
  realWebSocketService.executeGraph();
};
