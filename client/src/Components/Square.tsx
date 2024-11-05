export default function Square({name, color}) {
    return <button 
        data-cell={name}
        onClick={() => console.log(name)}
        className={`aspect-square ${color==='white' ? 'bg-white-cell' : 'bg-black-cell'}`}
    />;
}
// style={{'--cell': name} as React.CSSProperties}
