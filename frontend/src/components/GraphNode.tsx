
import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Loader2 } from 'lucide-react';

const GraphNode = ({ data }: { data: { label: string, content?: string, isExecuting?: boolean } }) => {
  return (
    <div className="graph-node">
      <Handle type="target" position={Position.Top} />
      <div className="w-[120px] h-[40px] px-4 py-2 bg-white text-gray-800 rounded-lg shadow-sm border border-gray-200 flex items-center justify-center relative">
        {data.label}
        {data.isExecuting && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        )}
      </div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};

export default memo(GraphNode);
