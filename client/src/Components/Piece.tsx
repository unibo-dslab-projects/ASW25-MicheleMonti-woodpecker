type PieceType = 'king' | 'queen' | 'rook' | 'bishop' | 'knight' | 'pawn' | null;
type PieceColor = 'white' | 'black';

export default function Piece({type, color, cell}: {type: PieceType, color: PieceColor, cell: string}) {
    const url = `/pieces/pieces.svg#${type}`;
    return <svg viewBox="0 0 50 50" shapeRendering="geometricPrecision" style={{gridArea: cell}} >
        <use href={url} fill={color} />
    </svg>;
}
