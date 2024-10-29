import Piece from "./Piece";

export default function Square({name}) {
    return <button data-name={name} onClick={() => console.log(name)} className="aspect-square hover:bg-neutral-200">
        <Piece type={['king', 'queen', 'rook', 'bishop', 'knight', 'pawn'][Math.random()*6|0]} color="black" />
    </button>;
}