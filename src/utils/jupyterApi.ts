export function connectJupyterHubKernelWebSocket(
  kernelId: string,
  token: string,
  onMessage: (msg: any) => void
) {
  const wsUrl = `ws://localhost:8000/user/admin/api/kernels/${kernelId}/channels?token=${token}`;
  const ws = new WebSocket(wsUrl);
  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    onMessage(data);
  };
  return ws;
}

export function executeJupyterHubCell(
  ws: WebSocket,
  code: string,
  username = "admin",
  session: string
) {
  const message = {
    header: {
      msg_id: session,
      username,
      session,
      msg_type: "execute_request",
      version: "5.0",
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
    channel: "shell",
  };
  console.log("Sending execute_request message:", message);
  ws.send(JSON.stringify(message));
}
export async function updateJupyterHubCell(
  token: string,
  notebookPath: string,
  cellIndex: number,
  code: string
) {
  const res = await fetch(
    `http://localhost:8000/user/admin/api/contents/${encodeURIComponent(
      notebookPath
    )}`,
    {
      method: "GET",
      headers: {
        Authorization: `token ${token}`,
      },
    }
  );
  if (!res.ok) {
    throw new Error(`Failed to fetch notebook: ${res.statusText}`);
  }
  const notebook = await res.json();
  while (notebook.content.cells.length <= cellIndex) {
    notebook.content.cells.push({
      cell_type: "code",
      metadata: {
        kernelspec: {
          display_name: "Python 3",
          language: "python",
          name: "python3",
        },
      },
      source: "",
      outputs: [],
      execution_count: null,
    });
  }
  notebook.content.cells[cellIndex].source = code;
  console.log(notebook, 'notebook content before update');
  const putRes = await fetch(
    `http://localhost:8000/user/admin/api/contents/${encodeURIComponent(
      notebookPath
    )}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `token ${token}`,
      },
      body: JSON.stringify({
        content: notebook.content,
        type: "notebook",
        format: "json",
      }),
    }
  );
  if (!putRes.ok) {
    throw new Error(`Failed to update notebook: ${putRes.statusText}`);
  }
  return putRes.json();
}
export async function startJupyterHubKernel(
  token: string,
  notebookPath: string
) {
  const response = await fetch(`http://localhost:8000/user/admin/api/kernels`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `token ${token}`,
    },
    body: JSON.stringify({
      path: notebookPath,
      name: "python3",
    }),
  });
  if (!response.ok) {
    throw new Error(`Failed to start kernel: ${response.statusText}`);
  }
  return response.json();
}
export async function createJupyterHubNotebook(
  token: string,
  notebookName = "MyNotebook.ipynb"
) {
  const response = await fetch(
    `http://localhost:8000/user/admin/api/contents/`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `token ${token}`,
      },
      body: JSON.stringify({
        type: "notebook",
        name: notebookName,
      }),
    }
  );
  if (!response.ok) {
    throw new Error(`Failed to create notebook: ${response.statusText}`);
  }
  return response.json();
}

export const JUPYTER_BASE_URL = "http://localhost:8888";

export async function createNotebook(notebookName: string) {
  const res = await fetch(`${JUPYTER_BASE_URL}/api/contents`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      type: "notebook",
      name: notebookName,
      format: "json",
    }),
  });
  return res.json();
}

export async function startKernel(notebookPath: string) {
  const res = await fetch(`${JUPYTER_BASE_URL}/api/kernels`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      path: notebookPath,
      name: "python3", // or other kernel name
    }),
  });
  return res.json();
}

export async function updateCell(
  notebookPath: string,
  cellIndex: number,
  code: string
) {
  const res = await fetch(`${JUPYTER_BASE_URL}/api/contents/${notebookPath}`, {
    method: "GET",
  });
  const notebook = await res.json();
  notebook.content.cells[cellIndex].source = code;
  const putRes = await fetch(
    `${JUPYTER_BASE_URL}/api/contents/${notebookPath}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: notebook.content,
        type: "notebook",
        format: "json",
      }),
    }
  );
  return putRes.json();
}

export function connectKernelWebSocket(
  kernelId: string,
  onMessage: (msg: any) => void
) {
  const ws = new WebSocket(
    `${JUPYTER_BASE_URL.replace("http", "ws")}/api/kernels/${kernelId}/channels`
  );
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
      username: "",
      session: "",
      msg_type: "execute_request",
      version: "5.0",
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
    channel: "shell",
  };
  ws.send(JSON.stringify(message));
}
