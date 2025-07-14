import React, { useState, useRef } from 'react';
import { useWorkbenchStore } from '../store/workbenchStore';
import { updateJupyterHubCell, connectJupyterHubKernelWebSocket, executeJupyterHubCell } from '../utils/jupyterApi';
import { v4 as uuidv4 } from 'uuid';

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
  token: string;
}


export default function CellItem({ notebookId, cell, dragHandleProps, notebookPath, kernelId, cellIndex, token }: CellItemProps) {
  console.log('Running cell with kernelId:', kernelId, 'notebookPath:', notebookPath);
  const updateCell = useWorkbenchStore((s: any) => s.updateCell);
  const deleteCell = useWorkbenchStore((s: any) => s.deleteCell);
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Memoize the onChange handler to prevent recreating it on every render
  const handleCodeChange = React.useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateCell(notebookId, cell.id, { code: e.target.value });
  }, [notebookId, cell.id, updateCell]);

  const handleRun = async () => {
    if (!notebookPath || !kernelId) {
      alert('Notebook or kernel is not ready. Please try again.');
      setIsRunning(false);
      return;
    }
    setIsRunning(true);
    setOutput('');
    await updateJupyterHubCell(token, notebookPath, cellIndex, cell.code);
    const ws = connectJupyterHubKernelWebSocket(kernelId, token, (msg) => {
      console.log("WS message:", msg);
      const msgType = msg.header?.msg_type;
      if (msgType === 'stream' && msg.content?.text) {
        setOutput(prev => prev + msg.content.text);
        ws.close();
        setIsRunning(false);
      }
      if (msgType === 'execute_result' && msg.content?.data) {
        setOutput(prev => prev + (msg.content.data['text/plain'] || ''));
        setIsRunning(false);
        ws.close();
      }
      if (msgType === 'error' && msg.content?.evalue) {
        setOutput(prev => prev + '\nError: ' + msg.content.evalue);
        setIsRunning(false);
        ws.close();
      }
    });
    ws.onopen = () => {
      const session = uuidv4();
      const username = 'admin';
      console.log("WebSocket opened, sending execute request:", cell.code);
      executeJupyterHubCell(ws, cell.code, username, session);
    };
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
        ref={textareaRef}
        className="w-full h-24 border p-2"
        value={cell.code}
        onChange={handleCodeChange}
        data-cell-id={cell.id}
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
