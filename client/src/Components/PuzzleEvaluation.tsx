interface PuzzleEvaluationProps {
    isLoggedIn: boolean;
    selectedEvaluation: string | null;
    onEvaluationChange: (evaluation: string | null) => void;
}

export default function PuzzleEvaluation({ 
    isLoggedIn,
    selectedEvaluation,
    onEvaluationChange
}: PuzzleEvaluationProps) {
    const handleEvaluationSelect = (evaluation: string) => {
        if (selectedEvaluation === evaluation) {
            onEvaluationChange(null);
        } else {
            onEvaluationChange(evaluation);
        }
    };

    if (!isLoggedIn) {
        return null;
    }

    const evaluations = [
        { value: 'failed', label: 'Failed', selectedColor: 'text-red-600' },
        { value: 'partial', label: 'Partial', selectedColor: 'text-yellow-400' },
        { value: 'solved', label: 'Solved', selectedColor: 'text-green-500' }
    ];

    return (
        <div className="flex gap-2">
            {evaluations.map((option) => {
                const isSelected = selectedEvaluation === option.value;
                
                return (
                    <button
                        key={option.value}
                        onClick={() => handleEvaluationSelect(option.value)}
                        className={`flex-1 px-4 py-2 font-bold rounded-xl transition-all duration-200 
                                  shadow-md hover:shadow-lg hover:scale-105 active:scale-95 active:shadow-sm
                                  border-b-4 ${isSelected 
                                    ? 'border-gray-800 scale-105 shadow-lg' 
                                    : 'border-gray-700 hover:border-gray-800'
                                  }
                                  hover:brightness-110 active:brightness-95 relative z-10
                                  ${isSelected ? option.selectedColor : 'text-black'}`}
                        style={{ backgroundColor: 'var(--black-cell-color)' }}
                    >
                        {option.label}
                    </button>
                );
            })}
        </div>
    );
}