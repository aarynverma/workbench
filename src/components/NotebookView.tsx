import React from 'react';
import { useWorkbenchStore } from '../store/workbenchStore';
import CellList from './CellList';

export default function NotebookView() {
  const selectedId = useWorkbenchStore(s => s.selectedNotebookId);
  const notebook = useWorkbenchStore(s =>
    s.notebooks.find(nb => nb.id === selectedId)
  );

  const addCell = useWorkbenchStore(s => s.addCell);

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
      />
    </div>
  );
}
