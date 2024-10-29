type PieceType = 'king' | 'queen' | 'rook' | 'bishop' | 'knight' | 'pawn' | null;
type PieceColor = 'white' | 'black';

export default function Piece({type, color}: {type: PieceType, color: PieceColor}) {
    const url = `/pieces/pieces.svg#${type}`;
    return <svg viewBox="0 0 50 50" image-rendering="optimizeQuality" shape-rendering="geometricPrecision">
        <use href={url} fill={color} />
    </svg>;
}
