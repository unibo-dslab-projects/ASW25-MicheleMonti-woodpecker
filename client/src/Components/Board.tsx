const CELLS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].flatMap(c => [1, 2, 3, 4, 5, 6, 7, 8].map(r => c + r));

export default function Board() {
    return <div className="board">
        {CELLS.map(cell => <button key={cell} className="cell">{cell}</button>)}
    </div>;
}