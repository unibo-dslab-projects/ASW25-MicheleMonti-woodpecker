import Square from "./Square";

const CELLS = [1, 2, 3, 4, 5, 6, 7, 8].reverse().flatMap(c => 'ABCDEFGH'.split('').map(r => c + r));

export default function Board() {
    return <div className="grid grid-cols-8 grid-rows-8">
        {CELLS.map(cell => <Square key={cell} name={cell} />)}
    </div>;
}