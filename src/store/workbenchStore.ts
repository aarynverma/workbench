import { create } from 'zustand';
import { produce } from 'immer';
import { nanoid } from 'nanoid';

interface Cell {
  id: string;
  code: string;
  output: string;
  status: 'idle' | 'running' | 'error' | 'success';
}

interface Notebook {
  id: string;
  name: string;
  cells: Cell[];
  notebookPath: string;
  kernelId: string;
}

interface WorkbenchState {
  notebooks: Notebook[];
  selectedNotebookId: string | null;

  addNotebook: (name: string) => void;
  deleteNotebook: (id: string) => void;
  setSelectedNotebook: (id: string) => void;

  addCell: (notebookId: string) => void;
  updateCell: (
    notebookId: string,
    cellId: string,
    params: Partial<Omit<Cell, 'id'>>
  ) => void;
  deleteCell: (notebookId: string, cellId: string) => void;
  reorderCells: (notebookId: string, newOrder: string[]) => void;
}

export const useWorkbenchStore = create<WorkbenchState>((set) => ({
  notebooks: [],
  selectedNotebookId: null,

  addNotebook: (name) =>
    set((state) => ({
      notebooks: [
        ...state.notebooks,
        { id: nanoid(), name, cells: [], notebookPath: '', kernelId: '' },
      ],
    })),

  deleteNotebook: (id) =>
    set((state) => ({
      notebooks: state.notebooks.filter((nb) => nb.id !== id),
      selectedNotebookId:
        state.selectedNotebookId === id
          ? state.notebooks.length > 1
            ? state.notebooks[0].id
            : null
          : state.selectedNotebookId,
    })),

  setSelectedNotebook: (id) => set(() => ({ selectedNotebookId: id })),

  addCell: (notebookId) =>
    set((state) => ({
      notebooks: state.notebooks.map((nb) =>
        nb.id === notebookId
          ? {
              ...nb,
              cells: [
                ...nb.cells,
                {
                  id: nanoid(),
                  code: '',
                  output: '',
                  status: 'idle',
                },
              ],
            }
          : nb
      ),
    })),

  updateCell: (notebookId, cellId, params) =>
    set((state) => ({
      notebooks: state.notebooks.map((nb) =>
        nb.id === notebookId
          ? {
              ...nb,
              cells: nb.cells.map((c) =>
                c.id === cellId
                  ? { ...c, ...params }
                  : c
              ),
            }
          : nb
      ),
    })),

  deleteCell: (notebookId, cellId) =>
    set((state) => ({
      notebooks: state.notebooks.map((nb) =>
        nb.id === notebookId
          ? { ...nb, cells: nb.cells.filter((c) => c.id !== cellId) }
          : nb
      ),
    })),

  reorderCells: (notebookId, newOrder) =>
    set((state) =>
      produce(state, (draft) => {
        const nb = draft.notebooks.find((n) => n.id === notebookId);
        if (nb) {
          nb.cells = newOrder
            .map((cellId) => nb.cells.find((c) => c.id === cellId)!)
            .filter(Boolean);
        }
      })
    ),
}));
