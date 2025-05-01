
import { BackendGraphData } from '../types/graph';

const API_URL = 'http://localhost:8765';

export class GraphService {
  async getGraphData(): Promise<BackendGraphData> {
    try {
      const response = await fetch(`${API_URL}/graph-description`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching graph data:', error);
      throw error;
    }
  }
}

export const graphService = new GraphService();
