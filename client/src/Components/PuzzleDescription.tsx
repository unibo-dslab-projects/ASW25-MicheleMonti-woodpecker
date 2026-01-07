interface PuzzleDescriptionProps {
    puzzleIndex: number;
    difficulty: 'easy' | 'medium' | 'hard';
    direction: string;
    description: string;
}

export default function PuzzleDescription({ 
    puzzleIndex, 
    difficulty, 
    direction, 
    description 
}: PuzzleDescriptionProps) {
    
    const formatDescription = (desc: string) => {
        // Simple approach: bold the first word or first part until comma
        const firstCommaIndex = desc.indexOf(',');
        
        if (firstCommaIndex !== -1) {
            const boldPart = desc.substring(0, firstCommaIndex + 1);
            const rest = desc.substring(firstCommaIndex + 1);
            return (
                <>
                    <strong>{boldPart}</strong>
                    {rest}
                </>
            );
        }
        
        return desc;
    };

    return (
        <div className="flex items-center justify-center gap-2 mb-6 w-full">
            <div 
                className="w-5 h-5 rounded border border-gray-700 shadow-sm flex-shrink-0"
                style={{
                    backgroundColor: direction === 'w' ? 'var(--white-piece-color)' : 'var(--black-piece-color)'
                }}
                title={`Next move: ${direction === 'w' ? 'White' : 'Black'}`}
                aria-label={`Next move: ${direction === 'w' ? 'white' : 'black'}`}
            />
            <div className="text-neutral-400 text-center">
                <span className="font-bold">#{puzzleIndex}</span>{' '}
                <span className="text-sm px-2 py-1 rounded bg-gray-800 ml-2 capitalize">
                    {difficulty}
                </span>
                {' '}
                {formatDescription(description)}
            </div>
        </div>
    );
}