// src/utils/jupyterApi.ts
// Utility functions for interacting with Jupyter REST API and WebSocket

export const JUPYTER_BASE_URL = 'http://localhost:8888'; // Change if needed

export async function createNotebook(notebookName: string) {
  // Creates a new notebook via Jupyter API
  const res = await fetch(`${JUPYTER_BASE_URL}/api/contents`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'notebook',
      name: notebookName,
      format: 'json',
    }),
  });
  return res.json();
}

export async function startKernel(notebookPath: string) {
  // Starts a kernel for the notebook
  const res = await fetch(`${JUPYTER_BASE_URL}/api/kernels`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      path: notebookPath,
      name: 'python3', // or other kernel name
    }),
  });
  return res.json();
}

export async function updateCell(notebookPath: string, cellIndex: number, code: string) {
  // Updates cell code in the notebook
  // This is a simplified example; you may need to fetch notebook, update cell, and PUT back
  const res = await fetch(`${JUPYTER_BASE_URL}/api/contents/${notebookPath}`, {
    method: 'GET',
  });
  const notebook = await res.json();
  notebook.content.cells[cellIndex].source = code;
  const putRes = await fetch(`${JUPYTER_BASE_URL}/api/contents/${notebookPath}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content: notebook.content, type: 'notebook', format: 'json' }),
  });
  return putRes.json();
}

export function connectKernelWebSocket(kernelId: string, onMessage: (msg: any) => void) {
  // Connects to Jupyter kernel WebSocket and listens for messages
  const ws = new WebSocket(`${JUPYTER_BASE_URL.replace('http', 'ws')}/api/kernels/${kernelId}/channels`);
  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    onMessage(data);
  };
  return ws;
}

export function executeCell(ws: WebSocket, code: string, cellIndex: number) {
  // Sends code execution request to kernel WebSocket
  const message = {
    header: {
      msg_id: Math.random().toString(36).substr(2, 10),
      username: '',
      session: '',
      msg_type: 'execute_request',
      version: '5.0',
    },
    parent_header: {},
    metadata: {},
    content: {
      code,
      silent: false,
      store_history: true,
      user_expressions: {},
      allow_stdin: false,
      stop_on_error: true,
    },
    channel: 'shell',
  };
  ws.send(JSON.stringify(message));
}
