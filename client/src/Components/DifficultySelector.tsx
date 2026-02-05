import { Difficulty, DIFFICULTY_RANGES } from './constants';

interface DifficultySelectorProps {
    difficulty: Difficulty;
    setDifficulty: (diff: Difficulty) => void;
}

export default function DifficultySelector({ difficulty, setDifficulty }: DifficultySelectorProps) {
    return (
        <div className="mb-2">
            <h3 className="font-bold text-lg text-center mb-2 text-neutral-800">Difficulty</h3>
            
            <div className="relative">
                <div 
                    className="flex rounded-lg overflow-hidden border-2 border-gray-700 shadow-sm relative z-0"
                    style={{ backgroundColor: 'var(--black-cell-color)' }}
                >
                    {(Object.keys(DIFFICULTY_RANGES) as Difficulty[]).map((level) => {
                        const isActive = difficulty === level;
                        
                        return (
                            <button
                                key={level}
                                onClick={() => setDifficulty(level)}
                                className={`flex-1 px-3 py-2 text-center relative z-10 transition-colors duration-200 ${
                                    isActive 
                                        ? 'font-bold text-neutral-900' 
                                        : 'text-neutral-300 hover:text-white'
                                }`}
                                aria-label={`Set difficulty to ${level}`}
                            >
                                <span className="capitalize relative z-20">{level}</span>
                            </button>
                        );
                    })}
                    
                    {/* Animated slider background */}
                    <div 
                        className="absolute top-0 left-0 h-full slider-spring rounded-md"
                        style={{ 
                            width: `${100 / Object.keys(DIFFICULTY_RANGES).length}%`,
                            backgroundColor: 'var(--white-cell-color)',
                            transform: `translateX(${
                                difficulty === 'easy' ? '0%' : 
                                difficulty === 'medium' ? '100%' : 
                                '200%'
                            })`
                        }}
                    />
                </div>
                
                {/* Range indicator below the slider */}
                <div className="text-xs text-center mt-1 text-neutral-600">
                    {DIFFICULTY_RANGES[difficulty].min}-{DIFFICULTY_RANGES[difficulty].max}
                </div>
            </div>
        </div>
    );
}