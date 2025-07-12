import React from 'react';
import { useWorkbenchStore } from '../store/workbenchStore';

import { useState } from 'react';
import { updateCell as updateJupyterCell, connectKernelWebSocket, executeCell } from '../utils/jupyterApi';

interface CellItemProps {
  notebookId: string;
  cell: {
    id: string;
    code: string;
    output: string;
    status: 'idle' | 'running' | 'error' | 'success';
  };
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>;
  notebookPath: string;
  kernelId: string;
  cellIndex: number;
}


export default function CellItem({ notebookId, cell, dragHandleProps, notebookPath, kernelId, cellIndex }: CellItemProps) {
  const updateCell = useWorkbenchStore(s => s.updateCell);
  const deleteCell = useWorkbenchStore(s => s.deleteCell);
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);

  const handleRun = async () => {
    setIsRunning(true);
    setOutput('');
    // 1. Update cell code in Jupyter notebook
    await updateJupyterCell(notebookPath, cellIndex, cell.code);
    // 2. Connect to kernel WebSocket
    const ws = connectKernelWebSocket(kernelId, (msg) => {
      // 3. Stream output
      if (msg.msg_type === 'stream' && msg.content?.text) {
        setOutput(prev => prev + msg.content.text);
      }
      if (msg.msg_type === 'execute_result' && msg.content?.data) {
        setOutput(prev => prev + (msg.content.data['text/plain'] || ''));
      }
      if (msg.msg_type === 'error' && msg.content?.evalue) {
        setOutput(prev => prev + '\nError: ' + msg.content.evalue);
      }
      if (msg.msg_type === 'status' && msg.content?.execution_state === 'idle') {
        ws.close();
        setIsRunning(false);
      }
    });
    // 4. Execute cell
    executeCell(ws, cell.code, cellIndex);
  };

  return (
    <div className="border p-3 mb-2 bg-gray-50 flex flex-col">
      <div className="flex items-center mb-2">
        <div
          {...dragHandleProps}
          className="cursor-grab mr-2 p-1 text-gray-500 hover:text-blue-600"
          title="Drag to reorder"
          style={{ display: 'flex', alignItems: 'center' }}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="5" cy="6" r="1.5" fill="currentColor" />
            <circle cx="5" cy="10" r="1.5" fill="currentColor" />
            <circle cx="5" cy="14" r="1.5" fill="currentColor" />
            <circle cx="15" cy="6" r="1.5" fill="currentColor" />
            <circle cx="15" cy="10" r="1.5" fill="currentColor" />
            <circle cx="15" cy="14" r="1.5" fill="currentColor" />
          </svg>
        </div>
        <span className="font-semibold text-gray-700">Cell</span>
      </div>
      <textarea
        className="w-full h-24 border p-2"
        value={cell.code}
        onChange={e =>
          updateCell(notebookId, cell.id, { code: e.target.value })
        }
      />
      <div className="mt-2 flex space-x-2">
        <button
          onClick={handleRun}
          disabled={isRunning}
          className="bg-blue-500 text-white px-3 py-1 rounded"
        >
          {isRunning ? 'Running...' : 'Run'}
        </button>
        <button
          onClick={() => deleteCell(notebookId, cell.id)}
          className="bg-red-500 text-white px-3 py-1 rounded"
        >
          Delete
        </button>
      </div>
      <pre className="mt-2 bg-gray-200 p-2 h-28 overflow-auto">
        {output}
      </pre>
    </div>
  );
}
