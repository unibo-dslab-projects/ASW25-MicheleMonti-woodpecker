import { DeskCell, PieceColor} from "../defs";

export default function Square({name, color, onClick, isSelected, children}: {name: DeskCell, color: PieceColor, onClick: () => void, isSelected: boolean, children?: React.ReactNode}) {
    return <button 
        style={{gridArea: name}}
        onClick={onClick}
        className={`aspect-square ${color === 'white' ? 'bg-white-cell' : 'bg-black-cell'} ${isSelected && 'ring-4 ring-blue-500 ring-inset'}`}
    >
        {children}
    </button>;
}
