import React, { useState } from 'react';
import { useWorkbenchStore } from '../store/workbenchStore';

export default function NotebookList() {
  const notebooks = useWorkbenchStore(s => s.notebooks);
  const selectedId = useWorkbenchStore(s => s.selectedNotebookId);
  const addNotebook = useWorkbenchStore(s => s.addNotebook);
  const selectNotebook = useWorkbenchStore(s => s.setSelectedNotebook);

  const [name, setName] = useState('');
  return (
    <div className="w-1/4 border-r p-4">
      <h2 className="text-xl font-bold mb-2">Notebooks</h2>
      <ul>
        {notebooks.map(nb => (
          <li key={nb.id}>
            <button
              className={`w-full text-left py-2 px-2 ${
                nb.id === selectedId ? 'bg-blue-200' : ''
              }`}
              onClick={() => selectNotebook(nb.id)}
            >
              {nb.name || 'Untitled'}
            </button>
          </li>
        ))}
      </ul>

      <div className="mt-4">
        <input
          type="text"
          placeholder="New notebook..."
          value={name}
          onChange={e => setName(e.target.value)}
          className="border p-1 w-full mb-2"
        />
        <button
          onClick={() => {
            if (name.trim()) {
              addNotebook(name);
              setName('');
            }
          }}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Add
        </button>
      </div>
    </div>
  );
}
