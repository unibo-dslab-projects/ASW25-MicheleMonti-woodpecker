export default function Square({name}) {
    return <button data-name={name} onClick={() => console.log(name)} className="aspect-square hover:bg-neutral-200">{name}</button>;
}