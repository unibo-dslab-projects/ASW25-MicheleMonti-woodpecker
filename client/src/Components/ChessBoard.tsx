import { useRef, useEffect } from "react";
import { DeskCell, BOARD_CELLS, COLUMNS, ROWS, WHITE_SIDE_CELLS, BLACK_SIDE_CELLS, PieceType } from "../defs";
import Piece from "./Piece";
import Square from "./Square";
import LoadingOverlay from "./LoadingOverlay";
import { BoardState } from "./types";

interface ChessBoardProps {
  board: BoardState;
  selectedCell: DeskCell | null;
  onCellClick: (cell: DeskCell) => void;
  isLoading?: boolean;
  loadingMessage?: string;
}

export default function ChessBoard({ 
  board, 
  selectedCell, 
  onCellClick, 
  isLoading = false,
  loadingMessage = "Loading puzzle..."
}: ChessBoardProps) {
  const gridElement = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function callback(mutations: MutationRecord[]) {
      let from = null, to = null, piece = null;
      for (const m of mutations) {
        if (m.addedNodes.length) { 
          to = m.target as Element; 
          piece = m.addedNodes[0] as Element; 
        } else if (m.removedNodes.length) { 
          from = m.target as Element; 
        }
      }
      if (from && to && piece) {
        const rFrom = from.getBoundingClientRect(), rTo = to.getBoundingClientRect();
        const dx = rFrom.x - rTo.x, dy = rFrom.y - rTo.y;
        piece.animate([
          { translate: `${dx}px ${dy}px` },
          { translate: "0px 0px" },
        ], { duration: 200, easing: "cubic-bezier(0.65, 0, 0.35, 1)" });
      }
    }
    
    if (gridElement.current) {
      const observer = new MutationObserver(callback);
      observer.observe(gridElement.current, { subtree: true, childList: true });
      return () => observer.disconnect();
    }
  }, []);

  return (
    <div className={`relative transition-opacity duration-300 ${isLoading ? 'opacity-70' : 'opacity-100'}`}>
      <div ref={gridElement} className="desk-grid-area w-[min(100vh,100vw)] p-3">
        <div className="board-subgrid checkered-background rounded-lg shadow-2xl">
          {BOARD_CELLS.map(cell => (
            <Square key={cell} name={cell} onClick={() => onCellClick(cell)} isSelected={selectedCell == cell}>
              <Piece piece={board.get(cell)} />
            </Square>
          ))}
        </div>
        <div className="white-side-subgrid bg-black-cell rounded-lg shadow-lg">
          {WHITE_SIDE_CELLS.map(cell => (
            <Square key={cell} name={cell} onClick={() => onCellClick(cell)} isSelected={selectedCell == cell}>
              <Piece piece={board.get(cell)} />
            </Square>
          ))}
        </div>
        <div className="black-side-subgrid bg-white-cell rounded-lg shadow-lg">
          {BLACK_SIDE_CELLS.map(cell => (
            <Square key={cell} name={cell} onClick={() => onCellClick(cell)} isSelected={selectedCell == cell}>
              <Piece piece={board.get(cell)} />
            </Square>
          ))}
        </div>
        <div className="contents">
          {COLUMNS.map(c => (
            <div key={c} style={{ gridArea: `r${c}` }} className="text-neutral-400 place-self-center">
              {c.toLowerCase()}
            </div>
          ))}
          {ROWS.map(r => (
            <div key={r} style={{ gridArea: `r${r}` }} className="text-neutral-400 place-self-center">
              {r}
            </div>
          ))}
        </div>
      </div>
      <LoadingOverlay isLoading={isLoading} message={loadingMessage} />
    </div>
  );
}