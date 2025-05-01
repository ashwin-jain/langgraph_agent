import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import python from 'react-syntax-highlighter/dist/esm/languages/hljs/python';
import json from 'react-syntax-highlighter/dist/esm/languages/hljs/json';
import atomOneLight from 'react-syntax-highlighter/dist/esm/styles/hljs/atom-one-light';
import { Button } from '@/components/ui/button';
import { GraphNode } from '../types/graph';

SyntaxHighlighter.registerLanguage('python', python);
SyntaxHighlighter.registerLanguage('json', json);

interface ExecutionPanelProps {
  selectedNode: GraphNode | null;
  executionOutput: string;
  executingNodeIds: Set<string>;
  onExecute: () => void;
}

const renderContent = (content: string) => {
  // Check if content is Python code
  if (content.includes('def ')) {
    return (
      <SyntaxHighlighter
        language="python"
        style={atomOneLight}
        customStyle={{ margin: 0, borderRadius: '0.375rem' }}
      >
        {content}
      </SyntaxHighlighter>
    );
  }
  
  // Check if content is JSON
  try {
    JSON.parse(content);
    return (
      <SyntaxHighlighter
        language="json"
        style={atomOneLight}
        customStyle={{ margin: 0, borderRadius: '0.375rem' }}
      >
        {content}
      </SyntaxHighlighter>
    );
  } catch {
    // If not JSON, return as plain text with normal word wrap
    return (
      <div className="whitespace-pre-wrap">{content}</div>
    );
  }
};

export const ExecutionPanel = ({ 
  selectedNode, 
  executionOutput, 
  executingNodeIds, 
  onExecute 
}: ExecutionPanelProps) => {
  if (!selectedNode) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        Select a node to view details
      </div>
    );
  }

  return (
    <>
      <h2 className="text-2xl font-bold mb-4">{selectedNode.data.label}</h2>
      <div className="h-[400px] mb-4 overflow-auto rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background">
        {selectedNode.data.content && renderContent(selectedNode.data.content)}
      </div>
      <div className="h-[400px] mb-4 overflow-auto rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background">
        {executionOutput && renderContent(executionOutput)}
      </div>
      <div className="flex justify-end items-center gap-4">
        <Button 
          onClick={onExecute}
          disabled={executingNodeIds.size > 0}
        >
          Execute
        </Button>
      </div>
    </>
  );
};
