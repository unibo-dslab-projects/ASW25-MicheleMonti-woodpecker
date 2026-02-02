import { useState } from 'react';
import { DeskCell, PieceType, WHITE_SIDE_CELLS, BLACK_SIDE_CELLS } from '../defs';

export function useBoardInteractions(initialBoard: Map<DeskCell, PieceType>) {
  const [board, setBoard] = useState<Map<DeskCell, PieceType>>(initialBoard);
  const [selectedCell, setSelectedCell] = useState<DeskCell | null>(null);

  const isSideCell = (cell: DeskCell): boolean => {
    return WHITE_SIDE_CELLS.includes(cell as any) || BLACK_SIDE_CELLS.includes(cell as any);
  };

  const onSelectedCell = (cell: DeskCell) => {
    if (selectedCell == cell) {
      setSelectedCell(null);
    } else if (selectedCell) {
      const piece = board.get(selectedCell);
      if (!piece) return;
      
      const destPiece = board.get(cell);
      const isDestSideCell = isSideCell(cell);
      const isSourceSideCell = isSideCell(selectedCell);
      
      const newBoard = new Map(board);
      newBoard.delete(selectedCell);
      
      if (!isDestSideCell) newBoard.set(cell, piece);
      if (isSourceSideCell) newBoard.set(selectedCell, new PieceType(piece.type, piece.color));
      if ((isSourceSideCell && isDestSideCell) || (!isDestSideCell && destPiece && destPiece.color === piece.color)) {
        setSelectedCell(cell);
        return;
      }
      
      setBoard(newBoard);
      setSelectedCell(null);
    } else if (board.has(cell)) {
      setSelectedCell(cell);
    }
  };

  return {
    board,
    setBoard,
    selectedCell,
    setSelectedCell,
    onSelectedCell,
    isSideCell
  };
}