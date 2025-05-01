
import { BackendGraphData, GraphData, GraphNode, GraphEdge } from '../types/graph';
import { MarkerType } from '@xyflow/react';

// Function to transform backend data to ReactFlow format
export const transformGraphData = (backendData: BackendGraphData): GraphData => {
  const verticalSpacing = 100; // Using 100 as specified
  
  // Create a map to store node positions
  const nodePositions = new Map<string, { x: number, y: number }>();
  
  // Create maps to store children and parents for each node
  const childrenMap = new Map<string, string[]>();
  const parentMap = new Map<string, string>();
  
  // Build the children and parent maps
  backendData.edges.forEach(edge => {
    if (!childrenMap.has(edge.source)) {
      childrenMap.set(edge.source, []);
    }
    childrenMap.get(edge.source)!.push(edge.target);
    
    // Record parent relationship
    parentMap.set(edge.target, edge.source);
  });
  
  // Calculate node levels and positions using topological sort
  const calculateNodePositions = () => {
    // Find root nodes (nodes with no incoming edges)
    const inDegree = new Map<string, number>();
    backendData.nodes.forEach(node => {
      inDegree.set(node.id, 0);
    });
    
    backendData.edges.forEach(edge => {
      inDegree.set(edge.target, (inDegree.get(edge.target) || 0) + 1);
    });
    
    // Start with root nodes
    const queue: string[] = [];
    const levels = new Map<string, number>();
    
    backendData.nodes.forEach(node => {
      if ((inDegree.get(node.id) || 0) === 0) {
        queue.push(node.id);
        levels.set(node.id, 0);
      }
    });
    
    // Process nodes in topological order
    let currentLevel = 0;
    while (queue.length > 0) {
      const levelSize = queue.length;
      const nodesAtCurrentLevel: string[] = [];
      
      // Process all nodes at the current level
      for (let i = 0; i < levelSize; i++) {
        const nodeId = queue.shift()!;
        nodesAtCurrentLevel.push(nodeId);
        
        // Add children to queue for next level processing
        const children = childrenMap.get(nodeId) || [];
        children.forEach(childId => {
          inDegree.set(childId, inDegree.get(childId)! - 1);
          if (inDegree.get(childId) === 0) {
            queue.push(childId);
            levels.set(childId, currentLevel + 1);
          }
        });
      }
      
      // Position nodes at current level
      const levelWidth = nodesAtCurrentLevel.length;
      nodesAtCurrentLevel.forEach((nodeId, index) => {
        // Calculate position for this node
        // Center position is 250
        const x = 250 - ((levelWidth - 1) * 150) / 2 + index * 150;
        const y = currentLevel * verticalSpacing;
        nodePositions.set(nodeId, { x, y });
      });
      
      currentLevel++;
    }
    
    // Handle branching cases specifically
    // First, identify all nodes with multiple children (branching nodes)
    const branchingNodes = Array.from(childrenMap.entries())
      .filter(([_, children]) => children.length > 1)
      .map(([nodeId]) => nodeId);
    
    // For each branching node, adjust the children positions
    branchingNodes.forEach(nodeId => {

      const children = childrenMap.get(nodeId) || [];
      if (children.length > 1) {
        // Calculate current min and max x of children
        let minX = Infinity;
        let maxX = -Infinity;
        
        children.forEach(childId => {
          const pos = nodePositions.get(childId);
          if (pos) {
            minX = Math.min(minX, pos.x);
            maxX = Math.max(maxX, pos.x);
          }
        });
        
        // Current parent position
        const parentPos = nodePositions.get(nodeId);
        if (parentPos) {
          // Calculate midpoint of children
          const midpoint = (minX + maxX) / 2;
          
          // If parent is not at midpoint, adjust children
          // if (midpoint !== parentPos.x) {
            const offset = parentPos.x - midpoint;
            
            children.forEach(childId => {
              const pos = nodePositions.get(childId);
              if (pos) {
                nodePositions.set(childId, {
                  x: pos.x + offset,
                  y: pos.y
                });
                
                // Recursively adjust all descendants to align with their direct parent
                adjustDescendants(childId, offset);
              }
            });
          // }
        }
      }
    });
    
    // Helper function to recursively adjust descendants
    function adjustDescendants(nodeId: string, initialOffset: number) {
      const children = childrenMap.get(nodeId) || [];
      
      // If this node has only one child, align that child directly below
      if (children.length === 1) {
        const childId = children[0];
        const childPos = nodePositions.get(childId);
        const parentPos = nodePositions.get(nodeId);
        
        if (childPos && parentPos) {
          // Only adjust X to align with parent (keep Y as is)
          const newX = parentPos.x;
          if (newX !== childPos.x) {
            const childOffset = newX - childPos.x;
            nodePositions.set(childId, {
              x: newX,
              y: childPos.y
            });
            
            // Recursively adjust this child's descendants
            adjustDescendants(childId, childOffset);
          }
        }
      }
      // If node has multiple children, they should already be positioned correctly 
      // relative to this parent (after the branching adjustment)
      else if (children.length > 1) {
        // No need to adjust x positions as they were already set correctly in the branching logic
        // But we should still propagate the adjustment to non-branching descendants
        children.forEach(childId => {
          const grandchildren = childrenMap.get(childId) || [];
          if (grandchildren.length === 1) {
            adjustDescendants(childId, 0); // Continue alignment but no offset needed
          }
        });
      }
    }
  };
  
  // Calculate positions for all nodes
  calculateNodePositions();
  
  // Create ReactFlow nodes
  const nodes: GraphNode[] = backendData.nodes.map(node => {
    const position = nodePositions.get(node.id) || { x: 0, y: 0 };
    
    return {
      id: node.id,
      type: 'graphNode',
      position: position,
      data: { 
        label: node.label,
        content: node.description 
      },
      draggable: false,
      style: {
        visibility: 'visible' as const
      }
    };
  });

  // Create ReactFlow edges
  const edges: GraphEdge[] = backendData.edges.map((edge, index) => ({
    id: `e-${edge.source}-${edge.target}`,
    source: edge.source,
    target: edge.target,
    type: 'default',
    markerEnd: { type: MarkerType.ArrowClosed },
    style: { 
      strokeWidth: 2,
      visibility: 'visible' as const,
      opacity: 1,
      zIndex: 5
    }
  }));

  return { nodes, edges };
};
