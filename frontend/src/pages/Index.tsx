
import { useState, useEffect, useCallback, useRef } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Edge,
} from '@xyflow/react';
import GraphNode from '../components/GraphNode';
import { ExecutionPanel } from '../components/ExecutionPanel';
import { mockBackendData } from '../data/mockGraphData';
import { mockWebSocketService } from '../services/mockWebSocketService';
import { realWebSocketService } from '../services/realWebSocketService';
import { ExecutionUpdate } from '../types/websocket';
import { GraphNode as GraphNodeType, BackendGraphData } from '../types/graph';
import { graphService } from '../services/graphService';
import { transformGraphData } from '../utils/graphUtils';
import '@xyflow/react/dist/style.css';
import '../styles/graph.css';

const nodeTypes = {
  graphNode: GraphNode,
};

// Use realWebSocketService for development and production
const websocketService = realWebSocketService;

const Index = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Store transformed graph data derived from backend data
  const [graphData, setGraphData] = useState(transformGraphData(mockBackendData));
  
  const [nodes, setNodes, onNodesChange] = useNodesState(graphData.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(graphData.edges as unknown as Edge[]);
  const [selectedNode, setSelectedNode] = useState<GraphNodeType | null>(null);
  
  // Replace single executingNodeId with a Set of executing node IDs
  const [executingNodeIds, setExecutingNodeIds] = useState<Set<string>>(new Set());
  const [executionOutput, setExecutionOutput] = useState<string>('');
  
  // Store node outputs in a ref to persist between renders
  const nodeOutputsRef = useRef<Record<string, string>>({});
  
  // Use a ref to track if updates are in progress
  const isUpdatingRef = useRef(false);
  // Queue updates if one is already in progress
  const pendingUpdateRef = useRef<null | (() => void)>(null);

  useEffect(() => {
    const fetchBackendData = async () => {
      try {
        setLoading(true);
        const backendData: BackendGraphData = await graphService.getGraphData();
        const transformedData = transformGraphData(backendData);
        setGraphData(transformedData);
        setError(null);
      } catch (error) {
        console.error('Error fetching graph data:', error);
        setError('Failed to fetch graph data from backend. Using mock data instead.');
        // Explicitly use mock data
        setGraphData(transformGraphData(mockBackendData));
      } finally {
        setLoading(false);
      }
    };

    // Try to fetch from backend, but always use mock data in development
    fetchBackendData();
  }, []);

  // Create an atomic update function to update graph data
  const updateGraph = useCallback(() => {
    // If already updating, don't proceed
    if (isUpdatingRef.current) {
      return;
    }
    
    isUpdatingRef.current = true;
    
    // Update both nodes and edges atomically
    if (graphData) {
      // Update nodes with current executing state
      const updatedNodes = graphData.nodes.map(node => ({
        ...node,
        position: { ...node.position },
        data: {
          ...node.data,
          // Check if this node ID is in the Set of executing nodes
          isExecuting: executingNodeIds.has(node.id)
        },
        style: { 
          ...node.style,
          // Fix the visibility type by using "visible" as a specific value, not a string type
          visibility: "visible" as const
        }
      }));
      
      // Update edges
      const updatedEdges = graphData.edges.map(edge => ({
        ...edge,
        style: {
          ...edge.style,
          visibility: "visible" as const,
          opacity: 1,
          zIndex: 5
        }
      })) as unknown as Edge[];
      
      // Set both nodes and edges
      setNodes(updatedNodes);
      setEdges(updatedEdges);
    }
    
    // Mark update as complete
    isUpdatingRef.current = false;
    
    // If there's a pending update, process it now
    if (pendingUpdateRef.current) {
      const pendingUpdate = pendingUpdateRef.current;
      pendingUpdateRef.current = null;
      pendingUpdate();
    }
  }, [graphData, executingNodeIds, setNodes, setEdges]);

  // Update nodes and edges when graph data changes or during execution
  useEffect(() => {
    updateGraph();
  }, [graphData, executingNodeIds, updateGraph]);

  // Connect to WebSocket on component mount
  useEffect(() => {
    websocketService.connect();
    
    // Subscribe to execution updates
    const unsubscribe = websocketService.subscribe((update: ExecutionUpdate) => {
      handleExecutionUpdate(update);
    });
    
    return () => {
      unsubscribe();
      websocketService.disconnect();
    };
  }, []);

  // Handle updates from the WebSocket
  const handleExecutionUpdate = useCallback((update: ExecutionUpdate) => {
    if (!update.nodeId) return;
    
    const node = nodes.find(n => n.id === update.nodeId);
    if (!node) return;

    // Select the node that's being processed
    setSelectedNode(node);
    
    // Create an update function
    const processUpdate = () => {
      if (update.type === 'step_executing') {
        // Add the node ID to the Set of executing nodes
        setExecutingNodeIds(prev => {
          const newSet = new Set(prev);
          newSet.add(update.nodeId as string);
          return newSet;
        });
      } else if (update.type === 'step_completed') {
        // Remove the node ID from the Set of executing nodes
        setExecutingNodeIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(update.nodeId as string);
          return newSet;
        });
        
        if (update.output) {
          // Store output in the ref for this node
          nodeOutputsRef.current[update.nodeId as string] = update.output;
          setExecutionOutput(update.output);
        }
      }
    };
    
    // If currently updating graph, queue this update
    if (isUpdatingRef.current) {
      pendingUpdateRef.current = processUpdate;
    } else {
      // Otherwise process immediately
      processUpdate();
    }
  }, [nodes]);

  const onNodeClick = (_: any, node: GraphNodeType) => {
    setSelectedNode(node);
    // Set the output to the stored value for this node, or empty string if none exists
    setExecutionOutput(nodeOutputsRef.current[node.id] || '');
  };

  const handleExecute = useCallback(() => {
    // When executing, make sure we keep the current nodes and edges
    websocketService.executeGraph();
  }, [nodes]);

  return (
    <div className="flex h-screen">
      <div className="w-1/3 border-r border-gray-200 relative overflow-auto">
        <div style={{ height: '100vh' }}>
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <p>Loading graph data...</p>
            </div>
          ) : (
            <ReactFlow
              nodes={nodes}
              edges={edges}
              nodeTypes={nodeTypes}
              fitView
              attributionPosition="bottom-right"
              nodesDraggable={false}
              nodesConnectable={false}
              elementsSelectable={true}
              onNodeClick={onNodeClick}
            >
              <Background />
              <Controls />
            </ReactFlow>
          )}
        </div>
        {error && (
          <div className="absolute bottom-4 left-4 right-4 bg-red-100 text-red-700 p-2 rounded-md text-sm">
            {error}
          </div>
        )}
      </div>
      <div className="w-2/3 p-6 flex flex-col h-full">
        <ExecutionPanel
          selectedNode={selectedNode}
          executionOutput={executionOutput}
          executingNodeIds={executingNodeIds}
          onExecute={handleExecute}
        />
      </div>
    </div>
  );
};

export default Index;
