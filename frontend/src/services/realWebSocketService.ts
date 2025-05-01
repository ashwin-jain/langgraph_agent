
import { io, Socket } from 'socket.io-client';
import { ExecutionUpdate, ExecuteOptions, ExecutionObserver } from '../types/websocket';

class RealWebSocketService {
  private socket: Socket | null = null;
  private observers: ExecutionObserver[] = [];
  private executing: boolean = false;

  connect(): void {
    if (this.socket) {
      this.socket.disconnect();
    }

    this.socket = io("http://localhost:8765");
    
    this.socket.on("connect", () => {
      console.log("✅ Connected to Socket.IO server");
    });

    this.socket.on("message", (data) => {
      // Parse the data if it's a string
      const parsedData = typeof data === 'string' ? JSON.parse(data) : data;
      console.log("Received message:", parsedData);
      
      // Convert server message to ExecutionUpdate format
      if (parsedData.type && parsedData.nodeId) {
        const update: ExecutionUpdate = {
          type: parsedData.type as 'step_executing' | 'step_completed',
          nodeId: parsedData.nodeId,
          // Handle output properly - don't stringify text that's already a string
          output: typeof parsedData.output === 'string' 
            ? parsedData.output 
            : parsedData.output 
              ? JSON.stringify(parsedData.output, null, 2) 
              : undefined
        };
        
        // Notify all observers
        this.notify(update);
      }

      if(parsedData.type &&  parsedData.type === 'agent_completed') {
        this.executing = false;
      }
    });

    this.socket.on("disconnect", () => {
      console.log("❌ Disconnected from server");
      this.executing = false;
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    console.log("Socket.IO manually disconnected");
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

  executeGraph(): void {
    if (!this.socket || !this.socket.connected) {
      console.error("Socket not connected. Cannot execute graph.");
      return;
    }
    
    if (this.executing) {
      console.warn("Execution already in progress");
      return;
    }
    
    this.executing = true;
    
    // Send command to start execution
    this.socket.emit("start_agent");
    
    console.log("Execution request sent to server");
  }
}

export const realWebSocketService = new RealWebSocketService();
