import React from 'react';
import CellItem from './CellItem';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useWorkbenchStore } from '../store/workbenchStore';


interface CellListProps {
  notebook: {
    id: string;
    cells: any[];
    notebookPath: string;
    kernelId: string;
  };
  token: string;
}


function SortableCellItem({ cell, notebookId, notebookPath, kernelId, cellIndex, token }: {
  cell: any;
  notebookId: string;
  notebookPath: string;
  kernelId: string;
  cellIndex: number;
  token: string;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: cell.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 'auto',
  };

  const dragHandleProps = {
    ...attributes,
    ...listeners,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <CellItem
        cell={cell}
        notebookId={notebookId}
        dragHandleProps={dragHandleProps}
        notebookPath={notebookPath}
        kernelId={kernelId}
        cellIndex={cellIndex}
        token={token}
      />
    </div>
  );
}

const CellList: React.FC<CellListProps> = ({ notebook, token }) => {
  const { cells, id: notebookId, notebookPath, kernelId } = notebook;
  const reorderCells = useWorkbenchStore(s => s.reorderCells);

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = cells.findIndex(c => c.id === active.id);
      const newIndex = cells.findIndex(c => c.id === over.id);
      const newOrder = arrayMove(cells.map(c => c.id), oldIndex, newIndex);
      reorderCells(notebookId, newOrder);
    }
  };

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={cells.map(c => c.id)} strategy={verticalListSortingStrategy}>
        <div>
          {cells.map((cell, idx) => (
            <SortableCellItem
              key={cell.id}
              cell={cell}
              notebookId={notebookId}
              notebookPath={notebookPath}
              kernelId={kernelId}
              cellIndex={idx}
              token={token}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
};

export default CellList;
