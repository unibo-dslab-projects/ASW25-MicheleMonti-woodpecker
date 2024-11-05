import { BoardCell, PieceColor } from "../defs";

export default function Square({name, color}: {name: BoardCell, color: PieceColor}) {
    return <button 
        data-cell={name}
        onClick={() => console.log(name)}
        className={`aspect-square ${color === 'white' ? 'bg-white-cell' : 'bg-black-cell'}`}
    />;
}
