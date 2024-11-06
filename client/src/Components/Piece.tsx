import { BoardCell, PieceType } from "../defs";

export default function Piece({piece, cell}: {piece: PieceType, cell: BoardCell}) {
    const url = `/pieces/pieces.svg#${piece.type}`;
    return <svg
        data-cell={cell}
        className={`pointer-events-none ${piece.color==='white' ? 'text-white-piece' : 'text-black-piece'}`}
        viewBox="-2.5 -2.5 60 60"
        shapeRendering="geometricPrecision">
        <use href={url} fill="currentColor" />
    </svg>;
}
