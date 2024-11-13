import { PieceType } from "../defs";

export default function Piece({piece}: {piece?: PieceType}) {
    if (!piece)
        return null;
    const url = `/pieces/pieces.svg#${piece.type}`;
    return <svg
        className={`p-1 pointer-events-none ${piece.color==='white' ? 'text-white-piece' : 'text-black-piece'}`}
        viewBox="0 0 50 50"
        shapeRendering="geometricPrecision">
        <use href={url} fill="currentColor" />
    </svg>;
}
