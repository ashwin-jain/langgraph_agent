
import { GraphNode } from './graph';

export type ExecutionUpdate = {
  type: 'step_executing' | 'step_completed' | 'agent_completed';
  nodeId?: string;
  output?: string;
};

export type ExecuteOptions = {
  nodeIds: string[];
  nodes: GraphNode[];
};

export type ExecutionObserver = (update: ExecutionUpdate) => void;
