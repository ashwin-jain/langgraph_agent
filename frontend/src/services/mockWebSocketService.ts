
import { ExecutionUpdate, ExecuteOptions, ExecutionObserver } from '../types/websocket';
import { GraphNode } from '../types/graph';

class MockWebSocketService {
  private observers: ExecutionObserver[] = [];
  private executing: boolean = false;

  connect(): void {
    console.log('Mock WebSocket connected');
  }

  disconnect(): void {
    console.log('Mock WebSocket disconnected');
  }

  subscribe(observer: ExecutionObserver): () => void {
    this.observers.push(observer);
    return () => {
      this.observers = this.observers.filter(obs => obs !== observer);
    };
  }

  private notify(update: ExecutionUpdate): void {
    this.observers.forEach(observer => observer(update));
  }

  executeGraph(options: ExecuteOptions): void {
    if (this.executing) return;
    
    this.executing = true;
    
    // Execute all nodes except system nodes
    const nodesToExecute = options.nodes.map(node => node.id);
    
    this.simulateExecution({ nodeIds: nodesToExecute, nodes: options.nodes });
  }

  private async simulateExecution({ nodeIds, nodes }: ExecuteOptions): Promise<void> {
    // Process nodes sequentially with delays to simulate server processing
    for (const nodeId of nodeIds) {
      const node = nodes.find(n => n.id === nodeId);
      if (!node) continue;
      
      // Notify about the node being executed
      this.notify({ type: 'step_executing', nodeId });
      
      // Simulate backend processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate result based on node
      let output = "Execution completed successfully";
      if (nodeId === 'analysis1') {
        const analysisOutput = {
          top_values: [
            { key: "item3", value: 95 },
            { key: "item1", value: 85 },
            { key: "item4", value: 75 },
            { key: "item2", value: 65 },
            { key: "item5", value: 55 }
          ],
          metadata: {
            total_processed: 6,
            execution_time: "1.2s",
            status: "success"
          }
        };
        output = JSON.stringify(analysisOutput, null, 2);
      }
      
      // Notify about completion
      this.notify({ type: 'step_completed', nodeId, output });
      
      // Wait before processing next node
      if (nodeId !== nodeIds[nodeIds.length - 1]) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    this.executing = false;
  }
}

export const mockWebSocketService = new MockWebSocketService();
