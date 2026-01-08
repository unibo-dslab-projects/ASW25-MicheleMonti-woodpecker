import { Difficulty } from "./constants";
import { useState, useEffect } from "react";

interface PuzzleDescriptionProps {
    puzzleIndex: number;
    difficulty: Difficulty;
    direction: string;
    description: string;
}

export default function PuzzleDescription({ 
    puzzleIndex, 
    difficulty, 
    direction, 
    description 
}: PuzzleDescriptionProps) {
    const [displayedDescription, setDisplayedDescription] = useState(description);
    const [displayedIndex, setDisplayedIndex] = useState(puzzleIndex);
    
    useEffect(() => {
        setDisplayedDescription(description);
        setDisplayedIndex(puzzleIndex);
    }, [description, puzzleIndex]);
    
    const formatDescription = (desc: string) => {
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
                className="w-5 h-5 rounded border border-gray-700 shadow-sm flex-shrink-0 transition-colors duration-300"
                style={{
                    backgroundColor: direction === 'w' ? 'var(--white-piece-color)' : 'var(--black-piece-color)'
                }}
                title={`Next move: ${direction === 'w' ? 'White' : 'Black'}`}
                aria-label={`Next move: ${direction === 'w' ? 'white' : 'black'}`}
            />
            <div className="text-neutral-400 text-center transition-all duration-300">
                <span className="font-bold">#{displayedIndex}</span>{' '}
                <span className="text-sm px-2 py-1 rounded bg-gray-800 ml-2 capitalize transition-all duration-300">
                    {difficulty}
                </span>
                {' '}
                {formatDescription(displayedDescription)}
            </div>
        </div>
    );
}