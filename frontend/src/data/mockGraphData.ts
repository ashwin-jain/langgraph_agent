
import { BackendGraphData } from '../types/graph';
import { transformGraphData } from '../utils/graphUtils';

export const mockBackendData: BackendGraphData = {
  "nodes": [
    {
      "id": "analysis0",
      "type": "function",
      "label": "Analysis0m",
      "description": "```\ndef analysis_step0(state):\n    time.sleep(2)\n    result = {\n        \"market_size\": 1000000000,\n        \"growth_rate\": 0.15,\n        \"key_segments\": [\"segment1\", \"segment2\", \"segment3\"],\n        \"competitive_landscape\": {\"major_players\": 5, \"market_concentration\": \"medium\"}\n    }\n    return result\n```"
    },
    {
      "id": "analysis1",
      "type": "llm_text",
      "label": "Analysis1",
      "description": "Based on the market analysis data, identify key market opportunities.\n    Previous step output: <undefined>"
    },
    {
      "id": "analysis2",
      "type": "llm_text",
      "label": "Analysis2",
      "description": "Analyze competitive positioning and market dynamics.\n    Previous analysis: <undefined>"
    },
    {
      "id": "slide2",
      "type": "llm_json",
      "label": "Slide2",
      "description": "Create a summary slide for competitive analysis. Return only a concise JSON for a presentation slide and nothing else.\n    Analysis output: <undefined>"
    },
    {
      "id": "analysis3",
      "type": "function",
      "label": "Analysis3",
      "description": "```\ndef analysis_step3(state):\n    result = {\n        \"internal_capabilities\": {\"technology\": 0.8, \"market_reach\": 0.6, \"innovation\": 0.7},\n        \"gaps_identified\": [\"digital_transformation\", \"customer_experience\", \"data_analytics\"]\n    }\n    return result\n```"
    },
    {
      "id": "analysis4",
      "type": "llm_text",
      "label": "Analysis4",
      "description": "Synthesize findings and develop strategic recommendations.\n    Previous analyses: <undefined>"
    },
    {
      "id": "slide4",
      "type": "llm_json",
      "label": "Slide4",
      "description": "Create a summary slide for strategic recommendations. Return only a concise JSON for a presentation slide and nothing else.\n    Analysis output: <undefined>"
    }
  ],
  "edges": [
    {
      "source": "analysis0",
      "target": "analysis1"
    },
    {
      "source": "analysis1",
      "target": "analysis2"
    },
    {
      "source": "analysis2",
      "target": "slide2"
    },
    {
      "source": "analysis2",
      "target": "analysis3"
    },
    {
      "source": "analysis3",
      "target": "analysis4"
    },
    {
      "source": "analysis4",
      "target": "slide4"
    }
  ]
};

// We'll derive the mockGraphData from the mockBackendData using our transform function
export const mockGraphData = transformGraphData(mockBackendData);
