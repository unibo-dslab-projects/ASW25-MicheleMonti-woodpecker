type PieceType = 'king' | 'queen' | 'rook' | 'bishop' | 'knight' | 'pawn' | null;
type PieceColor = 'white' | 'black';

export default function Piece({type, color, cell}: {type: PieceType, color: PieceColor, cell: string}) {
    const url = `/pieces/pieces.svg#${type}`;
    return <svg
        data-cell={cell}
        className={`pointer-events-none ${color==='white' ? 'text-white-piece' : 'text-black-piece'}`}
        viewBox="0 0 50 50"
        shapeRendering="geometricPrecision">
        <use href={url} fill="currentColor" />
    </svg>;
}
