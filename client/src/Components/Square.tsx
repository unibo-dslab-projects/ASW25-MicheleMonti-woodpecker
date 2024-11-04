export default function Square({name}) {
    return <button 
        data-name={name}
        onClick={() => console.log(name)}
        className="aspect-square hover:bg-neutral-200"
        style={{gridArea: name}}
    />;
}
// style={{'--cell': name} as React.CSSProperties}
