interface SolutionBoxProps {
  solution: string;
  isSolutionRevealed: boolean;
  onToggle: () => void;
  isLoading?: boolean;
}

export default function SolutionBox({ 
  solution, 
  isSolutionRevealed, 
  onToggle, 
  isLoading = false 
}: SolutionBoxProps) {
  return (
    <div 
      className={`rounded-2xl p-6 cursor-pointer transition-all duration-300 
                 shadow-2xl hover:shadow-3xl hover:scale-[1.02] active:scale-[0.98] active:shadow-lg
                 border-2 border-white/10 hover:border-white/20 active:border-white/30
                 ${isLoading ? 'opacity-70 pointer-events-none' : 'opacity-100'}`}
      style={{ backgroundColor: 'var(--white-cell-color)' }}
      onClick={() => !isLoading && onToggle()}
    >
      <h3 className="font-bold text-2xl text-neutral-800 text-center mb-4">Solution</h3>
      {isSolutionRevealed ? (
        <div 
          className="text-neutral-800 whitespace-pre-line p-4 bg-white/50 rounded-xl shadow-inner" 
          dangerouslySetInnerHTML={{ __html: solution }} 
        />
      ) : (
        <div className="text-neutral-600 text-center py-8 text-xl font-medium">
          Click to reveal the solution
        </div>
      )}
    </div>
  );
}