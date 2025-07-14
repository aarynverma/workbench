import React, { useEffect } from 'react';
import { useWorkbenchStore } from '../store/workbenchStore';
import CellList from './CellList';
import { createJupyterHubNotebook, startJupyterHubKernel } from '../utils/jupyterApi';

const JUPYTERHUB_TOKEN = "f89d68d1fdd54ce48fff0bb3d629b5e6";

export default function NotebookView() {

  const selectedId = useWorkbenchStore(s => s.selectedNotebookId);
  const notebook = useWorkbenchStore(s =>
    s.notebooks.find(nb => nb.id === selectedId)
  );
  const setNotebookMeta = useWorkbenchStore(s => s.updateNotebookMeta);
  const addCell = useWorkbenchStore(s => s.addCell);

  useEffect(() => {
    const setupNotebookAndKernel = async () => {
      if (!notebook) return;
      if (!notebook.notebookPath) {
        const nbName = notebook.name ? `${notebook.name}.ipynb` : `Untitled.ipynb`;
        const nbRes = await createJupyterHubNotebook(JUPYTERHUB_TOKEN, nbName);
        const nbPath = nbRes.path;
        setNotebookMeta(notebook.id, { notebookPath: nbPath });
        const kernelRes = await startJupyterHubKernel(JUPYTERHUB_TOKEN, nbPath);
        setNotebookMeta(notebook.id, { kernelId: kernelRes.id });
      } else if (!notebook.kernelId) {
        const kernelRes = await startJupyterHubKernel(JUPYTERHUB_TOKEN, notebook.notebookPath);
        setNotebookMeta(notebook.id, { kernelId: kernelRes.id });
      }
    };
    setupNotebookAndKernel();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notebook?.id]);

  if (!notebook) {
    return <div className="flex-1 flex items-center justify-center">No notebook selected</div>;
  }

  return (
    <div className="flex-1 p-4">
      <h2 className="text-2xl font-semibold mb-4">{notebook.name || 'Untitled'}</h2>
      <button
        onClick={() => addCell(notebook.id)}
        className="mb-4 bg-green-500 text-white px-3 py-1 rounded"
      >
        + Add Cell
      </button>
      <CellList
        notebook={{
          ...notebook,
          notebookPath: notebook.notebookPath || '',
          kernelId: notebook.kernelId || '',
        }}
        token={JUPYTERHUB_TOKEN}
      />
    </div>
  );
}
