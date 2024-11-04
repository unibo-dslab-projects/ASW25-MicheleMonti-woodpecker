export default function Square({name}) {
    return <button 
        data-cell={name}
        onClick={() => console.log(name)}
        className="aspect-square bg-neutral-200 hover:bg-neutral-300"
    />;
}
// style={{'--cell': name} as React.CSSProperties}
