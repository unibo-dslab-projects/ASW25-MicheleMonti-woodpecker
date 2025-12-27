import { DeskCell } from "../defs";

export default function Square({name, onClick, isSelected, children}: {name: DeskCell, onClick: () => void, isSelected: boolean, children?: React.ReactNode}) {
    return <button 
        style={{gridArea: name}}
        onClick={onClick}
        className={`aspect-square ${isSelected && 'ring-4 ring-green-600 ring-inset'}`}
    >
        {children}
    </button>;
}
